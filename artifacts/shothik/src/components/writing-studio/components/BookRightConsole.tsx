import React from "react";
import { Terminal, Bot, Sparkles, Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface BookRightConsoleProps {
  logs: string[];
  status: string;
  customPrompt: string;
  onPromptChange: (text: string) => void;
  onRunAgent: (prompt: string) => void;
}

export function BookRightConsole({
  logs,
  status,
  customPrompt,
  onPromptChange,
  onRunAgent,
}: BookRightConsoleProps) {
  return (
    <div className="flex h-full flex-col p-3 space-y-3 bg-muted/20 border-l border-border/80">
      <div className="flex items-center justify-between border-b border-border/80 pb-2">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-foreground">
          <Terminal className="h-4 w-4 text-indigo-400" />
          <span>Sub-Agent Console</span>
        </div>
        <Badge variant="outline" className="text-[9px] font-mono border-emerald-500/30 text-emerald-400">
          Polsia Swarm Active
        </Badge>
      </div>

      {/* Execution Logs */}
      <div className="flex-1 space-y-1 overflow-y-auto rounded-xl border border-border bg-black/90 p-3 font-mono text-[10px] text-emerald-400">
        <p>[polsia-swarm] Initializing 10 Agency Swarm Personas…</p>
        <p>[github-fixer] AST symbol graph verified for 257 languages.</p>
        {logs.map((log, i) => (
          <p key={i}>{log}</p>
        ))}
      </div>

      {/* Agent Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (customPrompt.trim()) {
            onRunAgent(customPrompt.trim());
            onPromptChange("");
          }
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Instruct Sub-Agent Swarm…"
          className="w-full rounded-xl border border-border bg-muted/40 py-2 pl-3 pr-16 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Button type="submit" size="sm" className="absolute right-1 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs px-2">
          Run
        </Button>
      </form>
    </div>
  );
}
