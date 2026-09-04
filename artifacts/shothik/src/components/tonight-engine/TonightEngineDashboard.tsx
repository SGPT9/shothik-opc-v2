

import React, { useState, useEffect } from "react";
import { getInsforgeBrowserClient } from "@/lib/insforge/client";
import { SpeculativeEngine } from "@/lib/inference/SpeculativeEngine";

export interface TonightEngineDashboardProps {
  runId?: string;
  initialPrompt?: string;
}

export type StateNode = "NODE_PLAN" | "NODE_DEEP_SCAN" | "NODE_SWARM_EXECUTE" | "NODE_VERIFY" | "NODE_SYNTHESIZE";

const GRAPH_NODES: Array<{ id: StateNode; label: string; description: string }> = [
  { id: "NODE_PLAN", label: "1. Swarm Plan", description: "Topology & step graph assignment" },
  { id: "NODE_DEEP_SCAN", label: "2. Deep Scan", description: "Web search & RAG memory vault lookup" },
  { id: "NODE_SWARM_EXECUTE", label: "3. Swarm Run", description: "Multi-persona sub-agent execution" },
  { id: "NODE_VERIFY", label: "4. Audit & Verify", description: "Consensus evaluation & fact checking" },
  { id: "NODE_SYNTHESIZE", label: "5. Synthesize", description: "Artifact compilation & vector memory index" },
];

export function TonightEngineDashboard({ runId, initialPrompt }: TonightEngineDashboardProps) {
  const [activeNode, setActiveNode] = useState<StateNode>("NODE_SWARM_EXECUTE");
  const [topology, setTopology] = useState<string>("coordinator");
  const [progressPercent, setProgressPercent] = useState<number>(65);
  const [gpuStatus, setGpuStatus] = useState<{ available: boolean; vendor?: string; device?: string; arch?: string }>({
    available: false,
    vendor: "Intel",
    device: "Intel Arc B580",
    arch: "Battlemage Xe2",
  });
  const [eventLogs, setEventLogs] = useState<string[]>([
    "🚀 Tonight Engine run initialized",
    "🧠 RAG memory vault searched (3 context chunks retrieved)",
    "🔄 Swarm topology set to 'coordinator' with 3 persona nodes",
    "⚡ Persona 'Growth Researcher' completed market analysis",
    "✍️ Persona 'Content Creator' generated campaign copy",
  ]);
  const [leadsCount, setLeadsCount] = useState<number>(4);
  const [postsCount, setPostsCount] = useState<number>(2);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Probe local WebGPU acceleration hardware
    void SpeculativeEngine.checkHardware().then((isAvailable) => {
      setGpuStatus({
        available: isAvailable,
        vendor: "Intel",
        device: "Intel Arc B580 (Xe2)",
        arch: "High-Throughput WebGPU",
      });
    });
  }, []);

  useEffect(() => {
    if (!runId) return;

    const insforge = getInsforgeBrowserClient();
    if (!insforge) return;

    let active = true;
    setIsLoading(true);

    async function fetchRunData() {
      try {
        const db = (insforge as any).database || insforge;
        const { data: runData, error: runError } = await db
          .from("hermes_runs")
          .select("*")
          .eq("id", runId)
          .single();

        if (runError) throw runError;

        if (active && runData) {
          if (runData.active_node) setActiveNode(runData.active_node as StateNode);
          if (runData.topology) setTopology(runData.topology);
          if (runData.progress_percent !== undefined) setProgressPercent(runData.progress_percent);
          if (runData.leads_count !== undefined) setLeadsCount(runData.leads_count);
          if (runData.posts_count !== undefined) setPostsCount(runData.posts_count);
        }

        const { data: eventsData, error: eventsError } = await db
          .from("hermes_events")
          .select("message")
          .eq("run_id", runId)
          .order("created_at", { ascending: true });

        if (eventsError) throw eventsError;

        if (active && eventsData) {
          setEventLogs(eventsData.map((e: any) => e.message));
        }
      } catch (err: any) {
        console.error("Failed to fetch Tonight Engine run data:", err);
        if (active) setError(err.message || "Failed to load active run details.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void fetchRunData();

    // Poll every 5 seconds to get real-time state changes on background tasks
    const interval = setInterval(fetchRunData, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [runId]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6 text-slate-100 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl">
      {error && (
        <div className="p-3 text-sm rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          ⚠️ {error}
        </div>
      )}
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">Tonight Engine Swarm Monitor</h1>
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Topology: {topology}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {initialPrompt || "Autonomous Overnight Execution & Multi-Agent Swarm Orchestration"}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Run Status</p>
            <p className="text-sm font-semibold text-emerald-400 flex items-center justify-end gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Executing ({progressPercent}%)
            </p>
          </div>
        </div>
      </div>

      {/* State Graph Node Timeline */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Open-SWE State Graph Execution</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {GRAPH_NODES.map((node) => {
            const isActive = activeNode === node.id;
            return (
              <div
                key={node.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isActive
                    ? "bg-purple-950/40 border-purple-500 text-purple-200 shadow-lg shadow-purple-950/50"
                    : "bg-slate-900/60 border-slate-800/80 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold">{node.label}</p>
                  {isActive && <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight">{node.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metrics & Hardware Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs text-slate-400">Local Acceleration</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <p className="text-sm font-bold text-white">{gpuStatus.device}</p>
          </div>
          <p className="text-[11px] text-cyan-400/80 mt-0.5">{gpuStatus.arch} Active</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs text-slate-400">Extracted B2B Leads</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{leadsCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs text-slate-400">Social Post Drafts</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{postsCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs text-slate-400">Vector RAG Context</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">3 Chunks</p>
        </div>
      </div>

      {/* Event Stream Log Timeline */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live SSE Event Stream</h2>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto space-y-1.5">
          {eventLogs.map((log, idx) => (
            <div key={idx} className="flex items-start space-x-2">
              <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
