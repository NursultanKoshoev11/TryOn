# Docker and Endpoint Report

Date: 2026-05-06

## Summary

The project did not start in Docker out of the box. I fixed the blocking infrastructure issues first, then started the stack, ran migrations and seed data, and performed live endpoint checks.

Current container status after fixes:

- `api`: running on `http://localhost:8080`
- `worker`: running
- `postgres`: running on host port `5433`
- `redis`: running on host port `6380`
- `minio`: running on host ports `9002` and `9003`

## Startup Issues Found and Fixed

1. `docker-compose.yml` tried to run `go run main.go`, but the repo only had `main-new.go` for the API and `main-full.go` for the worker.
2. `services/api/Dockerfile` and `services/worker/Dockerfile` tried to build `main.go`, which did not match the actual repo state.
3. `services/api/go.sum` was empty, so Docker build failed during Go module verification.
4. `docker-compose.yml` had no `worker` service even though docs and Makefile expected one.
5. Postgres migrations used `gen_random_uuid()` without enabling `pgcrypto`.
6. `DATABASE_URL` missed `sslmode=disable`, which is risky for local Postgres.
7. Compose mounted source code and overrode container commands with `go run ...`, but the final runtime images do not contain the Go toolchain.
8. Default host port `5432` conflicted with another local Postgres instance, so host-exposed infra ports had to be remapped for this environment.
9. Postgres did not have the `scripts/` directory mounted, so migration/seed commands from the repo were not actually usable.

## Live Checks

### Working

- `GET /health` -> `200`
- `GET /ready` -> `200`
- `POST /api/v1/auth/register` -> `201`
- `POST /api/v1/auth/login` with freshly registered user -> `200`
- `POST /api/v1/auth/refresh` -> `200`
- `GET /api/v1/me` -> `200`
- `GET /api/v1/organizations` -> `200`
- `POST /api/v1/organizations` -> `201`
- `GET /api/v1/organizations/:id` -> `200`
- `PATCH /api/v1/organizations/:id` -> `200`
- `DELETE /api/v1/organizations/:id` -> `200`
- `GET /api/v1/organizations/:id/api-keys` -> `200`
- `POST /api/v1/organizations/:id/api-keys` -> `201`
- `POST /api/v1/organizations/:id/api-keys/:key_id/rotate` -> `201`
- `DELETE /api/v1/organizations/:id/api-keys/:key_id` -> `200`
- `GET /api/v1/organizations/:id/usage` -> `200`
- `GET /api/v1/organizations/:id/generations` -> `200`
- `GET /api/v1/admin/organizations` -> `200`
- `POST /api/v1/admin/organizations/:id/suspend` -> `200`
- `POST /api/v1/admin/organizations/:id/activate` -> `200`
- `POST /api/v1/tryon/generations` -> `201` when using a valid active API key and valid `Origin` / `Referer`
- `GET /api/v1/tryon/generations/:generation_id` -> `200`
- `GET /api/v1/tryon/generations/:generation_id/images` -> `200`

### Partially Working or Misleading

- Seeded demo credentials from `QUICKSTART.md` did not work in practice:
  - `merchant@example.com / password` -> `401`
  - `admin@example.com / password` -> `401`
- `POST /api/v1/tryon/generations` works only if the API key domain policy is satisfied.
  - With `allowed_domains=localhost` and no `Origin` or `Referer`, it returns `403`.
- Try-on jobs are created, but they stay in `queued`.
  - Root cause: `services/api/internal/services/generation_service.go` still contains `TODO: Push to Redis queue for worker processing`.
  - Result: the API endpoint exists, but the end-to-end generation pipeline is not complete.
- `GET /api/v1/tryon/generations/:generation_id/images` returns hardcoded placeholder URLs, not DB-backed generated images.
- Worker is up and listening, but API never enqueues jobs, so normal endpoint use does not reach the worker.

### Missing or Not Implemented

These returned `404` during authenticated checks:

- `GET /swagger`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/plans`
- `GET /api/v1/organizations/:id/subscription`
- `GET /api/v1/organizations/:id/usage/daily`
- `GET /api/v1/organizations/:id/usage/monthly`
- `GET /api/v1/organizations/:id/webhooks`
- `POST /api/v1/widget/session`
- `GET /api/v1/admin/users`
- `GET /api/v1/admin/generations`
- `GET /api/v1/admin/usage`
- `GET /api/v1/admin/system-events`
- `GET /api/v1/admin/audit-logs`

## Behavioral Problems Found

1. Empty collections are returned as `null` instead of `[]`.
   - Seen on organizations, API keys, and generations list responses.
2. After deleting an organization, `GET /api/v1/organizations/:id` returned `403` instead of a clearer `404` or deleted-state response.
3. Docs and runtime were inconsistent:
   - Quickstart says API docs exist at `/swagger`, but they do not.
   - Quickstart says worker is part of compose, but it was missing before the fix.
   - Quickstart says seed users are available, but their documented password did not log in successfully.
4. Postgres healthcheck still logs `database "tryon_user" does not exist` because `pg_isready -U tryon_user` checks the wrong default DB name.

## Overall Assessment

### Docker

- After fixes: starts successfully
- Before fixes: broken

### API

- Core auth and organization CRUD: usable
- API key management: usable
- Admin organization controls: usable
- Try-on endpoint surface: present but not fully integrated

### Worker

- Container starts
- Queue consumer loop runs
- Real production flow is blocked because API does not enqueue jobs

### Docs Accuracy

- Not reliable as-is for local startup or seeded credential testing

## Recommended Next Fixes

1. Implement Redis queue push inside `GenerationService.Create`.
2. Replace placeholder images endpoint with DB-backed generated image records.
3. Implement or remove undocumented routes from frontend/docs expectations.
4. Fix seed credentials so Quickstart matches reality.
5. Return empty arrays instead of `null`.
6. Fix deleted-organization response semantics.
7. Remove obsolete `version:` from `docker-compose.yml`.
8. Fix Postgres healthcheck to target `tryon_ai_db`.
