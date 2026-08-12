import express from 'express';
import triageRouter from './routes/triage.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Mount triage router
app.use('/', triageRouter);

app.listen(PORT, () => {
  console.log(`Triage service listening on port ${PORT}`);
});
