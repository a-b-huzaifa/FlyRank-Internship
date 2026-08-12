import express from 'express';
import { z } from 'zod';
import { computeIdempotencyKey } from '../jobs/idempotency.js';
import { createJob, findJobByIdempotencyKey } from '../jobs/store.js';

const router = express.Router();

const submitInputSchema = z.object({
  text: z.string({
    required_error: "field 'text' is required",
    invalid_type_error: "field 'text' must be a string"
  })
  .min(1, "field 'text' must not be empty")
  .max(2000, "field 'text' must not exceed 2000 characters")
});

router.post('/jobs/triage', (req, res) => {
  const result = submitInputSchema.safeParse(req.body);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const fieldName = firstIssue.path.join('.') || 'body';
    return res.status(400).json({
      error: `Invalid input on field "${fieldName}": ${firstIssue.message}`
    });
  }

  const idempotencyKey = computeIdempotencyKey(result.data.text);
  
  // Retrieve job if already exists and is in a valid (not permanently failed) state
  const existingJob = findJobByIdempotencyKey(idempotencyKey);
  if (existingJob && existingJob.status !== 'failed') {
    return res.status(202).json({
      job_id: existingJob.id,
      status: existingJob.status,
      status_url: `/jobs/${existingJob.id}`
    });
  }

  // Create new job
  const newJob = createJob({
    text: result.data.text,
    idempotency_key: idempotencyKey
  });

  return res.status(202).json({
    job_id: newJob.id,
    status: newJob.status,
    status_url: `/jobs/${newJob.id}`
  });
});

export default router;
