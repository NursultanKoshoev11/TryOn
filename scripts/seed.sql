-- Insert default plans
INSERT INTO plans (name, monthly_price, included_generations, overage_price_per_generation, max_api_keys, retention_days, features_json)
VALUES
    ('Starter', 29.00, 100, 0.50, 1, 30, '{"webhook": false, "analytics": true, "support": "email"}'),
    ('Growth', 99.00, 500, 0.30, 5, 30, '{"webhook": true, "analytics": true, "support": "priority"}'),
    ('Scale', 299.00, 2000, 0.20, 20, 90, '{"webhook": true, "analytics": true, "support": "dedicated", "custom_branding": true}'),
    ('Enterprise', NULL, NULL, 0.10, NULL, 365, '{"webhook": true, "analytics": true, "support": "dedicated", "custom_branding": true, "sso": true}')
ON CONFLICT (name) DO NOTHING;

-- Insert test admin user
INSERT INTO users (email, password_hash, full_name, role, email_verified)
VALUES
    ('admin@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUmGEJiq', 'Admin User', 'platform_admin', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insert test merchant user
INSERT INTO users (email, password_hash, full_name, role, email_verified)
VALUES
    ('merchant@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUmGEJiq', 'Merchant User', 'merchant_owner', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insert test organization
INSERT INTO organizations (owner_user_id, name, store_domain, status)
SELECT id, 'Test Fashion Store', 'test-store.example.com', 'active'
FROM users WHERE email = 'merchant@example.com'
ON CONFLICT DO NOTHING;

-- Insert test subscription
INSERT INTO subscriptions (organization_id, plan_id, status, current_period_start, current_period_end)
SELECT o.id, p.id, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days'
FROM organizations o, plans p
WHERE o.name = 'Test Fashion Store' AND p.name = 'Starter'
ON CONFLICT (organization_id) DO NOTHING;