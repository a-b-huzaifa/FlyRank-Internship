import { NextRequest } from "next/server";
import { inngest } from "@/lib/inngest/client";
import { createRun, getRun } from "@/lib/execution/store";

export async function POST(req: NextRequest) {
  try {
    const { nodes, edges, startNodeId } = await req.json();

    if (!startNodeId) {
      return Response.json(
        { error: "Start node must be specified. Please ensure you have at least one node." },
        { status: 400 }
      );
    }

    const runId = crypto.randomUUID();

    // Initialize execution run record in-memory
    createRun(runId, {
      status: 'pending',
      trace: [],
      error: null,
    });

    // Fire Inngest event
    await inngest.send({
      name: "workflow/run",
      data: {
        runId,
        nodes,
        edges,
        startNodeId,
      },
    });

    return Response.json({ runId });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Failed to initiate workflow run" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const runId = searchParams.get("runId");

  if (!runId) {
    return Response.json(
      { error: "Missing runId parameter" },
      { status: 400 }
    );
  }

  const run = getRun(runId);
  if (!run) {
    return Response.json(
      { error: "Run execution record not found" },
      { status: 404 }
    );
  }

  return Response.json(run);
}
