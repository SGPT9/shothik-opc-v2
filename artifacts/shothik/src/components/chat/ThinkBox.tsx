import { useState, useEffect } from "react";
import { ChevronDown, Brain, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkBoxProps {
  content: string;
  thinkingEnded?: boolean;
}

export function ThinkBox({ content, thinkingEnded = true }: ThinkBoxProps) {
  const [open, setOpen] = useState(!thinkingEnded);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (thinkingEnded) {
      setOpen(false);
    }
  }, [thinkingEnded]);

  const isBengali = /[\u0980-\u09FF]/.test(content);
  const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const estimatedSeconds = Math.max(1, Math.round(wordCount / 35));

  const title = thinkingEnded
    ? isBengali
      ? `চিন্তন সম্পন্ন (${estimatedSeconds} সে)`
      : `Thought for ${estimatedSeconds}s`
    : isBengali
      ? "যুক্তি বিশ্লেষণ চলছে…"
      : "Thinking…";

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-xl border border-white/[0.08] dark:border-white/[0.08] bg-zinc-100/80 dark:bg-black/40 backdrop-blur-xl overflow-hidden shadow-xs transition-all">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition hover:bg-white/[0.04] cursor-pointer select-none"
      >
        <div
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-md shrink-0 transition-colors border",
            thinkingEnded
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs shadow-emerald-500/20"
          )}
        >
          <Brain
            className={cn(
              "h-3.5 w-3.5",
              !thinkingEnded ? "animate-pulse text-emerald-300" : "text-emerald-400"
            )}
          />
        </div>

        <div className="flex flex-1 items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {open && content && (
            <button
              type="button"
              onClick={handleCopy}
              title={isBengali ? "যুক্তির বিবরণ কপি করুন" : "Copy reasoning"}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer select-none"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">{isBengali ? "কপি হয়েছে" : "Copied"}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>{isBengali ? "কপি" : "Copy"}</span>
                </>
              )}
            </button>
          )}

          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-zinc-400 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-white/[0.08] px-4 py-3 bg-black/20 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 font-mono whitespace-pre-wrap max-h-72 overflow-y-auto custom-scrollbar">
          {content}
        </div>
      )}
    </div>
  );
}
