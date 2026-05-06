package models

import (
	"time"
)

type SubscriptionStatus string

const (
	SubStatusActive    SubscriptionStatus = "active"
	SubStatusPastDue   SubscriptionStatus = "past_due"
	SubStatusCancelled SubscriptionStatus = "cancelled"
	SubStatusInactive  SubscriptionStatus = "inactive"
)

type Plan struct {
	ID                         string    `json:"id" db:"id"`
	Name                       string    `json:"name" db:"name"`
	MonthlyPrice               float64   `json:"monthly_price" db:"monthly_price"`
	IncludedGenerations        int       `json:"included_generations" db:"included_generations"`
	OveragePricePerGeneration  float64   `json:"overage_price_per_generation" db:"overage_price_per_generation"`
	MaxAPIKeys                 int       `json:"max_api_keys" db:"max_api_keys"`
	RetentionDays              int       `json:"retention_days" db:"retention_days"`
	FeaturesJSON               string    `json:"features_json" db:"features_json"`
	CreatedAt                  time.Time `json:"created_at" db:"created_at"`
}

type Subscription struct {
	ID                           string             `json:"id" db:"id"`
	OrganizationID               string             `json:"organization_id" db:"organization_id"`
	PlanID                       string             `json:"plan_id" db:"plan_id"`
	Status                       SubscriptionStatus `json:"status" db:"status"`
	CurrentPeriodStart           time.Time          `json:"current_period_start" db:"current_period_start"`
	CurrentPeriodEnd             time.Time          `json:"current_period_end" db:"current_period_end"`
	CancelAtPeriodEnd            bool               `json:"cancel_at_period_end" db:"cancel_at_period_end"`
	BillingProvider              *string            `json:"billing_provider" db:"billing_provider"`
	BillingProviderCustomerID    *string            `json:"billing_provider_customer_id" db:"billing_provider_customer_id"`
	BillingProviderSubscriptionID *string           `json:"billing_provider_subscription_id" db:"billing_provider_subscription_id"`
	CreatedAt                    time.Time          `json:"created_at" db:"created_at"`
	UpdatedAt                    time.Time          `json:"updated_at" db:"updated_at"`
}

type UsageRecord struct {
	ID             string    `json:"id" db:"id"`
	OrganizationID string    `json:"organization_id" db:"organization_id"`
	APIKeyID       *string   `json:"api_key_id" db:"api_key_id"`
	GenerationID   *string   `json:"generation_id" db:"generation_id"`
	Units          int       `json:"units" db:"units"`
	CostEstimate   float64   `json:"cost_estimate" db:"cost_estimate"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
}

type UsageResponse struct {
	TotalGenerations   int     `json:"total_generations"`
	MonthlyGenerations int     `json:"monthly_generations"`
	RemainingQuota     int     `json:"remaining_quota"`
	SuccessRate        float64 `json:"success_rate"`
	Plan               string  `json:"plan"`
	PeriodStart        string  `json:"period_start"`
	PeriodEnd          string  `json:"period_end"`
}
