import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { getTaskSummary } from '../../db.js';

export async function handleTasksSummaryReport(job) {
  // 1. Query aggregated task metrics from database
  const summary = await getTaskSummary();

  // 2. Ensure output directory exists
  const outputDir = process.env.OUTPUT_DIR || './outputs';
  fs.mkdirSync(outputDir, { recursive: true });

  const fileName = `${job.id}.pdf`;
  const filePath = path.join(outputDir, fileName);

  // 3. Render PDF document
  await new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // Title
      doc.fontSize(22).font('Helvetica-Bold').text('Task Summary Report', { align: 'center' });
      doc.moveDown(0.5);

      // Timestamp
      doc.fontSize(10).font('Helvetica-Oblique').fillColor('#555555')
         .text(`Generated At: ${summary.generated_at}`, { align: 'center' });
      doc.moveDown(1.5);

      // Divider line
      doc.strokeColor('#cccccc').lineWidth(1)
         .moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1.5);

      // Summary Metrics Header
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#111111').text('Summary Metrics:');
      doc.moveDown(0.8);

      // Metrics Content
      doc.fontSize(12).font('Helvetica').fillColor('#333333');
      doc.text(`• Total Tasks: ${summary.total_tasks}`);
      doc.moveDown(0.5);
      doc.text(`• Done Tasks: ${summary.done_count}`);
      doc.moveDown(0.5);
      doc.text(`• Pending Tasks: ${summary.pending_count}`);
      doc.moveDown(0.5);
      doc.text(`• Completion Rate: ${(summary.completion_rate * 100).toFixed(0)}% (${summary.completion_rate})`);
      doc.moveDown(2);

      // Footer note
      doc.fontSize(9).font('Helvetica-Oblique').fillColor('#888888')
         .text('This automated report was generated asynchronously by Assignment 9 Report Worker.', { align: 'center' });

      doc.end();

      writeStream.on('finish', () => resolve(filePath));
      writeStream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });

  // 4. Return result object referencing the generated file and metrics (never embed file binary/base64)
  return {
    file_path: filePath,
    download_url: `/reports/download/${job.id}`,
    total_tasks: summary.total_tasks,
    done_count: summary.done_count,
    pending_count: summary.pending_count,
    completion_rate: summary.completion_rate,
    generated_at: summary.generated_at,
  };
}
