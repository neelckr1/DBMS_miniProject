import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const roleHeader = req?.headers?.get('x-user-role');
    if (roleHeader === 'STUDENT') {
      return NextResponse.json(
        { error: 'Forbidden: Analytics and audit logs are restricted to Administrators.' },
        { status: 403 }
      );
    }

    const [paperAnalytics, recentSearches, categoryInsights, auditLogs] = await Promise.all([
      query(`SELECT * FROM view_paper_analytics LIMIT 15`),
      query(`SELECT * FROM view_recent_search_activity LIMIT 15`),
      query(`SELECT * FROM view_category_insights`),
      query(`SELECT * FROM paper_audit_log ORDER BY changed_at DESC LIMIT 10`),
    ]);

    return NextResponse.json({
      success: true,
      paperAnalytics: paperAnalytics.rows,
      recentSearches: recentSearches.rows,
      categoryInsights: categoryInsights.rows,
      auditLogs: auditLogs.rows,
    });
  } catch (error: any) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics.' },
      { status: 500 }
    );
  }
}
