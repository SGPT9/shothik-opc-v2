'use client';

import React from 'react';
import { Cpu, Terminal, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DeerFlowStatusBannerProps {
  isStreaming: boolean;
  activeNode: string | null;
  activeAgent: string | null;
  activeTool: string | null;
  executionMode?: 'realtime' | 'colibri_async' | 'airllm_frontier' | 'deepthink_async';
  error?: string | null;
  className?: string;
}

export function DeerFlowStatusBanner({
  isStreaming,
  activeNode,
  activeAgent,
  activeTool,
  executionMode,
  error,
  className,
}: DeerFlowStatusBannerProps) {
  if (!isStreaming && !error && !activeNode) return null;

  return (
    <div
      className={cn(
        'flex items-center justify-between px-3 py-1.5 rounded-md text-xs border transition-all',
        error
          ? 'bg-red-500/10 border-red-500/30 text-red-300'
          : isStreaming
          ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200 shadow-sm shadow-indigo-500/10'
          : 'bg-slate-900/60 border-slate-800 text-slate-400',
        className
      )}
    >
      <div className="flex items-center space-x-2">
        {isStreaming ? (
          <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
        ) : error ? (
          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        )}

        <div className="flex items-center space-x-1.5 font-mono">
          <span className="font-semibold text-slate-200">DeerFlow:</span>
          {activeAgent && (
            <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded text-[11px]">
              {activeAgent}
            </span>
          )}
          {activeNode && <span className="text-slate-400">({activeNode})</span>}
          {activeTool && (
            <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[11px] flex items-center space-x-1">
              <Terminal className="w-3 h-3 inline" />
              <span>{activeTool}</span>
            </span>
          )}
          {(executionMode === 'deepthink_async' || executionMode === 'colibri_async') && (
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded text-[10px] flex items-center space-x-1 font-sans">
              <Cpu className="w-3 h-3 inline text-purple-400" />
              <span>Colibri MoE</span>
            </span>
          )}
          {executionMode === 'airllm_frontier' && (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[10px] flex items-center space-x-1 font-sans">
              <Sparkles className="w-3 h-3 inline text-emerald-400" />
              <span>AirLLM Kimi 2.8T</span>
            </span>
          )}
        </div>
      </div>

      {isStreaming && (
        <span className="text-[10px] text-indigo-400 font-sans tracking-wide uppercase font-semibold animate-pulse">
          Streaming Active
        </span>
      )}
    </div>
  );
}
