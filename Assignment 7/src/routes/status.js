import express from 'express';
import { getJob } from '../jobs/store.js';

const router = express.Router();

router.get('/jobs/:id', (req, res) => {
  const jobId = req.params.id;
  const job = getJob(jobId);

  if (!job) {
    return res.status(404).json({
      error: `Job ${jobId} not found`
    });
  }

  const responseObj = {
    job_id: job.id,
    status: job.status,
    attempts: job.attempts,
    created_at: job.created_at,
    updated_at: job.updated_at
  };

  // Only present result if status is "done"
  if (job.status === 'done') {
    responseObj.result = job.result;
  }

  // Only present error if status is "failed"
  if (job.status === 'failed') {
    responseObj.error = job.error;
  }

  return res.status(200).json(responseObj);
});

export default router;
