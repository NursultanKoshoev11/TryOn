package ai

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type MockProvider struct{}

func NewMockProvider() *MockProvider {
	return &MockProvider{}
}

func (p *MockProvider) GenerateTryOn(ctx context.Context, input *GenerationInput) (*GenerationOutput, error) {
	// Simulate AI processing time
	time.Sleep(2 * time.Second)

	// Generate mock images
	images := []GeneratedImage{}
	for _, view := range input.RequestedViews {
		images = append(images, GeneratedImage{
			ViewType:    view,
			StoragePath: fmt.Sprintf("/mock/%s/%s_%s.jpg", input.OrganizationID, input.GenerationID, view),
			URL:         fmt.Sprintf("https://placeholder.com/%s.jpg", view),
		})
	}

	return &GenerationOutput{
		GeneratedImages:  images,
		ProviderJobID:    uuid.New().String(),
		ProviderStatus:   "completed",
		CostEstimate:     0.0,
		ProcessingTimeMs: 2000,
		RawResponse:      `{"status": "completed", "mock": true}`,
	}, nil
}

func (p *MockProvider) GetStatus(ctx context.Context, jobID string) (string, error) {
	return "completed", nil
}
