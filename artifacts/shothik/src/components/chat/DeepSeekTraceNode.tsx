import React, { useState } from "react";
import { Terminal, Brain, ChevronDown, ChevronRight, Layers, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DeepSeekTraceNodeProps {
  type: "context_injection" | "skill_catalog" | "think" | "custom";
  label?: string;
  source?: string;
  durationSeconds?: number;
  content?: string;
  className?: string;
}

export function DeepSeekTraceNode({
  type,
  label,
  source = "@deepseek-ai/dsh-system-prompt",
  durationSeconds = 23,
  content,
  className,
}: DeepSeekTraceNodeProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (type === "context_injection") {
    return (
      <div className={cn("flex items-center gap-2 py-1 text-xs text-zinc-400 font-mono select-none", className)}>
        <Layers className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        <span>Context injection</span>
        <span className="text-zinc-500">·</span>
        <span className="text-zinc-300 bg-zinc-800/60 px-1.5 py-0.5 rounded text-[11px] border border-zinc-700/40">
          {source}
        </span>
      </div>
    );
  }

  if (type === "skill_catalog") {
    return (
      <div className={cn("flex items-center gap-2 py-1 text-xs text-zinc-400 font-mono select-none", className)}>
        <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Context injection</span>
        <span className="text-zinc-500">·</span>
        <span className="text-emerald-400/90 bg-emerald-950/40 px-1.5 py-0.5 rounded text-[11px] border border-emerald-800/40 font-semibold">
          skill-catalog (vibemaster/shaping/coding/dig)
        </span>
      </div>
    );
  }

  // Think Node (Worked for Xs >)
  return (
    <div className={cn("my-2 select-none", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs transition-all duration-150 cursor-pointer",
          "bg-zinc-900/60 hover:bg-zinc-800/70 border border-zinc-800/80 text-zinc-300 hover:text-zinc-100",
          isOpen && "bg-zinc-800/90 border-zinc-700 text-zinc-100"
        )}
      >
        <Brain className="w-3.5 h-3.5 text-indigo-400 shrink-0 animate-pulse" />
        <span className="font-medium">{label || `Worked for ${durationSeconds}s`}</span>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        )}
      </button>

      {isOpen && content && (
        <div className="mt-2 pl-4 pr-3 py-2.5 rounded-lg bg-zinc-950/80 border-l-2 border-indigo-500 text-xs font-sans text-zinc-300 leading-relaxed max-w-3xl whitespace-pre-wrap animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-indigo-400 mb-1">
            <Sparkles className="w-3 h-3" />
            Reasoning Chain & Evidence
          </div>
          {content}
        </div>
      )}
    </div>
  );
}
