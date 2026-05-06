package ai

import (
	"context"
	"time"
)

type GenerationInput struct {
	GenerationID      string
	OrganizationID    string
	UserPhotoPath     string
	ProductImagePath  string
	ProductMetadata   map[string]interface{}
	OutputCount       int
	RequestedViews    []string
}

type GenerationOutput struct {
	GeneratedImages   []GeneratedImage
	ProviderJobID     string
	ProviderStatus    string
	CostEstimate      float64
	ProcessingTimeMs  int
	RawResponse       string
}

type GeneratedImage struct {
	ViewType    string
	StoragePath string
	URL         string
}

type Provider interface {
	GenerateTryOn(ctx context.Context, input *GenerationInput) (*GenerationOutput, error)
	GetStatus(ctx context.Context, jobID string) (string, error)
}
