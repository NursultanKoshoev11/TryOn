package repository

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/tryon-ai/api/internal/models"
)

type GenerationRepository struct {
	db *sql.DB
}

func NewGenerationRepository(db *sql.DB) *GenerationRepository {
	return &GenerationRepository{db: db}
}

func (r *GenerationRepository) Create(gen *models.GenerationJob) error {
	gen.ID = uuid.New().String()
	gen.CreatedAt = time.Now()
	gen.Status = models.GenStatusQueued

	query := `
		INSERT INTO generation_jobs (id, organization_id, api_key_id, product_id, product_name, product_metadata_json, user_photo_path, product_image_path, status, output_count, requested_views_json, ai_provider, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	`
	_, err := r.db.Exec(query, gen.ID, gen.OrganizationID, gen.APIKeyID, gen.ProductID, gen.ProductName, gen.ProductMetadataJSON, gen.UserPhotoPath, gen.ProductImagePath, gen.Status, gen.OutputCount, gen.RequestedViewsJSON, gen.AIProvider, gen.CreatedAt)
	return err
}

func (r *GenerationRepository) GetByID(id string) (*models.GenerationJob, error) {
	var gen models.GenerationJob
	query := `SELECT id, organization_id, api_key_id, product_id, product_name, product_metadata_json, user_photo_path, product_image_path, status, output_count, requested_views_json, ai_provider, provider_job_id, error_code, error_message, processing_time_ms, created_at, started_at, completed_at, deleted_at FROM generation_jobs WHERE id = $1`
	err := r.db.QueryRow(query, id).Scan(
		&gen.ID, &gen.OrganizationID, &gen.APIKeyID, &gen.ProductID, &gen.ProductName, &gen.ProductMetadataJSON, &gen.UserPhotoPath, &gen.ProductImagePath, &gen.Status, &gen.OutputCount, &gen.RequestedViewsJSON, &gen.AIProvider, &gen.ProviderJobID, &gen.ErrorCode, &gen.ErrorMessage, &gen.ProcessingTimeMs, &gen.CreatedAt, &gen.StartedAt, &gen.CompletedAt, &gen.DeletedAt,
	)
	if err != nil {
		return nil, err
	}
	return &gen, nil
}

func (r *GenerationRepository) GetByOrganizationID(orgID string, limit, offset int) ([]*models.GenerationJob, error) {
	query := `SELECT id, organization_id, api_key_id, product_id, product_name, status, output_count, created_at, completed_at FROM generation_jobs WHERE organization_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $2 OFFSET $3`
	rows, err := r.db.Query(query, orgID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []*models.GenerationJob
	for rows.Next() {
		var job models.GenerationJob
		if err := rows.Scan(&job.ID, &job.OrganizationID, &job.APIKeyID, &job.ProductID, &job.ProductName, &job.Status, &job.OutputCount, &job.CreatedAt, &job.CompletedAt); err != nil {
			return nil, err
		}
		jobs = append(jobs, &job)
	}
	return jobs, nil
}

func (r *GenerationRepository) UpdateStatus(id string, status models.GenerationStatus) error {
	query := `UPDATE generation_jobs SET status = $1 WHERE id = $2`
	_, err := r.db.Exec(query, status, id)
	return err
}

func (r *GenerationRepository) UpdateCompleted(id string, status models.GenerationStatus, processingTimeMs int) error {
	query := `UPDATE generation_jobs SET status = $1, completed_at = $2, processing_time_ms = $3 WHERE id = $4`
	_, err := r.db.Exec(query, status, time.Now(), processingTimeMs, id)
	return err
}

func (r *GenerationRepository) UpdateFailed(id string, errorCode, errorMessage string) error {
	query := `UPDATE generation_jobs SET status = $1, error_code = $2, error_message = $3, completed_at = $4 WHERE id = $5`
	_, err := r.db.Exec(query, models.GenStatusFailed, errorCode, errorMessage, time.Now(), id)
	return err
}

func (r *GenerationRepository) CountByOrganization(orgID string, startDate, endDate time.Time) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM generation_jobs WHERE organization_id = $1 AND created_at >= $2 AND created_at <= $3 AND deleted_at IS NULL`
	err := r.db.QueryRow(query, orgID, startDate, endDate).Scan(&count)
	return count, err
}

func (r *GenerationRepository) CountSuccessful(orgID string, startDate, endDate time.Time) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM generation_jobs WHERE organization_id = $1 AND status = $2 AND created_at >= $3 AND created_at <= $4 AND deleted_at IS NULL`
	err := r.db.QueryRow(query, orgID, models.GenStatusCompleted, startDate, endDate).Scan(&count)
	return count, err
}
