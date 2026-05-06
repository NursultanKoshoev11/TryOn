package models

import (
	"time"
)

type GenerationStatus string

const (
	GenStatusQueued     GenerationStatus = "queued"
	GenStatusProcessing GenerationStatus = "processing"
	GenStatusCompleted  GenerationStatus = "completed"
	GenStatusFailed     GenerationStatus = "failed"
	GenStatusCancelled  GenerationStatus = "cancelled"
)

type ViewType string

const (
	ViewTypeFront       ViewType = "front"
	ViewTypeLeft        ViewType = "left"
	ViewTypeRight       ViewType = "right"
	ViewTypeBack        ViewType = "back"
	ViewTypeAlternative ViewType = "alternative"
)

type GenerationJob struct {
	ID                 string           `json:"id" db:"id"`
	OrganizationID     string           `json:"organization_id" db:"organization_id"`
	APIKeyID           *string          `json:"api_key_id" db:"api_key_id"`
	ProductID          string           `json:"product_id" db:"product_id"`
	ProductName        string           `json:"product_name" db:"product_name"`
	ProductMetadataJSON string          `json:"product_metadata_json" db:"product_metadata_json"`
	UserPhotoPath      string           `json:"user_photo_path" db:"user_photo_path"`
	ProductImagePath   string           `json:"product_image_path" db:"product_image_path"`
	Status             GenerationStatus `json:"status" db:"status"`
	OutputCount        int              `json:"output_count" db:"output_count"`
	RequestedViewsJSON string           `json:"requested_views_json" db:"requested_views_json"`
	AIProvider         string           `json:"ai_provider" db:"ai_provider"`
	ProviderJobID      *string          `json:"provider_job_id" db:"provider_job_id"`
	ErrorCode          *string          `json:"error_code" db:"error_code"`
	ErrorMessage       *string          `json:"error_message" db:"error_message"`
	ProcessingTimeMs   *int             `json:"processing_time_ms" db:"processing_time_ms"`
	CreatedAt          time.Time        `json:"created_at" db:"created_at"`
	StartedAt          *time.Time       `json:"started_at" db:"started_at"`
	CompletedAt        *time.Time       `json:"completed_at" db:"completed_at"`
	DeletedAt          *time.Time       `json:"deleted_at" db:"deleted_at"`
}

type GeneratedImage struct {
	ID                 string     `json:"id" db:"id"`
	GenerationJobID    string     `json:"generation_job_id" db:"generation_job_id"`
	OrganizationID     string     `json:"organization_id" db:"organization_id"`
	ViewType           ViewType   `json:"view_type" db:"view_type"`
	StoragePath        string     `json:"storage_path" db:"storage_path"`
	SignedURLExpiresAt *time.Time `json:"signed_url_expires_at" db:"signed_url_expires_at"`
	CreatedAt          time.Time  `json:"created_at" db:"created_at"`
	DeletedAt          *time.Time `json:"deleted_at" db:"deleted_at"`
}

type CreateGenerationRequest struct {
	ProductID        string                 `json:"product_id" validate:"required"`
	ProductName      string                 `json:"product_name" validate:"required"`
	ProductImageURL  string                 `json:"product_image_url" validate:"required,url"`
	UserPhotoURL     string                 `json:"user_photo_url" validate:"required,url"`
	OutputCount      int                    `json:"output_count" validate:"min=1,max=10"`
	ProductMetadata  map[string]interface{} `json:"product_metadata,omitempty"`
	CallbackURL      string                 `json:"callback_url,omitempty" validate:"omitempty,url"`
}

type GenerationResponse struct {
	ID          string           `json:"id"`
	Status      GenerationStatus `json:"status"`
	ProductID   string           `json:"product_id"`
	ProductName string           `json:"product_name"`
	CreatedAt   time.Time        `json:"created_at"`
}

type GenerationImageResponse struct {
	ID        string    `json:"id"`
	ViewType  ViewType  `json:"view_type"`
	URL       string    `json:"url"`
	ExpiresAt time.Time `json:"expires_at"`
}
