# TryOnAI Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     End Users (Shoppers)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │  Widget  │ (Embeddable JS)
                    └────┬─────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐      ┌────▼────┐     ┌────▼────┐
   │ Frontend │      │   API    │     │  Admin   │
   │Dashboard │      │ (Go)     │     │ Panel    │
   └────┬─────┘      └────┬─────┘     └────┬─────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                    ┌─────▼──────┐
                    │  API Layer  │
                    │  (Echo)     │
                    └─────┬───────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐      ┌────▼────┐     ┌────▼────┐
   │Database  │      │  Cache   │     │ Storage  │
   │(Postgres)│      │ (Redis)  │     │(S3/Minio)│
   └──────────┘      └──────────┘     └──────────┘
        │
        └─────────────────┬──────────────────┐
                          │                  │
                    ┌─────▼────┐      ┌─────▼────┐
                    │  Worker   │      │ Webhooks │
                    │  (Go)     │      │ (Async)  │
                    └───────────┘      └──────────┘
```

## Components

### 1. Frontend (Next.js + TypeScript)

**Location**: `apps/web/`

**Responsibilities**:
- Landing page
- User authentication
- Merchant dashboard
- Admin panel
- API key management
- Usage analytics
- Settings

**Key Pages**:
- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Main dashboard
- `/store/[id]` - Store details
- `/create-store` - Create new store

**Technologies**:
- Next.js 14
- TypeScript
- Tailwind CSS
- React Query
- Zustand

### 2. Backend API (Go + Echo)

**Location**: `services/api/`

**Responsibilities**:
- User authentication
- Organization management
- API key management
- Generation job creation
- Usage tracking
- Webhook management
- Admin operations

**Key Endpoints**:
- `/api/v1/auth/*` - Authentication
- `/api/v1/organizations/*` - Organization management
- `/api/v1/tryon/generations` - Generation API
- `/api/v1/admin/*` - Admin operations

**Technologies**:
- Go 1.21
- Echo framework
- PostgreSQL driver
- Redis client
- JWT

### 3. Worker Service (Go)

**Location**: `services/worker/`

**Responsibilities**:
- Process generation jobs from queue
- Call AI provider
- Save generated images
- Update job status
- Trigger webhooks
- Handle retries

**Technologies**:
- Go 1.21
- Redis (job queue)
- PostgreSQL
- S3 client

### 4. Embeddable Widget (TypeScript)

**Location**: `apps/widget/`

**Responsibilities**:
- Provide embeddable button
- Handle photo upload
- Show consent notice
- Poll for results
- Display generated images
- Error handling

**Technologies**:
- TypeScript
- Vite
- Axios

### 5. Database (PostgreSQL)

**Multi-tenant schema** with tables:
- `users` - Platform users
- `organizations` - Merchant stores
- `api_keys` - API credentials
- `plans` - Subscription plans
- `subscriptions` - Active subscriptions
- `generation_jobs` - Try-on requests
- `generated_images` - Output images
- `usage_records` - Usage tracking
- `audit_logs` - Security audit trail
- `webhooks` - Merchant webhooks

### 6. Cache & Queue (Redis)

**Uses**:
- Session storage
- Rate limiting
- Job queue
- Real-time notifications
- Cache layer

### 7. Object Storage (S3-compatible)

**Stores**:
- User uploaded photos
- Product images
- Generated images
- Temporary files

**Access**: Signed URLs with expiration

## Data Flow

### Generation Flow

```
1. Merchant calls API
   POST /api/v1/tryon/generations
   ├─ Validate API key
   ├─ Check subscription status
   ├─ Check usage limit
   └─ Validate files

2. API creates job
   ├─ Save to database (status: queued)
   ├─ Upload files to S3
   ├─ Create audit log
   └─ Push to Redis queue

3. Worker processes job
   ├─ Fetch from queue
   ├─ Call AI provider
   ├─ Save generated images
   ├─ Update job status (completed)
   └─ Trigger webhook

4. Merchant retrieves results
   GET /api/v1/tryon/generations/:id/images
   ├─ Generate signed URLs
   └─ Return image URLs

5. Cleanup
   ├─ Daily job deletes old photos
   ├─ Deletes old generated images
   └─ Archives audit logs
```

## Multi-Tenancy

### Isolation Levels

**Database Level**:
- All tables include `organization_id`
- Queries filtered by organization
- Foreign key constraints

**Application Level**:
- Middleware validates user owns organization
- API endpoints check tenant access
- Storage paths scoped to organization

**Storage Level**:
- Bucket paths: `/org-{id}/...`
- Signed URLs with organization context
- No cross-tenant access

### Example Query

```sql
SELECT * FROM generation_jobs
WHERE organization_id = $1
AND id = $2
```

## Authentication Flow

### User Login

```
1. User submits email/password
2. API validates credentials
3. API generates JWT tokens
   ├─ Access token (24 hours)
   └─ Refresh token (7 days)
4. Frontend stores tokens
5. Frontend includes access token in requests
```

### API Key Authentication

```
1. Merchant creates API key
2. API generates key and hash
3. Hash stored in database
4. Full key shown once to user
5. Merchant includes key in requests
6. API validates key hash
```

## Rate Limiting

### Strategy

- **Per IP**: 100 req/min (unauthenticated)
- **Per API Key**: 1000 req/min (authenticated)
- **Per Organization**: 10,000 req/day
- **Generation**: 100 gen/min per API key

### Implementation

```go
// Redis-based rate limiter
key := fmt.Sprintf("ratelimit:%s", identifier)
count, _ := redis.Incr(key)
if count > limit {
    return TooManyRequests()
}
redis.Expire(key, 1*time.Minute)
```

## Error Handling

### Error Response Format

```json
{
  "error": "invalid_request",
  "message": "Product image URL is required",
  "request_id": "req_abc123",
  "status": 400
}
```

### Error Types

- `invalid_request` - Bad input (400)
- `unauthorized` - Missing/invalid auth (401)
- `forbidden` - Insufficient permissions (403)
- `not_found` - Resource not found (404)
- `conflict` - Resource conflict (409)
- `rate_limit_exceeded` - Too many requests (429)
- `internal_error` - Server error (500)

## Logging

### Structured Logging

```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "level": "info",
  "request_id": "req_abc123",
  "user_id": "user_123",
  "organization_id": "org_123",
  "action": "generation_created",
  "message": "Generation job created",
  "duration_ms": 150
}
```

### Log Levels

- `debug` - Development information
- `info` - General information
- `warn` - Warning messages
- `error` - Error messages
- `fatal` - Fatal errors

## Deployment Architecture

### Local Development

```
Docker Compose:
├─ PostgreSQL
├─ Redis
├─ MinIO
├─ API
└─ Worker
```

### Production (Planned)

```
Kubernetes:
├─ API pods (replicated)
├─ Worker pods (replicated)
├─ PostgreSQL (managed)
├─ Redis (managed)
├─ S3 (AWS)
└─ CDN (CloudFront)
```

## Security Architecture

### Layers

1. **Network**: HTTPS/TLS
2. **Authentication**: JWT + API keys
3. **Authorization**: RBAC
4. **Input Validation**: Schema validation
5. **Data Protection**: Encryption at rest
6. **Audit**: Comprehensive logging
7. **Rate Limiting**: Per IP/key/org

## Performance Considerations

### Caching

- User sessions in Redis
- API responses cached
- Database query results cached
- Static assets cached in CDN

### Database Optimization

- Indexes on frequently queried columns
- Connection pooling
- Query optimization
- Partitioning for large tables

### Async Processing

- Generation jobs queued
- Webhooks sent asynchronously
- Cleanup jobs run in background
- Email notifications queued

## Scalability

### Horizontal Scaling

- **API**: Stateless, can scale horizontally
- **Worker**: Multiple workers process queue
- **Database**: Read replicas for scaling reads
- **Cache**: Redis cluster for high availability

### Vertical Scaling

- Increase pod resources
- Increase database resources
- Increase cache resources

## Monitoring & Observability

### Metrics

- API response times
- Generation success rate
- Queue depth
- Storage usage
- Error rates

### Logging

- Structured JSON logs
- Centralized log aggregation
- Log retention policies
- Audit trail

### Tracing

- Request ID propagation
- Distributed tracing (planned)
- Performance profiling

## Future Enhancements

1. **Mobile App**
   - Native iOS/Android apps
   - Separate API endpoints
   - Push notifications

2. **Advanced AI**
   - Multiple AI providers
   - Provider failover
   - Quality comparison

3. **Analytics**
   - Advanced dashboards
   - Custom reports
   - Predictive analytics

4. **Integrations**
   - Shopify app
   - WooCommerce plugin
   - Custom integrations

5. **Enterprise Features**
   - SSO/SAML
   - Advanced RBAC
   - Custom branding
   - Dedicated support
