version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: tryon_postgres
    environment:
      POSTGRES_USER: tryon_user
      POSTGRES_PASSWORD: tryon_password
      POSTGRES_DB: tryon_ai_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U tryon_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache & Queue
  redis:
    image: redis:7-alpine
    container_name: tryon_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # MinIO S3-compatible Storage
  minio:
    image: minio/minio:latest
    container_name: tryon_minio
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/minio_data
    command: server /minio_data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Create MinIO bucket
  minio-init:
    image: minio/mc:latest
    container_name: tryon_minio_init
    depends_on:
      minio:
        condition: service_healthy
    entrypoint: >
      /bin/sh -c "
      /usr/bin/mc config host add myminio http://minio:9000 minioadmin minioadmin;
      /usr/bin/mc mb myminio/tryon-ai;
      /usr/bin/mc anonymous set public myminio/tryon-ai;
      exit 0;
      "

  # Go API Server
  api:
    build:
      context: ./services/api
      dockerfile: Dockerfile
    container_name: tryon_api
    environment:
      DATABASE_URL: postgres://tryon_user:tryon_password@postgres:5432/tryon_ai_db
      REDIS_URL: redis://redis:6379/0
      S3_ENDPOINT: http://minio:9000
      S3_BUCKET: tryon-ai
      S3_ACCESS_KEY: minioadmin
      S3_SECRET_KEY: minioadmin
      S3_USE_SSL: "false"
      JWT_SECRET: dev-secret-key-change-in-production
      JWT_REFRESH_SECRET: dev-refresh-secret-key
      API_KEY_SECRET: dev-api-key-secret
      ENVIRONMENT: development
      PORT: 8080
      LOG_LEVEL: debug
      CORS_ALLOWED_ORIGINS: http://localhost:3000,http://localhost:5173
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    volumes:
      - ./services/api:/app
    command: go run main.go

  # Go Worker
  worker:
    build:
      context: ./services/worker
      dockerfile: Dockerfile
    container_name: tryon_worker
    environment:
      DATABASE_URL: postgres://tryon_user:tryon_password@postgres:5432/tryon_ai_db
      REDIS_URL: redis://redis:6379/0
      S3_ENDPOINT: http://minio:9000
      S3_BUCKET: tryon-ai
      S3_ACCESS_KEY: minioadmin
      S3_SECRET_KEY: minioadmin
      S3_USE_SSL: "false"
      AI_PROVIDER: mock
      ENVIRONMENT: development
      LOG_LEVEL: debug
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    volumes:
      - ./services/worker:/app
    command: go run main.go

volumes:
  postgres_data:
  redis_data:
  minio_data:

networks:
  default:
    name: tryon_network
</parameter>
</invoke>
```

Now let me create the project folder structure:
```tool
TOOL_NAME: run_terminal_command
BEGIN_ARG: command
mkdir -p apps/web apps/widget services/api services/worker packages/shared packages/sdk infra scripts/migrations docs bin data/postgres data/redis data/minio