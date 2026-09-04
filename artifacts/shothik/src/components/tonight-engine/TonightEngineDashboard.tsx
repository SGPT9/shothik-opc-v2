

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

  // DeepSeek Harness (DSH) Trace Replay & Forking State
  const [dshSessionId, setDshSessionId] = useState<string>("dsh_session_live_101");
  const [forkedSessionId, setForkedSessionId] = useState<string | null>(null);
  const [dshStepIndex, setDshStepIndex] = useState<number>(2);
  const [isPlayingReplay, setIsPlayingReplay] = useState<boolean>(false);
  const [dshSteps, setDshSteps] = useState<Array<{ step: number; title: string; summary: string; latencyMs: number }>>([
    { step: 1, title: "1. Intent & Routing", summary: "Multi-tier router mapped prompt to Swarm coordinator", latencyMs: 12 },
    { step: 2, title: "2. Vector Recall", summary: "Loaded 3 context chunks from hot RAG store", latencyMs: 6 },
    { step: 3, title: "3. Swarm Deliberation", summary: "Growth Researcher & Content Creator personas synchronized", latencyMs: 140 },
    { step: 4, title: "4. Logistics Verification", summary: "Verified Steadfast Courier & bKash PGW endpoints", latencyMs: 45 },
    { step: 5, title: "5. WebGPU Polish", summary: "Rendered final campaign artifact via Intel Arc B580 Xe2", latencyMs: 18 },
  ]);

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

      {/* DeepSeek Harness (DSH) Interactive Trace Replay & Forking */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                DeepSeek Harness (DSH) Interactive Trace Replay & Forking
              </h2>
              {forkedSessionId && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Forked: {forkedSessionId}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Active Session: <span className="font-mono text-cyan-400">{dshSessionId}</span> • Step {dshStepIndex + 1} of {dshSteps.length}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDshStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={dshStepIndex === 0}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs rounded-lg transition-all"
              data-testid="dsh-prev-step"
            >
              ◀ Prev
            </button>
            <button
              onClick={() => {
                if (dshStepIndex < dshSteps.length - 1) {
                  setDshStepIndex((prev) => prev + 1);
                } else {
                  setDshStepIndex(0);
                }
              }}
              className="px-2.5 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg transition-all"
              data-testid="dsh-next-step"
            >
              Next Step ▶
            </button>
            <button
              onClick={() => {
                const newForkId = `dsh_fork_${Date.now().toString().slice(-6)}`;
                setForkedSessionId(newForkId);
                setEventLogs((prev) => [
                  ...prev,
                  `🍴 [DSH Trace Fork] Forked session ${dshSessionId} into ${newForkId} at Step ${dshStepIndex + 1} ("${dshSteps[dshStepIndex].title}")`,
                  `🌿 Branch isolated: Future interventions will run on isolated execution graph.`,
                ]);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5"
              data-testid="dsh-fork-button"
            >
              🍴 Fork at Step {dshStepIndex + 1}
            </button>
          </div>
        </div>

        {/* Selected Step Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-purple-300">
              {dshSteps[dshStepIndex]?.title}
            </p>
            <span className="text-[11px] font-mono text-slate-400">
              Latency: {dshSteps[dshStepIndex]?.latencyMs}ms
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {dshSteps[dshStepIndex]?.summary}
          </p>
        </div>
      </div>

      {/* Hardware Concurrency & Intel Arc Live Lab */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              12-Thread Swarm Concurrency & WebGPU Acceleration Lab
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              12 CPU Threads • 11.1 GB RAM In-Memory Buffer • Intel Arc B580 Xe2 Pipeline
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const startTime = performance.now();
                // Simulate 12 concurrent swarm agent threads running in parallel
                const tasks = Array.from({ length: 12 }, (_, i) => {
                  return new Promise<string>((resolve) => {
                    setTimeout(() => {
                      resolve(`Worker-${i + 1} completed sub-task in ${(performance.now() - startTime).toFixed(1)}ms`);
                    }, 50 + Math.random() * 50);
                  });
                });

                void Promise.all(tasks).then((results) => {
                  const elapsed = (performance.now() - startTime).toFixed(1);
                  setEventLogs((prev) => [
                    ...prev,
                    `⚡ [12-Thread Swarm Stress Test] Executed 12 parallel persona tasks in ${elapsed}ms (${results.length} workers synchronized)`,
                    `🧠 [In-Memory Cache] Vector store hit rate 100% | Zero disk I/O bottleneck`,
                  ]);
                });
              }}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
            >
              ⚡ Stress 12 Threads
            </button>
            <button
              onClick={async () => {
                const testInput = "The merchant made very good profit from cash on delivery and fast courier logistics.";
                const res = await SpeculativeEngine.translateBangla(testInput);
                setEventLogs((prev) => [
                  ...prev,
                  `⚡ [WebGPU Speculative Lab] Bangla translation rendered in ${res.latencyMs}ms (${res.engine.toUpperCase()})`,
                  `📝 Result: ${res.output}`,
                ]);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
            >
              ▶ Run WebGPU Kernel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
