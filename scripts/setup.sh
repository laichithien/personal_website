#!/bin/bash
# Interactive setup script for personal website deployment

set -e

echo "🚀 Personal Website Deployment Setup"
echo "===================================="

# Check if .env exists
if [ -f .env ]; then
    echo "📋 Found existing .env file"
    read -p "Do you want to update database settings? (y/n): " UPDATE_DB
    if [ "$UPDATE_DB" != "y" ]; then
        echo "✅ Using existing .env configuration"
        echo "🚀 Running database initialization..."
        ./scripts/init-db.sh
        exit 0
    fi
else
    echo "📝 Creating new .env file..."
    cp .env.example .env
fi

# Collect database information
echo ""
echo "📊 Database Configuration"
echo "========================="

read -p "Database host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Database port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "Database name (default: ai_agent_db): " DB_NAME
DB_NAME=${DB_NAME:-ai_agent_db}

read -p "Database username: " DB_USER
while [ -z "$DB_USER" ]; do
    read -p "Database username (required): " DB_USER
done

read -s -p "Database password: " DB_PASSWORD
echo ""
while [ -z "$DB_PASSWORD" ]; do
    read -s -p "Database password (required): " DB_PASSWORD
    echo ""
done

# Test database connection
echo ""
echo "🔍 Testing database connection..."
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/postgres"

if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo "Please check your credentials and try again"
    exit 1
fi

# Collect API keys
echo ""
echo "🔑 API Configuration"
echo "==================="

read -p "OpenRouter API key: " OPENROUTER_KEY
while [ -z "$OPENROUTER_KEY" ]; do
    read -p "OpenRouter API key (required): " OPENROUTER_KEY
done

# Collect domain information
echo ""
echo "🌐 Domain Configuration"
echo "======================="

read -p "Your domain (e.g., example.com, or localhost for local): " DOMAIN
DOMAIN=${DOMAIN:-localhost}

if [ "$DOMAIN" = "localhost" ]; then
    API_URL="http://localhost:3334"
    SITE_URL="http://localhost:3333"
    CORS_ORIGINS="http://localhost:3000,http://localhost:3333"
    COOKIE_DOMAIN=""
else
    API_URL="https://api.$DOMAIN"
    SITE_URL="https://$DOMAIN"
    CORS_ORIGINS="https://$DOMAIN,https://www.$DOMAIN"
    COOKIE_DOMAIN=".$DOMAIN"
fi

# Update .env file
echo ""
echo "📝 Updating .env file..."

# Create the full DATABASE_URL
FULL_DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

# Update .env file with collected information
cat > .env << EOF
# ===========================================
# Personal Website - Environment Variables
# ===========================================

# Database Configuration
DATABASE_URL=$FULL_DATABASE_URL
POSTGRES_USER=$DB_USER
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_DB=$DB_NAME

# OpenRouter AI
OPENROUTER_API_KEY=$OPENROUTER_KEY

# For Pydantic-AI OpenAI compatibility with OpenRouter
OPENAI_API_KEY=$OPENROUTER_KEY
OPENAI_BASE_URL=https://openrouter.ai/api/v1

# Default Model
DEFAULT_MODEL=xiaomi/mimo-v2-flash:free
DEFAULT_TEMPERATURE=0.7

# Application
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO

# CORS (comma-separated origins)
CORS_ORIGINS_STR=$CORS_ORIGINS

# Rate Limiting
RATE_LIMIT_PER_MINUTE=30

# Frontend URLs
NEXT_PUBLIC_API_URL=$API_URL
NEXT_PUBLIC_SITE_URL=$SITE_URL

# Cookie Configuration
COOKIE_DOMAIN=$COOKIE_DOMAIN

# ===========================================
# Admin Panel Configuration
# ===========================================

# Admin Credentials (change after first login)
ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123

# JWT Authentication
JWT_SECRET_KEY=$(openssl rand -base64 32)
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# File Upload (for knowledge documents)
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=10
EOF

echo "✅ .env file updated"

# Show summary
echo ""
echo "📊 Configuration Summary"
echo "======================="
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo "Domain: $DOMAIN"
echo "Frontend: $SITE_URL"
echo "API: $API_URL"

# Ask to initialize database
echo ""
read -p "Initialize database now? (y/n): " INIT_DB
if [ "$INIT_DB" = "y" ]; then
    echo "🚀 Initializing database..."
    ./scripts/init-db.sh
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. docker compose -f docker-compose.external-db.yml up -d"
    echo "2. Access admin panel: $SITE_URL/admin"
    echo "3. Login with: admin / admin123"
    echo "4. Change default password in Settings"
else
    echo ""
    echo "✅ Configuration saved to .env"
    echo "Run './scripts/init-db.sh' when ready to initialize database"
fi
EOF