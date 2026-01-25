-- Migration: Add system_settings, contact_leads tables and new tools
-- Run this manually or tables will be auto-created on server restart
--
-- For DEV:  psql -h localhost -p 5452 -U postgres -d ai_agent_db -f this_file.sql
-- For PROD: psql -h localhost -p 5442 -U postgres -d ai_agent_db -f this_file.sql

-- ==========================================
-- System Settings table (for configurable API keys, URLs, etc.)
-- ==========================================
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_system_settings_key ON system_settings(key);

-- ==========================================
-- Contact Leads table (visitor info collected by AI agent)
-- ==========================================
CREATE TABLE IF NOT EXISTS contact_leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    company VARCHAR(255),
    phone VARCHAR(50),
    purpose VARCHAR(50),  -- 'hiring', 'collaboration', 'project', 'other'
    message TEXT,
    session_id VARCHAR(255),  -- Link to chat session
    is_contacted BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ==========================================
-- Insert default settings
-- ==========================================
INSERT INTO system_settings (key, value, description, is_sensitive) VALUES
    ('resume_url', '', 'URL to download CV/Resume (PDF)', false),
    ('calendly_link', '', 'Calendly link for scheduling meetings', false),
    ('github_username', '', 'GitHub username for profile stats', false),
    ('github_token', '', 'GitHub personal access token (optional, for higher rate limits)', true)
ON CONFLICT (key) DO NOTHING;

-- ==========================================
-- Delete old fragmented tools (cleanup)
-- ==========================================
DELETE FROM agent_tool_links WHERE tool_id IN (
    SELECT id FROM tool_definitions WHERE name IN (
        'get_about_me', 'get_full_portfolio', 'get_experiences',
        'get_projects', 'get_tech_stack', 'get_achievements',
        'get_publications', 'get_courses', 'search_projects',
        'search_knowledge', 'get_cv_info', 'get_contact_info'
    )
);

DELETE FROM tool_definitions WHERE name IN (
    'get_about_me', 'get_full_portfolio', 'get_experiences',
    'get_projects', 'get_tech_stack', 'get_achievements',
    'get_publications', 'get_courses', 'search_projects',
    'search_knowledge', 'get_cv_info', 'get_contact_info'
);

-- ==========================================
-- Insert new unified tools
-- ==========================================
INSERT INTO tool_definitions (name, description, is_active, created_at) VALUES
    (
        'search_profile',
        'Search through Thiện''s complete profile - background, skills, experience, projects, achievements, publications, courses, and interests. Use for ANY question about Thiện.',
        true,
        NOW()
    ),
    (
        'send_cv',
        'Get the download link for Thiện''s CV/Resume. Use when visitors ask to download CV, resume, or want documentation about his background.',
        true,
        NOW()
    ),
    (
        'save_contact',
        'Save visitor contact information for follow-up. Use when visitors want to leave their contact info, get in touch, request a callback, or express interest in hiring/collaboration.',
        true,
        NOW()
    ),
    (
        'schedule_meeting',
        'Get information about scheduling a meeting with Thiện. Use when visitors want to schedule a call, book time, or set up an interview/consultation.',
        true,
        NOW()
    ),
    (
        'fetch_github_stats',
        'Fetch GitHub statistics and activity for Thiện''s profile. Use when visitors ask about GitHub contributions, open source activity, coding statistics, or repositories.',
        true,
        NOW()
    ),
    (
        'calculator',
        'Evaluate simple mathematical expressions. Use for basic calculations during conversation.',
        true,
        NOW()
    )
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

-- ==========================================
-- Link new tools to existing agents (if any exist)
-- This links all new tools to all active agents
-- ==========================================
INSERT INTO agent_tool_links (agent_id, tool_id)
SELECT a.id, t.id
FROM agent_configs a
CROSS JOIN tool_definitions t
WHERE a.is_active = true
AND t.name IN ('search_profile', 'send_cv', 'save_contact', 'schedule_meeting', 'fetch_github_stats', 'calculator')
ON CONFLICT DO NOTHING;
