"use client";

/**
 * Hermes Interactive Terminal Emulator UI Component
 * 
 * Renders a dark-theme interactive shell terminal emulator with real-time log output
 * streaming, command history, and interactive prompt submission.
 */

import React, { useState, useRef, useEffect } from "react";
import { useRealtimeWorkspace } from "@/hooks/use-realtime-workspace";

export interface TerminalEmulatorProps {
  workspaceId: string;
  sessionId?: string;
  initialLogs?: string[];
  onCommandSubmit?: (command: string) => void;
  onClear?: () => void;
}

export function TerminalEmulator({
  workspaceId,
  sessionId = "trm_interactive",
  initialLogs = ["$ hermes --version\nHermes Agentic Monolith v2.5.0\nType 'help' or any command below...\n"],
  onCommandSubmit,
  onClear,
}: TerminalEmulatorProps) {
  const [logs, setLogs] = useState<string[]>(initialLogs);
  const [inputVal, setInputVal] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const { connectionState, lastEvent } = useRealtimeWorkspace({
    workspaceId,
  });

  useEffect(() => {
    if (lastEvent?.payload?.statusMessage) {
      setLogs((prev) => [...prev, `${lastEvent.payload.statusMessage}\n`]);
    }
  }, [lastEvent]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const cmd = inputVal.trim();
    setLogs((prev) => [...prev, `$ ${cmd}\n`]);
    setInputVal("");
    onCommandSubmit?.(cmd);
  };

  const handleClearTerminal = () => {
    setLogs([]);
    onClear?.();
  };

  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 font-mono text-sm shadow-2xl overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-2.5">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-rose-500/80" />
          <div className="h-3 w-3 rounded-full bg-amber-500/80" />
          <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-xs font-medium text-slate-400">
            shothik-tty — {sessionId}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-500 font-sans">
            Status: <span className="text-emerald-400 capitalize">{connectionState}</span>
          </span>
          <button
            onClick={handleClearTerminal}
            className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-slate-700 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Terminal log output */}
      <div className="h-72 overflow-y-auto p-4 text-emerald-400 space-y-1">
        {logs.map((log, idx) => (
          <pre key={idx} className="whitespace-pre-wrap leading-relaxed">
            {log}
          </pre>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Input prompt */}
      <form onSubmit={handleSubmit} className="flex items-center border-t border-slate-800 bg-slate-900/50 px-4 py-2">
        <span className="mr-2 text-emerald-500 font-bold">$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Execute shell command or send stdin input..."
          className="w-full bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none"
        />
        <button type="submit" className="hidden">Run</button>
      </form>
    </div>
  );
}
