-- ==============================================================================
-- Stored Procedures & Functions
-- Course: DBMS Level 3 Mini-Project
-- Demonstrates: Stored Procedures/Functions, Vector Similarity, ACID Transactions
-- ==============================================================================

-- 1. Semantic Match Function: Retrieves top matching papers using cosine similarity
CREATE OR REPLACE FUNCTION match_papers(
    query_embedding vector(384),
    match_threshold float DEFAULT 0.2,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    paper_id INT,
    title VARCHAR(500),
    abstract TEXT,
    authors VARCHAR(300),
    category VARCHAR(100),
    publication_date DATE,
    similarity_score DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rp.paper_id,
        rp.title,
        rp.abstract,
        rp.authors,
        rp.category,
        rp.publication_date,
        (1 - (ve.vector_data <=> query_embedding))::DOUBLE PRECISION AS similarity_score
    FROM vector_embedding ve
    JOIN research_paper rp ON rp.paper_id = ve.paper_id
    WHERE (1 - (ve.vector_data <=> query_embedding)) >= match_threshold
    ORDER BY ve.vector_data <=> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- ==============================================================================
-- 2. Transactional Search & Logging Function:
-- Performs vector retrieval AND logs the query and retrieval relations atomically.
-- Demonstrates multi-table ACID transaction in PostgreSQL PL/pgSQL.
-- ==============================================================================
CREATE OR REPLACE FUNCTION execute_and_log_search(
    p_user_id INT,
    p_query_text TEXT,
    p_query_embedding vector(384),
    p_match_count INT DEFAULT 5,
    p_match_threshold FLOAT DEFAULT 0.1
)
RETURNS TABLE (
    retrieval_query_id INT,
    paper_id INT,
    title VARCHAR(500),
    abstract TEXT,
    authors VARCHAR(300),
    category VARCHAR(100),
    similarity_score DOUBLE PRECISION,
    rank_order INT
)
LANGUAGE plpgsql
AS $$
#variable_conflict use_column
DECLARE
    v_query_id INT;
BEGIN
    -- Step 1: Insert search query record
    INSERT INTO search_query (query_text, user_id, timestamp)
    VALUES (p_query_text, p_user_id, CURRENT_TIMESTAMP)
    RETURNING query_id INTO v_query_id;

    -- Step 2: Retrieve top matching papers and populate query_retrieval
    RETURN QUERY
    WITH ranked_matches AS (
        SELECT 
            rp.paper_id AS r_paper_id,
            rp.title AS r_title,
            rp.abstract AS r_abstract,
            rp.authors AS r_authors,
            rp.category AS r_category,
            (1 - (ve.vector_data <=> p_query_embedding))::DOUBLE PRECISION AS r_similarity_score,
            ROW_NUMBER() OVER (ORDER BY (ve.vector_data <=> p_query_embedding) ASC)::INT AS r_rank_order
        FROM vector_embedding ve
        JOIN research_paper rp ON rp.paper_id = ve.paper_id
        WHERE (1 - (ve.vector_data <=> p_query_embedding)) >= p_match_threshold
        ORDER BY ve.vector_data <=> p_query_embedding ASC
        LIMIT p_match_count
    ),
    do_insert AS (
        INSERT INTO query_retrieval (query_id, paper_id, similarity_score, rank_order)
        SELECT v_query_id, rm.r_paper_id, rm.r_similarity_score, rm.r_rank_order
        FROM ranked_matches rm
    )
    SELECT 
        v_query_id,
        rm.r_paper_id,
        rm.r_title,
        rm.r_abstract,
        rm.r_authors,
        rm.r_category,
        rm.r_similarity_score,
        rm.r_rank_order
    FROM ranked_matches rm;
END;
$$;
