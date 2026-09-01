import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Wand2,
  Languages,
  Scissors,
  GitBranch,
  Check,
  X,
  ArrowRight,
  Loader2,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FloatingSelectionToolbarProps {
  containerRef: React.RefObject<HTMLElement | null>;
  onTransform: (action: "polish" | "bangla_harmony" | "forecast" | "shorten" | "custom", selectedText: string, customPrompt?: string) => Promise<string | void> | void;
  isTransforming?: boolean;
}

export function FloatingSelectionToolbar({
  containerRef,
  onTransform,
  isTransforming = false,
}: FloatingSelectionToolbarProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        if (!showCustomInput) {
          setPosition(null);
          setSelectedText("");
        }
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 3) {
        setPosition(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();

      if (containerRect) {
        // Position relative to container or viewport
        const top = rect.top - 54;
        const left = Math.max(16, Math.min(window.innerWidth - 360, rect.left + rect.width / 2 - 160));
        
        setSelectedText(text);
        setPosition({ top, left });
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [containerRef, showCustomInput]);

  if (!position || (!selectedText && !showCustomInput)) {
    return null;
  }

  const handleAction = async (action: "polish" | "bangla_harmony" | "forecast" | "shorten" | "custom") => {
    if (action === "custom" && !showCustomInput) {
      setShowCustomInput(true);
      return;
    }

    try {
      await onTransform(action, selectedText, customPrompt);
    } finally {
      if (action !== "custom") {
        setPosition(null);
        setShowCustomInput(false);
        setCustomPrompt("");
      }
    }
  };

  const isBengali = /[\u0980-\u09FF]/.test(selectedText);

  return (
    <div
      ref={toolbarRef}
      style={{
        position: "fixed",
        top: `${Math.max(12, position.top)}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }}
      className="animate-in fade-in zoom-in-95 duration-150 select-none shadow-2xl rounded-2xl bg-zinc-950/95 dark:bg-black/95 text-white border border-white/15 backdrop-blur-2xl p-1.5 flex items-center gap-1 min-w-[320px]"
    >
      {isTransforming ? (
        <div className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs text-cyan-300 w-full">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          <span className="font-mono font-medium">AI transforming selection...</span>
        </div>
      ) : showCustomInput ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (customPrompt.trim()) {
              handleAction("custom");
            }
          }}
          className="flex items-center gap-1.5 w-full px-1"
        >
          <input
            type="text"
            autoFocus
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder={isBengali ? "কী পরিবর্তন করতে চান লিখুন..." : "Instruct AI (e.g., 'Make it dramatic')..."}
            className="flex-1 bg-white/10 text-xs px-2.5 py-1.5 rounded-lg border border-white/20 text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-sans"
          />
          <button
            type="submit"
            disabled={!customPrompt.trim()}
            className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black transition cursor-pointer disabled:opacity-40"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCustomInput(false);
              setCustomPrompt("");
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <>
          {/* Action 1: Polish */}
          <button
            type="button"
            onClick={() => handleAction("polish")}
            title="Refine phrasing, tone, and clarity"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/15 transition cursor-pointer group"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Polish</span>
          </button>

          {/* Action 2: Bangla Harmony */}
          <button
            type="button"
            onClick={() => handleAction("bangla_harmony")}
            title="সাধু ও চলিত ভাষার মিশ্রণ দূর করে প্রমিত রূপান্তর"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-emerald-300 hover:text-white hover:bg-emerald-500/20 transition cursor-pointer group"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>{isBengali ? "শুদ্ধকরণ" : "Bangla"}</span>
          </button>

          {/* Action 3: Forecast Beat */}
          <button
            type="button"
            onClick={() => handleAction("forecast")}
            title="Generate InkOS 3-scenario branch based on this text"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-purple-300 hover:text-white hover:bg-purple-500/20 transition cursor-pointer group"
          >
            <GitBranch className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>Forecast</span>
          </button>

          {/* Action 4: Shorten */}
          <button
            type="button"
            onClick={() => handleAction("shorten")}
            title="Trim words and eliminate fluff"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-amber-300 hover:text-white hover:bg-amber-500/20 transition cursor-pointer group"
          >
            <Scissors className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Concise</span>
          </button>

          <div className="w-px h-4 bg-white/20 mx-0.5" />

          {/* Action 5: Custom Prompt */}
          <button
            type="button"
            onClick={() => handleAction("custom")}
            title="Ask custom instruction"
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-medium text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>
        </>
      )}
    </div>
  );
}
