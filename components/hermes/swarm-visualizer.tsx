"use client";

/**
 * Hermes Multi-Agent Swarm Visualizer UI Component
 * 
 * Renders real-time interactive multi-agent swarm node cards (Researcher, Writer,
 * Coder, Reviewer) with live WebSocket pub/sub updates and manual handoff triggers.
 */

import React, { useState, useEffect } from "react";
import { useRealtimeWorkspace } from "@/hooks/use-realtime-workspace";
import type { SwarmAgentMember, SwarmAgentRole } from "@/lib/hermes/modules/swarm-orchestrator";

export interface SwarmVisualizerProps {
  workspaceId: string;
  swarmId: string;
  runId: string;
  initialActiveRole?: SwarmAgentRole;
  onHandoffTriggered?: (fromRole: SwarmAgentRole, toRole: SwarmAgentRole) => void;
}

const AGENT_ROLES: Array<{ role: SwarmAgentRole; name: string; icon: string; description: string }> = [
  { role: "researcher", name: "Deep Research Agent", icon: "🔍", description: "Performs web search & vector RAG lookup" },
  { role: "writer", name: "Synthesis Writer Agent", icon: "✍️", description: "Generates Markdown reports & executive summaries" },
  { role: "coder", name: "Code Execution Agent", icon: "💻", description: "Runs Python & TypeScript code sandboxes" },
  { role: "reviewer", name: "QA & Verification Agent", icon: "🛡️", description: "Performs fact checking & code review" },
];

export function SwarmVisualizer({
  workspaceId,
  swarmId,
  runId,
  initialActiveRole = "researcher",
  onHandoffTriggered,
}: SwarmVisualizerProps) {
  const [activeRole, setActiveRole] = useState<SwarmAgentRole>(initialActiveRole);

  const { connectionState, lastEvent } = useRealtimeWorkspace({
    workspaceId,
  });

  useEffect(() => {
    if (lastEvent?.eventType === "handoff_requested" && lastEvent.payload?.toRole) {
      setActiveRole(lastEvent.payload.toRole as SwarmAgentRole);
    }
  }, [lastEvent]);

  const handleManualHandoff = (targetRole: SwarmAgentRole) => {
    if (targetRole === activeRole) return;
    const fromRole = activeRole;
    setActiveRole(targetRole);
    onHandoffTriggered?.(fromRole, targetRole);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-2xl">
      <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Hermes Swarm Topology</h3>
          <p className="text-xs text-slate-400">Swarm ID: {swarmId} • Run ID: {runId}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              connectionState === "connected"
                ? "bg-emerald-500 animate-pulse"
                : connectionState === "connecting"
                ? "bg-amber-500 animate-ping"
                : "bg-rose-500"
            }`}
          />
          <span className="text-xs font-medium capitalize text-slate-300">
            {connectionState}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {AGENT_ROLES.map(({ role, name, icon, description }) => {
          const isActive = activeRole === role;

          return (
            <div
              key={role}
              onClick={() => handleManualHandoff(role)}
              className={`group relative flex cursor-pointer flex-col justify-between rounded-lg border p-4 transition-all duration-200 ${
                isActive
                  ? "border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-2xl">{icon}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      isActive
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isActive ? "Active Role" : "Idle"}
                  </span>
                </div>
                <h4 className="font-medium text-slate-200 group-hover:text-white">{name}</h4>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 uppercase font-mono">{role}</span>
                <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isActive ? "Executing..." : "Handoff ➔"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
