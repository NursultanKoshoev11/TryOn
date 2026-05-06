package services

import (
	"errors"

	"github.com/tryon-ai/api/internal/models"
	"github.com/tryon-ai/api/internal/repository"
)

type OrganizationService struct {
	orgRepo *repository.OrganizationRepository
}

func NewOrganizationService(orgRepo *repository.OrganizationRepository) *OrganizationService {
	return &OrganizationService{orgRepo: orgRepo}
}

func (s *OrganizationService) Create(userID string, req *models.CreateOrganizationRequest) (*models.Organization, error) {
	org := &models.Organization{
		OwnerUserID: userID,
		Name:        req.Name,
		StoreDomain: req.StoreDomain,
	}

	if err := s.orgRepo.Create(org); err != nil {
		return nil, err
	}

	return org, nil
}

func (s *OrganizationService) GetByID(id string) (*models.Organization, error) {
	return s.orgRepo.GetByID(id)
}

func (s *OrganizationService) GetByUserID(userID string) ([]*models.Organization, error) {
	return s.orgRepo.GetByUserID(userID)
}

func (s *OrganizationService) Update(id string, req *models.UpdateOrganizationRequest) (*models.Organization, error) {
	org, err := s.orgRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if req.Name != "" {
		org.Name = req.Name
	}
	if req.StoreDomain != "" {
		org.StoreDomain = req.StoreDomain
	}

	if err := s.orgRepo.Update(org); err != nil {
		return nil, err
	}

	return org, nil
}

func (s *OrganizationService) Delete(id string) error {
	return s.orgRepo.Delete(id)
}

func (s *OrganizationService) CheckOwnership(orgID, userID string) error {
	org, err := s.orgRepo.GetByID(orgID)
	if err != nil {
		return err
	}

	if org.OwnerUserID != userID {
		return errors.New("unauthorized: user does not own this organization")
	}

	return nil
}

func (s *OrganizationService) GetAll() ([]*models.Organization, error) {
	return s.orgRepo.GetAll()
}

func (s *OrganizationService) Suspend(id string) error {
	return s.orgRepo.UpdateStatus(id, models.OrgStatusSuspended)
}

func (s *OrganizationService) Activate(id string) error {
	return s.orgRepo.UpdateStatus(id, models.OrgStatusActive)
}
