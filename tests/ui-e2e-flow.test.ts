import test from 'node:test';
import assert from 'node:assert/strict';
import { POST as searchHandler } from '../src/app/api/search/route';
import { GET as getPapersHandler, POST as createPaperHandler } from '../src/app/api/papers/route';
import { DELETE as deletePaperHandler } from '../src/app/api/papers/[id]/route';
import { GET as getAnalyticsHandler } from '../src/app/api/analytics/route';
import { GET as getSqlDemoHandler } from '../src/app/api/sql-demo/route';
import { NextRequest } from 'next/server';

function createMockRequest(url: string, method: string, body?: any): NextRequest {
  const reqInit: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    reqInit.body = JSON.stringify(body);
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), reqInit);
}

test('UI End-to-End User Journey Tests', async (t) => {
  let createdTestPaperId: number | null = null;

  await t.test('1. Semantic Search Flow: Student executes natural language search query', async () => {
    const req = createMockRequest('http://localhost:3000/api/search', 'POST', {
      queryText: 'transformers and attention mechanisms for language modeling',
      userId: 2, // Student
      limit: 3,
      threshold: 0.1,
    });

    const res = await searchHandler(req);
    assert.strictEqual(res.status, 200, 'Search must return HTTP 200');

    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.results.length >= 1, 'Must return at least 1 match above threshold');
    
    // Check results structure matching UI expectations
    const topResult = data.results[0];
    assert.ok('paper_id' in topResult);
    assert.ok('title' in topResult);
    assert.ok('similarity_score' in topResult);
    assert.ok('rank_order' in topResult);
    assert.strictEqual(topResult.rank_order, 1, 'Top match must have rank 1');
  });

  await t.test('2. Paper Creation Flow: Admin uploads a campus academic paper with vectorization', async () => {
    const testTitle = 'Automated Vector Retrieval for Student Capstone Projects';
    const testAbstract = 'This academic thesis presents a comparative study on dense vector indexing and lexical keyword search across campus research repositories, demonstrating improved recall.';

    const req = createMockRequest('http://localhost:3000/api/papers', 'POST', {
      title: testTitle,
      abstract: testAbstract,
      authors: 'Neel Chandrakar & Nikhil Raj',
      category: 'Computer Science & Engineering',
      publicationDate: '2026-05-15',
      userId: 1, // Admin
    });

    const res = await createPaperHandler(req);
    assert.strictEqual(res.status, 201, 'Creating paper must return HTTP 201');

    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.paper.paper_id, 'Must return newly created paper_id');
    createdTestPaperId = data.paper.paper_id;
  });

  await t.test('3. Repository Browsing Flow: Verifies newly created paper appears in repository with vector active', async () => {
    const res = await getPapersHandler();
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.papers.length > 0);

    const found = data.papers.find((p: any) => p.paper_id === createdTestPaperId);
    assert.ok(found, 'Newly uploaded paper must exist in repository');
    assert.strictEqual(found.has_vector, true, 'Paper must have 384-d vector_embedding active');
  });

  await t.test('4. Institutional Analytics Flow: UI queries PostgreSQL materialized views', async () => {
    // Verify Student access is rejected with 403 Forbidden
    const studentReq = new NextRequest(new URL('http://localhost:3000/api/analytics'), {
      headers: { 'x-user-role': 'STUDENT' },
    });
    const forbiddenRes = await getAnalyticsHandler(studentReq);
    assert.strictEqual(forbiddenRes.status, 403, 'Student request to /api/analytics must return 403 Forbidden');

    // Verify Admin / default access succeeds
    const adminReq = createMockRequest('http://localhost:3000/api/analytics', 'GET');
    const res = await getAnalyticsHandler(adminReq);
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.paperAnalytics), 'paperAnalytics must be an array');
    assert.ok(Array.isArray(data.recentSearches), 'recentSearches must be an array');
    assert.ok(Array.isArray(data.categoryInsights), 'categoryInsights must be an array');
    assert.ok(Array.isArray(data.auditLogs), 'auditLogs must be an array');
  });

  await t.test('5. Paper Deletion & Trigger Audit Flow: Deletes test paper and verifies audit log', async () => {
    assert.ok(createdTestPaperId, 'Must have created paper ID');

    const req = createMockRequest(`http://localhost:3000/api/papers/${createdTestPaperId}`, 'DELETE');
    const res = await deletePaperHandler(req, { params: { id: String(createdTestPaperId) } });
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.strictEqual(data.success, true);

    // Verify audit log has recorded DELETE action
    const analyticsRes = await getAnalyticsHandler(createMockRequest('http://localhost:3000/api/analytics', 'GET'));
    const analyticsData = await analyticsRes.json();
    const deleteAudit = analyticsData.auditLogs.find(
      (log: any) => log.paper_id === createdTestPaperId && log.action_type === 'DELETE'
    );
    assert.ok(deleteAudit, 'DELETE trigger must have recorded event into paper_audit_log');
  });

  await t.test('6. SQL Demonstrator Flow: Executes all 3 faculty showcase queries', async () => {
    const queryTypes = ['multi_join', 'group_by_having', 'hybrid_search'];

    for (const type of queryTypes) {
      const req = createMockRequest(`http://localhost:3000/api/sql-demo?type=${type}`, 'GET');
      const res = await getSqlDemoHandler(req);
      assert.strictEqual(res.status, 200);

      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.demoKey, type);
      assert.ok(data.sql.length > 10, 'SQL query must be returned');
      assert.ok(typeof data.executionTimeMs === 'number', 'Execution time must be measured');
      assert.ok(Array.isArray(data.rows), 'Query result rows must be an array');
    }
  });
});
