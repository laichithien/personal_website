# Infrastructure Setup Guide

**Document:** Implementation Guide - DevOps & Deployment
**Project:** The Transparent Core
**Stack:** Docker Compose, PostgreSQL, Cloudflare Tunnel

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      INTERNET                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   CLOUDFLARE EDGE                            │
│  • SSL/TLS Termination                                       │
│  • DDoS Protection                                           │
│  • CDN Caching                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (Encrypted Tunnel)
┌─────────────────────────────────────────────────────────────┐
│                   HOME SERVER (Ubuntu)                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              DOCKER COMPOSE NETWORK                  │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │    │
│  │  │   cloudflared │  │     web      │  │ ai-service│  │    │
│  │  │   (tunnel)   │→│  (Next.js)   │  │ (FastAPI) │  │    │
│  │  │              │  │  Port 3000   │  │ Port 8000 │  │    │
│  │  └──────────────┘  └──────────────┘  └───────────┘  │    │
│  │                            │                │        │    │
│  │                            └───────┬────────┘        │    │
│  │                                    ▼                 │    │
│  │                          ┌──────────────┐            │    │
│  │                          │  PostgreSQL  │            │    │
│  │                          │  + pgvector  │            │    │
│  │                          │  Port 5432   │            │    │
│  │                          └──────────────┘            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  LOCAL ACCESS:                                               │
│  • localhost:3333 → web:3000                                 │
│  • localhost:3334 → ai-service:8000                          │
│  • localhost:5432 → db:5432                                  │
└─────────────────────────────────────────────────────────────┘

PUBLIC ACCESS:
• yourdomain.com       → tunnel → web:3000
• api.yourdomain.com   → tunnel → ai-service:8000
```

---

## 2. Prerequisites

### 2.1. Server Requirements

```bash
# Minimum specs
- CPU: 4 cores
- RAM: 8GB
- Storage: 50GB SSD
- OS: Ubuntu 22.04 LTS

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### 2.2. Domain Setup

1. Register domain (e.g., `yourdomain.com`)
2. Add to Cloudflare (free plan works)
3. Set nameservers to Cloudflare
4. Verify domain is active

---

## 3. Cloudflare Tunnel Setup

### 3.1. Create Tunnel

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com)
2. Navigate to **Access → Tunnels**
3. Click **Create a tunnel**
4. Name: `thien-portfolio`
5. Select **Cloudflared** connector
6. Copy the tunnel token (starts with `eyJ...`)

### 3.2. Configure Public Hostnames

In the tunnel dashboard, add these hostnames:

| Subdomain | Domain | Service | URL |
|-----------|--------|---------|-----|
| (empty) | yourdomain.com | HTTP | `http://web:3000` |
| api | yourdomain.com | HTTP | `http://ai-service:8000` |

**Important:** Use internal Docker service names (`web`, `ai-service`) and their internal ports.

---

## 4. Environment Configuration

### 4.1. Create .env File

```bash
# Copy example and edit
cp .env.example .env
nano .env
```

```ini
# ===================
# Database
# ===================
DB_USER=thien_admin
DB_PASSWORD=your_secure_password_here_32chars

# ===================
# AI Service
# ===================
GEMINI_API_KEY=AIzaSy...your_actual_key

# ===================
# Cloudflare Tunnel
# ===================
TUNNEL_TOKEN=eyJhIjoiMz...your_tunnel_token

# ===================
# URLs (Production)
# ===================
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
INTERNAL_API_URL=http://ai-service:8000
```

### 4.2. Secure .env File

```bash
# Restrict permissions
chmod 600 .env

# Add to .gitignore (should already be there)
echo ".env" >> .gitignore
```

---

## 5. Docker Compose Configuration

### 5.1. Main Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  # =============================================
  # Database Layer
  # =============================================
  db:
    image: pgvector/pgvector:pg16
    container_name: portfolio_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infrastructure/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    ports:
      - "5432:5432"  # Expose for local development/debugging
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    networks:
      - portfolio_network

  # =============================================
  # AI Backend Service
  # =============================================
  ai-service:
    build:
      context: ./apps/ai-service
      dockerfile: Dockerfile
      target: production
    container_name: portfolio_ai
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/ai_agent_db
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    ports:
      - "3334:8000"  # Host:3334 → Container:8000
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - portfolio_network

  # =============================================
  # Frontend Web Service
  # =============================================
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
      target: runner
    container_name: portfolio_web
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/portfolio_main_db
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
      INTERNAL_API_URL: ${INTERNAL_API_URL}
    ports:
      - "3333:3000"  # Host:3333 → Container:3000
    depends_on:
      - db
      - ai-service
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    networks:
      - portfolio_network

  # =============================================
  # Cloudflare Tunnel (Production Only)
  # =============================================
  tunnel:
    image: cloudflare/cloudflared:latest
    container_name: portfolio_tunnel
    restart: unless-stopped
    command: tunnel run
    environment:
      TUNNEL_TOKEN: ${TUNNEL_TOKEN}
    depends_on:
      web:
        condition: service_healthy
      ai-service:
        condition: service_healthy
    networks:
      - portfolio_network
    profiles:
      - production

# =============================================
# Volumes
# =============================================
volumes:
  postgres_data:
    driver: local

# =============================================
# Networks
# =============================================
networks:
  portfolio_network:
    driver: bridge
```

### 5.2. Development Overrides

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  ai-service:
    build:
      target: development
    volumes:
      - ./apps/ai-service/src:/app/src:ro
    command: uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
    environment:
      - DEBUG=true

  web:
    build:
      target: development
    volumes:
      - ./apps/web/src:/app/src:ro
      - ./apps/web/public:/app/public:ro
    command: npm run dev
    environment:
      - NODE_ENV=development
```

---

## 6. Database Initialization

### 6.1. Init Script

```sql
-- infrastructure/postgres/init.sql

-- =============================================
-- Database Initialization Script
-- Project: The Transparent Core
-- =============================================

-- 1. Create Frontend Database
CREATE DATABASE portfolio_main_db;

-- 2. Create AI Agent Database
CREATE DATABASE ai_agent_db;

-- 3. Connect to AI database and enable pgvector
\c ai_agent_db;
CREATE EXTENSION IF NOT EXISTS vector;

-- 4. Grant privileges
GRANT ALL PRIVILEGES ON DATABASE portfolio_main_db TO thien_admin;
GRANT ALL PRIVILEGES ON DATABASE ai_agent_db TO thien_admin;

-- Log completion
\echo 'Database initialization complete!'
```

---

## 7. Deployment Commands

### 7.1. First Time Setup

```bash
# 1. Clone repository
git clone <your-repo> thien-portfolio
cd thien-portfolio

# 2. Create environment file
cp .env.example .env
# Edit .env with your values

# 3. Build all images
docker compose build

# 4. Start database first
docker compose up -d db

# 5. Wait for database to be ready
docker compose logs -f db
# Wait for "database system is ready to accept connections"

# 6. Run database migrations (if using alembic)
docker compose run --rm ai-service alembic upgrade head

# 7. Seed initial data
docker compose run --rm ai-service python scripts/seed_data.py

# 8. Start all services (development)
docker compose up -d

# 9. Start all services with tunnel (production)
docker compose --profile production up -d
```

### 7.2. Daily Operations

```bash
# View all running containers
docker compose ps

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f web
docker compose logs -f ai-service

# Restart a service
docker compose restart web

# Stop all services
docker compose down

# Stop and remove volumes (CAUTION: deletes data)
docker compose down -v
```

### 7.3. Update Deployment

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose build
docker compose up -d

# Or with zero downtime (one service at a time)
docker compose up -d --no-deps --build web
docker compose up -d --no-deps --build ai-service
```

---

## 8. Backup & Recovery

### 8.1. Database Backup

```bash
# Create backup directory
mkdir -p backups

# Backup all databases
docker exec portfolio_db pg_dumpall -U thien_admin > backups/backup_$(date +%F).sql

# Backup specific database
docker exec portfolio_db pg_dump -U thien_admin ai_agent_db > backups/ai_agent_$(date +%F).sql
```

### 8.2. Automated Backup (Cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/thien-portfolio && docker exec portfolio_db pg_dumpall -U thien_admin > backups/backup_$(date +\%F).sql

# Keep only last 7 days
0 3 * * * find /path/to/thien-portfolio/backups -name "*.sql" -mtime +7 -delete
```

### 8.3. Restore from Backup

```bash
# Stop services (keep db running)
docker compose stop web ai-service

# Restore
cat backups/backup_2024-01-15.sql | docker exec -i portfolio_db psql -U thien_admin

# Restart services
docker compose up -d
```

---

## 9. Monitoring

### 9.1. Health Checks

```bash
# Check all services
docker compose ps

# Check specific health
curl http://localhost:3333          # Frontend
curl http://localhost:3334/health   # Backend
```

### 9.2. Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Clean unused resources
docker system prune -a
```

### 9.3. Log Rotation

Create `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
# Restart Docker
sudo systemctl restart docker
```

---

## 10. Security Checklist

### 10.1. Server Hardening

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Enable firewall
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (if needed)
sudo ufw allow ssh

# Allow local Docker ports (optional, for debugging)
sudo ufw allow from 192.168.0.0/16 to any port 3333
sudo ufw allow from 192.168.0.0/16 to any port 3334

# NO need to allow 80/443 - Cloudflare Tunnel handles this
```

### 10.2. Docker Security

```bash
# Run containers as non-root (already in Dockerfiles)
# Use read-only volumes where possible
# Limit container resources

# In docker-compose.yml, add:
services:
  web:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

### 10.3. Environment Security

- Never commit `.env` to git
- Use strong passwords (32+ chars)
- Rotate API keys periodically
- Enable Cloudflare security features (WAF, Bot Protection)

---

## 11. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Container won't start | Check logs: `docker compose logs <service>` |
| Database connection refused | Wait for health check or check `DATABASE_URL` |
| Tunnel not connecting | Verify `TUNNEL_TOKEN` and check Cloudflare dashboard |
| Port already in use | Find process: `lsof -i :3333` and kill or change port |
| Out of disk space | Clean Docker: `docker system prune -a` |
| Permission denied | Check file ownership and Docker group membership |

### Debug Mode

```bash
# Run with verbose output
docker compose --verbose up

# Enter container shell
docker exec -it portfolio_web sh
docker exec -it portfolio_ai bash

# Check network connectivity
docker exec portfolio_web curl http://ai-service:8000/health
```

---

## 12. Production Checklist

Before going live:

- [ ] `.env` file configured with production values
- [ ] Database passwords are strong (32+ chars)
- [ ] Cloudflare Tunnel token is set
- [ ] SSL/TLS working (automatic via Cloudflare)
- [ ] Health checks passing for all services
- [ ] Backup script configured and tested
- [ ] Log rotation configured
- [ ] Firewall rules applied
- [ ] Initial data seeded
- [ ] Domain DNS pointing to Cloudflare

---

## Next Steps

- **[04-component-specs.md](./04-component-specs.md)** - UI Component specifications
- **[05-api-specification.md](./05-api-specification.md)** - API documentation
