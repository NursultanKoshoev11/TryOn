package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

func main() {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379/0"
	}

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatalf("Failed to parse Redis URL: %v", err)
	}

	rdb := redis.NewClient(opt)
	defer rdb.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	fmt.Println("Worker started. Listening for generation jobs...")

	// Main worker loop
	for {
		ctx := context.Background()

		// Try to get a job from the queue
		result, err := rdb.BLPop(ctx, 0, "generation_queue").Result()
		if err != nil {
			log.Printf("Error getting job from queue: %v", err)
			continue
		}

		if len(result) < 2 {
			continue
		}

		jobID := result[1]
		fmt.Printf("Processing job: %s\n", jobID)

		// TODO: Implement actual job processing
		// 1. Fetch job details from database
		// 2. Call AI provider
		// 3. Save generated images
		// 4. Update job status
		// 5. Trigger webhook if configured

		// For now, just mark as processed
		rdb.Set(ctx, fmt.Sprintf("job:%s:status", jobID), "completed", 24*time.Hour)
	}
}
