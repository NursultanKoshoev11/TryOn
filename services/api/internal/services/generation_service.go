package services

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/tryon-ai/api/internal/models"
	"github.com/tryon-ai/api/internal/repository"
)

type GenerationService struct {
	genRepo *repository.GenerationRepository
	subRepo *repository.SubscriptionRepository
	orgRepo *repository.OrganizationRepository
}

func NewGenerationService(genRepo *repository.GenerationRepository, subRepo *repository.SubscriptionRepository, orgRepo *repository.OrganizationRepository) *GenerationService {
	return &GenerationService{
		genRepo: genRepo,
		subRepo: subRepo,
		orgRepo: orgRepo,
	}
}

func (s *GenerationService) Create(orgID string, apiKeyID *string, req *models.CreateGenerationRequest) (*models.GenerationResponse, error) {
	// Check organization status
	org, err := s.orgRepo.GetByID(orgID)
	if err != nil {
		return nil, err
	}

	if org.Status != models.OrgStatusActive {
		return nil, errors.New("organization is not active")
	}

	// Check subscription
	sub, err := s.subRepo.GetByOrganizationID(orgID)
	if err != nil {
		return nil, errors.New("no active subscription")
	}

	if sub.Status != models.SubStatusActive {
		return nil, errors.New("subscription is not active")
	}

	// Check usage limit
	plan, err := s.subRepo.GetPlanByID(sub.PlanID)
	if err != nil {
		return nil, err
	}

	// Count current month usage
	startOfMonth := time.Date(time.Now().Year(), time.Now().Month(), 1, 0, 0, 0, 0, time.UTC)
	endOfMonth := startOfMonth.AddDate(0, 1, 0).Add(-time.Second)

	monthlyCount, err := s.genRepo.CountByOrganization(orgID, startOfMonth, endOfMonth)
	if err != nil {
		return nil, err
	}

	if monthlyCount >= plan.IncludedGenerations {
		return nil, errors.New("monthly generation limit exceeded")
	}

	// Create generation job
	metadataJSON, _ := json.Marshal(req.ProductMetadata)
	requestedViews := []string{"front", "left", "right", "back"}
	viewsJSON, _ := json.Marshal(requestedViews)

	gen := &models.GenerationJob{
		OrganizationID:     orgID,
		APIKeyID:           apiKeyID,
		ProductID:          req.ProductID,
		ProductName:        req.ProductName,
		ProductMetadataJSON: string(metadataJSON),
		UserPhotoPath:      req.UserPhotoURL,      // TODO: Download and store
		ProductImagePath:   req.ProductImageURL,   // TODO: Download and store
		OutputCount:        req.OutputCount,
		RequestedViewsJSON: string(viewsJSON),
		AIProvider:         "mock",
	}

	if err := s.genRepo.Create(gen); err != nil {
		return nil, err
	}

	// Create usage record
	usageRecord := &models.UsageRecord{
		OrganizationID: orgID,
		APIKeyID:       apiKeyID,
		GenerationID:   &gen.ID,
		Units:          1,
		CostEstimate:   0.0, // Mock: no cost
	}

	_ = s.subRepo.CreateUsageRecord(usageRecord)

	// TODO: Push to Redis queue for worker processing

	return &models.GenerationResponse{
		ID:          gen.ID,
		Status:      gen.Status,
		ProductID:   gen.ProductID,
		ProductName: gen.ProductName,
		CreatedAt:   gen.CreatedAt,
	}, nil
}

func (s *GenerationService) GetByID(id string) (*models.GenerationJob, error) {
	return s.genRepo.GetByID(id)
}

func (s *GenerationService) GetByOrganizationID(orgID string, limit, offset int) ([]*models.GenerationJob, error) {
	return s.genRepo.GetByOrganizationID(orgID, limit, offset)
}

func (s *GenerationService) GetUsage(orgID string) (*models.UsageResponse, error) {
	// Get subscription
	sub, err := s.subRepo.GetByOrganizationID(orgID)
	if err != nil {
		return nil, err
	}

	plan, err := s.subRepo.GetPlanByID(sub.PlanID)
	if err != nil {
		return nil, err
	}

	// Count total generations
	totalCount, _ := s.genRepo.CountByOrganization(orgID, time.Time{}, time.Now())

	// Count monthly generations
	startOfMonth := time.Date(time.Now().Year(), time.Now().Month(), 1, 0, 0, 0, 0, time.UTC)
	endOfMonth := startOfMonth.AddDate(0, 1, 0).Add(-time.Second)
	monthlyCount, _ := s.genRepo.CountByOrganization(orgID, startOfMonth, endOfMonth)

	// Count successful
	successfulCount, _ := s.genRepo.CountSuccessful(orgID, startOfMonth, endOfMonth)

	// Calculate success rate
	successRate := 0.0
	if monthlyCount > 0 {
		successRate = float64(successfulCount) / float64(monthlyCount) * 100
	}

	remainingQuota := plan.IncludedGenerations - monthlyCount
	if remainingQuota < 0 {
		remainingQuota = 0
	}

	return &models.UsageResponse{
		TotalGenerations:   totalCount,
		MonthlyGenerations: monthlyCount,
		RemainingQuota:     remainingQuota,
		SuccessRate:        successRate,
		Plan:               plan.Name,
		PeriodStart:        sub.CurrentPeriodStart.Format("2006-01-02"),
		PeriodEnd:          sub.CurrentPeriodEnd.Format("2006-01-02"),
	}, nil
}
