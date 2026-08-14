import { findNextPendingJob, updateJob, getJob } from './store.js';
import { handleTasksSummaryReport } from './handlers/tasksSummaryReport.js';

export async function processNextJob() {
  const job = findNextPendingJob();
  if (!job) return;

  // Lock status and increment attempts BEFORE starting work to prevent double processing
  const updatedAttempts = job.attempts + 1;
  updateJob(job.id, { status: "processing", attempts: updatedAttempts });
  console.log(`[Worker] Locked job ${job.id} state:`, JSON.stringify(getJob(job.id)));

  try {
    let result;
    switch (job.type) {
      case 'tasks-summary-report':
        result = await handleTasksSummaryReport(job);
        break;
      default:
        // Default to tasks-summary-report if unspecified or handle explicitly
        result = await handleTasksSummaryReport(job);
        break;
    }

    updateJob(job.id, { status: "done", result, error: null });
    console.log(`[Worker] Success job ${job.id} state:`, JSON.stringify(getJob(job.id)));
  } catch (err) {
    console.error(`[Worker] Error processing job ${job.id} (Attempt ${updatedAttempts}):`, err.message);

    if (updatedAttempts < 3) {
      // Retry: put back to pending to be picked up on a later tick
      updateJob(job.id, { status: "pending" });
      console.log(`[Worker] Reset job ${job.id} to pending:`, JSON.stringify(getJob(job.id)));
    } else {
      // Failed permanently after 3 attempts
      const errorMessage = err.message || "Execution failure";
      updateJob(job.id, { status: "failed", error: errorMessage });
      console.log(`[Worker] Job ${job.id} failed permanently:`, JSON.stringify(getJob(job.id)));

      console.log(JSON.stringify({
        level: "alert",
        message: "job failed permanently",
        job_id: job.id,
        attempts: updatedAttempts,
        error: errorMessage,
      }));
    }
  }
}

let workerStarted = false;

export function startWorker() {
  if (workerStarted) return;
  workerStarted = true;
  console.log("[Worker] Background polling loop started.");

  setInterval(async () => {
    try {
      await processNextJob();
    } catch (err) {
      console.error("[Worker] Polling tick error:", err);
    }
  }, 1000);
}
