import { Router } from 'express';
import { createJob, findJobByIdempotencyKey } from '../jobs/store.js';
import { computeIdempotencyKey } from '../jobs/idempotency.js';

const router = Router();

router.post('/reports/tasks-summary', (req, res) => {
  // Use today's ISO date string (YYYY-MM-DD) for idempotency key
  const today = new Date().toISOString().slice(0, 10);
  const idempotencyKey = computeIdempotencyKey(`tasks-summary-${today}`);

  // Check for an existing non-failed job
  const existingJob = findJobByIdempotencyKey(idempotencyKey);
  if (existingJob && ['pending', 'processing', 'done'].includes(existingJob.status)) {
    return res.status(202).json({
      job_id: existingJob.id,
      status: existingJob.status,
      status_url: `/jobs/${existingJob.id}`,
    });
  }

  // Create a new background report job
  const job = createJob({
    text: 'tasks-summary',
    type: 'tasks-summary-report',
    idempotency_key: idempotencyKey,
  });

  return res.status(202).json({
    job_id: job.id,
    status: job.status,
    status_url: `/jobs/${job.id}`,
  });
});

export default router;
