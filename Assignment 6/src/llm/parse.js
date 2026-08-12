import { triageResponseSchema } from './schema.js';
import { createChatCompletion } from './client.js';

function cleanRawText(text) {
  let cleaned = text.trim();
  
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/, '');
  cleaned = cleaned.replace(/\s*```$/, '');
  cleaned = cleaned.trim();
  
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

export async function parseAndValidate(rawText, systemPrompt, userText) {
  let cleaned = cleanRawText(rawText);
  let parsed;
  let validationError = null;

  try {
    parsed = JSON.parse(cleaned);
    const result = triageResponseSchema.safeParse(parsed);
    if (result.success) {
      return { success: true, data: result.data };
    }
    validationError = result.error.issues
      .map(issue => `Field "${issue.path.join('.')}": ${issue.message}`)
      .join(', ');
  } catch (err) {
    validationError = `JSON parse error: ${err.message}`;
  }

  console.warn(`Model output validation failed (${validationError}). Attempting repair...`);
  
  const repairUserMessage = `Here is the broken output:\n${rawText}\n\nHere is the exact validation error:\n${validationError}\n\nYour previous answer was rejected for this reason. Return only corrected JSON matching the schema.`;

  try {
    const repairResponse = await createChatCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userText },
      { role: "assistant", content: rawText },
      { role: "user", content: repairUserMessage }
    ], 0.2, true);

    const repairRawText = repairResponse.choices[0].message.content;
    const repairCleaned = cleanRawText(repairRawText);
    const repairParsed = JSON.parse(repairCleaned);
    const repairResult = triageResponseSchema.safeParse(repairParsed);
    if (repairResult.success) {
      return { success: true, data: repairResult.data };
    }

    return {
      success: false,
      error: `Repair failed validation: ${repairResult.error.issues.map(issue => issue.message).join(', ')}`,
      rawFailedOutput: repairRawText
    };
  } catch (err) {
    return {
      success: false,
      error: `Repair failed: ${err.message}`,
      rawFailedOutput: rawText
    };
  }
}
