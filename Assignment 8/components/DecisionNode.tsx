import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface DecisionNodeData {
  prompt: string;
  onPromptChange: (id: string, text: string) => void;
}

export default function DecisionNode({ id, data }: NodeProps<DecisionNodeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState(data.prompt || '');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsEditing(false);
    data.onPromptChange(id, prompt);
  };

  return (
    <div className="relative bg-white dark:bg-zinc-950 text-foreground rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-md w-[280px] p-4 font-sans hover:shadow-lg transition-shadow">
      {/* Target input handle on the left (for incoming flows) */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{
          background: 'var(--color-zinc-400, #a1a1aa)',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          left: '-5px'
        }}
      />

      <div className="flex flex-col gap-2">
        <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          AI Decision Node
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <textarea
              autoFocus
              className="w-full min-h-[60px] p-2 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onBlur={() => handleSubmit()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <button
              type="submit"
              className="self-end px-3 py-1 text-xs font-semibold bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 rounded-md hover:opacity-90 transition-opacity"
            >
              Save
            </button>
          </form>
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="text-sm text-foreground bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors break-words min-h-[50px] flex items-center justify-center text-center font-medium border border-dashed border-zinc-200 dark:border-zinc-800"
          >
            {prompt || <span className="text-zinc-400 dark:text-zinc-500 italic">Click to edit prompt...</span>}
          </div>
        )}
      </div>

      {/* YES Handle - Top Right outgoing */}
      <div className="absolute -right-[5px] top-[30%] -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
        <span className="text-[9px] font-bold text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-950/30 px-1 py-0.5 rounded border border-green-200 dark:border-green-900 mr-1.5 select-none">
          YES
        </span>
        <Handle
          type="source"
          position={Position.Right}
          id="yes"
          style={{
            background: '#22c55e',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            pointerEvents: 'auto'
          }}
        />
      </div>

      {/* NO Handle - Bottom Right outgoing */}
      <div className="absolute -right-[5px] top-[70%] -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
        <span className="text-[9px] font-bold text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-950/30 px-1 py-0.5 rounded border border-red-200 dark:border-red-900 mr-1.5 select-none">
          NO
        </span>
        <Handle
          type="source"
          position={Position.Right}
          id="no"
          style={{
            background: '#ef4444',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            pointerEvents: 'auto'
          }}
        />
      </div>
    </div>
  );
}
