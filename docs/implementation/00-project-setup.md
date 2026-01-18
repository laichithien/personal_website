# Project Setup Guide

**Document:** Implementation Guide - Project Bootstrap
**Project:** The Transparent Core
**Phase:** 1 (MVP)

---

## 1. Directory Structure

```bash
thien-portfolio/
├── apps/
│   ├── web/                          # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── globals.css
│   │   │   │   └── api/              # API Routes (proxy)
│   │   │   ├── components/
│   │   │   │   ├── ui/               # Base components (shadcn + custom)
│   │   │   │   ├── features/         # Feature components
│   │   │   │   └── shared/           # Layout components
│   │   │   ├── lib/                  # Utilities
│   │   │   ├── config/               # Static content
│   │   │   └── hooks/                # Custom React hooks
│   │   ├── public/                   # Static assets
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   └── ai-service/                   # FastAPI Backend
│       ├── src/
│       │   ├── main.py               # FastAPI entry
│       │   ├── config.py             # Settings
│       │   ├── database/
│       │   │   ├── connection.py
│       │   │   └── models.py         # SQLModel schemas
│       │   ├── agent/
│       │   │   ├── factory.py        # Agent builder
│       │   │   ├── registry.py       # Tool registry
│       │   │   └── tools/            # Tool implementations
│       │   ├── api/
│       │   │   ├── routes/
│       │   │   └── schemas.py        # Pydantic schemas
│       │   └── services/             # Business logic
│       ├── requirements.txt
│       ├── pyproject.toml
│       ├── alembic/                  # DB migrations
│       └── Dockerfile
│
├── infrastructure/
│   └── postgres/
│       └── init.sql                  # DB initialization
│
├── docs/                             # Documentation
│   ├── products/
│   ├── technicals/
│   └── implementation/
│
├── docker-compose.yml
├── docker-compose.dev.yml            # Development overrides
├── .env.example
├── .gitignore
└── README.md
```

---

## 2. Initial Setup Commands

### 2.1. Create Project Root

```bash
# Create main project directory
mkdir -p thien-portfolio
cd thien-portfolio

# Initialize git
git init

# Create directory structure
mkdir -p apps/web apps/ai-service infrastructure/postgres docs
```

### 2.2. Create .gitignore

```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.pyc
.venv/
venv/

# Environment
.env
.env.local
.env.*.local

# Build outputs
.next/
out/
dist/
build/

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Database
*.db
*.sqlite

# Docker
postgres_data/
EOF
```

### 2.3. Create .env.example

```bash
cat > .env.example << 'EOF'
# ===================
# Database
# ===================
DB_USER=thien_admin
DB_PASSWORD=your_secure_password_here

# ===================
# AI Service
# ===================
GEMINI_API_KEY=your_gemini_api_key_here

# ===================
# Cloudflare Tunnel
# ===================
TUNNEL_TOKEN=your_tunnel_token_here

# ===================
# URLs (Production)
# ===================
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
INTERNAL_API_URL=http://ai-service:8000

# ===================
# URLs (Development)
# ===================
# NEXT_PUBLIC_API_URL=http://localhost:3334
# INTERNAL_API_URL=http://localhost:3334
EOF
```

---

## 3. Frontend Setup (Next.js)

### 3.1. Initialize Next.js Project

```bash
cd apps/web

# Create Next.js with TypeScript, Tailwind, ESLint, App Router
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### 3.2. Install Dependencies

```bash
# Core dependencies
npm install framer-motion clsx tailwind-merge lucide-react

# Data fetching
npm install @tanstack/react-query axios

# Dev dependencies
npm install -D @types/node
```

### 3.3. Install shadcn/ui

```bash
# Initialize shadcn
npx shadcn@latest init

# Select options:
# - Style: Default
# - Base color: Neutral
# - CSS variables: Yes

# Install required components
npx shadcn@latest add button dialog input textarea tabs card
```

### 3.4. Configure Tailwind

Update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom Liquid Glass colors
        glass: {
          light: "rgba(255, 255, 255, 0.1)",
          medium: "rgba(255, 255, 255, 0.15)",
          dark: "rgba(0, 0, 0, 0.2)",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "float-slow": "float 20s ease-in-out infinite",
        "float-medium": "float 15s ease-in-out infinite",
        "float-fast": "float 10s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -30px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### 3.5. Update globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 3%;
    --foreground: 0 0% 98%;
    /* ... other shadcn variables */
  }
}

@layer utilities {
  /* Noise texture overlay */
  .bg-noise {
    position: relative;
  }

  .bg-noise::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 10;
    pointer-events: none;
    opacity: 0.05;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }

  /* Glass border gradient */
  .glass-border {
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}
```

---

## 4. Backend Setup (FastAPI)

### 4.1. Initialize Python Project

```bash
cd apps/ai-service

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Create project structure
mkdir -p src/{agent/tools,api/routes,database,services}
touch src/__init__.py src/main.py src/config.py
touch src/agent/__init__.py src/agent/factory.py src/agent/registry.py
touch src/api/__init__.py src/api/schemas.py
touch src/database/__init__.py src/database/connection.py src/database/models.py
```

### 4.2. Create requirements.txt

```bash
cat > requirements.txt << 'EOF'
# Web Framework
fastapi>=0.109.0
uvicorn[standard]>=0.27.0

# Database
sqlmodel>=0.0.14
psycopg2-binary>=2.9.9
asyncpg>=0.29.0
pgvector>=0.2.4

# AI
pydantic-ai>=0.0.9
google-generativeai>=0.3.2

# Utilities
python-dotenv>=1.0.0
pydantic>=2.5.0
pydantic-settings>=2.1.0

# Development
alembic>=1.13.0
EOF
```

### 4.3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4.4. Create pyproject.toml

```bash
cat > pyproject.toml << 'EOF'
[project]
name = "ai-service"
version = "0.1.0"
description = "AI Agent Service for The Transparent Core"
requires-python = ">=3.11"

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W"]

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
EOF
```

---

## 5. Database Setup

### 5.1. Create init.sql

```bash
cat > infrastructure/postgres/init.sql << 'EOF'
-- =============================================
-- Database Initialization Script
-- Project: The Transparent Core
-- =============================================

-- 1. Create Frontend Database
CREATE DATABASE portfolio_main_db;

-- 2. Create AI Agent Database
CREATE DATABASE ai_agent_db;

-- 3. Enable pgvector extension for AI database
\c ai_agent_db;
CREATE EXTENSION IF NOT EXISTS vector;

-- 4. Create default user permissions
GRANT ALL PRIVILEGES ON DATABASE portfolio_main_db TO thien_admin;
GRANT ALL PRIVILEGES ON DATABASE ai_agent_db TO thien_admin;
EOF
```

---

## 6. Docker Configuration

### 6.1. Create docker-compose.yml

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Database
  db:
    image: pgvector/pgvector:pg16
    container_name: portfolio_db
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infrastructure/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5

  # AI Backend
  ai-service:
    build:
      context: ./apps/ai-service
      dockerfile: Dockerfile
    container_name: portfolio_ai
    restart: always
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/ai_agent_db
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    ports:
      - "3334:8000"
    depends_on:
      db:
        condition: service_healthy

  # Frontend
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    container_name: portfolio_web
    restart: always
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/portfolio_main_db
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
      INTERNAL_API_URL: ${INTERNAL_API_URL}
    ports:
      - "3333:3000"
    depends_on:
      - db
      - ai-service

  # Cloudflare Tunnel (Production only)
  tunnel:
    image: cloudflare/cloudflared:latest
    container_name: portfolio_tunnel
    restart: always
    command: tunnel run
    environment:
      TUNNEL_TOKEN: ${TUNNEL_TOKEN}
    depends_on:
      - web
      - ai-service
    profiles:
      - production

volumes:
  postgres_data:
```

### 6.2. Create Development Override

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  ai-service:
    build:
      target: development
    volumes:
      - ./apps/ai-service/src:/app/src
    command: uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

  web:
    build:
      target: development
    volumes:
      - ./apps/web/src:/app/src
    command: npm run dev
```

---

## 7. Verification Checklist

After setup, verify:

```bash
# Check directory structure
tree -L 3 apps/

# Verify Node.js project
cd apps/web && npm run dev
# Should start on http://localhost:3000

# Verify Python project
cd apps/ai-service
source .venv/bin/activate
python -c "import fastapi; print('FastAPI OK')"

# Verify Docker
docker-compose config
# Should output merged config without errors
```

---

## Next Steps

1. **[01-frontend-implementation.md](./01-frontend-implementation.md)** - Build UI components
2. **[02-backend-implementation.md](./02-backend-implementation.md)** - Build API & Agent
3. **[03-infrastructure-setup.md](./03-infrastructure-setup.md)** - Deploy with Docker
4. **[04-component-specs.md](./04-component-specs.md)** - Detailed component implementations
5. **[05-api-specification.md](./05-api-specification.md)** - API endpoints & schemas
