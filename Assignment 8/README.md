# Visual AI Workflow Editor & Queue - Assignment 8

An interactive, canvas-based visual workflow editor for support triage routing rules. Users can visually map out flowchart decision paths, input questions for each node, and execute the entire workflow through a background queue driven by Inngest and OpenRouter LLM classifications — with real-time visual execution state highlighting and a polished execution logs panel.

---

## Technical Stack & Architectures

- **Core Framework**: Next.js (App Router, TypeScript)
- **Visual Editor**: React Flow (drag-and-drop nodes, custom green/red decision edges)
- **Background Orchestrator**: Inngest Serverless Steps (polls traversal sequences, follows YES/NO decisions)
- **AI Engine**: OpenRouter OpenAI SDK (forced binary classification YES/NO questions)
- **Execution Storage**: In-memory Map store holding active trace histories
- **Styling**: Tailwind CSS v4 + Shadcn UI

---

## Setup & Running Guide

1. Navigate to the project directory:
   ```bash
   cd "Assignment 8"
   ```
2. Install all node modules:
   ```bash
   npm install
   ```
3. Configure your local environment file:
   - Copy `.env.local` or make sure it has the following parameters set:
     ```env
     OPENAI_BASE_URL=https://openrouter.ai/api/v1
     OPENAI_API_KEY=your-openrouter-key-here
     OPENAI_MODEL=openrouter/free
     INNGEST_EVENT_KEY=local
     INNGEST_DEV=1
     ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
5. In a separate terminal tab, boot up the local **Inngest Dev Server**:
   ```bash
   npx inngest-cli@latest dev
   ```
6. Open your browser and navigate to the canvas dashboard at `http://localhost:3000`.

---

## Workflow Features

### 1. Interactive Flow Canvas (React Flow)
- **Adding Nodes**: Click "+ Add Decision Node" to spawn a card. Double-click or click inside the card prompt to edit its classification question inline.
- **Custom YES Edge (Green)**: Drag a connection from the YES output handle. Draws a green bezier line labeled "YES".
- **Custom NO Edge (Red)**: Drag a connection from the NO output handle. Draws a red bezier line labeled "NO".
- **Output Constraints**: Each node allows at most one YES connection and one NO connection. Creating a new connection from a used handle replaces the prior connection.

### 2. Queue Traversal & LLM Classifications (Inngest)
- Click **"Run Workflow"** to initiate traversal.
- The start node is computed automatically as the node with no incoming connections (falling back to the first node if the graph has a cycle).
- The Inngest background event starts walking the nodes:
  - Queries OpenRouter at temperature `0.1` using a strict binary categorization system prompt.
  - Normalizes the answer (`"YES"` or `"NO"`). If validation fails, the traversal terminates as `failed`.
  - Walks the corresponding edge to locate the next node.
  - Traversal completes successfully when a leaf/end node is reached.
  - Max depth is capped at `50` nodes to guard against cyclical graph loops.
- The UI polls progress from the serverless store and renders a trace sidebar tracking step histories, timestamps, and classifications.

### 3. Visual Execution State (Phase 4)
- **Active Node Highlighting**: While a workflow is running, the currently-executing node pulses with a blue glow border and a pinging indicator dot, so you can watch the graph traverse in real time.
- **Result Coloring**: After each node completes:
  - **YES** → green-tinted border and background
  - **NO** → red/orange-tinted border and background
  - **FAILED** → dashed red border with a `⚠️ Error` badge displayed over the node card
- **Unvisited Nodes**: Nodes not part of the execution path remain in their default idle style.
- **MiniMap Colors**: The minimap dynamically reflects execution state — blue for running, green for YES, red for NO, orange for FAILED.

### 4. Execution Logs Panel (Phase 4)
- A slide-in side panel appears on the right when a workflow run is triggered.
- **Header**: Displays "Workflow Execution" title, the unique run ID (monospace), and a status badge (`Running` with pulse animation / `Completed` in green / `Failed` in red).
- **Error Alert Banner**: If the run fails, a prominent red alert banner with `⚠️ Workflow Execution Failed` and the error message is shown at the top of the panel.
- **Trace Steps**: Each visited node is rendered as a card with:
  - A colored left accent stripe (green/red/orange matching the answer)
  - Node ID badge, step number, and timestamp
  - The prompt text that was sent to the LLM
  - A colored answer badge (YES/NO/FAILED)
- **Summary Footer**: After execution completes, a footer bar shows the total nodes traversed and a breakdown of YES/NO/FAILED counts.

---

## Project Structure

```
Assignment 8/
├── app/
│   ├── api/
│   │   ├── inngest/route.ts          # Inngest serve handler
│   │   └── run-workflow/route.ts     # POST to trigger, GET to poll status
│   ├── globals.css                   # Tailwind + custom node-pulse animation
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Main flow editor page (client component)
├── components/
│   ├── DecisionNode.tsx              # Custom React Flow node with execution states
│   ├── YesEdge.tsx                   # Green "YES" custom edge
│   └── NoEdge.tsx                    # Red "NO" custom edge
├── lib/
│   ├── execution/
│   │   └── store.ts                  # In-memory RunRecord store (activeNodeId, trace)
│   └── inngest/
│       ├── client.ts                 # Inngest client instance
│       └── functions/
│           └── runWorkflow.ts        # Graph traversal function with LLM calls
├── .env.local                        # Environment config (not committed)
├── package.json
└── README.md
```

