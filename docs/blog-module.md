# Blog Module

## Goal

Build a complete blog module with:

- Blog posts stored in PostgreSQL
- Admin CRUD for posts
- Markdown-first writing experience without a formatting toolbar
- Manual save as the primary action
- Optional autosave with configurable interval
- Public blog list and blog detail pages
- Reuse the existing markdown renderer for public display

## Data Model

Table: `blog_posts`

Fields:

- `id`
- `title`
- `slug`
- `excerpt`
- `cover_image`
- `content_markdown`
- `tags`
- `is_published`
- `published_at`
- `created_at`
- `updated_at`

Migration:

- `apps/ai-service/migrations/002_add_blog_posts.sql`

## Backend

Admin endpoints:

- `GET /api/admin/blog`
- `GET /api/admin/blog/{id}`
- `POST /api/admin/blog`
- `PUT /api/admin/blog/{id}`
- `DELETE /api/admin/blog/{id}`

Public endpoints:

- `GET /api/blog`
- `GET /api/blog/{slug}`

## Frontend

### Admin

Pages:

- `/admin/blog`
- `/admin/blog/new`
- `/admin/blog/[id]`

Editor behavior:

- No toolbar
- Large distraction-free markdown source area
- Live article preview beneath the editor
- Explicit `Save` button
- Optional autosave toggle
- Adjustable autosave interval in seconds

### Public

Pages:

- `/blog`
- `/blog/[slug]`

Homepage:

- Add a blog preview section showing recent published posts

## Local Dev

If PostgreSQL is already running locally:

```bash
cp .env.example .env
```

Set:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_agent_db
NEXT_PUBLIC_API_URL=http://localhost:3344
NEXT_PUBLIC_SITE_URL=http://localhost:3343
CORS_ORIGINS_STR=http://localhost:3343,http://localhost:3000
```

Backend:

```bash
cd apps/ai-service
source .venv/bin/activate
uvicorn src.main:app --reload --host 0.0.0.0 --port 3344
```

Frontend:

```bash
cd apps/web
pnpm dev --hostname 0.0.0.0 --port 3343
```

## Migration

Run manually if the table is not present yet:

```bash
psql -h localhost -p 5432 -U postgres -d ai_agent_db -f apps/ai-service/migrations/002_add_blog_posts.sql
```
