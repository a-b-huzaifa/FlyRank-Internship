# Visual AI Workflow Editor & Queue - Assignment 8

An interactive, canvas-based visual workflow editor for support triage routing rules. Users can visually map out flowchart decision paths, input questions for each node, and execute the entire workflow through a background queue driven by Inngest and OpenRouter LLM classifications.

---

## Technical Stack & Architectures

- **Core Framework**: Next.js (App Router, TypeScript)
- **Visual Editor**: React Flow (drag-and-drop nodes, custom green/red decision edges)
- **Background Orchestrator**: Inngest Serverless Steps (polls traversal sequences, follows YES/NO decisions)
- **AI Engine**: OpenRouter OpenAI SDK (forced binary classification YES/NO questions)
- **Execution Storage**: In-memory Map store holding active trace histories

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
