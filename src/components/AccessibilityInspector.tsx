/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layers, Search, Eye, Sparkles } from 'lucide-react';
import { AccessibilityNode } from '../core/schemas';

interface AccessibilityInspectorProps {
  rawTree: AccessibilityNode;
  prunedNodes: AccessibilityNode[];
  activeTargetNodeId?: string;
  onSelectNode: (nodeId: string) => void;
}

export const AccessibilityInspector: React.FC<AccessibilityInspectorProps> = ({
  rawTree,
  prunedNodes,
  activeTargetNodeId,
  onSelectNode,
}) => {
  const [viewMode, setViewMode] = useState<'pruned' | 'raw'>('pruned');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredPruned = prunedNodes.filter(
    (n) =>
      n.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      n.text.toLowerCase().includes(searchFilter.toLowerCase()) ||
      n.description.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden">
      {/* Inspector Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Layer 4: Accessibility Hierarchy Bridge
          </h3>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => setViewMode('pruned')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'pruned'
                ? 'bg-indigo-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-indigo-200" />
            <span>Pruned ({prunedNodes.length} nodes · -85% tokens)</span>
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'raw'
                ? 'bg-indigo-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw Hierarchy
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/50 flex items-center gap-2">
        <Search className="w-3.5 h-3.5 text-slate-500" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter nodes by ID, text, or content-description..."
          className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-600 focus:outline-none font-mono"
        />
      </div>

      {/* Node Viewport */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2.5 font-mono text-xs">
        {viewMode === 'pruned' ? (
          filteredPruned.map((node) => {
            const isTarget = activeTargetNodeId && node.id === activeTargetNodeId;
            return (
              <div
                key={node.id}
                onClick={() => onSelectNode(node.id)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isTarget
                    ? 'bg-indigo-950/70 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-indigo-300 truncate max-w-[280px]">{node.id}</span>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    {node.clickable && <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">CLICK</span>}
                    {node.editable && <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">EDIT</span>}
                    {node.focused && <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400">FOCUS</span>}
                  </div>
                </div>
                {node.text && (
                  <div className="text-slate-300 text-[11px]">
                    <span className="text-slate-500">text:</span> "{node.text}"
                  </div>
                )}
                {node.description && (
                  <div className="text-slate-400 text-[11px]">
                    <span className="text-slate-500">desc:</span> "{node.description}"
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <pre className="text-[11px] text-slate-300 whitespace-pre-wrap">
            {JSON.stringify(rawTree, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};
