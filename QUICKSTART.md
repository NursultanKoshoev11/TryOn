# TryOnAI Quick Start Guide

## 5-Minute Setup

### Prerequisites

- Docker & Docker Compose
- Git
- 2GB free disk space

### Step 1: Clone Repository

```bash
git clone https://github.com/tryon-ai/saas.git
cd tryon-ai-saas
cp .env.example .env
```

### Step 2: Start Services

```bash
make up
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- MinIO (port 9000, UI at 9001)
- API (port 8080)
- Worker (background)

### Step 3: Run Migrations

```bash
make migrate-up
```

### Step 4: Seed Database

```bash
make seed
```

Creates test data:
- Admin user: `admin@example.com` / `password`
- Merchant user: `merchant@example.com` / `password`
- Test store with API key

### Step 5: Start Frontend

```bash
cd apps/web
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

### Step 6: Test API

```bash
curl http://localhost:8080/health
```

Response:
```json
{"status":"ok"}
```

## Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | merchant@example.com / password |
| API | http://localhost:8080 | - |
| API Docs | http://localhost:8080/swagger | - |
| MinIO | http://localhost:9001 | minioadmin / minioadmin |
| PostgreSQL | localhost:5432 | tryon_user / tryon_password |
| Redis | localhost:6379 | - |

## First Steps

### 1. Login to Dashboard

1. Go to http://localhost:3000
2. Click "Login"
3. Enter: `merchant@example.com` / `password`
4. You'll see the test store

### 2. View API Keys

1. Click on "Test Fashion Store"
2. Scroll to "API Keys" section
3. You'll see the test API key

### 3. Test API

```bash
API_KEY="sk_live_test_key_from_dashboard"

curl -X POST http://localhost:8080/api/v1/tryon/generations \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "test_product",
    "product_name": "Test Product",
    "product_image_url": "https://via.placeholder.com/300",
    "user_photo_url": "https://via.placeholder.com/300",
    "output_count": 4
  }'
```

### 4. Check Generation Status

```bash
GEN_ID="<generation_id_from_response>"

curl http://localhost:8080/api/v1/tryon/generations/$GEN_ID \
  -H "Authorization: Bearer $API_KEY"
```

## Common Commands

```bash
# View logs
make logs

# View API logs only
make logs-api

# Stop services
make down

# Clean everything
make clean

# Run tests
make test

# Database shell
make shell-postgres

# Redis shell
make shell-redis

# API shell
make shell-api
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8080
lsof -i :8080

# Kill process
kill -9 <PID>
```

### Database Connection Error

```bash
# Check if PostgreSQL is running
make ps

# Restart services
make down
make up
```

### MinIO Not Working

```bash
# Check MinIO logs
make logs-minio

# Restart MinIO
docker-compose restart minio
```

### API Not Starting

```bash
# Check API logs
make logs-api

# Rebuild API
docker-compose build api
make up
```

## Next Steps

1. **Read Documentation**
   - `docs/architecture.md` - System design
   - `docs/api-spec.md` - API reference
   - `docs/integration-guide.md` - Integration examples

2. **Explore Code**
   - `services/api/` - Backend API
   - `apps/web/` - Frontend dashboard
   - `apps/widget/` - Embeddable widget

3. **Create Your Store**
   - Go to http://localhost:3000
   - Click "Create Store"
   - Generate API key
   - Start integrating

4. **Test Widget**
   - See `apps/widget/` for widget development
   - Test on product pages

5. **Deploy**
   - See `docs/deployment.md` for production setup

## Development Tips

### Hot Reload

Frontend and API support hot reload:
- Edit files in `apps/web/src/` - changes appear instantly
- Edit files in `services/api/` - restart with `make logs-api`

### Database Changes

To add new tables:

1. Create migration in `scripts/migrations/`
2. Run: `make migrate-up`
3. Update Go models
4. Restart API

### Testing API Endpoints

Use curl or Postman:

```bash
# Get user info
curl http://localhost:8080/api/v1/me \
  -H "Authorization: Bearer <access_token>"

# List organizations
curl http://localhost:8080/api/v1/organizations \
  -H "Authorization: Bearer <access_token>"

# Create generation
curl -X POST http://localhost:8080/api/v1/tryon/generations \
  -H "Authorization: Bearer <api_key>" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

## Getting Help

- **Documentation**: See `docs/` folder
- **Issues**: GitHub Issues
- **Email**: support@example.com
- **Slack**: Join our community

## What's Next?

- [ ] Read architecture documentation
- [ ] Explore API endpoints
- [ ] Test widget integration
- [ ] Create test store
- [ ] Generate API key
- [ ] Make first API call
- [ ] Review security documentation
- [ ] Check privacy policy
- [ ] Plan deployment

Happy coding! 🚀
