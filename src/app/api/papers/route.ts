import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { generateEmbedding, formatVectorForPg } from '@/lib/embeddings';

// GET all papers with user details (Demonstrating JOIN & ORDER BY)
export async function GET() {
  try {
    const result = await query(`
      SELECT 
        rp.paper_id,
        rp.title,
        rp.abstract,
        rp.authors,
        rp.category,
        rp.publication_date,
        rp.upload_date,
        rp.updated_at,
        u.user_id,
        u.full_name AS uploaded_by,
        u.role AS uploader_role,
        (ve.embedding_id IS NOT NULL) AS has_vector
      FROM research_paper rp
      LEFT JOIN users u ON rp.user_id = u.user_id
      LEFT JOIN vector_embedding ve ON rp.paper_id = ve.paper_id
      ORDER BY rp.upload_date DESC;
    `);

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      papers: result.rows,
    });
  } catch (error: any) {
    console.error('Fetch papers error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch research papers.' },
      { status: 500 }
    );
  }
}

// POST: Add new paper with automatic vector embedding generation
// Demonstrates multi-statement ACID transaction
export async function POST(req: NextRequest) {
  const client = await getClient();
  try {
    const { title, abstract, authors, category, publicationDate, userId = 1 } = await req.json();

    if (!title || !abstract || abstract.trim().length < 20) {
      return NextResponse.json(
        { error: 'Title and an abstract of at least 20 characters are required.' },
        { status: 400 }
      );
    }

    // Begin ACID transaction
    await client.query('BEGIN');

    // 1. Insert paper record
    const insertPaperRes = await client.query(
      `INSERT INTO research_paper (title, abstract, authors, category, publication_date, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING paper_id, title, upload_date`,
      [title.trim(), abstract.trim(), authors || 'Unknown', category || 'General Computer Science', publicationDate || null, userId]
    );

    const newPaper = insertPaperRes.rows[0];

    // 2. Generate vector embedding using local transformer model
    const textToEmbed = `${title.trim()}\n${abstract.trim()}`;
    const embedding = await generateEmbedding(textToEmbed);
    const vectorPg = formatVectorForPg(embedding);

    // 3. Insert vector record into vector_embedding
    await client.query(
      `INSERT INTO vector_embedding (paper_id, model_version, vector_data)
       VALUES ($1, 'all-MiniLM-L6-v2', $2::vector)`,
      [newPaper.paper_id, vectorPg]
    );

    // Commit transaction
    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'Paper and vector embedding successfully created.',
      paper: newPaper,
    }, { status: 201 });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Create paper error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create paper and vector embedding.' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
