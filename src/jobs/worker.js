import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { findNextPendingJob, updateJob, getJob } from './store.js';
import { createChatCompletion } from '../llm/client.js';
import { parseAndValidate } from '../llm/parse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the versioned system prompt once on startup
const promptPath = path.join(__dirname, '../../prompts/triage-v1.md');
const systemPrompt = fs.readFileSync(promptPath, 'utf8');

export async function processNextJob() {
  const job = findNextPendingJob();
  if (!job) return;

  // Lock status and increment attempts BEFORE making LLM calls
  const updatedAttempts = job.attempts + 1;
  updateJob(job.id, { status: "processing", attempts: updatedAttempts });
  console.log(`[Worker] Locked job ${job.id} state:`, JSON.stringify(getJob(job.id)));

  try {
    const response = await createChatCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: job.input.text }
    ], 0.2, false);

    const rawOutput = response.choices[0].message.content;

    const parseResult = await parseAndValidate(rawOutput, systemPrompt, job.input.text);
    if (parseResult.success) {
      updateJob(job.id, { status: "done", result: parseResult.data, error: null });
      console.log(`[Worker] Success job ${job.id} state:`, JSON.stringify(getJob(job.id)));
    } else {
      throw new Error(parseResult.error || "Model output validation failed after repair retry");
    }
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
        error: errorMessage
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

// Start worker automatically upon import
startWorker();
