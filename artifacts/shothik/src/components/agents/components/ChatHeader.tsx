import React, { useState, useEffect } from "react";
import { Bot, Menu, X, Sun, Moon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatHeaderProps {
  currentPersona?: string;
  onSelectPersona?: (persona: string) => void;
  executionMode?: "realtime" | "colibri_async" | "airllm_frontier" | "deepthink_async";
  activeTab?: string | null;
  onTabChange?: (tab: string) => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export function ChatHeader({
  currentPersona = "general",
  executionMode = "realtime",
  activeTab,
  onTabChange,
  onToggleSidebar,
  sidebarOpen = false,
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
    <div className="flex h-12 w-full items-center justify-between border-b border-border/60 bg-background/95 px-3 backdrop-blur-xl select-none z-20 shrink-0">
      
      {/* Left: Hamburger + Logo */}
      <div className="flex items-center gap-2.5">
        {/* Hamburger — opens/closes sidebar */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        )}

        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-emerald-500 text-white shadow-sm">
          <Bot className="h-3.5 w-3.5" />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight text-foreground leading-tight">Shothik</h2>
        </div>
      </div>

      {/* Right: Theme Toggle + Status indicator */}
      <div className="flex items-center gap-2">
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

        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
          <Sparkles className="h-2.5 w-2.5 text-indigo-400" />
          Polsia AI Cofounder
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Online
        </span>
      </div>
    </div>
  );
}
