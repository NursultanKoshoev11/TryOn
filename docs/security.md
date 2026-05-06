# TryOnAI Security Documentation

## Overview

Security is a core principle of TryOnAI. This document outlines our security practices and requirements.

## Authentication & Authorization

### User Authentication

- **Password Hashing**: Argon2id with configurable parameters
- **Access Tokens**: JWT with 24-hour expiration
- **Refresh Tokens**: JWT with 7-day expiration, rotated on use
- **Email Verification**: Required before account activation
- **Password Reset**: Secure token-based flow

### API Key Security

- **Key Format**: `sk_live_` prefix for production, `sk_test_` for testing
- **Key Storage**: SHA-256 hash in database, never plaintext
- **Key Display**: Shown only once at creation
- **Key Rotation**: Supported via rotate endpoint
- **Key Revocation**: Immediate revocation on demand
- **Key Scoping**: Can be restricted to specific domains
- **Rate Limiting**: Per-key rate limits enforced

### Role-Based Access Control

```
platform_admin
  ├── View all organizations
  ├── View all users
  ├── Suspend/activate organizations
  ├── View system logs
  └── View audit logs

merchant_owner
  ├── Manage organization
  ├── Create/revoke API keys
  ├── View usage analytics
  ├── Manage team members
  └── Configure webhooks

merchant_admin
  ├── Manage organization (limited)
  ├── View API keys
  ├── View usage analytics
  └── Manage team members

merchant_developer
  ├── View API keys
  ├── View usage analytics
  └── Create generations

merchant_viewer
  ├── View usage analytics
  └── View generations
```

## Data Protection

### Encryption in Transit

- **HTTPS Only**: All API endpoints require HTTPS
- **TLS 1.2+**: Minimum TLS version enforced
- **Certificate Pinning**: Recommended for mobile apps
- **HSTS**: HTTP Strict-Transport-Security enabled

### Encryption at Rest

- **Database**: PostgreSQL with SSL connections
- **Storage**: S3 server-side encryption (AES-256)
- **Backups**: Encrypted backups stored securely
- **Secrets**: Environment variables, never in code

### Data Retention

- **User Photos**: Deleted after 30 days (configurable per plan)
- **Generated Images**: Deleted after 90 days
- **Audit Logs**: Retained for 1 year
- **Usage Records**: Retained for 2 years
- **Automatic Cleanup**: Daily background job
- **Manual Deletion**: Available via API

## Input Validation

### File Upload Validation

- **Allowed Types**: JPEG, PNG, WebP only
- **Max Size**: 10MB per file
- **Image Dimensions**: 100x100 to 4000x4000 pixels
- **Malware Scanning**: Placeholder for integration
- **Content Validation**: Magic number verification

### API Input Validation

- **Email**: RFC 5322 compliant validation
- **URLs**: Scheme and domain validation
- **JSON**: Schema validation on all endpoints
- **String Length**: Max length enforced
- **Numeric Ranges**: Min/max validation
- **Enum Values**: Whitelist validation

### SQL Injection Prevention

- **Parameterized Queries**: All database queries use parameters
- **ORM Usage**: Recommended for application code
- **Input Escaping**: Applied at database layer

## Rate Limiting

### Per IP

- **Limit**: 100 requests per minute
- **Applies To**: All unauthenticated endpoints
- **Response**: 429 Too Many Requests

### Per API Key

- **Limit**: 1000 requests per minute
- **Applies To**: All authenticated endpoints
- **Response**: 429 Too Many Requests

### Per Organization

- **Limit**: 10,000 requests per day
- **Applies To**: All organization endpoints
- **Response**: 429 Too Many Requests

### Generation Endpoint

- **Limit**: 100 generations per minute per API key
- **Applies To**: POST /api/v1/tryon/generations
- **Response**: 429 Too Many Requests

## Audit Logging

### Logged Events

- User registration
- User login (success and failure)
- User logout
- Password change
- Email verification
- API key creation
- API key revocation
- API key rotation
- Organization creation
- Organization update
- Organization deletion
- Subscription change
- Generation creation
- Generation deletion
- Image deletion
- Webhook configuration
- Admin actions

### Log Contents

```json
{
  "id": "uuid",
  "timestamp": "2024-01-01T12:00:00Z",
  "user_id": "uuid",
  "organization_id": "uuid",
  "action": "api_key_created",
  "resource_type": "api_key",
  "resource_id": "uuid",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "status": "success",
  "details": {}
}
```

### Log Retention

- **Retention Period**: 1 year
- **Access**: Admin only
- **Export**: Available via API
- **Immutable**: Cannot be modified after creation

## API Security

### CORS Policy

```
Allowed Origins:
  - https://app.example.com
  - https://widget.example.com
  - https://*.example.com (for merchant domains)

Allowed Methods:
  - GET
  - POST
  - PUT
  - PATCH
  - DELETE

Allowed Headers:
  - Content-Type
  - Authorization
  - X-Request-ID

Exposed Headers:
  - X-RateLimit-Limit
  - X-RateLimit-Remaining
  - X-RateLimit-Reset
```

### Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

### Error Handling

- **No Stack Traces**: Production errors don't expose stack traces
- **Generic Messages**: Errors don't leak system information
- **Request ID**: All errors include request ID for debugging
- **Logging**: Detailed errors logged server-side

## Privacy & Data Protection

### GDPR Compliance

- **Data Subject Rights**: Implemented
  - Right to access
  - Right to rectification
  - Right to erasure ("right to be forgotten")
  - Right to restrict processing
  - Right to data portability
  - Right to object

### Data Minimization

- **Collect Only Necessary Data**: No unnecessary fields
- **Purpose Limitation**: Data used only for stated purpose
- **Storage Limitation**: Data deleted when no longer needed
- **Accuracy**: Data kept accurate and up-to-date

### Consent Management

- **Explicit Consent**: Required before photo upload
- **Consent Records**: Stored with generation
- **Consent Withdrawal**: Can be withdrawn anytime
- **Privacy Policy**: Linked in all consent flows

## Content Safety

### Prohibited Content

- Nudity or sexual content
- Sexualized images of minors
- Body shaming or negative body commentary
- Hate speech or discrimination
- Violence or gore
- Illegal content

### Safety Checks

- **Age Detection**: Placeholder for minor detection
- **Content Moderation**: Placeholder for content filtering
- **Manual Review**: Flagged content reviewed by team
- **Reporting**: Users can report inappropriate content

## Tenant Isolation

### Database Level

- **Organization ID**: All tables include organization_id
- **Row-Level Security**: Queries filtered by organization_id
- **Foreign Keys**: Enforce referential integrity
- **Indexes**: Optimized for tenant queries

### Application Level

- **Middleware**: Validates user owns organization
- **API Endpoints**: All endpoints check tenant access
- **Storage**: Separate paths per organization
- **Webhooks**: Scoped to organization

### Storage Level

- **Bucket Paths**: `/org-{id}/...` structure
- **Access Control**: Signed URLs with expiration
- **Public Access**: Disabled on all buckets
- **Versioning**: Enabled for recovery

## Vulnerability Management

### Dependency Management

- **Automated Scanning**: Dependencies scanned for vulnerabilities
- **Regular Updates**: Security patches applied promptly
- **Pinned Versions**: Exact versions specified
- **Audit**: `npm audit` and `go mod tidy` regularly

### Code Security

- **Static Analysis**: Linting and security scanning
- **Code Review**: All changes reviewed before merge
- **Testing**: Unit and integration tests required
- **SAST**: Static application security testing

### Incident Response

- **Security Team**: Dedicated security contact
- **Disclosure Policy**: Responsible disclosure encouraged
- **Response Time**: Critical issues addressed within 24 hours
- **Communication**: Affected users notified promptly

## Compliance

### Standards

- **OWASP Top 10**: Addressed in design and implementation
- **CWE**: Common Weakness Enumeration mitigations
- **NIST**: Cybersecurity framework alignment

### Certifications (Planned)

- SOC 2 Type II
- ISO 27001
- GDPR Compliance

## Security Checklist for Merchants

- [ ] Use HTTPS for all integrations
- [ ] Store API keys securely (environment variables)
- [ ] Rotate API keys regularly
- [ ] Verify webhook signatures
- [ ] Implement rate limiting on your side
- [ ] Log all API calls
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated
- [ ] Use strong passwords
- [ ] Enable two-factor authentication (when available)

## Reporting Security Issues

If you discover a security vulnerability, please email:

**security@example.com**

Do not open public issues for security vulnerabilities.

Include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 24 hours and provide updates on our progress.
