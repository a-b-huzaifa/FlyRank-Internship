import express from 'express';
import dotenv from 'dotenv';
import generateReportRouter from './routes/generateReport.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Mount report generation route
app.use('/', generateReportRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Server] Assignment 9 server listening on port ${PORT}`);
  });
}

export default app;
