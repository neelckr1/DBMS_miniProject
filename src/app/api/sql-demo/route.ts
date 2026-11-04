import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const demoKey = searchParams.get('type') || 'multi_join';

  try {
    let sql = '';
    let description = '';
    let params: any[] = [];

    switch (demoKey) {
      case 'multi_join':
        description = 'Complex 4-Table JOIN (Users -> Search_Query -> Query_Retrieval -> Research_Paper) with Aggregation and Subquery';
        sql = `
          SELECT 
            u.full_name AS researcher_name,
            u.role,
            sq.query_text,
            sq.timestamp AS query_timestamp,
            COUNT(qr.paper_id) AS papers_retrieved,
            ROUND(AVG(qr.similarity_score)::numeric, 4) AS avg_match_confidence,
            (
              SELECT rp_sub.title 
              FROM query_retrieval qr_sub
              JOIN research_paper rp_sub ON qr_sub.paper_id = rp_sub.paper_id
              WHERE qr_sub.query_id = sq.query_id
              ORDER BY qr_sub.similarity_score DESC
              LIMIT 1
            ) AS top_ranked_paper
          FROM users u
          JOIN search_query sq ON u.user_id = sq.user_id
          LEFT JOIN query_retrieval qr ON sq.query_id = qr.query_id
          GROUP BY u.user_id, u.full_name, u.role, sq.query_id, sq.query_text, sq.timestamp
          ORDER BY sq.timestamp DESC;
        `;
        break;

      case 'group_by_having':
        description = 'GROUP BY with HAVING Clause and Aggregate Functions (COUNT, AVG, MAX)';
        sql = `
          SELECT 
            rp.category,
            COUNT(DISTINCT rp.paper_id) AS total_published_papers,
            COUNT(qr.query_id) AS total_retrieval_events,
            COALESCE(ROUND(AVG(qr.similarity_score)::numeric, 4), 0.0000) AS mean_category_relevance,
            COALESCE(ROUND(MAX(qr.similarity_score)::numeric, 4), 0.0000) AS highest_recorded_similarity
          FROM research_paper rp
          LEFT JOIN query_retrieval qr ON rp.paper_id = qr.paper_id
          GROUP BY rp.category
          HAVING COUNT(DISTINCT rp.paper_id) >= 1
          ORDER BY total_retrieval_events DESC;
        `;
        break;

      case 'hybrid_search':
        description = 'PostgreSQL Full-Text Search (tsvector + GIN) vs Vector Cosine Distance (<=>)';
        sql = `
          SELECT 
            rp.paper_id,
            rp.title,
            rp.category,
            ts_rank(to_tsvector('english', rp.title || ' ' || rp.abstract), plainto_tsquery('english', 'transformers')) AS fts_rank,
            ROUND((1 - (ve.vector_data <=> (SELECT vector_data FROM vector_embedding WHERE paper_id = 1)))::numeric, 4) AS vector_similarity
          FROM research_paper rp
          JOIN vector_embedding ve ON rp.paper_id = ve.paper_id
          ORDER BY vector_similarity DESC
          LIMIT 5;
        `;
        break;

      default:
        return NextResponse.json({ error: 'Unknown demo query type.' }, { status: 400 });
    }

    const start = Date.now();
    const result = await query(sql, params);
    const executionTimeMs = Date.now() - start;

    return NextResponse.json({
      success: true,
      demoKey,
      description,
      sql: sql.trim(),
      executionTimeMs,
      rowCount: result.rowCount,
      rows: result.rows,
    });
  } catch (error: any) {
    console.error('SQL demo error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
