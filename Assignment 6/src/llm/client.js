import OpenAI from "openai";

// Set client timeout to 30s and explicitly disable built-in SDK retries
export const client = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,
  apiKey: process.env.LLM_API_KEY,
  timeout: 30000,
  maxRetries: 0
});

export const LLM_MODEL = process.env.LLM_MODEL;

// Custom request-retry wrapper with exponential backoff, jitter, and cost logging
export async function createChatCompletion(messages, temperature = 0.2, wasRepair = false) {
  let attempt = 0;
  const maxRetries = 2; // Cap retries at 2 attempts maximum (3 attempts total)

  while (true) {
    const startTime = Date.now();
    try {
      const response = await client.chat.completions.create({
        model: LLM_MODEL,
        messages,
        temperature
      });

      const durationMs = Date.now() - startTime;
      const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0 };
      
      // Cost logging output to stdout
      console.log(JSON.stringify({
        prompt_version: "triage-v1",
        model: LLM_MODEL,
        input_tokens: usage.prompt_tokens,
        output_tokens: usage.completion_tokens,
        duration_ms: durationMs,
        was_repair: wasRepair
      }));

      return response;
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const statusCode = err.status || err.statusCode;
      const isTimeout = err.name === 'APIConnectionTimeoutError' || err.message?.toLowerCase().includes('timeout');
      
      // Retry ONLY on request timeout, HTTP 429, and HTTP 5xx responses
      const isRetryable = isTimeout || statusCode === 429 || (statusCode >= 500 && statusCode < 600);

      if (isRetryable && attempt < maxRetries) {
        attempt++;
        let waitTimeMs = Math.pow(2, attempt - 1) * 1000 + Math.random() * 300;

        // If 429 rate limit error has a Retry-After header, use it instead of backoff
        if (statusCode === 429) {
          const retryAfterHeader = err.headers?.['retry-after'] || err.response?.headers?.get?.('retry-after');
          if (retryAfterHeader) {
            const parsedSeconds = parseInt(retryAfterHeader, 10);
            if (!isNaN(parsedSeconds)) {
              waitTimeMs = parsedSeconds * 1000;
            }
          }
        }

        console.warn(`[Retry] Attempt ${attempt} of ${maxRetries} after error (Status: ${statusCode}, Timeout: ${isTimeout}). Waiting ${waitTimeMs.toFixed(0)}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTimeMs));
        continue;
      }

      throw err;
    }
  }
}
