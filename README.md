# The Transparent Core

A modern portfolio website with AI-powered chat assistant, featuring a Liquid Glass design system.

## Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- shadcn/ui
- React Query

**Backend**
- FastAPI
- Pydantic-AI
- SQLModel + PostgreSQL
- pgvector (RAG support)

**AI**
- OpenRouter API
- Model: `xiaomi/mimo-v2-flash:free`

## Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- [direnv](https://direnv.net/) (optional, for auto-loading env)

## Quick Start

### 1. Clone and Setup Environment

```bash
cd /path/to/personal_website

# Copy environment file
cp .env.example .env

# Edit .env with your OpenRouter API key
# OPENROUTER_API_KEY=your_key_here
# OPENAI_API_KEY=your_key_here  # Same as OpenRouter key

# If using direnv
direnv allow
```

### 2. Run with Docker Compose

```bash
# Build images (first time only)
docker compose build                              # Dev
docker compose -f docker-compose.prod.yml build   # Prod

# Start development
docker compose up -d

# Start production
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose logs -f
```

## Ports & URLs

| Environment | Web | API | Postgres | Access |
|-------------|-----|-----|----------|--------|
| **Development** | `localhost:3343` | `localhost:3344` | `localhost:5452` | Local only |
| **Production** | `localhost:3333` | `localhost:3334` | `localhost:5442` | Via Cloudflare Tunnel |

**Production Public URLs:**
- Frontend: https://yourdomain.com
- API: https://api.yourdomain.com

## Docker Commands

### Development

```bash
# Start dev environment
docker compose up -d

# View logs
docker compose logs -f
docker compose logs -f web   # specific service

# Stop dev
docker compose down

# Rebuild after Dockerfile changes
docker compose up -d --build
```

### Production

```bash
# Start production
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop production
docker compose -f docker-compose.prod.yml down

# Rebuild production (required for code changes)
docker compose -f docker-compose.prod.yml up -d --build
```

### Run Both Simultaneously

Dev and prod use different ports and container names, so they can run at the same time:

```bash
# Start both
docker compose up -d
docker compose -f docker-compose.prod.yml up -d

# Stop both
docker compose down
docker compose -f docker-compose.prod.yml down
```

### Reset Database

```bash
# Dev (removes tc-postgres-data-dev volume)
docker compose down -v

# Prod (removes tc-postgres-data volume)
docker compose -f docker-compose.prod.yml down -v
```

## Local Development (without Docker)

### Start Database Only

```bash
docker compose up -d postgres
```

### Run Backend

```bash
cd apps/ai-service

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Run API server
uvicorn src.main:app --reload --port 8000
```

### Run Frontend

```bash
cd apps/web

# Install dependencies
npm install

# Run dev server
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Project Structure

```
.
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/            # App router pages
│   │   │   ├── components/
│   │   │   │   ├── ui/         # Base UI components
│   │   │   │   ├── features/   # Feature components
│   │   │   │   └── shared/     # Shared components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── lib/            # Utilities
│   │   │   └── config/         # Static config
│   │   └── Dockerfile
│   │
│   └── ai-service/             # FastAPI backend
│       ├── src/
│       │   ├── api/            # API routes
│       │   ├── agent/          # AI agent system
│       │   ├── database/       # Models & connection
│       │   └── services/       # Business logic
│       ├── tests/
│       └── Dockerfile
│
├── infrastructure/
│   ├── postgres/
│   │   └── init.sql            # Database initialization
│   └── cloudflared/
│       ├── config.yml          # Tunnel configuration
│       └── credentials.json    # Tunnel credentials (not in git)
│
├── docs/                       # Documentation
├── docker-compose.yml          # Development
├── docker-compose.prod.yml     # Production
├── .env.example
└── README.md
```

## Environment Variables

| Variable | Description | Dev Default | Prod Default |
|----------|-------------|-------------|--------------|
| `DATABASE_URL` | PostgreSQL connection | `localhost:5452` | `localhost:5442` |
| `OPENROUTER_API_KEY` | OpenRouter API key | - | - |
| `OPENAI_API_KEY` | Same as OpenRouter key | - | - |
| `OPENAI_BASE_URL` | OpenRouter base URL | `https://openrouter.ai/api/v1` | same |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3344` | `https://api.yourdomain.com` |
| `NEXT_PUBLIC_SITE_URL` | Frontend URL | `http://localhost:3343` | `https://yourdomain.com` |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/docs` | Swagger documentation |
| `POST` | `/api/chat/{agent_slug}` | Send message to AI agent |
| `GET` | `/api/chat/{agent_slug}/history/{session_id}` | Get chat history |

## Cloudflare Tunnel

The project includes Cloudflare Tunnel for public access in production.

**Tunnel Configuration:**
- Config: `infrastructure/cloudflared/config.yml`
- Credentials: `infrastructure/cloudflared/credentials.json`

**Manage Tunnel:**
```bash
# List tunnels
cloudflared tunnel list

# Check tunnel status
docker compose -f docker-compose.prod.yml logs cloudflared
```

## Container Names

| Service | Dev | Prod |
|---------|-----|------|
| Web | `tc-web-dev` | `tc-web` |
| API | `tc-api-dev` | `tc-api` |
| Postgres | `tc-postgres-dev` | `tc-postgres` |
| Cloudflared | `tc-cloudflared-dev` | `tc-cloudflared` |

## Image Tags

Images are tagged separately for dev and prod to avoid rebuilding when switching:

| Service | Dev | Prod |
|---------|-----|------|
| Web | `transparent-core-web:dev` | `transparent-core-web:prod` |
| API | `transparent-core-api:dev` | `transparent-core-api:prod` |

## Development Notes

- Docker services are configured with `restart: "no"` (dev) or `restart: unless-stopped` (prod)
- Dev and prod can run simultaneously (different ports, containers, volumes)
- `NEXT_PUBLIC_*` variables are embedded at build time for production
- Production images don't mount volumes (use built code)
- Dev images mount source code for hot reload

## License

MIT
