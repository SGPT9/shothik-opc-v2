"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  Layers,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  Terminal,
  Trash2,
  Wrench,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AgentTraceItem {
  id: string;
  sessionId: string;
  agentName: string;
  prompt: string;
  response: string;
  status: "completed" | "in_progress" | "error" | string;
  durationMs: number;
  metadata: string;
  createdAt: number;
}

interface LiveAgentTraceTimelineProps {
  sessionId: string;
  isStreaming?: boolean;
  className?: string;
  onTraceSelect?: (trace: AgentTraceItem) => void;
}

export function LiveAgentTraceTimeline({
  sessionId,
  isStreaming = false,
  className,
  onTraceSelect,
}: LiveAgentTraceTimelineProps) {
  const [traces, setTraces] = useState<AgentTraceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedTraceIds, setExpandedTraceIds] = useState<Set<string>>(new Set());
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTraces = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/agent/traces/${encodeURIComponent(sessionId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.traces)) {
          setTraces(data.traces);
        }
      }
    } catch {
      // Fallback or offline dev mode
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchTraces();
  }, [fetchTraces]);

  // Auto-refresh when streaming is active
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      fetchTraces();
    }, 1500);
    return () => clearInterval(interval);
  }, [isStreaming, fetchTraces]);

  const toggleExpand = (id: string) => {
    setExpandedTraceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearTraces = async () => {
    try {
      await fetch(`/api/v1/agent/traces/${encodeURIComponent(sessionId)}`, {
        method: "DELETE",
      });
      setTraces([]);
    } catch {}
  };

  const agentNames = Array.from(new Set(traces.map((t) => t.agentName)));

  const filteredTraces = traces.filter((trace) => {
    if (filterAgent !== "all" && trace.agentName !== filterAgent) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        trace.prompt.toLowerCase().includes(q) ||
        trace.response.toLowerCase().includes(q) ||
        trace.agentName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStageIcon = (agentName: string) => {
    const lower = agentName.toLowerCase();
    if (lower.includes("think") || lower.includes("perceive")) return <Brain className="w-3.5 h-3.5 text-purple-400" />;
    if (lower.includes("plan")) return <Layers className="w-3.5 h-3.5 text-blue-400" />;
    if (lower.includes("code") || lower.includes("execute")) return <Code2 className="w-3.5 h-3.5 text-emerald-400" />;
    if (lower.includes("heal") || lower.includes("verify")) return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    if (lower.includes("mcp") || lower.includes("tool")) return <Wrench className="w-3.5 h-3.5 text-cyan-400" />;
    return <Cpu className="w-3.5 h-3.5 text-zinc-400" />;
  };

  return (
    <div className={cn("flex flex-col h-full bg-zinc-950/80 border border-white/[0.08] rounded-xl overflow-hidden backdrop-blur-xl", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-zinc-200">Execution Trace Timeline</span>
          {isStreaming && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded-full animate-pulse font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              LIVE
            </span>
          )}
          <span className="text-[11px] text-zinc-500 font-mono">({traces.length} steps)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchTraces}
            disabled={loading}
            className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]"
            title="Refresh Traces"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          </Button>
          {traces.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearTraces}
              className="h-7 w-7 p-0 text-zinc-400 hover:text-red-400 hover:bg-red-950/20"
              title="Clear Session Traces"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06] bg-zinc-900/20 text-xs">
        <div className="relative flex-1">
          <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompt or thoughts..."
            className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-md pl-7 pr-2 py-1 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {agentNames.length > 1 && (
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            aria-label="Filter traces by agent"
            className="bg-zinc-900/80 border border-white/[0.08] rounded-md px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">All Agents</option>
            {agentNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Timeline Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredTraces.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-zinc-500 text-xs space-y-1">
            <Terminal className="w-6 h-6 text-zinc-600 mb-1" />
            <p>No traces recorded for this session yet.</p>
            <p className="text-[11px] text-zinc-600">Traces appear automatically during agent execution.</p>
          </div>
        ) : (
          filteredTraces.map((trace) => {
            const isExpanded = expandedTraceIds.has(trace.id);
            let parsedMetadata: Record<string, unknown> = {};
            try {
              parsedMetadata = JSON.parse(trace.metadata || "{}");
            } catch {}

            return (
              <div
                key={trace.id}
                className={cn(
                  "rounded-lg border border-white/[0.06] bg-zinc-900/40 hover:bg-zinc-900/70 transition-colors p-2.5 text-xs font-mono",
                  trace.status === "error" && "border-red-500/30 bg-red-950/10",
                  isExpanded && "border-white/[0.12] bg-zinc-900/90 shadow-lg"
                )}
                onClick={() => onTraceSelect?.(trace)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(trace.id);
                      }}
                      className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded"
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>

                    <div className="p-1 rounded bg-white/[0.05] border border-white/[0.08]">
                      {getStageIcon(trace.agentName)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-zinc-200 truncate">{trace.agentName}</span>
                        {trace.durationMs > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-zinc-500">
                            <Clock className="w-2.5 h-2.5" />
                            {trace.durationMs}ms
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 text-[11px] truncate mt-0.5">{trace.prompt}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {trace.status === "completed" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        OK
                      </span>
                    ) : trace.status === "error" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-red-400 bg-red-950/40 border border-red-800/30 px-1.5 py-0.5 rounded">
                        <XCircle className="w-2.5 h-2.5" />
                        ERR
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/40 border border-amber-800/30 px-1.5 py-0.5 rounded animate-pulse">
                        <Play className="w-2.5 h-2.5" />
                        RUN
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.06] space-y-2 text-[11px]">
                    {trace.response && (
                      <div>
                        <span className="text-zinc-500 font-semibold uppercase text-[10px]">Response / Output:</span>
                        <div className="mt-1 p-2 rounded bg-black/50 border border-white/[0.04] text-zinc-300 whitespace-pre-wrap font-mono text-[11px] max-h-48 overflow-y-auto">
                          {trace.response}
                        </div>
                      </div>
                    )}

                    {Object.keys(parsedMetadata).length > 0 && (
                      <div>
                        <span className="text-zinc-500 font-semibold uppercase text-[10px]">Metadata:</span>
                        <pre className="mt-1 p-2 rounded bg-black/50 border border-white/[0.04] text-zinc-400 overflow-x-auto text-[10px]">
                          {JSON.stringify(parsedMetadata, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                      <span>ID: {trace.id}</span>
                      <span>Recorded: {new Date(trace.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
