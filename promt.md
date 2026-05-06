Ты — Senior Full-Stack Architect, Senior Backend Engineer, SaaS Product Engineer и Security/Privacy Engineer.

Твоя задача — спроектировать и начать реализацию B2B SaaS-платформы для виртуальной AI-примерки одежды для онлайн-магазинов.

Проект: AI Virtual Try-On SaaS для e-commerce.

Главная идея:
Наши клиенты — это владельцы интернет-магазинов одежды. Они регистрируются на нашем сайте, покупают подписку, получают API-ключ и подключают наш сервис в свой интернет-магазин. После подключения покупатели интернет-магазина могут загрузить свое фото, выбрать одежду, и AI-сервис генерирует 4 или более изображений, где эта одежда виртуально надета на покупателя.

Важно:
Сейчас НЕ делать мобильное приложение. Архитектура должна быть готова к мобильному приложению в будущем, но на первом этапе нужно отдельно сделать:
1. Backend API.
2. SaaS website / dashboard для наших клиентов — интернет-магазинов.
3. API для интеграции интернет-магазинов.
4. Виджет или простой frontend SDK для подключения в интернет-магазин.
5. Отдельный AI generation service/module, чтобы в будущем можно было заменить AI-провайдера.
6. Admin panel для владельца SaaS-платформы.

Нужно работать профессионально, как будто проект готовится к коммерческому запуску в США и Европе.

==================================================
1. PRODUCT REQUIREMENTS
==================================================

Платформа должна поддерживать три типа пользователей:

A) Platform Owner / Admin
Это мы, владелец SaaS.
Админ должен видеть:
- список всех магазинов;
- зарегистрированных клиентов;
- тарифы;
- подписки;
- количество генераций по каждому магазину;
- расходы;
- ошибки генераций;
- активные API-ключи;
- заблокированные API-ключи;
- историю платежей;
- подозрительную активность;
- usage analytics;
- system logs;
- audit logs.

B) Store Owner / Merchant
Это наши клиенты — владельцы интернет-магазинов.
Они должны:
- зарегистрироваться;
- подтвердить email;
- войти в кабинет;
- создать организацию / магазин;
- указать название магазина;
- указать домен магазина;
- купить или выбрать подписку;
- получить API-ключ;
- создать дополнительные API-ключи;
- удалить / перевыпустить API-ключ;
- видеть usage dashboard;
- видеть количество генераций;
- видеть оставшийся лимит;
- видеть расходы;
- видеть историю запросов;
- видеть ошибки;
- видеть документацию по интеграции;
- скопировать embed script / SDK token;
- настроить allowed domains;
- настроить callback/webhook URL;
- настроить branding виджета;
- настроить privacy/data retention параметры, если тариф позволяет.

C) End Customer / Shopper
Это покупатель в интернет-магазине нашего клиента.
Он НЕ регистрируется у нас напрямую.
Он должен:
- открыть страницу товара в интернет-магазине;
- нажать “Try On” / “Virtual Try-On”;
- загрузить свою фотографию;
- выбрать товар/вариант одежды;
- отправить запрос;
- увидеть статус генерации;
- получить 4 изображения:
  1. Front view
  2. Left side view
  3. Right side view
  4. Back / alternative generated view

Важно:
Если из одного фото невозможно достоверно получить реальные 4 стороны человека, интерфейс должен честно показывать, что side/back views являются AI-estimated preview, а не точным фактическим изображением.

==================================================
2. CORE BUSINESS LOGIC
==================================================

Нужно реализовать multi-tenant SaaS.

Каждый интернет-магазин — отдельный tenant / organization.

Для каждого tenant нужно хранить:
- organization_id;
- owner_user_id;
- store_name;
- store_domain;
- billing_plan;
- subscription_status;
- monthly_generation_limit;
- used_generation_count;
- total_generation_count;
- API keys;
- allowed domains;
- created_at;
- updated_at;
- status: active/suspended/deleted.

API-ключи:
- API key должен быть создан только после регистрации магазина.
- API key должен храниться безопасно: в базе хранить только hash API-ключа, а не plain text.
- Полный API key показывать пользователю только один раз при создании.
- Нужно поддерживать key rotation.
- Нужно поддерживать revoke.
- Нужно поддерживать domain restriction.
- Нужно поддерживать rate limits per key.
- Нужно логировать каждый запрос по API key.

Usage accounting:
Для каждой генерации нужно сохранить:
- generation_id;
- organization_id;
- api_key_id;
- product_id;
- product_name;
- product_image_url или storage_path;
- user_photo_storage_path;
- generated_image_paths;
- number_of_outputs;
- status: queued/processing/completed/failed/cancelled;
- error_code;
- error_message;
- ai_provider;
- generation_cost_estimate;
- processing_time_ms;
- created_at;
- completed_at;
- request_ip;
- user_agent;
- source_domain.

Billing:
Сделать архитектуру так, чтобы можно было подключить Stripe или другого billing provider.
На первом этапе можно сделать mocked billing / manual subscription activation, но структура должна быть готова для реального billing.
Должны быть таблицы:
- plans;
- subscriptions;
- invoices или billing_events;
- usage_records.

Subscription logic:
- Если подписка inactive/past_due/cancelled — API requests должны блокироваться.
- Если месячный лимит исчерпан — генерация должна блокироваться или разрешаться как overage, в зависимости от плана.
- Все blocked requests нужно логировать.

==================================================
3. AI GENERATION FLOW
==================================================

Нужно спроектировать AI generation pipeline.

Flow:
1. Интернет-магазин вызывает наш API или JS widget.
2. Передает:
   - API key;
   - product_id;
   - product_name;
   - product image;
   - optional product metadata: size, color, category, fabric, gender/unisex;
   - shopper uploaded photo;
   - desired output count;
   - callback_url optional.
3. Backend проверяет:
   - API key;
   - allowed domain;
   - subscription status;
   - usage limit;
   - file type;
   - file size;
   - content safety;
   - rate limit.
4. Backend создает generation job.
5. Фото сохраняется в object storage.
6. Job отправляется в очередь.
7. Worker берет job.
8. Worker вызывает AI provider через абстрактный interface.
9. Результаты сохраняются в object storage.
10. Статус обновляется в database.
11. Если есть webhook/callback_url — отправить результат магазину.
12. Клиент может получить результат через polling endpoint.

AI provider должен быть абстрактным:
Нельзя жестко привязывать бизнес-логику к одному AI API.
Нужно сделать interface:

GenerateTryOn(input) -> output

Где input:
- user_photo_url/storage_path;
- product_image_url/storage_path;
- product_metadata;
- output_count;
- requested_views;
- tenant_id;
- generation_id.

Output:
- generated_images[];
- provider_job_id;
- provider_status;
- cost_estimate;
- processing_time_ms;
- raw_provider_response optional.

Пока можно сделать MockAIProvider, который возвращает placeholder images или заранее подготовленные mock URLs.
Но архитектура должна позволять подключить реального AI provider.

Обязательно:
- не хранить исходные фото покупателей дольше, чем нужно;
- добавить retention policy;
- добавить delete endpoint;
- добавить статус “deleted”;
- добавить background cleanup job;
- не использовать реальные фото для обучения модели без явного согласия;
- не показывать фото одного магазина другому магазину;
- строго соблюдать tenant isolation.

==================================================
4. PRIVACY, SAFETY AND COMPLIANCE REQUIREMENTS
==================================================

Так как пользователи загружают фотографии людей, проект должен быть privacy-first.

Обязательно реализовать или заложить в архитектуру:
- consent checkbox перед загрузкой фото;
- текстовое предупреждение, что изображение будет обработано AI;
- ссылка на Privacy Policy;
- возможность удаления изображения;
- data retention policy;
- автоматическое удаление исходных фото через configurable TTL;
- хранить минимально необходимые данные;
- audit logs;
- encryption in transit;
- encryption at rest, если возможно на уровне storage provider;
- secure signed URLs для доступа к изображениям;
- запрет публичного доступа к bucket/storage;
- tenant isolation;
- rate limiting;
- abuse detection.

Safety rules:
- Не генерировать nudity.
- Не генерировать sexual content.
- Не генерировать sexualized images of minors.
- Не делать body shaming.
- Не делать оценку тела пользователя.
- Не изменять тело пользователя с целью “улучшения фигуры”, “похудения”, “увеличения частей тела” и т.д.
- Не использовать пользовательские фото для рекламы без отдельного согласия.
- Не использовать пользовательские фото для обучения AI без отдельного согласия.
- Если система подозревает, что фото содержит ребенка или несовершеннолетнего, нужно применять более строгие safety rules.
- Интерфейс должен быть нейтральным: “Virtual preview”, “AI-generated try-on”, “May not represent exact fit”.

Нужно добавить moderation layer:
- file type validation;
- image size validation;
- malware scanning placeholder;
- content safety check placeholder;
- adult content rejection placeholder;
- logging rejected requests.

==================================================
5. TECH STACK
==================================================

Используй современный, production-ready stack.

Backend:
- Go preferred.
- Framework: Gin, Echo или Chi. Выбери один и объясни почему.
- PostgreSQL для основной базы.
- Redis для queue/rate limit/cache.
- Object Storage abstraction: S3-compatible storage.
- Docker + Docker Compose.
- Migrations: golang-migrate или goose.
- API docs: OpenAPI/Swagger.
- Auth: JWT access token + refresh token.
- Password hashing: Argon2id или bcrypt.
- API key hashing: SHA-256/HMAC with server-side secret или безопасная hash strategy.
- Background workers for generation jobs.
- Structured logging.
- Request ID middleware.
- Audit logging middleware.
- Rate limiting middleware.
- CORS with strict allowed origins.

Frontend:
- Next.js + TypeScript.
- Tailwind CSS.
- Clean SaaS landing page.
- Dashboard for merchants.
- Admin panel.
- Auth pages.
- API key management pages.
- Billing/subscription pages.
- Usage analytics pages.
- Integration docs page.
- Settings page.
- Store branding configuration page.

Widget/SDK:
- JavaScript/TypeScript lightweight SDK.
- Embeddable script for online stores.
- Should support:
  - open modal;
  - upload user photo;
  - select product;
  - call backend;
  - poll generation status;
  - show generated results;
  - show error states;
  - show consent checkbox.
- Widget must not expose secret API key in frontend if possible.
- If public key is needed, create separate public client token with limited permissions.
- Secret API key should be used server-to-server by merchant backend.
- Provide two integration modes:
  1. Server-to-server integration with secret API key.
  2. Public widget integration with restricted public token and allowed domains.

Testing:
- Backend unit tests.
- API integration tests.
- Auth tests.
- API key tests.
- Rate limit tests.
- Tenant isolation tests.
- Generation job tests.
- Basic frontend component tests where useful.

Do NOT use:
- Hardcoded secrets.
- Plaintext API keys in database.
- Public buckets for user images.
- One global tenant for all stores.
- Fake security claims.
- Copy-pasted UI from another website.
- Unlicensed images/assets.
- Mobile app implementation in first phase.
- AI provider hardcoded directly into controller.
- Business logic inside frontend.
- Unvalidated file uploads.
- Unlimited generation endpoint.
- No rate limit.
- No audit logs.

==================================================
6. REPOSITORY STRUCTURE
==================================================

Create a clean monorepo structure:

/apps
  /web
    Next.js SaaS website + dashboard
  /widget
    embeddable JS/TS widget
  /admin
    optional admin app, or include admin routes in /web

/services
  /api
    Go backend API
  /worker
    Go worker for AI generation jobs

/packages
  /shared
    shared TypeScript types if needed
  /sdk
    merchant SDK

/infra
  docker-compose.yml
  nginx or reverse proxy config if needed
  local dev config

/docs
  architecture.md
  api.md
  integration-guide.md
  security.md
  privacy.md
  billing.md
  deployment.md

/scripts
  dev scripts
  migration scripts
  seed scripts

Root files:
- README.md
- .env.example
- .gitignore
- Makefile
- docker-compose.yml

==================================================
7. DATABASE DESIGN
==================================================

Design PostgreSQL schema.

Required tables:

users:
- id
- email
- password_hash
- full_name
- role: platform_admin / merchant_owner / merchant_member
- email_verified
- created_at
- updated_at
- deleted_at

organizations:
- id
- owner_user_id
- name
- store_domain
- status
- created_at
- updated_at
- deleted_at

organization_members:
- id
- organization_id
- user_id
- role: owner/admin/developer/viewer
- created_at

api_keys:
- id
- organization_id
- name
- key_prefix
- key_hash
- scopes
- allowed_domains
- status
- last_used_at
- created_at
- revoked_at

plans:
- id
- name
- monthly_price
- included_generations
- overage_price_per_generation
- max_api_keys
- retention_days
- features_json
- created_at

subscriptions:
- id
- organization_id
- plan_id
- status
- current_period_start
- current_period_end
- cancel_at_period_end
- billing_provider
- billing_provider_customer_id
- billing_provider_subscription_id
- created_at
- updated_at

usage_records:
- id
- organization_id
- api_key_id
- generation_id
- units
- cost_estimate
- created_at

generation_jobs:
- id
- organization_id
- api_key_id
- product_id
- product_name
- product_metadata_json
- user_photo_path
- product_image_path
- status
- output_count
- requested_views_json
- ai_provider
- provider_job_id
- error_code
- error_message
- processing_time_ms
- created_at
- started_at
- completed_at
- deleted_at

generated_images:
- id
- generation_job_id
- organization_id
- view_type: front/left/right/back/alternative
- storage_path
- signed_url_expires_at optional
- created_at
- deleted_at

webhooks:
- id
- organization_id
- url
- secret
- status
- created_at
- updated_at

webhook_deliveries:
- id
- webhook_id
- generation_job_id
- status
- response_code
- error_message
- attempts
- created_at
- delivered_at

audit_logs:
- id
- organization_id nullable
- user_id nullable
- action
- resource_type
- resource_id
- ip_address
- user_agent
- metadata_json
- created_at

system_events:
- id
- level
- event_type
- message
- metadata_json
- created_at

uploaded_files:
- id
- organization_id
- generation_job_id nullable
- file_type
- storage_path
- original_filename
- content_type
- size_bytes
- checksum
- created_at
- deleted_at

==================================================
8. BACKEND API REQUIREMENTS
==================================================

Create REST API v1.

Auth endpoints:
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
POST /api/v1/auth/verify-email
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password

Merchant organization:
GET /api/v1/me
GET /api/v1/organizations
POST /api/v1/organizations
GET /api/v1/organizations/:id
PATCH /api/v1/organizations/:id
DELETE /api/v1/organizations/:id

API keys:
GET /api/v1/organizations/:id/api-keys
POST /api/v1/organizations/:id/api-keys
DELETE /api/v1/organizations/:id/api-keys/:key_id
POST /api/v1/organizations/:id/api-keys/:key_id/rotate

Plans/subscriptions:
GET /api/v1/plans
GET /api/v1/organizations/:id/subscription
POST /api/v1/organizations/:id/subscription/checkout
POST /api/v1/organizations/:id/subscription/cancel

Usage:
GET /api/v1/organizations/:id/usage
GET /api/v1/organizations/:id/usage/daily
GET /api/v1/organizations/:id/usage/monthly
GET /api/v1/organizations/:id/generations
GET /api/v1/organizations/:id/generations/:generation_id

Generation public/merchant API:
POST /api/v1/tryon/generations
GET /api/v1/tryon/generations/:generation_id
GET /api/v1/tryon/generations/:generation_id/images
DELETE /api/v1/tryon/generations/:generation_id

Widget token:
POST /api/v1/widget/session
POST /api/v1/widget/generations
GET /api/v1/widget/generations/:generation_id

Webhooks:
GET /api/v1/organizations/:id/webhooks
POST /api/v1/organizations/:id/webhooks
PATCH /api/v1/organizations/:id/webhooks/:webhook_id
DELETE /api/v1/organizations/:id/webhooks/:webhook_id

Admin:
GET /api/v1/admin/organizations
GET /api/v1/admin/users
GET /api/v1/admin/generations
GET /api/v1/admin/usage
GET /api/v1/admin/system-events
GET /api/v1/admin/audit-logs
POST /api/v1/admin/organizations/:id/suspend
POST /api/v1/admin/organizations/:id/activate

Health:
GET /health
GET /ready
GET /metrics optional

Every endpoint must:
- validate input;
- return structured JSON;
- include request_id;
- use proper HTTP status codes;
- never leak secrets;
- enforce tenant access;
- log security-sensitive events.

==================================================
9. FRONTEND WEBSITE REQUIREMENTS
==================================================

Create SaaS website with clean, modern, premium design.

Important:
I will provide a reference website URL later. Use it only as inspiration for layout quality, spacing, animation style and general UX. Do not copy brand assets, logo, exact text, images, colors or protected design.

Landing page sections:
- Hero section:
  - headline about AI Virtual Try-On for online fashion stores;
  - subheadline about increasing confidence and reducing returns;
  - CTA: “Start free” / “Book demo”;
  - secondary CTA: “View integration docs”.
- How it works:
  1. Store installs widget/API.
  2. Shopper uploads photo.
  3. AI generates try-on images.
  4. Store gets analytics.
- Benefits:
  - virtual fitting experience;
  - API-first integration;
  - dashboard and analytics;
  - privacy-first;
  - scalable SaaS;
  - multi-store support.
- Demo section:
  - product image;
  - user photo placeholder;
  - generated results grid with 4 views.
- Pricing section:
  - Starter;
  - Growth;
  - Scale;
  - Enterprise.
- Security/privacy section.
- Developer/API section.
- FAQ.
- Footer.

Dashboard pages:
1. Login
2. Register
3. Email verification
4. Forgot password
5. Onboarding:
   - create store
   - add domain
   - choose plan
   - generate API key
6. Main dashboard:
   - total generations
   - monthly usage
   - success rate
   - failed generations
   - estimated cost
   - remaining quota
7. Generations page:
   - table of generation jobs
   - status
   - product
   - created date
   - cost
   - view details
8. Generation detail page:
   - uploaded product image
   - uploaded shopper image
   - generated images
   - logs/status timeline
9. API keys page:
   - create key
   - revoke key
   - rotate key
   - copy key only once
10. Integration docs page:
   - server-to-server example
   - widget example
   - webhook example
11. Billing page:
   - current plan
   - usage
   - invoices placeholder
   - upgrade/downgrade
12. Settings:
   - store name
   - allowed domains
   - webhook URL
   - retention settings
   - branding
13. Team members:
   - invite member
   - roles
14. Admin panel:
   - all tenants
   - all users
   - all generations
   - errors
   - usage analytics
   - suspended tenants.

Design requirements:
- Minimalist, premium SaaS style.
- Good spacing.
- Not too much text.
- Clear cards.
- Clean tables.
- Responsive design.
- Loading states.
- Empty states.
- Error states.
- Success notifications.
- Dark/light mode optional.
- Use TypeScript strictly.
- Use reusable components.

==================================================
10. WIDGET REQUIREMENTS
==================================================

Create embeddable widget.

Merchant integration example:

<script src="https://cdn.example.com/tryon-widget.js"></script>
<script>
  TryOnWidget.init({
    publicKey: "pk_live_xxx",
    productId: "dress_123",
    productName: "Summer Dress",
    productImageUrl: "https://store.com/products/dress.jpg",
    container: "#tryon-button"
  });
</script>

Widget behavior:
- Shows button: “Virtual Try-On”.
- Opens modal.
- Shows consent notice.
- Allows photo upload.
- Shows product preview.
- Starts generation.
- Shows progress:
  - uploading;
  - queued;
  - generating;
  - finalizing;
  - completed.
- Shows 4 generated images.
- Allows download/share only if merchant enables it.
- Shows clear disclaimer:
  “AI-generated preview. Fit, size and appearance may vary.”
- Shows errors:
  - invalid photo;
  - generation failed;
  - limit reached;
  - service unavailable;
  - domain not allowed.

Security:
- Widget must use public token, not secret API key.
- Public token must be restricted by allowed domain.
- Backend must verify Origin/Referer where possible.
- Never trust frontend-only validation.

==================================================
11. SECURITY REQUIREMENTS
==================================================

Backend:
- Input validation everywhere.
- File upload validation.
- Max file size.
- Allowed mime types: image/jpeg, image/png, image/webp.
- Randomized storage paths.
- Signed URLs.
- No public storage bucket.
- API key hashing.
- JWT expiration.
- Refresh token rotation.
- Rate limiting:
  - per IP;
  - per API key;
  - per organization.
- Audit logs:
  - login;
  - failed login;
  - API key created;
  - API key revoked;
  - subscription changed;
  - generation created;
  - generation failed;
  - image deleted;
  - admin action.
- CORS strict.
- Security headers.
- No stack traces in production responses.
- Centralized error handling.
- Environment-based config.
- Secrets only through env variables.
- Do not commit .env.
- Add .env.example.

Privacy:
- Delete shopper photos based on retention policy.
- Allow manual deletion.
- Add privacy-focused logging: do not log raw image URLs if they expose private access.
- Avoid storing unnecessary PII.
- Do not store face embeddings.
- Do not perform identity recognition.
- Do not compare users’ bodies.
- Do not rate attractiveness or body type.

==================================================
12. DEVELOPMENT PHASES
==================================================

Work in phases.

Phase 1 — Architecture and planning:
- Create architecture.md.
- Create database schema.
- Create OpenAPI spec.
- Create README with setup instructions.
- Create Docker Compose with API, Postgres, Redis, storage mock/minio optional.
- Create basic project structure.

Phase 2 — Backend MVP:
- Auth.
- Organizations.
- API keys.
- Plans.
- Mock subscriptions.
- Usage tracking.
- Generation job creation.
- MockAIProvider.
- Worker.
- Object storage abstraction.
- Audit logs.
- Admin basic endpoints.

Phase 3 — Frontend MVP:
- Landing page.
- Auth pages.
- Merchant dashboard.
- API key page.
- Usage page.
- Generations page.
- Integration docs.
- Settings.

Phase 4 — Widget MVP:
- Embeddable widget.
- Upload photo.
- Create generation.
- Poll status.
- Show result.
- Error handling.

Phase 5 — Production hardening:
- Tests.
- Rate limits.
- Better audit logs.
- Webhooks.
- Billing provider abstraction.
- Real AI provider integration placeholder.
- Monitoring.
- Deployment docs.

Do not jump directly to UI only.
First create architecture and backend foundation.

==================================================
13. ACCEPTANCE CRITERIA
==================================================

The project is acceptable only if:

- It has clear multi-tenant architecture.
- Backend and website are separate.
- Mobile app is not implemented now.
- AI provider is abstracted.
- API keys are secure.
- Usage is tracked per organization.
- Subscription/limit logic exists.
- Store owners can see their generation count and usage.
- Admin can see all stores and usage.
- Widget can be embedded into a store.
- Generated images are linked to generation jobs.
- Uploads are validated.
- There is privacy/data retention logic.
- There is audit logging.
- There is documentation.
- Docker local setup works.
- .env.example exists.
- README explains how to run the project.
- OpenAPI documentation exists.
- Tests exist for critical backend logic.

==================================================
14. OUTPUT FORMAT FOR YOUR WORK
==================================================

When you start, first produce:
1. Short product understanding summary.
2. Proposed architecture.
3. Tech stack choice and reason.
4. Database schema.
5. API design.
6. Security/privacy model.
7. Folder structure.
8. Step-by-step implementation plan.

Then implement files.

When coding:
- Make small, clean commits/steps logically.
- Explain each major step.
- Do not create fake claims.
- If something is mocked, clearly mark it as mocked.
- If something needs a real provider key, add placeholder in .env.example.
- Do not hide limitations.
- Do not implement mobile app.
- Do not copy the reference website exactly.
- Build original UI inspired by the reference only.

==================================================
15. BRANDING / DESIGN DIRECTION
==================================================

Brand feel:
- Premium.
- Clean.
- Modern.
- AI fashion SaaS.
- Minimal.
- Trustworthy.
- Developer-friendly.
- Privacy-first.

Possible product names:
Use placeholder name until final name is provided:
“TryOnAI SaaS” or “VirtualFit API”.

Do not lock the project to this name. Make branding configurable.

Landing page tone:
- B2B.
- For online fashion stores.
- Focus on conversion, customer confidence, product visualization, and developer-friendly API.
- Avoid exaggerated claims unless proven.
- Use honest language.

==================================================
16. IMPORTANT LIMITATIONS TO SHOW IN PRODUCT
==================================================

The system must clearly communicate:
- AI-generated images are previews.
- Results may not represent exact size, fit, fabric movement or real-world appearance.
- Side/back views generated from limited input are AI-estimated.
- User must have rights/consent to upload the image.
- Uploaded images are processed according to privacy policy.
- Store owners must configure their own consent/privacy text if they use the widget.

==================================================
17. FINAL GOAL
==================================================

Build the foundation of a real commercial SaaS product:

A merchant registers -> creates store -> chooses plan -> gets API key/public widget token -> integrates into e-commerce store -> shopper uploads photo and product -> AI generation job is created -> 4 try-on images are generated -> merchant sees usage/cost/history in dashboard -> admin sees all platform activity.

Everything must be scalable, secure, privacy-first, cleanly structured and ready for future mobile app integration.

анализируй promt.md и сделай как там написано и сайт должен быть походий на https://www.lancer.app/ точь точь как в этот сайт, сделай точно как написано в промте без добавлений и тд