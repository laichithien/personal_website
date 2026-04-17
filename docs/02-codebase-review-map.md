# Codebase Review Map

Use this file when reviewing or refactoring. Start at the top and only go deeper where needed.

## Layer 1: Entrypoints

Frontend:

- `apps/web/src/app/page.tsx`
- `apps/web/src/app/blog/*`
- `apps/web/src/app/admin/*`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/proxy.ts`

Backend:

- `apps/ai-service/src/main.py`
- `apps/ai-service/src/api/routes/*`
- `apps/ai-service/src/database/models.py`

## Layer 2: Shared Runtime Infrastructure

Frontend:

- `apps/web/src/lib/api-base.ts`
- `apps/web/src/lib/api-client.ts`
- `apps/web/src/lib/admin-api.ts`
- `apps/web/src/lib/portfolio-api.ts`
- `apps/web/src/lib/blog-api.ts`
- `apps/web/src/components/shared/smooth-scroll-container.tsx`
- `apps/web/src/hooks/use-contained-scroll.ts`

Backend:

- `apps/ai-service/src/config.py`
- `apps/ai-service/src/database/connection.py`
- `apps/ai-service/src/api/deps/auth.py`
- `apps/ai-service/src/services/auth.py`

## Layer 3: Product Modules

Portfolio:

- public rendering: `apps/web/src/components/features/*`
- admin CRUD: `apps/web/src/app/admin/portfolio/*`
- schemas/routes: `apps/ai-service/src/api/routes/portfolio.py`, `apps/ai-service/src/api/routes/admin/portfolio.py`

Blog:

- public pages: `apps/web/src/app/blog/*`
- admin pages: `apps/web/src/app/admin/blog/*`
- editor: `apps/web/src/components/admin/blog-post-form.tsx`
- api routes: `apps/ai-service/src/api/routes/blog.py`, `apps/ai-service/src/api/routes/admin/blog.py`

Chat:

- client state: `apps/web/src/hooks/use-chat.ts`
- UI: `apps/web/src/components/features/chat/*`
- backend route: `apps/ai-service/src/api/routes/chat.py`
- agent context: `apps/ai-service/src/agent/context.py`

## Layer 4: AI / Agent Internals

- `apps/ai-service/src/agent/factory.py`
- `apps/ai-service/src/agent/registry.py`
- `apps/ai-service/src/agent/tools/*`
- `apps/ai-service/src/agent/context.py`

Review this layer when:

- model/provider behavior is wrong
- tool registration is inconsistent
- prompt context is too large or too weak

## Layer 5: Persistence and Migrations

- `apps/ai-service/src/database/models.py`
- `apps/ai-service/migrations/001_add_system_settings_and_contact_leads.sql`
- `apps/ai-service/migrations/002_add_blog_posts.sql`

Review this layer when:

- API contracts and DB fields drift
- timestamps behave incorrectly
- new content models are added

## Review Priorities

If time is short, review in this order:

1. `apps/web/src/app/page.tsx`
2. `apps/web/src/components/shared/smooth-scroll-container.tsx`
3. `apps/web/src/components/features/chat/*`
4. `apps/web/src/components/features/hero/hero-section.tsx`
5. `apps/ai-service/src/api/routes/chat.py`
6. `apps/ai-service/src/agent/context.py`
7. `apps/ai-service/src/api/routes/admin/blog.py`
8. `apps/ai-service/src/database/models.py`
