-- ===========================================
-- The Transparent Core - Database Initialization
-- ===========================================

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- Agent Configuration Tables
-- ===========================================

CREATE TABLE IF NOT EXISTS agent_configs (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    model_provider VARCHAR(50) DEFAULT 'openai',
    model_name VARCHAR(100) DEFAULT 'xiaomi/mimo-v2-flash:free',
    system_prompt TEXT NOT NULL,
    temperature FLOAT DEFAULT 0.7,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tool_definitions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_tool_links (
    agent_id INTEGER REFERENCES agent_configs(id) ON DELETE CASCADE,
    tool_id INTEGER REFERENCES tool_definitions(id) ON DELETE CASCADE,
    PRIMARY KEY (agent_id, tool_id)
);

-- ===========================================
-- Chat & Session Tables
-- ===========================================

CREATE TABLE IF NOT EXISTS chat_sessions (
    id SERIAL PRIMARY KEY,
    session_id UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    agent_slug VARCHAR(100) NOT NULL,
    user_identifier VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- Knowledge Base Tables (RAG)
-- ===========================================

CREATE TABLE IF NOT EXISTS knowledge_documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(768),  -- Gemini embedding dimension
    chunk_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- Admin User Table
-- ===========================================

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- ===========================================
-- Portfolio Content Tables
-- ===========================================

CREATE TABLE IF NOT EXISTS portfolio_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_experiences (
    id SERIAL PRIMARY KEY,
    company VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    period VARCHAR(50) NOT NULL,
    highlights JSONB DEFAULT '[]',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_tech_stack (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    tags JSONB DEFAULT '[]',
    image VARCHAR(255),
    link VARCHAR(255),
    github VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_publications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    venue VARCHAR(200) NOT NULL,
    doi VARCHAR(100),
    year INTEGER NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_achievements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    event VARCHAR(200) NOT NULL,
    organization VARCHAR(200) NOT NULL,
    year INTEGER NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    year INTEGER NOT NULL,
    focus JSONB DEFAULT '[]',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_agent_slug ON chat_sessions(agent_slug);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document_id ON knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops);

-- Portfolio indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_settings_key ON portfolio_settings(key);
CREATE INDEX IF NOT EXISTS idx_portfolio_experiences_order ON portfolio_experiences(display_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_tech_stack_order ON portfolio_tech_stack(display_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_order ON portfolio_projects(display_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_publications_order ON portfolio_publications(display_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_achievements_order ON portfolio_achievements(display_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_courses_order ON portfolio_courses(display_order);

-- ===========================================
-- Seed Data: Default Agent & Tools
-- ===========================================

-- Insert default tools
INSERT INTO tool_definitions (name, description) VALUES
    ('search_projects', 'Search through portfolio projects by keyword'),
    ('get_cv_info', 'Get CV and professional experience information'),
    ('get_contact_info', 'Get contact and social media information'),
    ('get_tech_stack', 'Get detailed technology stack information'),
    ('search_knowledge', 'Semantic search through knowledge base')
ON CONFLICT (name) DO NOTHING;

-- Insert default portfolio assistant agent
INSERT INTO agent_configs (slug, name, system_prompt) VALUES
    ('portfolio-assistant', 'Portfolio Assistant',
    'You are a portfolio assistant. You help visitors learn about the owner''s professional background, projects, and technical skills.

Personality:
- Friendly and professional
- Enthusiastic about technology
- Helpful and informative

Guidelines:
- Answer questions about the owner''s experience, skills, and projects
- Be concise but thorough
- If asked about personal opinions, clarify you''re an AI assistant
- Use tools to retrieve accurate information when needed
- For contact requests, provide contact information')
ON CONFLICT (slug) DO NOTHING;

-- Link tools to portfolio assistant
INSERT INTO agent_tool_links (agent_id, tool_id)
SELECT a.id, t.id
FROM agent_configs a, tool_definitions t
WHERE a.slug = 'portfolio-assistant'
  AND t.name IN ('search_projects', 'get_cv_info', 'get_contact_info', 'get_tech_stack')
ON CONFLICT DO NOTHING;

-- ===========================================
-- Seed Data: Sample Knowledge Documents
-- ===========================================

INSERT INTO knowledge_documents (title, content, source) VALUES
    ('About Me', 'I am an AI Engineer with experience in building intelligent systems, data pipelines, and full-stack applications. Contact: contact@yourdomain.com, GitHub: github.com/yourusername, LinkedIn: linkedin.com/in/yourprofile', 'cv'),
    ('Technical Skills', 'Languages: Python, TypeScript, SQL. Frameworks: FastAPI, Next.js, React. AI/ML: Pydantic-AI, LangChain, RAG systems. Data: PySpark, PostgreSQL, pgvector. DevOps: Docker, Kubernetes, Terraform.', 'cv'),
    ('Sample Project', 'A self-hosted infrastructure project running on home servers with Kubernetes orchestration. Includes various microservices and AI experimentation tools.', 'project')
ON CONFLICT DO NOTHING;

-- ===========================================
-- Seed Data: Portfolio Settings
-- ===========================================
-- Note: Include updated_at for SQLModel compatibility (NOT NULL without default)

INSERT INTO portfolio_settings (key, value, updated_at) VALUES
    ('hero', '{"name": "Your Name", "title": "AI Engineer", "tagline": "Building Agentic AI systems that automate complex workflows. Bridging cutting-edge GenAI with robust production systems.", "avatar": "/images/avatar.jpg", "location": "Your City, Country"}', CURRENT_TIMESTAMP),
    ('about', '{"summary": "Machine Learning Engineer with expertise in building Agentic AI systems and automating workflows. Proficient in orchestrating LLMs and enforcing software engineering standards.", "highlights": ["Architected Agentic AI systems", "Implemented Human-in-the-loop (HITL) capabilities", "Published research on AI/ML", "BS in Computer Science"]}', CURRENT_TIMESTAMP),
    ('education', '{"school": "Your University", "degree": "BS in Computer Science", "period": "2020 - 2024", "gpa": "3.8/4.0", "coursework": ["Deep Learning Techniques", "Computer Vision", "Probability and Statistics", "Python for ML"]}', CURRENT_TIMESTAMP),
    ('lifestyle', '{"music": {"instruments": ["Guitar", "Piano"], "currentlyPlaying": "Lo-fi Beats"}, "routines": ["Morning: Code & Coffee", "Afternoon: Deep Work", "Evening: Music & Reading"]}', CURRENT_TIMESTAMP),
    ('social', '{"github": "https://github.com/yourusername", "linkedin": "https://www.linkedin.com/in/yourprofile/", "email": "contact@yourdomain.com", "phone": "+00 000 000 000"}', CURRENT_TIMESTAMP)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP;

-- ===========================================
-- Seed Data: Portfolio Experience
-- ===========================================
-- Note: Include is_active, created_at, updated_at for SQLModel compatibility

INSERT INTO portfolio_experiences (company, role, period, highlights, display_order, is_active, created_at, updated_at) VALUES
    ('Your Company', 'AI Engineer', '2024 - Present', '["Architected Agentic AI system using Pydantic-AI", "Engineered dynamic tool execution with Human-in-the-loop capabilities", "Integrated RAG support"]', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Another Company', 'Machine Learning Engineer', '2023 - 2024', '["Developed AI-Agent automation tools", "Enhanced ML model accuracy"]', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ===========================================
-- Seed Data: Portfolio Tech Stack
-- ===========================================

INSERT INTO portfolio_tech_stack (name, icon, category, display_order, is_active, created_at, updated_at) VALUES
    ('Python', 'python', 'language', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('TypeScript', 'typescript', 'language', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('FastAPI', 'fastapi', 'backend', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Next.js', 'nextjs', 'frontend', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ===========================================
-- Seed Data: Portfolio Projects
-- ===========================================

INSERT INTO portfolio_projects (title, description, tags, display_order, is_featured, is_active, created_at, updated_at) VALUES
    ('AI Project', 'Description of your amazing AI project.', '["Python", "AI", "API"]', 0, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ===========================================
-- Seed Data: Portfolio Publications
-- ===========================================

INSERT INTO portfolio_publications (title, venue, doi, year, display_order, is_active, created_at, updated_at) VALUES
    ('Your Research Paper', 'International Conference', '10.1109/EXAMPLE', 2023, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ===========================================
-- Seed Data: Portfolio Achievements
-- ===========================================

INSERT INTO portfolio_achievements (title, event, organization, year, display_order, is_active, created_at, updated_at) VALUES
    ('First Prize', 'Hackathon 2023', 'Tech Organization', 2023, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ===========================================
-- Seed Data: Portfolio Courses
-- ===========================================

INSERT INTO portfolio_courses (title, year, focus, display_order, is_active, created_at, updated_at) VALUES
    ('Advanced ML Course', 2024, '["Topic A", "Topic B"]', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

COMMIT;
