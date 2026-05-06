package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

// AI Provider interface
type AIProvider interface {
	GenerateTryOn(ctx context.Context, input *GenerationInput) (*GenerationOutput, error)
}

type GenerationInput struct {
	GenerationID      string
	OrganizationID    string
	UserPhotoPath     string
	ProductImagePath  string
	OutputCount       int
	RequestedViews    []string
}

type GenerationOutput struct {
	GeneratedImages   []GeneratedImage
	ProviderJobID     string
	ProcessingTimeMs  int
}

type GeneratedImage struct {
	ViewType    string
	StoragePath string
}

// MockAIProvider
type MockAIProvider struct{}

func (p *MockAIProvider) GenerateTryOn(ctx context.Context, input *GenerationInput) (*GenerationOutput, error) {
	time.Sleep(2 * time.Second) // Simulate processing

	images := []GeneratedImage{}
	for _, view := range input.RequestedViews {
		images = append(images, GeneratedImage{
			ViewType:    view,
			StoragePath: fmt.Sprintf("/mock/%s/%s_%s.jpg", input.OrganizationID, input.GenerationID, view),
		})
	}

	return &GenerationOutput{
		GeneratedImages:  images,
		ProviderJobID:    uuid.New().String(),
		ProcessingTimeMs: 2000,
	}, nil
}

type GenerationJob struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organization_id"`
}

func main() {
	fmt.Println("🔧 Starting TryOnAI Worker...")

	databaseURL := getEnv("DATABASE_URL", "postgres://tryon_user:tryon_password@postgres:5432/tryon_ai_db")
	redisURL := getEnv("REDIS_URL", "redis://redis:6379/0")

	// Connect to PostgreSQL
	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	fmt.Println("✓ Connected to PostgreSQL")

	// Connect to Redis
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatalf("Failed to parse Redis URL: %v", err)
	}

	redisClient := redis.NewClient(opt)
	defer redisClient.Close()

	ctx := context.Background()
	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	fmt.Println("✓ Connected to Redis")

	// Initialize AI provider
	provider := &MockAIProvider{}
	fmt.Println("✓ Using MockAIProvider")
	fmt.Println("\n🚀 Worker ready. Listening for jobs...\n")

	// Setup graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	// Worker loop
	go func() {
		for {
			result, err := redisClient.BLPop(ctx, 5*time.Second, "generation_queue").Result()
			if err != nil {
				if err.Error() != "redis: nil" {
					log.Printf("Error popping job: %v", err)
				}
				continue
			}

			if len(result) < 2 {
				continue
			}

			var job GenerationJob
			if err := json.Unmarshal([]byte(result[1]), &job); err != nil {
				log.Printf("Error unmarshaling job: %v", err)
				continue
			}

			fmt.Printf("📦 Processing job: %s (org: %s)\n", job.ID, job.OrganizationID)

			if err := processJob(ctx, db, provider, &job); err != nil {
				log.Printf("❌ Failed to process job %s: %v", job.ID, err)
				updateJobFailed(db, job.ID, err.Error())
			} else {
				fmt.Printf("✅ Job %s completed successfully\n", job.ID)
			}
		}
	}()

	<-sigChan
	fmt.Println("\n🛑 Shutting down worker...")
}

func processJob(ctx context.Context, db *sql.DB, provider AIProvider, job *GenerationJob) error {
	// Update status to processing
	if err := updateJobStatus(db, job.ID, "processing"); err != nil {
		return err
	}

	// Get job details
	var userPhotoPath, productImagePath, requestedViewsJSON string
	var outputCount int

	query := `SELECT user_photo_path, product_image_path, output_count, requested_views_json FROM generation_jobs WHERE id = $1`
	err := db.QueryRow(query, job.ID).Scan(&userPhotoPath, &productImagePath, &outputCount, &requestedViewsJSON)
	if err != nil {
		return err
	}

	// Parse requested views
	var requestedViews []string
	if requestedViewsJSON != "" {
		json.Unmarshal([]byte(requestedViewsJSON), &requestedViews)
	} else {
		requestedViews = []string{"front", "left", "right", "back"}
	}

	// Call AI provider
	startTime := time.Now()

	input := &GenerationInput{
		GenerationID:     job.ID,
		OrganizationID:   job.OrganizationID,
		UserPhotoPath:    userPhotoPath,
		ProductImagePath: productImagePath,
		OutputCount:      outputCount,
		RequestedViews:   requestedViews,
	}

	output, err := provider.GenerateTryOn(ctx, input)
	if err != nil {
		return err
	}

	processingTime := int(time.Since(startTime).Milliseconds())

	// Save generated images
	for _, img := range output.GeneratedImages {
		insertImageQuery := `
			INSERT INTO generated_images (id, generation_job_id, organization_id, view_type, storage_path, created_at)
			VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
		`
		_, err := db.Exec(insertImageQuery, job.ID, job.OrganizationID, img.ViewType, img.StoragePath)
		if err != nil {
			log.Printf("Warning: Failed to save image: %v", err)
		}
	}

	// Update job status to completed
	updateQuery := `
		UPDATE generation_jobs 
		SET status = $1, completed_at = $2, processing_time_ms = $3, provider_job_id = $4
		WHERE id = $5
	`
	_, err = db.Exec(updateQuery, "completed", time.Now(), processingTime, output.ProviderJobID, job.ID)

	return err
}

func updateJobStatus(db *sql.DB, jobID, status string) error {
	query := `UPDATE generation_jobs SET status = $1, started_at = $2 WHERE id = $3`
	_, err := db.Exec(query, status, time.Now(), jobID)
	return err
}

func updateJobFailed(db *sql.DB, jobID, errorMsg string) {
	query := `UPDATE generation_jobs SET status = $1, error_message = $2, completed_at = $3 WHERE id = $4`
	db.Exec(query, "failed", errorMsg, time.Now(), jobID)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
