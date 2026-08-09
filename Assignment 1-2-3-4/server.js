const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openApiDocument = require('./openapi.json');
const db = require('./db');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware to handle JSON parsing errors (malformed JSON)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  next();
});

// Swagger UI Interactive Docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// Mount auth router
app.use(authRouter);

// 1. GET /
app.get('/', (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"]
  });
});

// 2. GET /health
app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

// 3. GET /tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await db.getTasks();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Database query failed" });
  }
});

// 4. GET /tasks/:id
app.get('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  
  try {
    const task = await db.getTaskById(id);
    if (!task) {
      return res.status(404).json({ error: `Task ${id} not found` });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Database query failed" });
  }
});

// 5. POST /tasks
app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  
  if (title === undefined || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: "Title is required and must be a non-empty string" });
  }
  
  try {
    const newTask = await db.createTask(title.trim());
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: "Database insertion failed" });
  }
});

// 6. PUT /tasks/:id
app.put('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  
  const { title, done } = req.body;
  const hasTitle = 'title' in req.body;
  const hasDone = 'done' in req.body;
  
  // Empty or invalid body (no fields to update)
  if (!hasTitle && !hasDone) {
    return res.status(400).json({ error: "Empty or invalid body. Please provide a 'title' or 'done' status to update" });
  }
  
  if (hasTitle && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ error: "Title must be a non-empty string" });
  }
  
  if (hasDone && typeof done !== 'boolean') {
    return res.status(400).json({ error: "Done must be a boolean value" });
  }
  
  try {
    const updatedTask = await db.updateTask(id, title ? title.trim() : undefined, done);
    if (!updatedTask) {
      return res.status(404).json({ error: `Task ${id} not found` });
    }
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: "Database update failed" });
  }
});

// 7. DELETE /tasks/:id
app.delete('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  
  try {
    const success = await db.deleteTask(id);
    if (!success) {
      return res.status(404).json({ error: `Task ${id} not found` });
    }
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Database deletion failed" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Task API listening on port ${PORT}`);
  console.log('Server running and connected to Supabase');
});
