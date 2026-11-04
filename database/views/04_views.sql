-- ==============================================================================
-- Analytical Views
-- Course: DBMS Level 3 Mini-Project
-- Demonstrates: Complex SQL Views, JOINs, GROUP BY, HAVING, Aggregate Functions
-- ==============================================================================

-- 1. Paper Retrieval Analytics View
-- Aggregates search performance and retrieval frequency for every research paper
CREATE OR REPLACE VIEW view_paper_analytics AS
SELECT 
    rp.paper_id,
    rp.title,
    rp.category,
    rp.upload_date,
    u.full_name AS uploaded_by,
    COUNT(qr.query_id) AS total_retrievals,
    COUNT(DISTINCT sq.user_id) AS unique_researchers_reached,
    COALESCE(ROUND(AVG(qr.similarity_score)::numeric, 4), 0.0000) AS avg_similarity_score,
    COALESCE(ROUND(MAX(qr.similarity_score)::numeric, 4), 0.0000) AS max_similarity_score,
    MAX(qr.retrieved_at) AS last_retrieved_at
FROM research_paper rp
LEFT JOIN users u ON rp.user_id = u.user_id
LEFT JOIN query_retrieval qr ON rp.paper_id = qr.paper_id
LEFT JOIN search_query sq ON qr.query_id = sq.query_id
GROUP BY rp.paper_id, rp.title, rp.category, rp.upload_date, u.full_name
ORDER BY total_retrievals DESC;

-- 2. Recent Search Activity View
-- Combines query logs, executing user information, and summary of retrieved papers
CREATE OR REPLACE VIEW view_recent_search_activity AS
SELECT 
    sq.query_id,
    sq.query_text,
    sq.timestamp AS query_time,
    u.user_id,
    COALESCE(u.full_name, 'Anonymous') AS user_name,
    COALESCE(u.role, 'GUEST') AS user_role,
    COUNT(qr.paper_id) AS papers_matched,
    COALESCE(ROUND(AVG(qr.similarity_score)::numeric, 4), 0.0000) AS avg_similarity,
    (
        SELECT rp_top.title
        FROM query_retrieval qr_top
        JOIN research_paper rp_top ON qr_top.paper_id = rp_top.paper_id
        WHERE qr_top.query_id = sq.query_id AND qr_top.rank_order = 1
        LIMIT 1
    ) AS top_matched_paper
FROM search_query sq
LEFT JOIN users u ON sq.user_id = u.user_id
LEFT JOIN query_retrieval qr ON sq.query_id = qr.query_id
GROUP BY sq.query_id, sq.query_text, sq.timestamp, u.user_id, u.full_name, u.role
ORDER BY sq.timestamp DESC;

-- 3. Category Distribution & Performance View (Demonstrating GROUP BY & HAVING)
-- Highlights research domains with meaningful retrieval volume
CREATE OR REPLACE VIEW view_category_insights AS
SELECT 
    rp.category,
    COUNT(DISTINCT rp.paper_id) AS total_papers,
    COUNT(qr.query_id) AS total_retrievals,
    COALESCE(ROUND(AVG(qr.similarity_score)::numeric, 4), 0.0000) AS category_avg_relevance
FROM research_paper rp
LEFT JOIN query_retrieval qr ON rp.paper_id = qr.paper_id
GROUP BY rp.category
HAVING COUNT(DISTINCT rp.paper_id) > 0
ORDER BY total_retrievals DESC, total_papers DESC;
