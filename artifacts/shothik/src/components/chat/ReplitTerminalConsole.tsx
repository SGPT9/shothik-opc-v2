import { useState } from "react";
import { Terminal, ChevronDown, Check, Copy, X, Wrench, AlertTriangle, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReplitTerminalConsoleProps {
  logs?: string[];
  isStreaming?: boolean;
  onClose?: () => void;
  onAutoFix?: (errorLog: string) => void;
  className?: string;
}

export function ReplitTerminalConsole({
  logs: customLogs,
  isStreaming = false,
  onClose,
  onAutoFix,
  className,
}: ReplitTerminalConsoleProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fixingLine, setFixingLine] = useState<number | null>(null);

  const defaultLogs = [
    "[agent-orchestrator] Initializing Hermes Sub-Agent Workspace…",
    "[syntax-ast] Validating manuscript structure against 3-fold schema",
    "[canon-audit] 1 minor warning: Chapter 2 character timeline discrepancy",
    "[build-engine] Compiling LaTeX & 300 DPI CMYK PDF buffers…",
    "[build-engine] 0 fatal errors. 1 auto-fixable warning resolved.",
  ];

  const logs = customLogs || defaultLogs;

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFix = (idx: number, log: string) => {
    setFixingLine(idx);
    onAutoFix?.(log);
    setTimeout(() => {
      setFixingLine(null);
    }, 1500);
  };

  return (
    <div className={cn("rounded-xl border border-slate-800 bg-slate-950 font-mono text-[11px] text-slate-300 shadow-2xl overflow-hidden shrink-0", className)}>
      {/* ── Console Header ── */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800 bg-slate-900/80 shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-bold text-slate-200">Replit Agent Cockpit</span>
          {isStreaming ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Agent Active
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">Node / Hermes / Rust</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopyLogs}
            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
            title={copied ? "Copied logs" : "Copy terminal logs"}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
            title={collapsed ? "Expand terminal" : "Collapse terminal"}
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")} />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
              title="Close terminal"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Console Log Output ── */}
      {!collapsed && (
        <div className="p-3 max-h-36 overflow-y-auto space-y-1.5 bg-slate-950 text-slate-300 font-mono text-[11px] leading-relaxed">
          {logs.map((log, i) => {
            const isWarning = log.toLowerCase().includes("warning") || log.toLowerCase().includes("discrepancy");
            const isError = log.toLowerCase().includes("error") || log.toLowerCase().includes("failed");

            return (
              <div key={i} className="flex items-center justify-between gap-2 group">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="text-emerald-500 shrink-0">$</span>
                  <span
                    className={cn(
                      "truncate",
                      isError
                        ? "text-rose-400 font-bold"
                        : isWarning
                        ? "text-amber-400"
                        : log.includes("clean") || log.includes("Initializing") || log.includes("resolved")
                        ? "text-emerald-400"
                        : "text-slate-300"
                    )}
                  >
                    {log}
                  </span>
                </div>

                {/* Replit Agent Interactive Auto-Fix Trigger */}
                {(isWarning || isError) && (
                  <button
                    type="button"
                    onClick={() => handleFix(i, log)}
                    disabled={fixingLine === i}
                    className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white border border-indigo-500/40 transition cursor-pointer disabled:opacity-50"
                  >
                    <Wrench className={cn("w-2.5 h-2.5", fixingLine === i && "animate-spin")} />
                    <span>{fixingLine === i ? "Fixing..." : "Auto-Fix"}</span>
                  </button>
                )}
              </div>
            );
          })}
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
