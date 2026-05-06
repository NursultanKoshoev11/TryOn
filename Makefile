.PHONY: help up down logs migrate-up migrate-down seed test build clean

help:
	@echo "TryOnAI SaaS - Available commands:"
	@echo "  make up              - Start all services"
	@echo "  make down            - Stop all services"
	@echo "  make logs            - View logs"
	@echo "  make logs-api        - View API logs"
	@echo "  make logs-worker     - View worker logs"
	@echo "  make migrate-up      - Run database migrations"
	@echo "  make migrate-down    - Rollback database migrations"
	@echo "  make seed            - Seed database with test data"
	@echo "  make test            - Run tests"
	@echo "  make build           - Build all services"
	@echo "  make clean           - Clean up containers and volumes"

up:
	docker-compose up -d
	@echo "Services started. API: http://localhost:8080, Web: http://localhost:3000, MinIO: http://localhost:9001"

down:
	docker-compose down

logs:
	docker-compose logs -f

logs-api:
	docker-compose logs -f api

logs-worker:
	docker-compose logs -f worker

logs-postgres:
	docker-compose logs -f postgres

logs-redis:
	docker-compose logs -f redis

migrate-up:
	@echo "Running migrations..."
	docker-compose exec postgres psql -U tryon_user -d tryon_ai_db -f /scripts/migrations/001_init.sql

migrate-down:
	@echo "Rolling back migrations..."
	docker-compose exec postgres psql -U tryon_user -d tryon_ai_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

seed:
	@echo "Seeding database..."
	docker-compose exec postgres psql -U tryon_user -d tryon_ai_db -f /scripts/seed.sql

test:
	cd services/api && go test ./... -v
	cd apps/web && npm test

build:
	docker-compose build

clean:
	docker-compose down -v
	@echo "All containers and volumes removed"

ps:
	docker-compose ps

shell-api:
	docker-compose exec api sh

shell-postgres:
	docker-compose exec postgres psql -U tryon_user -d tryon_ai_db

shell-redis:
	docker-compose exec redis redis-cli