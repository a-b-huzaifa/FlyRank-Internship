import { z } from 'zod';

export const triageResponseSchema = z.object({
  category: z.enum(["billing", "bug", "feature", "account", "other"]),
  urgency: z.enum(["low", "normal", "high"]),
  suggested_team: z.enum(["support", "engineering", "billing_ops", "other"]),
  confidence: z.number().min(0.0).max(1.0),
  reason: z.string().min(1, "Reason is required")
});
