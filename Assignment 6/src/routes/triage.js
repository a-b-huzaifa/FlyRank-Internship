import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { triageResponseSchema } from '../llm/schema.js';
import { client, LLM_MODEL } from '../llm/client.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the versioned system prompt once on startup
const promptPath = path.join(__dirname, '../../prompts/triage-v1.md');
const systemPrompt = fs.readFileSync(promptPath, 'utf8');

const triageInputSchema = z.object({
  text: z.string({
    required_error: "field 'text' is required",
    invalid_type_error: "field 'text' must be a string"
  })
  .min(1, "field 'text' must not be empty")
  .max(2000, "field 'text' must not exceed 2000 characters")
});

router.post('/triage', async (req, res) => {
  const result = triageInputSchema.safeParse(req.body);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const fieldName = firstIssue.path.join('.') || 'body';
    return res.status(400).json({
      error: `Invalid input on field "${fieldName}": ${firstIssue.message}`
    });
  }

  // LLM Stub mode branch
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

  // Real LLM mode branch (Stage 2)
  try {
    const response = await client.chat.completions.create({
      model: LLM_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: result.data.text }
      ],
      temperature: 0.2
    });

    const rawOutput = response.choices[0].message.content;
    return res.status(200).json({
      raw_model_output: rawOutput
    });
  } catch (err) {
    console.error("LLM execution error:", err);
    return res.status(500).json({
      error: `LLM request failed: ${err.message}`
    });
  }
});

export default router;
