#!/bin/bash
# Database initialization script for external PostgreSQL

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check required variables
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not set"
    exit 1
fi

# Extract connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_URL_PATTERN="postgresql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+)"

if [[ $DATABASE_URL =~ $DB_URL_PATTERN ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASSWORD="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    echo "ERROR: Invalid DATABASE_URL format"
    exit 1
fi

echo "🔧 Initializing database: $DB_NAME"
echo "📍 Host: $DB_HOST:$DB_PORT"
echo "👤 User: $DB_USER"

# Check if database exists
echo "📋 Checking if database exists..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "✅ Database '$DB_NAME' already exists"
else
    echo "🔨 Creating database '$DB_NAME'..."
    PGPASSWORD="$DB_PASSWORD" createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
fi

# Check if pgvector extension is available
echo "🔍 Checking pgvector extension..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>/dev/null; then
    echo "✅ pgvector extension available"
else
    echo "⚠️  WARNING: pgvector extension not available - RAG features will not work"
    echo "   Install with: sudo apt install postgresql-16-pgvector"
fi

# Run initialization SQL
echo "🚀 Running database initialization script..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f infrastructure/postgres/init.sql

echo "✅ Database initialization completed!"

# Show database info
echo ""
echo "📊 Database Summary:"
echo "   Database: $DB_NAME"
echo "   Connection: $DB_HOST:$DB_PORT"
echo "   Tables created with seed data"
echo "   Default admin user: admin / admin123"
echo ""
echo "🚀 Next steps:"
echo "   1. docker compose -f docker-compose.external-db.yml up -d"
echo "   2. Access admin panel and change default password"