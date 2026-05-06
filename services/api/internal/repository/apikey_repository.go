package repository

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/tryon-ai/api/internal/models"
)

type APIKeyRepository struct {
	db *sql.DB
}

func NewAPIKeyRepository(db *sql.DB) *APIKeyRepository {
	return &APIKeyRepository{db: db}
}

func (r *APIKeyRepository) Create(apiKey *models.APIKey) error {
	apiKey.ID = uuid.New().String()
	apiKey.CreatedAt = time.Now()
	apiKey.Status = models.APIKeyStatusActive

	query := `
		INSERT INTO api_keys (id, organization_id, name, key_prefix, key_hash, scopes, allowed_domains, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := r.db.Exec(query, apiKey.ID, apiKey.OrganizationID, apiKey.Name, apiKey.KeyPrefix, apiKey.KeyHash, apiKey.Scopes, apiKey.AllowedDomains, apiKey.Status, apiKey.CreatedAt)
	return err
}

func (r *APIKeyRepository) GetByHash(keyHash string) (*models.APIKey, error) {
	var apiKey models.APIKey
	query := `SELECT id, organization_id, name, key_prefix, key_hash, scopes, allowed_domains, status, last_used_at, created_at, revoked_at FROM api_keys WHERE key_hash = $1 AND status = $2`
	err := r.db.QueryRow(query, keyHash, models.APIKeyStatusActive).Scan(
		&apiKey.ID, &apiKey.OrganizationID, &apiKey.Name, &apiKey.KeyPrefix, &apiKey.KeyHash, &apiKey.Scopes, &apiKey.AllowedDomains, &apiKey.Status, &apiKey.LastUsedAt, &apiKey.CreatedAt, &apiKey.RevokedAt,
	)
	if err != nil {
		return nil, err
	}
	return &apiKey, nil
}

func (r *APIKeyRepository) GetByOrganizationID(orgID string) ([]*models.APIKey, error) {
	query := `SELECT id, organization_id, name, key_prefix, key_hash, scopes, allowed_domains, status, last_used_at, created_at, revoked_at FROM api_keys WHERE organization_id = $1 AND revoked_at IS NULL ORDER BY created_at DESC`
	rows, err := r.db.Query(query, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var keys []*models.APIKey
	for rows.Next() {
		var key models.APIKey
		if err := rows.Scan(&key.ID, &key.OrganizationID, &key.Name, &key.KeyPrefix, &key.KeyHash, &key.Scopes, &key.AllowedDomains, &key.Status, &key.LastUsedAt, &key.CreatedAt, &key.RevokedAt); err != nil {
			return nil, err
		}
		keys = append(keys, &key)
	}
	return keys, nil
}

func (r *APIKeyRepository) UpdateLastUsed(id string) error {
	query := `UPDATE api_keys SET last_used_at = $1 WHERE id = $2`
	_, err := r.db.Exec(query, time.Now(), id)
	return err
}

func (r *APIKeyRepository) Revoke(id string) error {
	query := `UPDATE api_keys SET status = $1, revoked_at = $2 WHERE id = $3`
	_, err := r.db.Exec(query, models.APIKeyStatusRevoked, time.Now(), id)
	return err
}

func (r *APIKeyRepository) CountByOrganization(orgID string) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM api_keys WHERE organization_id = $1 AND status = $2 AND revoked_at IS NULL`
	err := r.db.QueryRow(query, orgID, models.APIKeyStatusActive).Scan(&count)
	return count, err
}
