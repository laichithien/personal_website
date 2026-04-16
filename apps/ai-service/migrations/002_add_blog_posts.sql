-- Migration: Add blog_posts table
-- For DEV:  psql -h localhost -p 5452 -U postgres -d ai_agent_db -f this_file.sql
-- For PROD: psql -h localhost -p 5442 -U postgres -d ai_agent_db -f this_file.sql

CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    excerpt VARCHAR(500) NOT NULL DEFAULT '',
    cover_image TEXT,
    content_markdown TEXT NOT NULL,
    tags JSON NOT NULL DEFAULT '[]'::json,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS ix_blog_posts_title ON blog_posts(title);
CREATE INDEX IF NOT EXISTS ix_blog_posts_published_at ON blog_posts(published_at DESC);
