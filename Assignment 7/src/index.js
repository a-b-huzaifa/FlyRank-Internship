import express from 'express';
import submitRouter from './routes/submit.js';
import statusRouter from './routes/status.js';
import { startWorker } from './jobs/worker.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Mount routers
app.use('/', submitRouter);
app.use('/', statusRouter);

app.listen(PORT, () => {
  console.log(`Job submission service listening on port ${PORT}`);
  startWorker();
});
