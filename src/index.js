import express from 'express';
import dotenv from 'dotenv';
import generateReportRouter from './routes/generateReport.js';
import statusRouter from './routes/status.js';
import downloadReportRouter from './routes/downloadReport.js';
import { startWorker } from './jobs/worker.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Mount application routes
app.use('/', generateReportRouter);
app.use('/', statusRouter);
app.use('/', downloadReportRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Server] Assignment 9 server listening on port ${PORT}`);
    startWorker();
  });
}

export default app;
