import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateEmbedding, formatVectorForPg } from '@/lib/embeddings';

export async function POST(req: NextRequest) {
  try {
    const { queryText, userId = 2, limit = 5, threshold = 0.1 } = await req.json();

    if (!queryText || typeof queryText !== 'string' || !queryText.trim()) {
      return NextResponse.json(
        { error: 'Valid query text is required.' },
        { status: 400 }
      );
    }

    const trimmedQuery = queryText.trim();

    // 1. Generate 384-dimensional dense vector embedding
    const embedding = await generateEmbedding(trimmedQuery);
    const vectorPg = formatVectorForPg(embedding);

    // 2. Call the transactional stored function execute_and_log_search
    // Atomically inserts search_query, computes cosine distance, and populates query_retrieval
    const result = await query(
      `SELECT * FROM execute_and_log_search($1, $2, $3::vector, $4, $5)`,
      [userId, trimmedQuery, vectorPg, limit, threshold]
    );

    return NextResponse.json({
      success: true,
      query: trimmedQuery,
      totalMatches: result.rows.length,
      results: result.rows,
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during search.' },
      { status: 500 }
    );
  }
}
