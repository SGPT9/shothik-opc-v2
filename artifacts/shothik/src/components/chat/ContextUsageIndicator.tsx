/**
 * Context Usage Indicator Component (Subsystem 4)
 * Displays current context usage tokens, attached files, workspace scope, and DSH SessionEventLog memory indicator.
 */

import React from 'react';
import { Database, FileText, Cpu, Brain, Layers, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ContextUsageIndicatorProps {
  tokensUsed: number;
  maxTokens?: number;
  attachedFilesCount: number;
  activeMemoryCount: number;
  workspaceName?: string;
  activeAgent?: string;
  className?: string;
}

export function ContextUsageIndicator({
  tokensUsed,
  maxTokens = 128_000,
  attachedFilesCount,
  activeMemoryCount,
  workspaceName = 'Default Workspace',
  activeAgent,
  className,
}: ContextUsageIndicatorProps) {
  const percentage = Math.min(100, Math.round((tokensUsed / maxTokens) * 100));

  const getStatusColor = () => {
    if (percentage > 85) return 'text-rose-400 bg-rose-950/40 border-rose-800/40';
    if (percentage > 60) return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
    return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
  };

  return (
    <div className={cn(
      "flex flex-wrap items-center justify-between gap-3 px-3 py-1.5 rounded-lg bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 text-xs text-neutral-400",
      className
    )}>
      {/* Active Scope & Agent */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 font-medium text-neutral-300">
          <Layers className="h-3.5 w-3.5 text-purple-400" />
          <span>{workspaceName}</span>
        </div>

        {activeAgent ? (
          <span className="px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/40 text-purple-300 font-mono text-[11px]">
            @{activeAgent}
          </span>
        ) : null}
      </div>

      {/* Stats Indicators */}
      <div className="flex items-center gap-3">
        {/* Memory Indicator */}
        <div className="flex items-center gap-1 text-neutral-400" title="Active DSH Session Memory Entries">
          <Brain className="h-3.5 w-3.5 text-cyan-400" />
          <span>{activeMemoryCount} memories</span>
        </div>

        {/* Files Attached */}
        <div className="flex items-center gap-1 text-neutral-400" title="Attached Files">
          <FileText className="h-3.5 w-3.5 text-amber-400" />
          <span>{attachedFilesCount} files</span>
        </div>

        {/* Token Budget Progress Bar */}
        <div className="flex items-center gap-2" title="Context Token Consumption">
          <Cpu className="h-3.5 w-3.5 text-neutral-400" />
          <div className="w-20 bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn("h-full transition-all duration-300", percentage > 85 ? "bg-rose-500" : percentage > 60 ? "bg-amber-500" : "bg-emerald-500")}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className={cn("font-mono text-[11px] px-1.5 py-0.5 rounded border", getStatusColor())}>
            {percentage}% ({Math.round(tokensUsed / 1000)}k / {Math.round(maxTokens / 1000)}k)
          </span>
        </div>
      </div>
    </div>
  );
}
