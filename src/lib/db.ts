import { Pool, QueryResult, QueryResultRow } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neelchandrakar@localhost:5432/research_paper_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SQL Query] duration=${duration}ms rows=${res.rowCount}`);
  }
  return res;
}

export async function getClient() {
  return await pool.connect();
}

export default pool;
