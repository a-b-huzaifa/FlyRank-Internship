import OpenAI from "openai";
import { inngest } from "../client";
import { updateRun, TraceStep } from "../../execution/store";

interface WorkflowRunData {
  runId: string;
  nodes: any[];
  edges: any[];
  startNodeId: string;
}

const systemPrompt = `You are a binary classification helper. 
You must answer the user's question with EXACTLY one of the following two words: "YES" or "NO".
Do not include any explanation, punctuation, extra spaces, or other text.
Your response must consist of only the single word: "YES" or "NO".`;

export const runWorkflow = inngest.createFunction(
  { 
    id: "run-workflow", 
    name: "Run Workflow Execution",
    triggers: [{ event: "workflow/run" }]
  },
  async ({ event, step }) => {
    const { runId, nodes, edges, startNodeId } = event.data as WorkflowRunData;

    const openai = new OpenAI({
      baseURL: process.env.OPENAI_BASE_URL,
      apiKey: process.env.OPENAI_API_KEY,
    });

    let currentNodeId = startNodeId;
    let visitedCount = 0;
    const trace: TraceStep[] = [];
    let status: 'completed' | 'failed' = 'completed';
    let error: string | null = null;

    while (currentNodeId && visitedCount < 50) {
      visitedCount++;
      
      const node = nodes.find((n) => n.id === currentNodeId);
      if (!node) {
        status = 'failed';
        error = `Node ${currentNodeId} not found in the graph.`;
        break;
      }

      const prompt = node.data.prompt || '';

      // Highlight the currently-executing node BEFORE calling the LLM
      await step.run(`set-active-${currentNodeId}-${visitedCount}`, () => {
        updateRun(runId, { activeNodeId: currentNodeId, status: 'running' });
      });

      const stepResult = await step.run(
        `visit-${currentNodeId}-step-${visitedCount}`,
        async () => {
          try {
            const response = await openai.chat.completions.create({
              model: process.env.OPENAI_MODEL || 'openrouter/free',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
              ],
              temperature: 0.1,
            });

            const raw = response.choices[0]?.message?.content || '';
            const answer = raw.trim().toUpperCase();

            if (answer !== 'YES' && answer !== 'NO') {
              return {
                success: false,
                error: `Invalid response: "${raw}" (must be YES or NO)`,
              };
            }

            return {
              success: true,
              answer,
            };
          } catch (err: any) {
            return {
              success: false,
              error: err.message || 'LLM connection error',
            };
          }
        }
      ) as { success: boolean; answer?: string; error?: string };

      if (!stepResult.success) {
        status = 'failed';
        error = stepResult.error || 'LLM execution failed';
        trace.push({
          node_id: currentNodeId,
          prompt,
          answer: 'FAILED',
          timestamp: new Date().toISOString(),
        });
        // Mark the node as failed and clear active highlight
        await step.run(`fail-node-${currentNodeId}-${visitedCount}`, () => {
          updateRun(runId, { trace, status: 'failed', error, activeNodeId: null });
        });
        break;
      }

      const answer = stepResult.answer as string;
      trace.push({
        node_id: currentNodeId,
        prompt,
        answer,
        timestamp: new Date().toISOString(),
      });

      await step.run(`update-store-${currentNodeId}-${visitedCount}`, () => {
        updateRun(runId, { trace, status: 'running', activeNodeId: null });
      });

      const expectedEdgeType = answer === 'YES' ? 'yesEdge' : 'noEdge';
      const edge = edges.find(
        (e) => e.source === currentNodeId && e.type === expectedEdgeType
      );

      if (!edge) {
        break;
      }

      currentNodeId = edge.target;
    }

    if (visitedCount >= 50 && currentNodeId) {
      status = 'failed';
      error = 'Maximum traversal depth of 50 nodes exceeded. Potential loop detected.';
    }

    await step.run('finalize-run', () => {
      updateRun(runId, { status, trace, error, activeNodeId: null });
    });

    return { runId, status, visitedCount };
  }
);
