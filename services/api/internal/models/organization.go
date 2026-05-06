package models

import (
	"time"
)

type OrganizationStatus string

const (
	OrgStatusActive    OrganizationStatus = "active"
	OrgStatusSuspended OrganizationStatus = "suspended"
	OrgStatusDeleted   OrganizationStatus = "deleted"
)

type Organization struct {
	ID                     string             `json:"id" db:"id"`
	OwnerUserID            string             `json:"owner_user_id" db:"owner_user_id"`
	Name                   string             `json:"name" db:"name"`
	StoreDomain            string             `json:"store_domain" db:"store_domain"`
	Status                 OrganizationStatus `json:"status" db:"status"`
	CreatedAt              time.Time          `json:"created_at" db:"created_at"`
	UpdatedAt              time.Time          `json:"updated_at" db:"updated_at"`
	DeletedAt              *time.Time         `json:"deleted_at,omitempty" db:"deleted_at"`
}

type CreateOrganizationRequest struct {
	Name        string `json:"name" validate:"required"`
	StoreDomain string `json:"store_domain" validate:"required"`
}

type UpdateOrganizationRequest struct {
	Name        string `json:"name,omitempty"`
	StoreDomain string `json:"store_domain,omitempty"`
}

type OrganizationMemberRole string

const (
	MemberRoleOwner     OrganizationMemberRole = "owner"
	MemberRoleAdmin     OrganizationMemberRole = "admin"
	MemberRoleDeveloper OrganizationMemberRole = "developer"
	MemberRoleViewer    OrganizationMemberRole = "viewer"
)

type OrganizationMember struct {
	ID             string                 `json:"id" db:"id"`
	OrganizationID string                 `json:"organization_id" db:"organization_id"`
	UserID         string                 `json:"user_id" db:"user_id"`
	Role           OrganizationMemberRole `json:"role" db:"role"`
	CreatedAt      time.Time              `json:"created_at" db:"created_at"`
}
