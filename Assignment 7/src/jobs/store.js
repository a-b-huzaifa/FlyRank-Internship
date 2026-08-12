import { randomUUID } from 'crypto';

const jobsStore = new Map();

export function createJob({ text, idempotency_key }) {
  const now = new Date().toISOString();
  const job = {
    id: randomUUID(),
    status: "pending",
    input: { text },
    result: null,
    error: null,
    attempts: 0,
    idempotency_key,
    created_at: now,
    updated_at: now
  };
  jobsStore.set(job.id, job);
  return job;
}

export function getJob(id) {
  return jobsStore.get(id) || null;
}

export function updateJob(id, changes) {
  const job = jobsStore.get(id);
  if (!job) return null;

  const updated = {
    ...job,
    ...changes,
    updated_at: new Date().toISOString()
  };
  jobsStore.set(id, updated);
  return updated;
}

export function findJobByIdempotencyKey(key) {
  for (const job of jobsStore.values()) {
    if (job.idempotency_key === key) {
      return job;
    }
  }
  return null;
}

export function listPendingJobs() {
  return Array.from(jobsStore.values()).filter(job => job.status === "pending");
}
