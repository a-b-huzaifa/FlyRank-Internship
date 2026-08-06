const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openApiDocument = require('./openapi.json');

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store initialized with 3 tasks
let tasks = [
  { id: 1, title: "Learn Express", done: true },
  { id: 2, title: "Build Task API", done: false },
  { id: 3, title: "Document with Swagger", done: false }
];
let nextId = 4;

// Middleware to handle JSON parsing errors (malformed JSON)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  next();
});

// Swagger UI Interactive Docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

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
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// 4. GET /tasks/:id
app.get('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }
  res.json(task);
});

// 5. POST /tasks
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  
  if (title === undefined || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: "Title is required and must be a non-empty string" });
  }
  
  const newTask = {
    id: nextId++,
    title: title.trim(),
    done: false
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// 6. PUT /tasks/:id
app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }
  
  const { title, done } = req.body;
  const hasTitle = 'title' in req.body;
  const hasDone = 'done' in req.body;
  
  // Empty or invalid body (no fields to update)
  if (!hasTitle && !hasDone) {
    return res.status(400).json({ error: "Empty or invalid body. Please provide a 'title' or 'done' status to update" });
  }
  
  const updates = {};
  
  if (hasTitle) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: "Title must be a non-empty string" });
    }
    updates.title = title.trim();
  }
  
  if (hasDone) {
    if (typeof done !== 'boolean') {
      return res.status(400).json({ error: "Done must be a boolean value" });
    }
    updates.done = done;
  }
  
  // Apply updates to in-memory task
  tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
  
  res.json(tasks[taskIndex]);
});

// 7. DELETE /tasks/:id
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }
  
  tasks.splice(taskIndex, 1);
  res.status(204).end();
});

// Start server
app.listen(PORT, () => {
  console.log(`Task API listening on port ${PORT}`);
});
