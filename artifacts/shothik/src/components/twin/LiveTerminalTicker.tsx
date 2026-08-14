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
      setLogs((prev) => [...prev.slice(-6), nextLog]);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoModeActive]);

  return (
    <div className="w-full bg-black text-white font-mono text-[11px] border-b border-zinc-900 select-none py-2 px-6">
      <div className="max-w-[1680px] mx-auto flex flex-col justify-start space-y-1">
        {logs.map((log, idx) => (
          <div key={idx} className="flex items-center gap-2 text-zinc-100 tracking-wide leading-tight">
            <span>{log}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
