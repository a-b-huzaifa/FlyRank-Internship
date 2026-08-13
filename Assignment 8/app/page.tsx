'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import DecisionNode from '@/components/DecisionNode';
import YesEdge from '@/components/YesEdge';
import NoEdge from '@/components/NoEdge';

interface TraceStep {
  node_id: string;
  prompt: string;
  answer: string;
  timestamp: string;
}

interface RunRecord {
  status: 'pending' | 'running' | 'completed' | 'failed';
  trace: TraceStep[];
  error?: string | null;
  activeNodeId?: string | null;
}

// Register custom node and edge types
const nodeTypes = {
  decisionNode: DecisionNode,
};

const edgeTypes = {
  yesEdge: YesEdge,
  noEdge: NoEdge,
};

const initialNodes: Node[] = [
  {
    id: 'node-1',
    type: 'decisionNode',
    position: { x: 150, y: 200 },
    data: { prompt: 'Is the incoming ticket a billing query?' },
  },
  {
    id: 'node-2',
    type: 'decisionNode',
    position: { x: 550, y: 120 },
    data: { prompt: 'Direct ticket to billing_ops team.' },
  },
  {
    id: 'node-3',
    type: 'decisionNode',
    position: { x: 550, y: 320 },
    data: { prompt: 'Direct ticket to support team.' },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e-node-1-yes-node-2',
    source: 'node-1',
    sourceHandle: 'yes',
    target: 'node-2',
    targetHandle: 'input',
    type: 'yesEdge',
  },
  {
    id: 'e-node-1-no-node-3',
    source: 'node-1',
    sourceHandle: 'no',
    target: 'node-3',
    targetHandle: 'input',
    type: 'noEdge',
  },
];

export default function FlowEditorPage() {
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<RunRecord | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePromptChange = useCallback((nodeId: string, newPrompt: string) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, prompt: newPrompt } } : n
      )
    );
  }, []);

  // Map initial nodes and bind the onPromptChange handler
  const mappedInitialNodes = useMemo(() => {
    return initialNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onPromptChange: handlePromptChange,
      },
    }));
  }, [handlePromptChange]);

  const [nodes, setNodes, onNodesChange] = useNodesState(mappedInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Polling hook to query workflow execution state
  useEffect(() => {
    if (!activeRunId || !isRunning) return;

    let intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/run-workflow?runId=${activeRunId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch status');
        }
        const data: RunRecord = await res.json();
        setRunResult(data);

        if (data.status === 'completed' || data.status === 'failed') {
          setIsRunning(false);
          clearInterval(intervalId);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        setErrorMessage(err.message || 'Error tracking execution progress');
        setIsRunning(false);
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeRunId, isRunning]);

  // ─── Derive execution state for each node ─────────────────────────
  const nodesWithExecutionState = useMemo(() => {
    return nodes.map((node) => {
      // Default: no execution state overlay
      let executionState: 'idle' | 'running' | 'yes' | 'no' | 'failed' = 'idle';
      let nodeErrorMessage: string | undefined;

      if (runResult) {
        // Is this node the one actively being processed?
        if (runResult.activeNodeId === node.id && runResult.status === 'running') {
          executionState = 'running';
        } else {
          // Check the trace for a completed step on this node
          const traceStep = runResult.trace.find((s) => s.node_id === node.id);
          if (traceStep) {
            if (traceStep.answer === 'YES') {
              executionState = 'yes';
            } else if (traceStep.answer === 'NO') {
              executionState = 'no';
            } else if (traceStep.answer === 'FAILED') {
              executionState = 'failed';
              nodeErrorMessage = runResult.error || 'Execution failed';
            }
          }
        }
      }

      return {
        ...node,
        data: {
          ...node.data,
          onPromptChange: handlePromptChange,
          executionState,
          errorMessage: nodeErrorMessage,
        },
      };
    });
  }, [nodes, runResult, handlePromptChange]);

  // Handle new edge drag connections
  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source === params.target) return; // Prevent self-connections

      const edgeType = params.sourceHandle === 'yes' ? 'yesEdge' : 'noEdge';

      setEdges((eds) => {
        // Enforce max ONE outgoing YES and max ONE outgoing NO edge per node.
        // If a duplicate is connected, we filter it out (replace it).
        const filtered = eds.filter(
          (edge) =>
            !(edge.source === params.source && edge.sourceHandle === params.sourceHandle)
        );

        const newEdge: Edge = {
          id: `e-${params.source}-${params.sourceHandle}-${params.target}`,
          source: params.source || '',
          sourceHandle: params.sourceHandle || '',
          target: params.target || '',
          targetHandle: params.targetHandle || 'input',
          type: edgeType,
          animated: true,
        };

        return addEdge(newEdge, filtered);
      });
    },
    [setEdges]
  );

  // Add a new node to the canvas
  const addNode = useCallback(() => {
    const newId = `node-${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type: 'decisionNode',
      position: {
        x: Math.random() * 150 + 200,
        y: Math.random() * 150 + 150,
      },
      data: {
        prompt: 'New question...',
        onPromptChange: handlePromptChange,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, handlePromptChange]);

  // Clear all nodes and edges from canvas
  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setRunResult(null);
    setActiveRunId(null);
    setErrorMessage(null);
    setIsRunning(false);
  }, [setNodes, setEdges]);

  // Determine starting node and trigger the workflow run
  const runWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      alert('Please add at least one decision node to run the workflow!');
      return;
    }

    setErrorMessage(null);
    setRunResult(null);
    setIsRunning(true);

    // DETERMINING START NODE:
    // We choose the node that has no incoming edges.
    // If no such node is found (e.g. in a loop) or there are multiple,
    // we fall back to the first node in our state array.
    const startNode = nodes.find(
      (node) => !edges.some((edge) => edge.target === node.id)
    );
    const startNodeId = startNode?.id || nodes[0]?.id;

    console.log(`[Workflow] Starting execution from node ID: ${startNodeId}`);

    try {
      const res = await fetch('/api/run-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes,
          edges,
          startNodeId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to trigger run');
      }

      const { runId } = await res.json();
      setActiveRunId(runId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to execute workflow');
      setIsRunning(false);
    }
  }, [nodes, edges]);

  // ─── MiniMap node color based on execution state ───────────────────
  const miniMapNodeColor = useCallback(
    (node: Node) => {
      if (!runResult) return '#e4e4e7';
      if (runResult.activeNodeId === node.id) return '#3b82f6'; // blue for running
      const step = runResult.trace.find((s) => s.node_id === node.id);
      if (step) {
        if (step.answer === 'YES') return '#22c55e';
        if (step.answer === 'NO') return '#ef4444';
        if (step.answer === 'FAILED') return '#f97316';
      }
      return '#e4e4e7';
    },
    [runResult]
  );

  return (
    <div className="w-screen h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Header bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-10 shadow-sm">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <span>FlowEditor</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
              Phase 4
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Visual AI Triage Flow Engine
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={addNode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            <span>+</span> Add Decision Node
          </button>

          <button
            onClick={runWorkflow}
            disabled={isRunning || nodes.length === 0}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 hover:opacity-90 transition-opacity cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Run Workflow'}
          </button>
          
          <button
            onClick={clearCanvas}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-sm"
          >
            Clear Canvas
          </button>
        </div>
      </header>

      {/* Main body: Canvas + execution panel */}
      <div className="flex-1 w-full flex relative overflow-hidden">
        {/* React Flow Editor */}
        <div className="flex-1 h-full relative">
          <ReactFlow
            nodes={nodesWithExecutionState}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="bg-zinc-50 dark:bg-zinc-950"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="var(--color-zinc-300, #d4d4d8)"
            />
            <Controls className="!bg-white dark:!bg-zinc-900 !border-zinc-200 dark:!border-zinc-800 !shadow-md fill-zinc-600 dark:fill-zinc-400" />
            <MiniMap
              className="!bg-white dark:!bg-zinc-900 !border-zinc-200 dark:!border-zinc-800 !shadow-md rounded-lg overflow-hidden"
              maskColor="rgba(0, 0, 0, 0.05)"
              nodeColor={miniMapNodeColor}
            />
            
            {/* Quick Help Guide Panel */}
            <Panel position="bottom-center" className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-md text-center pointer-events-none select-none">
              <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 leading-tight">
                💡 <strong>Tip:</strong> Click prompt fields to edit prompts. Drag from <strong>YES (green)</strong> or <strong>NO (red)</strong> handles to build custom rules.
              </span>
            </Panel>
          </ReactFlow>
        </div>

        {/* ─── Execution Logs Panel ──────────────────────────────────── */}
        {(runResult || errorMessage || isRunning) && (
          <div className="w-[380px] h-full border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col z-10 shadow-lg">
            {/* Panel header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex flex-col">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">Workflow Execution</h3>
                <span className="text-[10px] text-zinc-400 font-mono">ID: {activeRunId || 'Initializing...'}</span>
              </div>
              
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isRunning ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 animate-pulse' :
                runResult?.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
              }`}>
                {isRunning ? 'Running' : runResult?.status || 'Failed'}
              </span>
            </div>

            {/* Error alert banner */}
            {(runResult?.status === 'failed' || errorMessage) && (
              <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-red-500 text-sm">⚠️</span>
                  <span className="text-xs font-bold text-red-700 dark:text-red-400">
                    Workflow Execution Failed
                  </span>
                </div>
                <p className="text-[11px] text-red-600 dark:text-red-400 leading-snug">
                  {errorMessage || runResult?.error || 'An unknown error occurred during execution.'}
                </p>
              </div>
            )}

            {/* Steps list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Execution Steps Traversed
              </h4>
              
              {runResult?.trace.length === 0 && !errorMessage && (
                <div className="text-xs text-zinc-400 italic text-center py-8">
                  Evaluating start node, fetching LLM classification...
                </div>
              )}

              <ul className="space-y-3">
                {runResult?.trace.map((step, idx) => (
                  <li key={idx} className="p-3 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 rounded-lg flex flex-col gap-2 relative overflow-hidden">
                    {/* Colored left accent stripe */}
                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg ${
                      step.answer === 'YES' ? 'bg-green-500' :
                      step.answer === 'NO' ? 'bg-red-500' :
                      step.answer === 'FAILED' ? 'bg-orange-500' :
                      'bg-zinc-300'
                    }`} />

                    <div className="flex justify-between items-start gap-2 pl-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono bg-zinc-200 dark:bg-zinc-800 px-1 py-0.2 rounded text-zinc-500 dark:text-zinc-400">
                          {step.node_id}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          Step {idx + 1}
                        </span>
                      </div>
                      
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm border ${
                        step.answer === 'YES' ? 'bg-green-500 text-white border-green-600' :
                        step.answer === 'NO' ? 'bg-red-500 text-white border-red-600' :
                        step.answer === 'FAILED' ? 'bg-orange-500 text-white border-orange-600' :
                        'bg-zinc-500 text-white border-zinc-600'
                      }`}>
                        {step.answer}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium pl-2">
                      &ldquo;{step.prompt}&rdquo;
                    </p>
                    
                    <span className="text-[9px] text-zinc-400 self-end">
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Panel footer with node count summary */}
            {runResult && runResult.trace.length > 0 && (
              <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between text-[10px] text-zinc-500">
                <span>{runResult.trace.length} node{runResult.trace.length !== 1 ? 's' : ''} traversed</span>
                <span>
                  {runResult.trace.filter((s) => s.answer === 'YES').length} YES · {runResult.trace.filter((s) => s.answer === 'NO').length} NO
                  {runResult.trace.some((s) => s.answer === 'FAILED') && ` · ${runResult.trace.filter((s) => s.answer === 'FAILED').length} FAILED`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
