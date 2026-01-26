#!/bin/bash
# Enhanced setup script that can create PostgreSQL users and databases

set -e

echo "🚀 Personal Website Deployment Setup (with User Creation)"
echo "========================================================="

echo ""
echo "📋 Setup Options:"
echo "1. Use existing PostgreSQL user"
echo "2. Create new PostgreSQL user (requires admin access)"
echo ""

read -p "Choose option (1 or 2): " SETUP_OPTION

if [ "$SETUP_OPTION" = "2" ]; then
    echo ""
    echo "🔑 PostgreSQL Admin Access Required"
    echo "=================================="
    
    read -p "PostgreSQL admin username (default: postgres): " ADMIN_USER
    ADMIN_USER=${ADMIN_USER:-postgres}
    
    read -p "PostgreSQL host (default: localhost): " DB_HOST
    DB_HOST=${DB_HOST:-localhost}
    
    read -p "PostgreSQL port (default: 5432): " DB_PORT
    DB_PORT=${DB_PORT:-5432}
    
    echo ""
    echo "🔍 Testing admin connection..."
    
    # Test admin connection
    if ! PGPASSWORD="" psql -h "$DB_HOST" -p "$DB_PORT" -U "$ADMIN_USER" -d postgres -c "SELECT 1;" >/dev/null 2>&1; then
        echo "❌ Cannot connect with empty password, will prompt for password during creation"
    else
        echo "✅ Admin connection successful"
    fi
    
    # Collect new user details
    echo ""
    echo "👤 New User Configuration"
    echo "========================"
    
    read -p "New username for application: " NEW_USER
    while [ -z "$NEW_USER" ]; do
        read -p "New username (required): " NEW_USER
    done
    
    read -s -p "Password for $NEW_USER: " NEW_PASSWORD
    echo ""
    while [ -z "$NEW_PASSWORD" ]; do
        read -s -p "Password (required): " NEW_PASSWORD
        echo ""
    done
    
    read -p "Database name (default: ai_agent_db): " DB_NAME
    DB_NAME=${DB_NAME:-ai_agent_db}
    
    echo ""
    echo "🔨 Creating user and database..."
    
    # Create user and database as admin
    PGPASSWORD="" psql -h "$DB_HOST" -p "$DB_PORT" -U "$ADMIN_USER" -d postgres << EOF
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$NEW_USER') THEN
        CREATE USER $NEW_USER WITH PASSWORD '$NEW_PASSWORD';
        RAISE NOTICE 'User $NEW_USER created';
    ELSE
        RAISE NOTICE 'User $NEW_USER already exists';
    END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE $DB_NAME OWNER $NEW_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $NEW_USER;
ALTER USER $NEW_USER CREATEDB;

-- Show created resources
\du $NEW_USER
\l $DB_NAME
EOF
    
    echo "✅ User and database created successfully"
    
    # Set variables for main setup
    DB_USER="$NEW_USER"
    DB_PASSWORD="$NEW_PASSWORD"
    
else
    # Use existing user - collect details
    echo ""
    echo "📊 Existing Database Configuration"
    echo "================================="
    
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
fi

# Continue with regular setup...
echo ""
echo "🔍 Testing application database connection..."
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ Application database connection successful"
else
    # Try to create database if it doesn't exist
    echo "🔨 Database doesn't exist, creating it..."
    if PGPASSWORD="$DB_PASSWORD" createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" >/dev/null 2>&1; then
        echo "✅ Database created successfully"
    else
        echo "❌ Cannot create database. Please create manually or check permissions"
        exit 1
    fi
fi

# Collect API keys and domain info (same as before)
echo ""
echo "🔑 API Configuration"
echo "==================="

read -p "OpenRouter API key: " OPENROUTER_KEY
while [ -z "$OPENROUTER_KEY" ]; do
    read -p "OpenRouter API key (required): " OPENROUTER_KEY
done

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

# Create .env file
echo ""
echo "📝 Creating .env file..."

cat > .env << EOF
# ===========================================
# Personal Website - Environment Variables
# ===========================================

# Database Configuration
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME
POSTGRES_USER=$DB_USER
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_DB=$DB_NAME

# OpenRouter AI
OPENROUTER_API_KEY=$OPENROUTER_KEY
OPENAI_API_KEY=$OPENROUTER_KEY
OPENAI_BASE_URL=https://openrouter.ai/api/v1

# Application
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO

# CORS and URLs
CORS_ORIGINS_STR=$CORS_ORIGINS
NEXT_PUBLIC_API_URL=$API_URL
NEXT_PUBLIC_SITE_URL=$SITE_URL
COOKIE_DOMAIN=$COOKIE_DOMAIN

# Admin Panel
ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123
JWT_SECRET_KEY=$(openssl rand -base64 32)
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# File Upload
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=10
EOF

echo "✅ .env file created"

# Initialize database
echo ""
echo "🚀 Initializing database schema and seed data..."
./scripts/init-db.sh

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📊 Summary:"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT" 
echo "User: $DB_USER"
echo "Domain: $DOMAIN"
echo ""
echo "Next steps:"
echo "1. docker compose -f docker-compose.external-db.yml up -d"
echo "2. Access: $SITE_URL/admin"
echo "3. Login: admin / admin123"
echo "4. Change default password"