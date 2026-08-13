export interface TraceStep {
  node_id: string;
  prompt: string;
  answer: string;
  timestamp: string;
}

export interface RunRecord {
  status: 'pending' | 'running' | 'completed' | 'failed';
  trace: TraceStep[];
  error?: string | null;
  activeNodeId?: string | null;
}

// Global variable to keep the Map reference during next.js hot reloads in dev mode
const globalForStore = global as unknown as { runStore: Map<string, RunRecord> };

if (!globalForStore.runStore) {
  globalForStore.runStore = new Map<string, RunRecord>();
}

export const runStore = globalForStore.runStore;

export function createRun(id: string, data: RunRecord) {
  runStore.set(id, data);
}

export function getRun(id: string): RunRecord | null {
  return runStore.get(id) || null;
}

export function updateRun(id: string, data: Partial<RunRecord>) {
  const existing = runStore.get(id);
  if (existing) {
    runStore.set(id, { ...existing, ...data });
  }
}
