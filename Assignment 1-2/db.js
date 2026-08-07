const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'tasks.db');
const db = new Database(dbPath);

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER DEFAULT 0
  )
`);

// Check row count and seed if empty
const countQuery = db.prepare('SELECT COUNT(*) AS count FROM tasks').get();
if (countQuery.count === 0) {
  const insertStmt = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  
  // Seed with 3 example tasks
  const seedTasks = [
    { title: "Learn Express", done: 1 },
    { title: "Build Task API", done: 0 },
    { title: "Document with Swagger", done: 0 }
  ];
  
  const transaction = db.transaction((tasks) => {
    for (const task of tasks) {
      insertStmt.run(task.title, task.done);
    }
  });
  
  transaction(seedTasks);
}

// Helper to format rows to JSON shapes (converting 0/1 to boolean)
function formatTask(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    title: row.title,
    done: row.done === 1 // Convert 1 to true, 0 to false
  };
}

module.exports = {
  getTasks() {
    const stmt = db.prepare('SELECT * FROM tasks');
    const rows = stmt.all();
    return rows.map(formatTask);
  },

  getTaskById(id) {
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const row = stmt.get(id);
    return formatTask(row);
  },

  createTask(title) {
    const stmt = db.prepare('INSERT INTO tasks (title, done) VALUES (?, 0)');
    const result = stmt.run(title);
    return {
      id: Number(result.lastInsertRowid),
      title: title,
      done: false
    };
  },

  updateTask(id, title, done) {
    // Determine the current task
    const current = this.getTaskById(id);
    if (!current) return null;

    const newTitle = title !== undefined ? title : current.title;
    const newDone = done !== undefined ? (done ? 1 : 0) : (current.done ? 1 : 0);

    const stmt = db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?');
    stmt.run(newTitle, newDone, id);

    return {
      id: id,
      title: newTitle,
      done: newDone === 1
    };
  },

  deleteTask(id) {
    const current = this.getTaskById(id);
    if (!current) return false;

    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    stmt.run(id);
    return true;
  }
};
