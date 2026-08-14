import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getTaskSummary() {
  const query = `
    SELECT
      COUNT(*)::int AS total_tasks,
      COUNT(*) FILTER (WHERE done = true)::int AS done_count,
      COUNT(*) FILTER (WHERE done = false OR done IS NULL)::int AS pending_count
    FROM tasks;
  `;

  const result = await pool.query(query);
  const row = result.rows[0] || { total_tasks: 0, done_count: 0, pending_count: 0 };

  const total_tasks = Number(row.total_tasks) || 0;
  const done_count = Number(row.done_count) || 0;
  const pending_count = Number(row.pending_count) || 0;
  const completion_rate = total_tasks > 0
    ? Number((done_count / total_tasks).toFixed(2))
    : 0;

  return {
    total_tasks,
    done_count,
    pending_count,
    completion_rate,
    generated_at: new Date().toISOString(),
  };
}
