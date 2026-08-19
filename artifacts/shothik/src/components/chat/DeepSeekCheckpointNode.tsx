import React, { useState } from "react";
import { ChevronDown, ChevronRight, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DeepSeekCheckpointNodeProps {
  content: string;
  className?: string;
  tokensSaved?: number;
  messageCount?: number;
}

export function DeepSeekCheckpointNode({
  content,
  className,
  tokensSaved = 4200,
  messageCount = 6,
}: DeepSeekCheckpointNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract clean text from inside <compacted-summary>...</compacted-summary>
  const cleanSummary = content
    .replace(/<compacted-summary>/gi, "")
    .replace(/<\/compacted-summary>/gi, "")
    .trim();

  return (
    <div className={cn("w-full my-3.5 select-none", className)}>
      {/* Collapsed Pill Row */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all duration-200 text-left",
          "bg-slate-50/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/60",
          isExpanded && "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
            Context Compacted Checkpoint
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3" />
            ~{tokensSaved.toLocaleString()} tokens saved
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            ({messageCount} turns folded)
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 shrink-0">
          <span className="text-[11px] font-medium hidden md:inline">
            {isExpanded ? "Hide Summary" : "View Checkpoint"}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Expanded Summary Drawer */}
      {isExpanded && (
        <div className="mt-2 p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 text-xs leading-relaxed shadow-lg animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Warm KV Prefix Cache Active
            </span>
            <span>&lt;compacted-summary&gt;</span>
          </div>
          <div className="prose prose-invert prose-xs max-w-none whitespace-pre-wrap font-sans text-slate-300">
            {cleanSummary}
          </div>
        </div>
      )}
    </div>
  );
}
