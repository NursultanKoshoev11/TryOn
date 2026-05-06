package repository

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/tryon-ai/api/internal/models"
)

type SubscriptionRepository struct {
	db *sql.DB
}

func NewSubscriptionRepository(db *sql.DB) *SubscriptionRepository {
	return &SubscriptionRepository{db: db}
}

func (r *SubscriptionRepository) GetByOrganizationID(orgID string) (*models.Subscription, error) {
	var sub models.Subscription
	query := `SELECT id, organization_id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end, billing_provider, billing_provider_customer_id, billing_provider_subscription_id, created_at, updated_at FROM subscriptions WHERE organization_id = $1`
	err := r.db.QueryRow(query, orgID).Scan(
		&sub.ID, &sub.OrganizationID, &sub.PlanID, &sub.Status, &sub.CurrentPeriodStart, &sub.CurrentPeriodEnd, &sub.CancelAtPeriodEnd, &sub.BillingProvider, &sub.BillingProviderCustomerID, &sub.BillingProviderSubscriptionID, &sub.CreatedAt, &sub.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &sub, nil
}

func (r *SubscriptionRepository) Create(sub *models.Subscription) error {
	sub.ID = uuid.New().String()
	sub.CreatedAt = time.Now()
	sub.UpdatedAt = time.Now()

	query := `
		INSERT INTO subscriptions (id, organization_id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := r.db.Exec(query, sub.ID, sub.OrganizationID, sub.PlanID, sub.Status, sub.CurrentPeriodStart, sub.CurrentPeriodEnd, sub.CancelAtPeriodEnd, sub.CreatedAt, sub.UpdatedAt)
	return err
}

func (r *SubscriptionRepository) GetPlanByID(planID string) (*models.Plan, error) {
	var plan models.Plan
	query := `SELECT id, name, monthly_price, included_generations, overage_price_per_generation, max_api_keys, retention_days, features_json, created_at FROM plans WHERE id = $1`
	err := r.db.QueryRow(query, planID).Scan(
		&plan.ID, &plan.Name, &plan.MonthlyPrice, &plan.IncludedGenerations, &plan.OveragePricePerGeneration, &plan.MaxAPIKeys, &plan.RetentionDays, &plan.FeaturesJSON, &plan.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &plan, nil
}

func (r *SubscriptionRepository) GetAllPlans() ([]*models.Plan, error) {
	query := `SELECT id, name, monthly_price, included_generations, overage_price_per_generation, max_api_keys, retention_days, features_json, created_at FROM plans ORDER BY monthly_price ASC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var plans []*models.Plan
	for rows.Next() {
		var plan models.Plan
		if err := rows.Scan(&plan.ID, &plan.Name, &plan.MonthlyPrice, &plan.IncludedGenerations, &plan.OveragePricePerGeneration, &plan.MaxAPIKeys, &plan.RetentionDays, &plan.FeaturesJSON, &plan.CreatedAt); err != nil {
			return nil, err
		}
		plans = append(plans, &plan)
	}
	return plans, nil
}

func (r *SubscriptionRepository) CreateUsageRecord(record *models.UsageRecord) error {
	record.ID = uuid.New().String()
	record.CreatedAt = time.Now()

	query := `
		INSERT INTO usage_records (id, organization_id, api_key_id, generation_id, units, cost_estimate, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.Exec(query, record.ID, record.OrganizationID, record.APIKeyID, record.GenerationID, record.Units, record.CostEstimate, record.CreatedAt)
	return err
}
