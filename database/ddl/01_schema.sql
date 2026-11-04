-- ==============================================================================
-- Schema: Research Paper Semantic Search & Retrieval System
-- Course: DBMS Level 3 Mini-Project
-- Paradigms: SQL (PostgreSQL) + Vector Database (pgvector)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean teardown (for repeatable execution during evaluation/testing)
DROP TABLE IF EXISTS query_retrieval CASCADE;
DROP TABLE IF EXISTS search_query CASCADE;
DROP TABLE IF EXISTS vector_embedding CASCADE;
DROP TABLE IF EXISTS research_paper CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==============================================================================
-- TABLE 1: users
-- Represents system actors with Role-Based Access Control (Admin / Researcher)
-- ==============================================================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'RESEARCHER' CHECK (role IN ('ADMIN', 'RESEARCHER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- TABLE 2: research_paper
-- Stores research paper metadata and text content
-- ==============================================================================
CREATE TABLE research_paper (
    paper_id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    abstract TEXT NOT NULL,
    authors VARCHAR(300),
    category VARCHAR(100),
    publication_date DATE,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_abstract_min_len CHECK (length(trim(abstract)) >= 20)
);

-- ==============================================================================
-- TABLE 3: vector_embedding
-- Stores dense vector embeddings corresponding to each research paper (1:1)
-- Dimension 384 corresponds to the standard all-MiniLM-L6-v2 sentence transformer
-- ==============================================================================
CREATE TABLE vector_embedding (
    embedding_id SERIAL PRIMARY KEY,
    paper_id INT UNIQUE NOT NULL REFERENCES research_paper(paper_id) ON DELETE CASCADE,
    model_version VARCHAR(100) NOT NULL DEFAULT 'all-MiniLM-L6-v2',
    vector_data vector(384) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- TABLE 4: search_query
-- Logs natural language queries executed by users
-- ==============================================================================
CREATE TABLE search_query (
    query_id SERIAL PRIMARY KEY,
    query_text TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL
);

-- ==============================================================================
-- TABLE 5: query_retrieval
-- Associative table tracking which papers were retrieved for each query (M:N)
-- Records cosine similarity score and ranked order
-- ==============================================================================
CREATE TABLE query_retrieval (
    query_id INT NOT NULL REFERENCES search_query(query_id) ON DELETE CASCADE,
    paper_id INT NOT NULL REFERENCES research_paper(paper_id) ON DELETE CASCADE,
    similarity_score DOUBLE PRECISION NOT NULL CHECK (similarity_score >= -1.0 AND similarity_score <= 1.0),
    rank_order INT NOT NULL CHECK (rank_order > 0),
    retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (query_id, paper_id)
);

-- ==============================================================================
-- INDEXES
-- Relational B-Trees, Full-Text GIN, and Approximate Nearest Neighbor HNSW
-- ==============================================================================

-- B-Tree indexes for foreign keys & frequent query filters
CREATE INDEX idx_research_paper_user_id ON research_paper(user_id);
CREATE INDEX idx_research_paper_category ON research_paper(category);
CREATE INDEX idx_search_query_user_id ON search_query(user_id);
CREATE INDEX idx_search_query_timestamp ON search_query(timestamp DESC);
CREATE INDEX idx_query_retrieval_paper_id ON query_retrieval(paper_id);

-- Full-Text Search GIN Index (for Hybrid Search demonstration)
CREATE INDEX idx_paper_fulltext ON research_paper 
USING gin(to_tsvector('english', title || ' ' || abstract));

-- Vector Index: HNSW (Hierarchical Navigable Small World) for sub-millisecond ANN search
CREATE INDEX idx_vector_embedding_hnsw ON vector_embedding 
USING hnsw (vector_data vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
