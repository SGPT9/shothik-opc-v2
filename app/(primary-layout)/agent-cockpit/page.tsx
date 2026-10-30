"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MCPServerConfig } from "../../api/agent-cockpit/mcp/route";
import { SecurityRule } from "../../api/agent-cockpit/permissions/route";

export default function AgentCockpitPage() {
  const [activeTab, setActiveTab] = useState<"mcp" | "permissions" | "metrics">("mcp");
  const [servers, setServers] = useState<MCPServerConfig[]>([]);
  const [rules, setRules] = useState<SecurityRule[]>([]);
  const [metrics, setMetrics] = useState<{
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    estimatedCostUsd: number;
    activeSessions: number;
    avgLatencyMs: number;
    modelUsageBreakdown: { model: string; usagePercent: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mcpRes, permRes, metRes] = await Promise.all([
        fetch("/api/agent-cockpit/mcp").then((r) => r.json()),
        fetch("/api/agent-cockpit/permissions").then((r) => r.json()),
        fetch("/api/agent-cockpit/metrics").then((r) => r.json()),
      ]);

      if (mcpRes.success) setServers(mcpRes.servers);
      if (permRes.success) setRules(permRes.rules);
      if (metRes.success) setMetrics(metRes.metrics);
    } catch (err) {
      console.error("Failed to load cockpit data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMCP = async (id: string, currentStatus: string) => {
    const action = currentStatus === "active" ? "disable" : "enable";
    const res = await fetch("/api/agent-cockpit/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    }).then((r) => r.json());

    if (res.success) {
      setServers((prev) => prev.map((s) => (s.id === id ? res.server : s)));
    }
  };

  const handleUpdatePermission = async (id: string, mode: SecurityRule["mode"]) => {
    const res = await fetch("/api/agent-cockpit/permissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, mode }),
    }).then((r) => r.json());

    if (res.success) {
      setRules(res.rules);
    }
  };

  // ⚡ Bolt Performance Optimization:
  // Memoized the filtering of servers and rules to prevent unnecessary O(N) recalculations on every render.
  // Cached `searchQuery.toLowerCase()` before filtering to turn O(N) string conversion into O(1),
  // reducing memory allocations and improving main thread performance during typing.
  const { filteredServers, filteredRules } = useMemo(() => {
    if (!searchQuery) {
      return { filteredServers: servers, filteredRules: rules };
    }

    const query = searchQuery.toLowerCase();

    return {
      filteredServers: servers.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query)
      ),
      filteredRules: rules.filter(
        (r) =>
          r.capability.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query)
      )
    };
  }, [servers, rules, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Pillar 1: Visual Agent Cockpit
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mt-2">Agent Control & Security Center</h1>
            <p className="text-slate-400 text-sm mt-1">
              Visual cockpit for MCP integrations, subagent security gates, and token cost analytics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                id="cockpit-search-input"
                name="search"
                type="text"
                placeholder="Search tools, servers, rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-slate-500 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("mcp")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === "mcp" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                MCP Servers ({filteredServers.filter((s) => s.status === "active").length})
              </button>
              <button
                onClick={() => setActiveTab("permissions")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === "permissions" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Security Gates
              </button>
              <button
                onClick={() => setActiveTab("metrics")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === "metrics" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Usage & Costs
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500 animate-pulse">Loading Agent Cockpit Telemetry...</div>
        ) : (
          <>
            {/* Tab 1: MCP Servers */}
            {activeTab === "mcp" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServers.map((server) => (
                  <div
                    key={server.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {server.category}
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            server.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-800 text-slate-500"
                          }`}
                        >
                          {server.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mt-3">{server.name}</h3>
                      <p className="text-slate-400 text-sm mt-1 leading-relaxed">{server.description}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <div>
                        <span className="font-semibold text-slate-200">{server.toolsCount}</span> Tools •{" "}
                        <span className="text-emerald-400">{server.lastPingMs}ms</span>
                      </div>
                      <button
                        onClick={() => handleToggleMCP(server.id, server.status)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                          server.status === "active"
                            ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
                            : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
                        }`}
                      >
                        {server.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Security Gates */}
            {activeTab === "permissions" && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
                <div>
                  <h2 className="text-xl font-bold text-white">Subagent Capability Permission Rules</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Control security gates for autonomous agent tools (Auto-Approve, Prompt for confirmation, or Block completely).
                  </p>
                </div>

                <div className="divide-y divide-slate-800">
                  {filteredRules.map((rule) => (
                    <div key={rule.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">{rule.capability}</h4>
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                              rule.riskLevel === "critical"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : rule.riskLevel === "high"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                            }`}
                          >
                            {rule.riskLevel} Risk
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{rule.description}</p>
                      </div>

                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                        {(["auto-approve", "prompt-user", "block"] as const).map((modeOption) => (
                          <button
                            key={modeOption}
                            onClick={() => handleUpdatePermission(rule.id, modeOption)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded transition-all capitalize ${
                              rule.mode === modeOption
                                ? modeOption === "block"
                                  ? "bg-rose-600 text-white"
                                  : modeOption === "prompt-user"
                                  ? "bg-amber-600 text-white"
                                  : "bg-emerald-600 text-white"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {modeOption.replace("-", " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Usage & Costs */}
            {activeTab === "metrics" && metrics && (
              <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                    <span className="text-xs text-slate-400 font-medium">Total Token Volume</span>
                    <div className="text-2xl font-bold text-white mt-2">{metrics.totalTokens.toLocaleString()}</div>
                    <div className="text-xs text-emerald-400 mt-1">Prompt: {metrics.promptTokens.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                    <span className="text-xs text-slate-400 font-medium">Est. Operational Cost</span>
                    <div className="text-2xl font-bold text-emerald-400 mt-2">${metrics.estimatedCostUsd.toFixed(2)}</div>
                    <div className="text-xs text-slate-400 mt-1">Billing Period: Current Month</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                    <span className="text-xs text-slate-400 font-medium">Active Agent Threads</span>
                    <div className="text-2xl font-bold text-indigo-400 mt-2">{metrics.activeSessions}</div>
                    <div className="text-xs text-slate-400 mt-1">Concurrent Subagents</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                    <span className="text-xs text-slate-400 font-medium">Avg Execution Latency</span>
                    <div className="text-2xl font-bold text-white mt-2">{metrics.avgLatencyMs}ms</div>
                    <div className="text-xs text-emerald-400 mt-1">Optimized Response Speed</div>
                  </div>
                </div>

                {/* Model Usage Breakdown */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">LLM Model Traffic Distribution</h3>
                  <div className="space-y-4">
                    {metrics.modelUsageBreakdown.map((item) => (
                      <div key={item.model} className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-300">
                          <span className="font-mono">{item.model}</span>
                          <span className="font-semibold">{item.usagePercent}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${item.usagePercent}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
