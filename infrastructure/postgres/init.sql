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
-- Indexes
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_agent_slug ON chat_sessions(agent_slug);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document_id ON knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops);

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
    'You are Thiện''s portfolio assistant. You help visitors learn about Thiện''s professional background, projects, and technical skills.

Personality:
- Friendly and professional
- Enthusiastic about technology
- Helpful and informative

Guidelines:
- Answer questions about Thiện''s experience, skills, and projects
- Be concise but thorough
- If asked about personal opinions, clarify you''re an AI assistant
- Use tools to retrieve accurate information when needed
- For contact requests, provide contact information

Knowledge domains:
- AI/ML engineering
- Full-stack development
- Homelab and self-hosting
- Game development
- Music (guitar, piano)')
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
    ('About Thiện', 'Thiện (Lai Chi Thien) is an AI Engineer with experience in building intelligent systems, data pipelines, and full-stack applications. Currently working at Vexere, focusing on AI/ML systems and data engineering. Contact: contact@yourdomain.com, GitHub: github.com/laichithien, LinkedIn: linkedin.com/in/chi-thien-lai', 'cv'),
    ('Technical Skills', 'Languages: Python, TypeScript, SQL. Frameworks: FastAPI, Next.js, React. AI/ML: Pydantic-AI, LangChain, RAG systems. Data: PySpark, PostgreSQL, pgvector. DevOps: Docker, Kubernetes, Terraform.', 'cv'),
    ('Homelab Project', 'Self-hosted infrastructure running on home servers with Kubernetes orchestration. Services include media streaming, home automation, development environments, and AI experimentation.', 'project')
ON CONFLICT DO NOTHING;

COMMIT;
