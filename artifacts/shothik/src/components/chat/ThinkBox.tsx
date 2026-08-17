import { useState } from "react";
import { ChevronDown, Brain, Copy, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkBoxProps {
  content: string;
  thinkingEnded?: boolean;
}

export function ThinkBox({ content, thinkingEnded = true }: ThinkBoxProps) {
  const [open, setOpen] = useState(!thinkingEnded);
  const [copied, setCopied] = useState(false);

  const isBengali = /[\u0980-\u09FF]/.test(content);
  const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const estimatedSeconds = Math.max(1, Math.round(wordCount / 35));

  const title = thinkingEnded
    ? isBengali
      ? "চিন্তন ও যুক্তি বিশ্লেষণ সম্পন্ন"
      : "Reasoning Process Complete"
    : isBengali
      ? "যুক্তি বিশ্লেষণ চলছে…"
      : "Analyzing & Reasoning…";

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/25 via-indigo-900/10 to-background/50 overflow-hidden shadow-xs transition-all">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition hover:bg-indigo-500/10 cursor-pointer select-none"
      >
        <div
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-md shrink-0 transition-colors",
            thinkingEnded
              ? "bg-indigo-500/20 text-indigo-300"
              : "bg-indigo-500/30 text-indigo-200 shadow-xs shadow-indigo-500/30"
          )}
        >
          <Brain
            className={cn(
              "h-3.5 w-3.5",
              !thinkingEnded ? "animate-pulse text-indigo-300" : "text-indigo-400"
            )}
          />
        </div>

        <div className="flex flex-1 items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-indigo-200">
            {title}
          </span>
          <span className="text-[10px] font-mono text-indigo-400/60 bg-indigo-500/10 px-1.5 py-0.5 rounded">
            {thinkingEnded ? `${wordCount} words • ~${estimatedSeconds}s` : "stream"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {open && content && (
            <button
              type="button"
              onClick={handleCopy}
              title="যুক্তির বিবরণ কপি করুন"
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-indigo-300 hover:text-white hover:bg-indigo-500/30 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>কপি</span>
                </>
              )}
            </button>
          )}

          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-indigo-400/70 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-indigo-500/15 bg-black/20 px-4 py-3 animate-in fade-in duration-150">
          <p className="text-xs text-indigo-200/80 leading-relaxed whitespace-pre-wrap font-mono select-text selection:bg-indigo-500/30">
            {content}
          </p>
        </div>
      )}
    </div>
  );
}
