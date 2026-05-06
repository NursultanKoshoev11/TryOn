package models

import (
	"time"
)

type APIKeyStatus string

const (
	APIKeyStatusActive  APIKeyStatus = "active"
	APIKeyStatusRevoked APIKeyStatus = "revoked"
)

type APIKey struct {
	ID             string       `json:"id" db:"id"`
	OrganizationID string       `json:"organization_id" db:"organization_id"`
	Name           string       `json:"name" db:"name"`
	KeyPrefix      string       `json:"key_prefix" db:"key_prefix"`
	KeyHash        string       `json:"-" db:"key_hash"`
	Scopes         string       `json:"scopes" db:"scopes"`
	AllowedDomains string       `json:"allowed_domains" db:"allowed_domains"`
	Status         APIKeyStatus `json:"status" db:"status"`
	LastUsedAt     *time.Time   `json:"last_used_at" db:"last_used_at"`
	CreatedAt      time.Time    `json:"created_at" db:"created_at"`
	RevokedAt      *time.Time   `json:"revoked_at" db:"revoked_at"`
}

type CreateAPIKeyRequest struct {
	Name           string `json:"name" validate:"required"`
	AllowedDomains string `json:"allowed_domains,omitempty"`
}

type CreateAPIKeyResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Key       string    `json:"key"` // Full key shown only once
	KeyPrefix string    `json:"key_prefix"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}
