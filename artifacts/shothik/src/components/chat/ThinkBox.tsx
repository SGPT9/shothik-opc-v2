import { useState } from "react";
import { ChevronDown, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkBoxProps {
  content: string;
  thinkingEnded?: boolean;
}

export function ThinkBox({ content, thinkingEnded = true }: ThinkBoxProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left transition hover:bg-indigo-500/5"
      >
        <div className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full shrink-0",
          thinkingEnded ? "bg-indigo-500/20" : "bg-indigo-500/10"
        )}>
          <Brain className={cn(
            "h-3 w-3 text-indigo-400",
            !thinkingEnded && "animate-pulse"
          )} />
        </div>
        <span className="flex-1 text-xs font-semibold text-indigo-300">
          {thinkingEnded ? "Reasoning complete" : "Thinking…"}
        </span>
        <ChevronDown className={cn(
          "h-3.5 w-3.5 text-indigo-400/60 transition-transform duration-200",
          open && "rotate-180"
        )} />
      </button>

      {open && (
        <div className="border-t border-indigo-500/15 px-4 py-3">
          <p className="text-xs text-indigo-200/70 leading-relaxed whitespace-pre-wrap font-mono">
            {content}
          </p>
        </div>
      )}
    </div>
  );
}
