# TryOnAI API Specification

## Base URL

```
https://api.example.com/api/v1
```

## Authentication

### JWT Token (User Authentication)

Include in header:
```
Authorization: Bearer <access_token>
```

### API Key (Merchant Integration)

Include in header:
```
Authorization: Bearer <api_key>
```

## Response Format

All responses are JSON:

```json
{
  "data": {},
  "error": null,
  "request_id": "req_xxx",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Error Responses

```json
{
  "error": "invalid_request",
  "message": "Product image URL is required",
  "request_id": "req_xxx",
  "status": 400
}
```

## Endpoints

### Authentication

#### POST /auth/register

Register new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "full_name": "John Doe"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "email_verified": false
}
```

#### POST /auth/login

Login user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 86400
}
```

#### POST /auth/refresh

Refresh access token.

**Request:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGc...",
  "expires_in": 86400
}
```

#### POST /auth/verify-email

Verify email address.

**Request:**
```json
{
  "code": "123456"
}
```

**Response (200):**
```json
{
  "message": "Email verified"
}
```

### Organizations

#### GET /organizations

List user's organizations.

**Response (200):**
```json
{
  "organizations": [
    {
      "id": "uuid",
      "name": "My Store",
      "store_domain": "store.example.com",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /organizations

Create new organization.

**Request:**
```json
{
  "name": "My Store",
  "store_domain": "store.example.com"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "My Store",
  "store_domain": "store.example.com",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### GET /organizations/:id

Get organization details.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "My Store",
  "store_domain": "store.example.com",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### PATCH /organizations/:id

Update organization.

**Request:**
```json
{
  "name": "Updated Store Name",
  "store_domain": "newdomain.example.com"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Updated Store Name",
  "store_domain": "newdomain.example.com",
  "status": "active",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### API Keys

#### GET /organizations/:id/api-keys

List API keys for organization.

**Response (200):**
```json
{
  "api_keys": [
    {
      "id": "uuid",
      "name": "Production",
      "key_prefix": "sk_live_abc123",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "last_used_at": "2024-01-02T00:00:00Z"
    }
  ]
}
```

#### POST /organizations/:id/api-keys

Create new API key.

**Request:**
```json
{
  "name": "Production"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Production",
  "key": "sk_live_xxx_full_key_shown_only_once",
  "key_prefix": "sk_live_abc123",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### DELETE /organizations/:id/api-keys/:key_id

Revoke API key.

**Response (200):**
```json
{
  "message": "API key revoked"
}
```

#### POST /organizations/:id/api-keys/:key_id/rotate

Rotate API key.

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Production",
  "key": "sk_live_xxx_new_key",
  "key_prefix": "sk_live_def456",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Generation (Merchant API)

#### POST /tryon/generations

Create generation job.

**Request:**
```json
{
  "product_id": "prod_123",
  "product_name": "Summer Dress",
  "product_image_url": "https://store.com/products/dress.jpg",
  "user_photo_url": "https://store.com/uploads/photo.jpg",
  "output_count": 4,
  "callback_url": "https://store.com/webhook"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "status": "queued",
  "product_id": "prod_123",
  "product_name": "Summer Dress",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### GET /tryon/generations/:id

Get generation status.

**Response (200):**
```json
{
  "id": "uuid",
  "status": "completed",
  "product_id": "prod_123",
  "product_name": "Summer Dress",
  "created_at": "2024-01-01T00:00:00Z",
  "completed_at": "2024-01-01T00:05:00Z",
  "processing_time_ms": 300000
}
```

#### GET /tryon/generations/:id/images

Get generated images.

**Response (200):**
```json
{
  "images": [
    {
      "id": "uuid",
      "view_type": "front",
      "url": "https://cdn.example.com/signed-url",
      "expires_at": "2024-01-02T00:00:00Z"
    },
    {
      "id": "uuid",
      "view_type": "left",
      "url": "https://cdn.example.com/signed-url",
      "expires_at": "2024-01-02T00:00:00Z"
    },
    {
      "id": "uuid",
      "view_type": "right",
      "url": "https://cdn.example.com/signed-url",
      "expires_at": "2024-01-02T00:00:00Z"
    },
    {
      "id": "uuid",
      "view_type": "back",
      "url": "https://cdn.example.com/signed-url",
      "expires_at": "2024-01-02T00:00:00Z"
    }
  ]
}
```

#### DELETE /tryon/generations/:id

Delete generation and associated images.

**Response (200):**
```json
{
  "message": "Generation deleted"
}
```

### Usage & Analytics

#### GET /organizations/:id/usage

Get current usage.

**Response (200):**
```json
{
  "total_generations": 150,
  "monthly_generations": 45,
  "remaining_quota": 55,
  "success_rate": 98.5,
  "plan": "Growth",
  "period_start": "2024-01-01T00:00:00Z",
  "period_end": "2024-02-01T00:00:00Z"
}
```

#### GET /organizations/:id/usage/daily

Get daily usage.

**Response (200):**
```json
{
  "daily_usage": [
    {
      "date": "2024-01-01",
      "generations": 10,
      "successful": 9,
      "failed": 1
    }
  ]
}
```

#### GET /organizations/:id/generations

List generations.

**Query Parameters:**
- `limit` (default: 20)
- `offset` (default: 0)
- `status` (queued, processing, completed, failed)

**Response (200):**
```json
{
  "generations": [
    {
      "id": "uuid",
      "product_id": "prod_123",
      "product_name": "Summer Dress",
      "status": "completed",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

### Admin

#### GET /admin/organizations

List all organizations (admin only).

**Response (200):**
```json
{
  "organizations": [
    {
      "id": "uuid",
      "name": "Store 1",
      "owner_email": "owner@example.com",
      "status": "active",
      "total_generations": 500,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /admin/users

List all users (admin only).

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "merchant_owner",
      "email_verified": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /admin/audit-logs

Get audit logs (admin only).

**Response (200):**
```json
{
  "logs": [
    {
      "id": "uuid",
      "action": "api_key_created",
      "resource_type": "api_key",
      "resource_id": "uuid",
      "user_id": "uuid",
      "organization_id": "uuid",
      "ip_address": "192.168.1.1",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /admin/organizations/:id/suspend

Suspend organization (admin only).

**Response (200):**
```json
{
  "message": "Organization suspended"
}
```

#### POST /admin/organizations/:id/activate

Activate organization (admin only).

**Response (200):**
```json
{
  "message": "Organization activated"
}
```

### Health

#### GET /health

Health check.

**Response (200):**
```json
{
  "status": "ok"
}
```

#### GET /ready

Readiness check.

**Response (200):**
```json
{
  "status": "ready"
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limiting

Rate limits are returned in headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1609459200
```

When limit exceeded, returns `429 Too Many Requests`.
