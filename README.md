# Personal Website

Portfolio web app with:

- public marketing site
- AI chat assistant
- admin panel for portfolio, knowledge, tools, agents, and blog posts
- FastAPI backend with PostgreSQL

## Stack

- `apps/web`: Next.js 16, React 19, Tailwind CSS v4, Framer Motion, React Query
- `apps/ai-service`: FastAPI, SQLModel, PostgreSQL, pgvector, Pydantic-AI
- Docker-first local development with separate dev and prod compose files

## Start Here

- Wide overview: [docs/README.md](/home/chithien/Workspace/Personal/projects/personal_website/docs/README.md)
- System overview: [docs/00-system-overview.md](/home/chithien/Workspace/Personal/projects/personal_website/docs/00-system-overview.md)
- Runtime flows: [docs/01-runtime-flows.md](/home/chithien/Workspace/Personal/projects/personal_website/docs/01-runtime-flows.md)
- Review map: [docs/02-codebase-review-map.md](/home/chithien/Workspace/Personal/projects/personal_website/docs/02-codebase-review-map.md)
- Maintenance checklist: [docs/03-maintenance-checklist.md](/home/chithien/Workspace/Personal/projects/personal_website/docs/03-maintenance-checklist.md)

## Local Development

Preferred:

```bash
docker compose -f docker-compose.dev.yml up -d
```

Useful commands:

```bash
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml logs -f web
docker compose -f docker-compose.dev.yml logs -f api
docker compose -f docker-compose.dev.yml down
```

Default dev ports:

- web: `http://localhost:3343`
- api: `http://localhost:3344`
- postgres: `localhost:5452`

Production compose remains separate:

```bash
docker compose -f docker-compose.prod.yml up -d
```

## Repository Shape

```text
apps/
  ai-service/   FastAPI backend, DB models, agent runtime, admin/public APIs
  web/          Next.js frontend, admin UI, public site, blog, chat
docs/           System docs, module docs, implementation notes
scripts/        Setup and DB bootstrap helpers
infrastructure/ Postgres init and Cloudflare tunnel config
```

## Quality Notes

- Current frontend package manager is `pnpm`
- Docker config is kept as-is intentionally
- Docs are organized from overview to module-specific so code review can start wide and then narrow
