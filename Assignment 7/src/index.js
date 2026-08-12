import express from 'express';
import submitRouter from './routes/submit.js';
import { startWorker } from './jobs/worker.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Mount routers
app.use('/', submitRouter);

app.listen(PORT, () => {
  console.log(`Job submission service listening on port ${PORT}`);
  // Initialize background polling worker
  startWorker();
});
