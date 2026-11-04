import test from 'node:test';
import assert from 'node:assert/strict';
import { query } from '../src/lib/db';

test('PostgreSQL Relational Schema & Constraints Tests', async (t) => {
  await t.test('All five core tables and audit log exist in database', async () => {
    const res = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('users', 'research_paper', 'vector_embedding', 'search_query', 'query_retrieval', 'paper_audit_log')
      ORDER BY table_name;
    `);

    const tableNames = res.rows.map((r) => r.table_name);
    assert.deepStrictEqual(tableNames, [
      'paper_audit_log',
      'query_retrieval',
      'research_paper',
      'search_query',
      'users',
      'vector_embedding',
    ]);
  });

  await t.test('pgvector extension is active with 384 dimensions', async () => {
    const res = await query(`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname = 'vector';
    `);
    assert.strictEqual(res.rowCount, 1, 'pgvector extension must be installed');

    const colRes = await query(`
      SELECT udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'vector_embedding' AND column_name = 'vector_data';
    `);
    assert.strictEqual(colRes.rows[0].udt_name, 'vector');
  });

  await t.test('CHECK constraint: abstract minimum length >= 20 characters', async () => {
    await assert.rejects(
      async () => {
        await query(`
          INSERT INTO research_paper (title, abstract, user_id)
          VALUES ('Too short', 'Short abstract', 1);
        `);
      },
      (err: any) => {
        return err.code === '23514'; // check_violation
      },
      'Inserting abstract shorter than 20 characters must trigger check_violation'
    );
  });

  await t.test('CHECK constraint: role must be ADMIN or STUDENT', async () => {
    await assert.rejects(
      async () => {
        await query(`
          INSERT INTO users (email, password_hash, full_name, role)
          VALUES ('invalid_role@test.edu', 'hash', 'Invalid Role User', 'HACKER');
        `);
      },
      (err: any) => {
        return err.code === '23514'; // check_violation
      },
      'Invalid role must trigger check_violation'
    );
  });

  await t.test('UNIQUE constraint: duplicate user emails are rejected', async () => {
    await assert.rejects(
      async () => {
        await query(`
          INSERT INTO users (email, password_hash, full_name, role)
          VALUES ('admin@campus.edu', 'hash', 'Duplicate Admin', 'ADMIN');
        `);
      },
      (err: any) => {
        return err.code === '23505'; // unique_violation
      },
      'Duplicate email must trigger unique_violation'
    );
  });

  await t.test('HNSW and GIN indexes exist on vector and fulltext columns', async () => {
    const res = await query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename IN ('vector_embedding', 'research_paper')
        AND indexname IN ('idx_vector_embedding_hnsw', 'idx_paper_fulltext');
    `);

    assert.strictEqual(res.rowCount, 2, 'Both HNSW and GIN indexes must exist');
    const hnswIndex = res.rows.find((r) => r.indexname === 'idx_vector_embedding_hnsw');
    assert.ok(hnswIndex.indexdef.includes('hnsw'), 'Must use HNSW index method');
    assert.ok(hnswIndex.indexdef.includes('vector_cosine_ops'), 'Must use cosine distance ops');
  });
});
