import express from 'express';
import { z } from 'zod';
import { triageResponseSchema } from '../llm/schema.js';

const router = express.Router();

const triageInputSchema = z.object({
  text: z.string({
    required_error: "field 'text' is required",
    invalid_type_error: "field 'text' must be a string"
  })
  .min(1, "field 'text' must not be empty")
  .max(2000, "field 'text' must not exceed 2000 characters")
});

router.post('/triage', (req, res) => {
  const result = triageInputSchema.safeParse(req.body);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const fieldName = firstIssue.path.join('.') || 'body';
    return res.status(400).json({
      error: `Invalid input on field "${fieldName}": ${firstIssue.message}`
    });
  }

  if (process.env.LLM_STUB === '1') {
    const stubData = {
      category: "billing",
      urgency: "high",
      suggested_team: "billing_ops",
      confidence: 1.0,
      reason: "This is a pre-configured stub response for billing inquiries."
    };

    const schemaCheck = triageResponseSchema.safeParse(stubData);
    if (!schemaCheck.success) {
      return res.status(500).json({
        error: "Stub response failed internal schema validation"
      });
    }

    return res.status(200).json(schemaCheck.data);
  }

  return res.status(501).json({
    error: "Not implemented yet"
  });
});

export default router;
