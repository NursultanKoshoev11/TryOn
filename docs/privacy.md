# TryOnAI Privacy Policy

## Overview

TryOnAI is privacy-first. We minimize data collection, provide transparency, and give users control over their data.

## Data We Collect

### From Store Owners (Merchants)

- Email address
- Full name
- Store name and domain
- Payment information (if applicable)
- API usage data
- Webhook configurations
- IP address and user agent

### From End Customers (Shoppers)

- Uploaded photo (temporary)
- Product selection
- Generation request metadata
- IP address and user agent

**Important**: We do NOT collect:
- Identity information
- Face embeddings or biometric data
- Body measurements or comparisons
- Personal information beyond what's necessary

## How We Use Data

### Store Owners

- Provide and improve the service
- Process payments
- Send service notifications
- Prevent fraud and abuse
- Comply with legal obligations
- Analyze usage patterns (anonymized)

### End Customers

- Generate virtual try-on images
- Provide results to the shopper
- Prevent abuse and fraud
- Improve AI model (with explicit consent only)

## Data Retention

### User Photos

- **Default**: 30 days
- **Growth Plan**: 30 days
- **Scale Plan**: 90 days
- **Enterprise**: Configurable (up to 1 year)
- **Automatic Deletion**: Daily cleanup job
- **Manual Deletion**: Available via API

### Generated Images

- **Retention**: 90 days
- **Automatic Deletion**: Daily cleanup job
- **Manual Deletion**: Available via API

### Audit Logs

- **Retention**: 1 year
- **Access**: Admin and organization owner only
- **Deletion**: After 1 year automatically

### Usage Records

- **Retention**: 2 years
- **Purpose**: Billing and analytics
- **Deletion**: After 2 years automatically

## Data Security

### Encryption

- **In Transit**: HTTPS/TLS 1.2+
- **At Rest**: AES-256 encryption
- **Database**: SSL connections
- **Backups**: Encrypted storage

### Access Control

- **Role-Based**: Different access levels
- **Tenant Isolation**: Strict data separation
- **Audit Logging**: All access logged
- **Signed URLs**: Time-limited image access

### Storage Security

- **Private Buckets**: No public access
- **Signed URLs**: Temporary access tokens
- **Versioning**: Enabled for recovery
- **Encryption**: Server-side encryption

## User Rights

### Right to Access

You can request all data we hold about you:

```
GET /api/v1/me/data-export
```

Response includes:
- Account information
- All generations
- Usage history
- Audit logs

### Right to Rectification

You can update your information:

```
PATCH /api/v1/me
{
  "full_name": "Updated Name",
  "email": "newemail@example.com"
}
```

### Right to Erasure ("Right to be Forgotten")

You can request deletion of your account and data:

```
DELETE /api/v1/me
```

This will:
- Delete your account
- Delete all personal data
- Delete all generations
- Delete all audit logs
- Retain only anonymized usage data for 2 years

### Right to Data Portability

You can export your data in standard format:

```
GET /api/v1/me/data-export?format=json
```

Includes:
- Account data
- All generations with metadata
- Generated images (as URLs)
- Usage history

### Right to Restrict Processing

You can restrict how we use your data:

```
PATCH /api/v1/me/privacy-settings
{
  "allow_analytics": false,
  "allow_ai_training": false
}
```

### Right to Object

You can object to specific processing:

```
POST /api/v1/me/objections
{
  "processing_type": "marketing_emails"
}
```

## Consent Management

### Photo Upload Consent

Before uploading a photo, users must:

1. Read consent notice
2. Understand photo will be processed by AI
3. Acknowledge photo will be deleted after retention period
4. Check consent checkbox
5. Confirm they have rights to the photo

### AI Training Consent

Separate consent for using photos to improve AI:

- **Default**: Not collected
- **Opt-In**: Users can explicitly consent
- **Revocable**: Can be withdrawn anytime
- **Documented**: Consent recorded with timestamp

### Marketing Consent

Separate consent for marketing communications:

- **Default**: Not collected
- **Opt-In**: Users can subscribe
- **Unsubscribe**: One-click unsubscribe in emails
- **Preference Center**: Manage all preferences

## Third-Party Services

### Payment Processing

- **Provider**: Stripe (or similar)
- **Data**: Payment information only
- **Privacy**: Stripe Privacy Policy applies
- **PCI Compliance**: Stripe handles PCI compliance

### Email Service

- **Provider**: SendGrid (or similar)
- **Data**: Email address and content
- **Privacy**: SendGrid Privacy Policy applies
- **Unsubscribe**: Available in all emails

### Analytics

- **Provider**: Plausible or similar (privacy-focused)
- **Data**: Anonymized usage data
- **Privacy**: No personal data collected
- **Opt-Out**: Available in settings

### AI Provider

- **Data**: Product images and generated results only
- **Privacy**: AI provider privacy policy applies
- **No Personal Data**: User photos not sent to AI provider
- **Contractual Obligations**: Data processing agreements in place

## Cookies

### Session Cookies

- **Purpose**: Maintain user session
- **Duration**: Session only
- **Required**: Yes

### Preference Cookies

- **Purpose**: Remember user preferences
- **Duration**: 1 year
- **Required**: No

### Analytics Cookies

- **Purpose**: Understand usage patterns
- **Duration**: 1 year
- **Required**: No
- **Opt-Out**: Available in settings

## Children's Privacy

### Age Restriction

- **Minimum Age**: 18 years old
- **Verification**: Not required but assumed
- **Parental Consent**: Required for users under 18

### Special Protections

If we detect a user is under 18:

- Stricter content safety checks
- No AI training consent
- Shorter data retention (7 days)
- Parental notification (if possible)

## International Data Transfers

### Data Location

- **Primary**: United States
- **Backup**: European Union
- **Compliance**: GDPR, CCPA, LGPD

### Standard Contractual Clauses

- **SCCs**: In place for EU data transfers
- **Adequacy**: Reviewed regularly
- **Safeguards**: Additional protections implemented

## Policy Changes

### Notification

- **Changes**: Notified via email
- **Notice Period**: 30 days before changes take effect
- **Opt-Out**: Can delete account if disagree

### Version History

- **Current Version**: 1.0
- **Last Updated**: 2024-01-01
- **Effective Date**: 2024-01-01

## Contact Us

### Privacy Questions

**Email**: privacy@example.com

**Mailing Address**:
```
TryOnAI Privacy Team
123 Main Street
San Francisco, CA 94105
USA
```

### Data Subject Requests

To exercise your rights:

1. Email privacy@example.com
2. Include request type (access, deletion, portability, etc.)
3. Provide proof of identity
4. We'll respond within 30 days

### Data Protection Officer

**Email**: dpo@example.com

### Complaints

If you believe we've violated your privacy rights:

1. Contact us first
2. If unsatisfied, file complaint with your local data protection authority

## Compliance

### GDPR (EU)

- **Legal Basis**: Consent, legitimate interest, contract
- **Data Protection Officer**: Appointed
- **Privacy by Design**: Implemented
- **Data Processing Agreements**: In place

### CCPA (California)

- **Consumer Rights**: Implemented
- **Opt-Out**: Available
- **Do Not Sell**: We don't sell personal data
- **Disclosure**: Provided in this policy

### LGPD (Brazil)

- **Legal Basis**: Consent, legitimate interest
- **Data Protection**: Implemented
- **User Rights**: Available

## Data Breach Notification

### In Case of Breach

1. **Investigation**: Immediate investigation
2. **Notification**: Users notified within 72 hours
3. **Authorities**: Reported to authorities if required
4. **Remediation**: Steps taken to prevent recurrence

### What We'll Tell You

- What data was affected
- What happened
- What we're doing about it
- What you can do
- Contact information for questions

## Privacy by Design

### Principles

1. **Data Minimization**: Collect only necessary data
2. **Purpose Limitation**: Use data only for stated purpose
3. **Storage Limitation**: Delete data when no longer needed
4. **Integrity and Confidentiality**: Protect data from unauthorized access
5. **Accountability**: Document all processing

### Implementation

- Privacy impact assessments
- Regular audits
- Employee training
- Vendor management
- Incident response plan

## Frequently Asked Questions

### Q: Do you use my photos to train AI models?

**A**: No, unless you explicitly consent. We never use photos for AI training without separate, explicit consent.

### Q: How long do you keep my photos?

**A**: By default, 30 days. Enterprise customers can configure up to 1 year. You can request deletion anytime.

### Q: Can I delete my account?

**A**: Yes. Go to Settings > Account > Delete Account. All personal data will be deleted.

### Q: Do you sell my data?

**A**: No. We never sell personal data to third parties.

### Q: Can I export my data?

**A**: Yes. Go to Settings > Privacy > Export Data. You'll get a JSON file with all your data.

### Q: How do I opt out of analytics?

**A**: Go to Settings > Privacy > Analytics. Toggle off to opt out.

### Q: What if I'm under 18?

**A**: We require users to be 18+. If you're under 18, parental consent is required.

### Q: How do I contact you about privacy?

**A**: Email privacy@example.com with your question or request.
