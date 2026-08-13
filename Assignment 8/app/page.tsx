'use client';

import React, { useCallback, useMemo } from 'react';
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
      // Random offset near center
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
  }, [setNodes, setEdges]);

  return (
    <div className="w-screen h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-10 shadow-sm">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <span>FlowEditor</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
              Phase 2
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Visual AI Triage Flow Engine
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={addNode}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            <span>+</span> Add Decision Node
          </button>
          
          <button
            onClick={clearCanvas}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-sm"
          >
            Clear Canvas
          </button>
        </div>
      </header>

      {/* React Flow Editor */}
      <div className="flex-1 w-full relative">
        <ReactFlow
          nodes={nodes}
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
            nodeColor={(node) => {
              if (node.type === 'decisionNode') return '#e4e4e7';
              return '#f4f4f5';
            }}
          />
          
          {/* Quick Help Guide Panel */}
          <Panel position="bottom-center" className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-md text-center pointer-events-none select-none">
            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 leading-tight">
              💡 <strong>Tip:</strong> Click prompt fields to edit prompts. Drag from <strong>YES (green)</strong> or <strong>NO (red)</strong> handles to build custom rules.
            </span>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
