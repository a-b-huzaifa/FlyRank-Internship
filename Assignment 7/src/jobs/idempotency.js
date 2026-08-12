import { createHash } from 'crypto';

export function computeIdempotencyKey(text) {
  const normalized = text.trim().toLowerCase();
  return createHash('sha256').update(normalized).digest('hex');
}
