import { useState, useEffect } from "react";
import { Bot, Menu, X, Sun, Moon, Sparkles, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatHeaderProps {
  currentPersona?: string;
  onSelectPersona?: (persona: string) => void;
  executionMode?: "realtime" | "colibri_async" | "airllm_frontier" | "deepthink_async";
  activeTab?: string | null;
  onTabChange?: (tab: string) => void;
  onPaywallClick?: () => void;
  onVTuberClick?: () => void;
}

export function ChatHeader({
  currentPersona = "general",
  executionMode = "realtime",
  activeTab,
  onTabChange,
  onPaywallClick,
  onVTuberClick,
}: ChatHeaderProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial dark mode status on html element
    const hasDark = document.documentElement.classList.contains("dark");
    setIsDark(hasDark);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  };

  return (
    <div className="flex h-12 w-full items-center justify-between border-b border-border/60 bg-background/95 px-4 backdrop-blur-xl select-none z-20 shrink-0">
      
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-dark text-white shadow-sm">
          <Bot className="h-3.5 w-3.5" />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight text-foreground leading-tight">Shothik AI</h2>
        </div>
      </div>

      {/* Right: Actions + Theme Toggle */}
      <div className="flex items-center gap-1.5">
        {/* 🎙️ 3D VTuber Presenter Button */}
        {onVTuberClick && (
          <button
            type="button"
            onClick={onVTuberClick}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 text-[11px] font-semibold transition"
            title="Launch 3D VTuber Avatar Presenter"
            data-testid="button-header-vtuber"
          >
            <span>🎙️</span>
            <span className="hidden md:inline">Advanced Voice</span>
          </button>
        )}

        {/* ⚡ Credit Badge */}
        {onPaywallClick && (
          <button
            type="button"
            onClick={onPaywallClick}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-brand hover:border-brand/50 font-mono text-[11px] font-semibold transition"
            title="Open Credit Top-Up Paywall Portal"
          >
            <span>⚡</span>
            <span>550</span>
          </button>
        )}

        {/* ☀️ 🌙 Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme mode"
          className="flex items-center justify-center h-8 w-8 rounded-lg border border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
          title={isDark ? "Switch to ChatGPT Crisp Light Mode" : "Switch to Perplexity Warm Dark Mode"}
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
        </button>

        {/* Clean status indicator */}
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-brand/10 border border-brand/20 px-2.5 py-1 text-[11px] font-semibold text-brand">
          <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
          <span>Online</span>
        </span>
      </div>
    </div>
  );
}
