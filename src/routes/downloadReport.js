import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { getJob } from '../jobs/store.js';

const router = Router();

router.get('/reports/download/:id', (req, res) => {
  const { id } = req.params;
  const job = getJob(id);

  // 1. Verify job exists and is finished
  if (!job || job.status !== 'done') {
    return res.status(404).json({
      error: 'Report not ready or does not exist',
    });
  }

  // 2. Resolve file path
  const outputDir = process.env.OUTPUT_DIR || './outputs';
  const filePath = job.result?.file_path || path.join(outputDir, `${id}.pdf`);

  // 3. Verify file exists on disk
  if (!fs.existsSync(filePath)) {
    return res.status(500).json({
      error: 'Report file is missing from disk storage',
    });
  }

  // 4. Send PDF file with attachment header
  const downloadFileName = `task-summary-${id}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

export default router;
