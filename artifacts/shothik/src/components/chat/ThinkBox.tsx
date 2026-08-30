import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Brain, Copy, Check, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkBoxProps {
  content: string;
  thinkingEnded?: boolean;
  modelName?: string;
}

export function ThinkBox({ content, thinkingEnded = true, modelName = "DeepSeek R1" }: ThinkBoxProps) {
  const [open, setOpen] = useState(!thinkingEnded);
  const [copied, setCopied] = useState(false);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live timer while reasoning is underway
  useEffect(() => {
    if (thinkingEnded) {
      setOpen(false);
      return;
    }

    setOpen(true);
    const start = Date.now();
    const interval = setInterval(() => {
      setLiveSeconds(Math.max(1, Math.round((Date.now() - start) / 1000)));
    }, 200);

    return () => clearInterval(interval);
  }, [thinkingEnded]);

  // Auto-scroll thought trace while streaming
  useEffect(() => {
    if (!thinkingEnded && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content, thinkingEnded]);

  const isBengali = /[\u0980-\u09FF]/.test(content);
  const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const estimatedSeconds = Math.max(1, liveSeconds || Math.round(wordCount / 35));
  const estimatedTokens = Math.round(wordCount * 1.33);

  const title = thinkingEnded
    ? isBengali
      ? `চিন্তন সম্পন্ন (${estimatedSeconds} সে · ${estimatedTokens} টোকেন)`
      : `Thought for ${estimatedSeconds}s (${estimatedTokens} tokens)`
    : isBengali
      ? `যুক্তি বিশ্লেষণ চলছে… (${estimatedSeconds} সে)`
      : `Reasoning (${estimatedSeconds}s · ${modelName})`;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-xl border border-border/80 bg-card/90 dark:bg-zinc-900/90 backdrop-blur-xl overflow-hidden shadow-xs transition-all">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition hover:bg-muted/40 cursor-pointer select-none"
      >
        <div
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-md shrink-0 transition-colors border",
            thinkingEnded
              ? "bg-muted text-foreground border-border/80"
              : "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-2xs"
          )}
        >
          <Brain
            className={cn(
              "h-3.5 w-3.5",
              !thinkingEnded ? "animate-pulse" : ""
            )}
          />
        </div>

        <div className="flex flex-1 items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-foreground">
            {title}
          </span>
          {!thinkingEnded && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.2 rounded bg-muted text-muted-foreground">
              <Zap className="w-2.5 h-2.5" /> Streaming
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {open && content && (
            <button
              type="button"
              onClick={handleCopy}
              title={isBengali ? "যুক্তির বিবরণ কপি করুন" : "Copy reasoning trace"}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer select-none"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500">{isBengali ? "কপি হয়েছে" : "Copied"}</span>
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
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {open && (
        <div
          ref={scrollRef}
          className="border-t border-border/60 px-4 py-3 bg-muted/20 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 font-mono whitespace-pre-wrap max-h-72 overflow-y-auto custom-scrollbar"
        >
          {content}
        </div>
      )}
    </div>
  );
}

export default ThinkBox;
