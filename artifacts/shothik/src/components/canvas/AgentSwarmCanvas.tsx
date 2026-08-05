

import React, { useState } from "react";

export interface SwarmNode {
  id: string;
  title: string;
  type: "research" | "repair" | "draft" | "engage" | "deploy" | "social";
  status: "idle" | "running" | "completed" | "error";
  description: string;
}

export function AgentSwarmCanvas() {
  const [nodes, setNodes] = useState<SwarmNode[]>([
    { id: "node-1", title: "1. Research Node (Crawl4AI)", type: "research", status: "completed", description: "Deep web scanning & RAG memory indexing" },
    { id: "node-2", title: "2. Self-Healing Code Fixer", type: "repair", status: "completed", description: "Stack trace diagnosis & auto-patching" },
    { id: "node-3", title: "3. Papermark Trackable Deck", type: "draft", status: "completed", description: "DocSend deck link with page view heatmaps" },
    { id: "node-4", title: "4. ChatbotX 8-Ch Responder", type: "engage", status: "running", description: "WhatsApp & Instagram AI lead responder" },
    { id: "node-5", title: "5. Coolify Web Deployer", type: "deploy", status: "completed", description: "Live site deployment with active SSL" },
    { id: "node-6", title: "6. Poltiz Growth Campaign", type: "social", status: "idle", description: "Polsia Framework 6 X & LinkedIn posts" },
  ]);

  const [godModeActive, setGodModeActive] = useState<boolean>(false);
  const [sessionInfo, setSessionInfo] = useState<string>("");

  const handleToggleGodMode = () => {
    const nextState = !godModeActive;
    setGodModeActive(nextState);
    if (nextState) {
      setSessionInfo("👑 7-Day God Mode Session ACTIVE (ID: god_session_8892). Background agent daemon running 24/7.");
    } else {
      setSessionInfo("⏸️ God Mode Session PAUSED by user.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl bg-slate-900 border border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
            <h1 className="text-xl font-bold text-white">Visual Agent Swarm Canvas & God Mode Control</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Drag, connect, and monitor multi-agent swarms in real-time. Powering 24/7 autonomous operations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleGodMode}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
              godModeActive
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                : "bg-purple-600 hover:bg-purple-500 text-white"
            }`}
          >
            {godModeActive ? "⏸️ Pause God Mode (7-Day Run)" : "👑 Start 7-Day God Mode Run"}
          </button>
        </div>
      </div>

      {sessionInfo && (
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs font-mono">
          {sessionInfo}
        </div>
      )}

      {/* Visual Swarm Node Graph Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-purple-500/50 transition-all shadow-xl"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">{node.type}</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                    node.status === "completed"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : node.status === "running"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {node.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{node.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{node.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Node ID: {node.id}</span>
              <span className="text-purple-400 cursor-pointer hover:underline">Configure ⚙️</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
