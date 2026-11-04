import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paperId = parseInt(params.id, 10);
    if (isNaN(paperId)) {
      return NextResponse.json({ error: 'Invalid paper ID.' }, { status: 400 });
    }

    const res = await query(
      `DELETE FROM research_paper WHERE paper_id = $1 RETURNING paper_id, title`,
      [paperId]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Paper not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Paper "${res.rows[0].title}" deleted successfully. Cascading deletions and audit triggers executed.`,
      paperId,
    });
  } catch (error: any) {
    console.error('Delete paper error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete paper.' },
      { status: 500 }
    );
  }
}
