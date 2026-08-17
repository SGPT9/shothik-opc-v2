"use client";

import React from "react";
import { Check, ChevronRight } from "lucide-react";

interface PerplexityChecklistProps {
  onSelectPrompt?: (prompt: string) => void;
}

export function PerplexityChecklist({ onSelectPrompt }: PerplexityChecklistProps) {
  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white/95 dark:bg-[#141517]/90 p-4 text-left shadow-xl backdrop-blur-md transition-colors duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/[0.06]">
        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Set up Computer</span>
        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
          <span>1/4</span>
          <div className="w-3 h-3 rounded-full border-2 border-teal-500 dark:border-teal-400 border-t-transparent animate-spin" />
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-white/[0.04] text-xs">
        <div className="flex items-center justify-between py-2.5 text-zinc-400">
          <div className="flex items-center gap-3">
            <Check className="w-4 h-4 text-teal-500 dark:text-teal-400 shrink-0" />
            <span className="line-through text-zinc-400 dark:text-zinc-500">Set up org connectors</span>
          </div>
        </div>

        <div 
          onClick={() => onSelectPrompt?.("Help me invite team members to our workspace")}
          className="flex items-center justify-between py-2.5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer group transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-zinc-400 dark:border-zinc-600 group-hover:border-zinc-600 dark:group-hover:border-zinc-400 shrink-0" />
            <span>Invite team members</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400" />
        </div>

        <div 
          onClick={() => onSelectPrompt?.("I want to add credits to my Shothik workspace")}
          className="flex items-center justify-between py-2.5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer group transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-zinc-400 dark:border-zinc-600 group-hover:border-zinc-600 dark:group-hover:border-zinc-400 shrink-0" />
            <span>Add credits</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400" />
        </div>

        <div 
          onClick={() => onSelectPrompt?.("How do I tag @Computer or @Shothik in Slack and WhatsApp?")}
          className="flex items-center justify-between py-2.5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer group transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-zinc-400 dark:border-zinc-600 group-hover:border-zinc-600 dark:group-hover:border-zinc-400 shrink-0" />
            <span>Tag @Computer in Slack</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
              {typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? "⌘K" : "Ctrl+K"}
            </span>
            <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
