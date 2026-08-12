import { triageResponseSchema } from './schema.js';
import { client, LLM_MODEL } from './client.js';

function cleanRawText(text) {
  let cleaned = text.trim();
  
  // Remove markdown block indicators if they surround the response
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/, '');
  cleaned = cleaned.replace(/\s*```$/, '');
  cleaned = cleaned.trim();
  
  // Extract strictly between the first '{' and last '}' to strip extra text
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

  // Attempt exactly one repair call
  console.warn(`Model output validation failed (${validationError}). Attempting repair...`);
  
  const repairUserMessage = `Here is the broken output:\n${rawText}\n\nHere is the exact validation error:\n${validationError}\n\nYour previous answer was rejected for this reason. Return only corrected JSON matching the schema.`;

  try {
    const repairResponse = await client.chat.completions.create({
      model: LLM_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userText },
        { role: "assistant", content: rawText },
        { role: "user", content: repairUserMessage }
      ],
      temperature: 0.2
    });

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
