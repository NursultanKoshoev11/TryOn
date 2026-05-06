package services

import (
	"errors"

	"github.com/tryon-ai/api/internal/models"
	"github.com/tryon-ai/api/internal/repository"
	"github.com/tryon-ai/api/pkg/hash"
)

type APIKeyService struct {
	apikeyRepo *repository.APIKeyRepository
	subRepo    *repository.SubscriptionRepository
	apiKeySecret string
}

func NewAPIKeyService(apikeyRepo *repository.APIKeyRepository, subRepo *repository.SubscriptionRepository, apiKeySecret string) *APIKeyService {
	return &APIKeyService{
		apikeyRepo:   apikeyRepo,
		subRepo:      subRepo,
		apiKeySecret: apiKeySecret,
	}
}

func (s *APIKeyService) Create(orgID string, req *models.CreateAPIKeyRequest) (*models.CreateAPIKeyResponse, error) {
	// Check subscription and max API keys limit
	sub, err := s.subRepo.GetByOrganizationID(orgID)
	if err != nil {
		return nil, errors.New("no active subscription found")
	}

	plan, err := s.subRepo.GetPlanByID(sub.PlanID)
	if err != nil {
		return nil, err
	}

	// Check current API key count
	count, err := s.apikeyRepo.CountByOrganization(orgID)
	if err != nil {
		return nil, err
	}

	if count >= plan.MaxAPIKeys {
		return nil, errors.New("API key limit reached for current plan")
	}

	// Generate API key
	fullKey, err := hash.GenerateAPIKey("sk_live")
	if err != nil {
		return nil, err
	}

	// Hash the key
	keyHash := hash.HashAPIKey(fullKey, s.apiKeySecret)
	keyPrefix := hash.GetAPIKeyPrefix(fullKey)

	// Create API key record
	apiKey := &models.APIKey{
		OrganizationID: orgID,
		Name:           req.Name,
		KeyPrefix:      keyPrefix,
		KeyHash:        keyHash,
		AllowedDomains: req.AllowedDomains,
		Scopes:         "*", // Default: all scopes
	}

	if err := s.apikeyRepo.Create(apiKey); err != nil {
		return nil, err
	}

	return &models.CreateAPIKeyResponse{
		ID:        apiKey.ID,
		Name:      apiKey.Name,
		Key:       fullKey, // Show full key only once
		KeyPrefix: keyPrefix,
		Status:    string(apiKey.Status),
		CreatedAt: apiKey.CreatedAt,
	}, nil
}

func (s *APIKeyService) GetByOrganizationID(orgID string) ([]*models.APIKey, error) {
	return s.apikeyRepo.GetByOrganizationID(orgID)
}

func (s *APIKeyService) Revoke(keyID string) error {
	return s.apikeyRepo.Revoke(keyID)
}

func (s *APIKeyService) ValidateAPIKey(apiKey string) (*models.APIKey, error) {
	keyHash := hash.HashAPIKey(apiKey, s.apiKeySecret)
	key, err := s.apikeyRepo.GetByHash(keyHash)
	if err != nil {
		return nil, errors.New("invalid API key")
	}

	// Update last used
	_ = s.apikeyRepo.UpdateLastUsed(key.ID)

	return key, nil
}

func (s *APIKeyService) Rotate(keyID, orgID string) (*models.CreateAPIKeyResponse, error) {
	// Get existing key
	keys, err := s.apikeyRepo.GetByOrganizationID(orgID)
	if err != nil {
		return nil, err
	}

	var existingKey *models.APIKey
	for _, k := range keys {
		if k.ID == keyID {
			existingKey = k
			break
		}
	}

	if existingKey == nil {
		return nil, errors.New("API key not found")
	}

	// Revoke old key
	if err := s.apikeyRepo.Revoke(keyID); err != nil {
		return nil, err
	}

	// Create new key with same name
	return s.Create(orgID, &models.CreateAPIKeyRequest{
		Name:           existingKey.Name,
		AllowedDomains: existingKey.AllowedDomains,
	})
}
