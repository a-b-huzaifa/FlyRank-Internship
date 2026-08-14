import { Router } from 'express';
import { getJob } from '../jobs/store.js';

const router = Router();

router.get('/jobs/:id', (req, res) => {
  const { id } = req.params;
  const job = getJob(id);

  if (!job) {
    return res.status(404).json({
      error: `Job ${id} not found`,
    });
  }

  return res.status(200).json(job);
});

export default router;
