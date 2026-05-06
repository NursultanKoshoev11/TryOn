package repository

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/tryon-ai/api/internal/models"
)

type OrganizationRepository struct {
	db *sql.DB
}

func NewOrganizationRepository(db *sql.DB) *OrganizationRepository {
	return &OrganizationRepository{db: db}
}

func (r *OrganizationRepository) Create(org *models.Organization) error {
	org.ID = uuid.New().String()
	org.CreatedAt = time.Now()
	org.UpdatedAt = time.Now()
	org.Status = models.OrgStatusActive

	query := `
		INSERT INTO organizations (id, owner_user_id, name, store_domain, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.Exec(query, org.ID, org.OwnerUserID, org.Name, org.StoreDomain, org.Status, org.CreatedAt, org.UpdatedAt)
	return err
}

func (r *OrganizationRepository) GetByID(id string) (*models.Organization, error) {
	var org models.Organization
	query := `SELECT id, owner_user_id, name, store_domain, status, created_at, updated_at FROM organizations WHERE id = $1 AND deleted_at IS NULL`
	err := r.db.QueryRow(query, id).Scan(
		&org.ID, &org.OwnerUserID, &org.Name, &org.StoreDomain, &org.Status, &org.CreatedAt, &org.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &org, nil
}

func (r *OrganizationRepository) GetByUserID(userID string) ([]*models.Organization, error) {
	query := `SELECT id, owner_user_id, name, store_domain, status, created_at, updated_at FROM organizations WHERE owner_user_id = $1 AND deleted_at IS NULL`
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orgs []*models.Organization
	for rows.Next() {
		var org models.Organization
		if err := rows.Scan(&org.ID, &org.OwnerUserID, &org.Name, &org.StoreDomain, &org.Status, &org.CreatedAt, &org.UpdatedAt); err != nil {
			return nil, err
		}
		orgs = append(orgs, &org)
	}
	return orgs, nil
}

func (r *OrganizationRepository) Update(org *models.Organization) error {
	org.UpdatedAt = time.Now()
	query := `UPDATE organizations SET name = $1, store_domain = $2, updated_at = $3 WHERE id = $4`
	_, err := r.db.Exec(query, org.Name, org.StoreDomain, org.UpdatedAt, org.ID)
	return err
}

func (r *OrganizationRepository) Delete(id string) error {
	query := `UPDATE organizations SET deleted_at = $1 WHERE id = $2`
	_, err := r.db.Exec(query, time.Now(), id)
	return err
}

func (r *OrganizationRepository) UpdateStatus(id string, status models.OrganizationStatus) error {
	query := `UPDATE organizations SET status = $1, updated_at = $2 WHERE id = $3`
	_, err := r.db.Exec(query, status, time.Now(), id)
	return err
}

func (r *OrganizationRepository) GetAll() ([]*models.Organization, error) {
	query := `SELECT id, owner_user_id, name, store_domain, status, created_at, updated_at FROM organizations WHERE deleted_at IS NULL ORDER BY created_at DESC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orgs []*models.Organization
	for rows.Next() {
		var org models.Organization
		if err := rows.Scan(&org.ID, &org.OwnerUserID, &org.Name, &org.StoreDomain, &org.Status, &org.CreatedAt, &org.UpdatedAt); err != nil {
			return nil, err
		}
		orgs = append(orgs, &org)
	}
	return orgs, nil
}
