require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Database initialization
const initDb = async () => {
  try {
    // 1. Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        done BOOLEAN DEFAULT false
      )
    `);

    // 2. Check if table is empty and seed if necessary
    const res = await pool.query('SELECT COUNT(*) AS count FROM tasks');
    const count = parseInt(res.rows[0].count, 10);
    
    if (count === 0) {
      const seedQuery = 'INSERT INTO tasks (title, done) VALUES ($1, $2)';
      await pool.query(seedQuery, ['Learn Express', true]);
      await pool.query(seedQuery, ['Build Task API', false]);
      await pool.query(seedQuery, ['Document with Swagger', false]);
      console.log('Database initialized and seeded with 3 example tasks.');
    } else {
      console.log('Database already initialized.');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};

initDb();

module.exports = {
  async getTasks() {
    const res = await pool.query('SELECT id, title, done FROM tasks ORDER BY id ASC');
    return res.rows;
  },

  async getTaskById(id) {
    const res = await pool.query('SELECT id, title, done FROM tasks WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async createTask(title) {
    const res = await pool.query(
      'INSERT INTO tasks (title, done) VALUES ($1, false) RETURNING id, title, done',
      [title]
    );
    return res.rows[0];
  },

  async updateTask(id, title, done) {
    const current = await this.getTaskById(id);
    if (!current) return null;

    const newTitle = title !== undefined ? title : current.title;
    const newDone = done !== undefined ? done : current.done;

    const res = await pool.query(
      'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING id, title, done',
      [newTitle, newDone, id]
    );
    return res.rows[0];
  },

  async deleteTask(id) {
    const current = await this.getTaskById(id);
    if (!current) return false;

    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    return true;
  }
};
