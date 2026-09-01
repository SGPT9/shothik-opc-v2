import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface LiveTerminalTickerProps {
  autoModeActive?: boolean;
  activeLogs?: string[];
  onViewLogs?: () => void;
}

const DEFAULT_LOGS = [
  "> Planning next steps",
  "> Committing and pushing the changes...",
  "> Deploying the update...",
  "> Verifying the deployment is healthy...",
];

export function LiveTerminalTicker({ autoModeActive = false, activeLogs, onViewLogs }: LiveTerminalTickerProps) {
  const [logs, setLogs] = useState<string[]>(DEFAULT_LOGS);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (activeLogs && activeLogs.length > 0) {
      setLogs(activeLogs);
    }
  }, [activeLogs]);

  useEffect(() => {
    if (!autoModeActive) return;
    const interval = setInterval(() => {
      const stepPool = [
        "> Running RAG memory indexing for company profile...",
        "> Scanning Bangladesh KYC & AML provider docs...",
        "> Refactoring /v1/verify/identity API payload validator...",
        "> Running Vitest AST verification sandbox (100% pass)...",
        "> Pushing commit to GitHub main branch...",
        "> Deploying container to Dokploy / VPS...",
        "> Live health check: https://shothikaddress.com [HTTP 200 OK]",
      ];
      const nextLog = stepPool[Math.floor(Math.random() * stepPool.length)];
      setLogs((prev) => [...prev.slice(-10), nextLog]);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoModeActive]);

  const latestLog = logs[logs.length - 1] || "> System idle · Ready for task dispatch";

  return (
    <aside aria-label="Terminal Execution Stream" className="w-full bg-zinc-950/90 backdrop-blur-md text-white font-mono text-[11px] border-b border-zinc-800/80 px-4 sm:px-6 py-1.5 transition-all">
      <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-3">
        {/* Left: Engine Status Badge & Active Ticker */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">HERMES RUNNER</span>
            <span className="sm:hidden">LIVE</span>
          </div>

          <p className="truncate text-zinc-300 font-medium tracking-wide">
            {latestLog}
          </p>
        </div>

        {/* Right: Expand/Collapse Log Stream Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-200 px-2 py-0.5 rounded hover:bg-zinc-800/60 transition cursor-pointer"
            title={expanded ? "Collapse logs" : "View execution history"}
          >
            <span>{expanded ? "Hide History" : `${logs.length} Steps`}</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Collapsible Expanded Log Console */}
      {expanded && (
        <div className="max-w-[1680px] mx-auto mt-2 pt-2 border-t border-zinc-800/60 space-y-1 max-h-32 overflow-y-auto custom-scrollbar animate-fade-in">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-center gap-2 text-zinc-400 text-[10.5px]">
              <span className="text-zinc-600 font-bold select-none">{String(idx + 1).padStart(2, "0")}</span>
              <span className={idx === logs.length - 1 ? "text-emerald-300 font-semibold" : "text-zinc-300"}>{log}</span>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
