import test from 'node:test';
import assert from 'node:assert/strict';
import { query } from '../src/lib/db';

test('Advanced DBMS Features Tests (Procedures, Views, Triggers, Transactions)', async (t) => {
  await t.test('Stored Procedure: match_papers returns ranked cosine similarity matches', async () => {
    // Fetch embedding of paper #1 (Attention Is All You Need)
    const vecRes = await query(`SELECT vector_data FROM vector_embedding WHERE paper_id = 1`);
    assert.strictEqual(vecRes.rowCount, 1);
    const queryVector = vecRes.rows[0].vector_data;

    // Call match_papers stored procedure
    const matchRes = await query(`
      SELECT paper_id, title, similarity_score 
      FROM match_papers($1::vector, 0.3, 3);
    `, [queryVector]);

    assert.ok(matchRes.rows.length >= 1, 'Should return matching papers');
    assert.strictEqual(matchRes.rows[0].paper_id, 1, 'Paper #1 must be ranked first with exact match');
    assert.ok(Math.abs(matchRes.rows[0].similarity_score - 1.0) < 0.001, 'Exact match similarity must be ~1.0');
  });

  await t.test('Transaction & Procedure: execute_and_log_search logs query and query_retrieval atomically', async () => {
    const testQueryText = 'neural sequence transduction and recurrent alternatives';
    const vecRes = await query(`SELECT vector_data FROM vector_embedding WHERE paper_id = 1`);
    const queryVector = vecRes.rows[0].vector_data;

    // Call transactional function
    const res = await query(`
      SELECT * FROM execute_and_log_search(2, $1, $2::vector, 3, 0.2);
    `, [testQueryText, queryVector]);

    assert.ok(res.rows.length > 0, 'Must return at least 1 match');
    const returnedQueryId = res.rows[0].retrieval_query_id;

    // Verify search_query table has this record
    const sqCheck = await query(`SELECT * FROM search_query WHERE query_id = $1`, [returnedQueryId]);
    assert.strictEqual(sqCheck.rowCount, 1);
    assert.strictEqual(sqCheck.rows[0].query_text, testQueryText);

    // Verify query_retrieval table has matching records
    const qrCheck = await query(`SELECT * FROM query_retrieval WHERE query_id = $1`, [returnedQueryId]);
    assert.strictEqual(qrCheck.rowCount, res.rows.length);
  });

  await t.test('Trigger: trg_audit_paper_changes logs UPDATE and DELETE events to paper_audit_log', async () => {
    // 1. Insert a temporary paper
    const insertRes = await query(`
      INSERT INTO research_paper (title, abstract, category, user_id)
      VALUES ('Temporary Audit Test Paper', 'This is a valid abstract for testing automated triggers and audit trails.', 'Testing', 1)
      RETURNING paper_id;
    `);
    const tempPaperId = insertRes.rows[0].paper_id;

    // 2. Update paper title -> triggers UPDATE audit
    await query(`
      UPDATE research_paper 
      SET title = 'Updated Audit Test Paper Title' 
      WHERE paper_id = $1;
    `, [tempPaperId]);

    const updateAudit = await query(`
      SELECT * FROM paper_audit_log 
      WHERE paper_id = $1 AND action_type = 'UPDATE';
    `, [tempPaperId]);
    assert.strictEqual(updateAudit.rowCount, 1, 'UPDATE action must be recorded in paper_audit_log');
    assert.strictEqual(updateAudit.rows[0].old_title, 'Temporary Audit Test Paper');
    assert.strictEqual(updateAudit.rows[0].new_title, 'Updated Audit Test Paper Title');

    // 3. Delete paper -> triggers DELETE audit
    await query(`DELETE FROM research_paper WHERE paper_id = $1`, [tempPaperId]);

    const deleteAudit = await query(`
      SELECT * FROM paper_audit_log 
      WHERE paper_id = $1 AND action_type = 'DELETE';
    `, [tempPaperId]);
    assert.strictEqual(deleteAudit.rowCount, 1, 'DELETE action must be recorded in paper_audit_log');
  });

  await t.test('Views: view_paper_analytics, view_recent_search_activity, view_category_insights execute and return aggregated metrics', async () => {
    const [paRes, saRes, ciRes] = await Promise.all([
      query(`SELECT * FROM view_paper_analytics`),
      query(`SELECT * FROM view_recent_search_activity`),
      query(`SELECT * FROM view_category_insights`),
    ]);

    assert.ok(paRes.rows.length > 0, 'view_paper_analytics must return rows');
    assert.ok('total_retrievals' in paRes.rows[0], 'Must contain aggregated total_retrievals column');
    assert.ok('avg_similarity_score' in paRes.rows[0], 'Must contain avg_similarity_score column');

    assert.ok(saRes.rows.length > 0, 'view_recent_search_activity must return rows');
    assert.ok('papers_matched' in saRes.rows[0], 'Must contain papers_matched column');

    assert.ok(ciRes.rows.length > 0, 'view_category_insights must return rows');
    assert.ok('total_papers' in ciRes.rows[0], 'Must contain total_papers column');
  });
});
