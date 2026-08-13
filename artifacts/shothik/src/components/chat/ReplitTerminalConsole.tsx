"use client";

import { useState } from "react";
import { Terminal, ChevronDown, CheckCircle, Play, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReplitTerminalConsoleProps {
  logs?: string[];
  isStreaming?: boolean;
  onClose?: () => void;
  className?: string;
}

export function ReplitTerminalConsole({
  logs: customLogs,
  isStreaming = false,
  onClose,
  className,
}: ReplitTerminalConsoleProps) {
  const [collapsed, setCollapsed] = useState(false);

  const defaultLogs = [
    "[py] Initializing Hermes Python Calculation Sandbox…",
    "[py] Loading workspace RAG embeddings (4 context vectors)",
    "[py] Computing 3-scenario revenue forecast (Base, Aggressive, Conservative)",
    "[py] Validating AST tree-sitter syntax for 24 sub-components…",
    "[py] Build output clean. 0 errors, 0 warnings.",
  ];

  const logs = customLogs || defaultLogs;

  return (
    <div className={cn("rounded-xl border border-slate-800 bg-slate-950 font-mono text-[11px] text-slate-300 shadow-2xl overflow-hidden shrink-0", className)}>
      {/* ── Console Header ── */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800 bg-slate-900/80 shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-bold text-slate-200">Replit Terminal Console</span>
          {isStreaming ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Running stdout
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">bash - zsh</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="p-1 text-slate-400 hover:text-white transition"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")} />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Console Log Output ── */}
      {!collapsed && (
        <div className="p-3 max-h-36 overflow-y-auto space-y-1 bg-slate-950 text-slate-300 font-mono text-[11px] leading-relaxed">
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-emerald-500 shrink-0">$</span>
              <span className={cn(log.includes("clean") || log.includes("Initializing") ? "text-emerald-400" : "text-slate-300")}>
                {log}
              </span>
            </div>
          ))}
          {isStreaming && (
            <div className="flex items-center gap-1.5 text-indigo-400 animate-pulse pt-0.5">
              <span>❯</span>
              <span className="h-3 w-1.5 bg-indigo-400" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
