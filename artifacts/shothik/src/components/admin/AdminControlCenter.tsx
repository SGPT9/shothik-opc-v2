"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Cpu,
  Activity,
  Users,
  Database,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Clock,
  TrendingUp,
  Server,
  Layers,
  ArrowUpRight,
  Filter
} from "lucide-react";
import { LiquidGlassCard } from "@/components/chat/LiquidGlassCard";
import { cn } from "@/lib/utils";

interface SystemMetric {
  label: string;
  value: string;
  sub: string;
  trend: string;
  status: "optimal" | "warning" | "active";
}

interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  status: "SUCCESS" | "SPECULATIVE" | "REVERTED";
  latencyMs: number;
}

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  tier: "FREE" | "PRO" | "ENTERPRISE";
  credits: number;
  lastActive: string;
  totalRuns: number;
}

export function AdminControlCenter() {
  const [activeSubTab, setActiveSubTab] = useState<"telemetry" | "gatekeeper" | "users" | "loop_engine">("telemetry");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserTier, setSelectedUserTier] = useState<"ALL" | "FREE" | "PRO" | "ENTERPRISE">("ALL");

  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([
    {
      id: "usr-01",
      name: "তানভীর আহমেদ (Tanveer)",
      email: "tanveer.bd@merchant.shothik.app",
      tier: "PRO",
      credits: 2450,
      lastActive: "2 mins ago",
      totalRuns: 142,
    },
    {
      id: "usr-02",
      name: "ফাহিম করিম (Fahim)",
      email: "fahim@d2c-brands.com",
      tier: "ENTERPRISE",
      credits: 89000,
      lastActive: "Just now",
      totalRuns: 1204,
    },
    {
      id: "usr-03",
      name: "ফারহানা ইয়াসমিন (Farhana)",
      email: "farhana.stu@du.ac.bd",
      tier: "FREE",
      credits: 120,
      lastActive: "1 hour ago",
      totalRuns: 18,
    },
    {
      id: "usr-04",
      name: "রাকিবুল হাসান (Rakib)",
      email: "rakib@chittagong-hub.net",
      tier: "FREE",
      credits: 45,
      lastActive: "3 hours ago",
      totalRuns: 9,
    },
  ]);

  const auditLogs: AuditLogItem[] = [
    {
      id: "AUD-9912",
      timestamp: new Date(Date.now() - 1000 * 45).toLocaleTimeString(),
      actor: "Hermes Gatekeeper",
      action: "Simulated bKash MFS Reconciliation (৳1,850)",
      target: "Order #ORD-8891",
      status: "SPECULATIVE",
      latencyMs: 14,
    },
    {
      id: "AUD-9911",
      timestamp: new Date(Date.now() - 1000 * 120).toLocaleTimeString(),
      actor: "Steadfast Courier Dispatch",
      action: "Consignment Booked & WhatsApp DM Sent (BD_ST_700766)",
      target: "Zindabazar, Sylhet Hub",
      status: "SUCCESS",
      latencyMs: 42,
    },
    {
      id: "AUD-9910",
      timestamp: new Date(Date.now() - 1000 * 300).toLocaleTimeString(),
      actor: "AST Self-Healing Loop",
      action: "Surgical Regex & Backoff Patch Applied",
      target: "ollama-service.ts:L42",
      status: "SUCCESS",
      latencyMs: 22,
    },
    {
      id: "AUD-9909",
      timestamp: new Date(Date.now() - 1000 * 600).toLocaleTimeString(),
      actor: "Admin (admin@shothik.app)",
      action: "Tier Upgrade: usr-01 to PRO (+2,000 Credits)",
      target: "Account Ledger",
      status: "SUCCESS",
      latencyMs: 8,
    },
  ];

  const metrics: SystemMetric[] = [
    {
      label: "LLM Gateway First-Byte Latency",
      value: "142 ms",
      sub: "Ollama Port 11434 GPU daemon",
      trend: "-18ms vs Cloud MoE",
      status: "optimal",
    },
    {
      label: "Speculative Simulation Success",
      value: "99.84%",
      sub: "Cloudflare OS Gatekeeper runtime",
      trend: "1,420 unblocked workflows",
      status: "optimal",
    },
    {
      label: "MFS & Courier Auto-Reconcile",
      value: "৳142,500",
      sub: "Steadfast, Pathao, bKash & Nagad",
      trend: "+34.2% GMV this week",
      status: "optimal",
    },
    {
      label: "AST Loop Healing MTTR",
      value: "22 ms",
      sub: "Zero runtime crashes",
      trend: "14/14 self-healed nodes",
      status: "optimal",
    },
  ];

  const handleUpdateTier = (userId: string, newTier: "FREE" | "PRO" | "ENTERPRISE") => {
    setManagedUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const addedCredits = newTier === "ENTERPRISE" ? 50000 : newTier === "PRO" ? 2500 : 100;
          return { ...u, tier: newTier, credits: u.credits + addedCredits };
        }
        return u;
      })
    );
  };

  const filteredUsers = managedUsers.filter((u) => {
    const matchesTier = selectedUserTier === "ALL" || u.tier === selectedUserTier;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Top Obsidian Header ── */}
      <header className="border-b border-border/60 bg-muted/20 px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">Shothik Hermes Admin Center</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Privileged Surface
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time telemetry, Gatekeeper audit logs, user tier provisioning & AST engine monitoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Port 8080 Active · Ollama 11434 Online</span>
          </div>
          <a
            href="/agents/chat"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition"
          >
            ➔ Return to Chat
          </a>
        </div>
      </header>

      {/* ── Sub Navigation ── */}
      <div className="border-b border-border/40 bg-muted/10 px-6 flex items-center gap-1">
        {[
          { id: "telemetry", label: "System Telemetry & LLM", Icon: Cpu },
          { id: "gatekeeper", label: "Gatekeeper Audit Logs", Icon: Activity },
          { id: "users", label: "User Tiers & Credits", Icon: Users },
          { id: "loop_engine", label: "5-Stage Loop Monitor", Icon: Layers },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveSubTab(id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer",
              activeSubTab === id
                ? "border-brand text-foreground bg-muted/30"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── Main Body Content ── */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, idx) => (
            <LiquidGlassCard key={idx} palette="indigo" className="p-4 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span>{m.label}</span>
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-foreground">{m.value}</div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground truncate">{m.sub}</span>
                <span className="text-emerald-400 font-mono font-semibold">{m.trend}</span>
              </div>
            </LiquidGlassCard>
          ))}
        </div>

        {/* Tab 1: System Telemetry & LLM */}
        {activeSubTab === "telemetry" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LiquidGlassCard palette="indigo" className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Server className="h-4 w-4 text-brand" />
                  <span>LLM Gateway Routing & Latency Distribution</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">100% Availability</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/40">
                  <div>
                    <span className="font-semibold text-foreground block">Ollama Port 11434 (Local GPU)</span>
                    <span className="text-[10px] text-muted-foreground">DeepSeek-R1 / Coder 6.7B · Zero Egress</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">142ms · ৳0.00</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/40">
                  <div>
                    <span className="font-semibold text-foreground block">Cloud MoE Gateway (DeepSeek V4 Flash)</span>
                    <span className="text-[10px] text-muted-foreground">1M Context Reasoning · Shothik Cloud</span>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold">198ms · ৳0.02</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/40">
                  <div>
                    <span className="font-semibold text-foreground block">Gemini 3.7 Flash Hybrid Reasoning</span>
                    <span className="text-[10px] text-muted-foreground">Multimodal Visual Intelligence</span>
                  </div>
                  <span className="font-mono text-indigo-400 font-bold">310ms · ৳0.05</span>
                </div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard palette="indigo" className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-emerald-400" />
                  <span>2GB RAM Client Optimization Diagnostics</span>
                </h3>
                <span className="text-[10px] font-mono text-indigo-400 font-semibold">South Asia Optimized</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>DOM Node Count Budget (Max 1,500)</span>
                    <span className="font-mono text-foreground font-semibold">680 nodes</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: "45%" }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>Client Heap Allocation (Max 80MB)</span>
                    <span className="font-mono text-foreground font-semibold">32.4 MB</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: "40%" }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>InsForge Realtime WebSocket Overhead</span>
                    <span className="font-mono text-foreground font-semibold">1.8 KB / delta</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: "20%" }} />
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        )}

        {/* Tab 2: Gatekeeper Audit Logs */}
        {activeSubTab === "gatekeeper" && (
          <LiquidGlassCard palette="indigo" className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="text-sm font-bold">Cloudflare OS-Style Gatekeeper Audit Trail</h3>
                <p className="text-xs text-muted-foreground">Every speculative and committed side effect is tracked with sub-millisecond timestamps</p>
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Refresh Log</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground">
                    <th className="py-2.5 px-3 font-semibold">Event ID</th>
                    <th className="py-2.5 px-3 font-semibold">Time</th>
                    <th className="py-2.5 px-3 font-semibold">Actor</th>
                    <th className="py-2.5 px-3 font-semibold">Action & Target</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-3 text-indigo-400 font-bold">{log.id}</td>
                      <td className="py-3 px-3 text-muted-foreground">{log.timestamp}</td>
                      <td className="py-3 px-3 text-foreground font-sans font-medium">{log.actor}</td>
                      <td className="py-3 px-3 text-foreground font-sans">
                        <span className="font-semibold">{log.action}</span>
                        <span className="text-muted-foreground block text-[11px] font-mono">{log.target}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold",
                            log.status === "SUCCESS"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          )}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-emerald-400 font-semibold">{log.latencyMs} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LiquidGlassCard>
        )}

        {/* Tab 3: User Tiers & Credits */}
        {activeSubTab === "users" && (
          <LiquidGlassCard palette="indigo" className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
              <div>
                <h3 className="text-sm font-bold">User Tier & Credit Allocation Manager</h3>
                <p className="text-xs text-muted-foreground">Provision FREE, PRO, and ENTERPRISE limits with instant credit grants</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name or email..."
                    className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-muted/60 border border-border/60 text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-brand"
                  />
                </div>

                <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/40 text-[11px] font-semibold">
                  {(["ALL", "FREE", "PRO", "ENTERPRISE"] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setSelectedUserTier(tier)}
                      className={cn(
                        "px-2.5 py-0.5 rounded transition cursor-pointer",
                        selectedUserTier === tier ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground">
                    <th className="py-2.5 px-3 font-semibold">User</th>
                    <th className="py-2.5 px-3 font-semibold">Current Tier</th>
                    <th className="py-2.5 px-3 font-semibold">Available Credits</th>
                    <th className="py-2.5 px-3 font-semibold">Total Runs</th>
                    <th className="py-2.5 px-3 font-semibold">Last Active</th>
                    <th className="py-2.5 px-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-3">
                        <span className="font-semibold text-foreground block">{user.name}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">{user.email}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold font-mono",
                            user.tier === "ENTERPRISE"
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              : user.tier === "PRO"
                              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                              : "bg-muted text-muted-foreground border border-border/40"
                          )}
                        >
                          {user.tier}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-foreground">
                        ⚡ {user.credits.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground">{user.totalRuns}</td>
                      <td className="py-3 px-3 text-muted-foreground">{user.lastActive}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          {user.tier !== "FREE" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateTier(user.id, "FREE")}
                              className="px-2 py-1 rounded bg-muted hover:bg-muted/80 text-[10px] font-semibold text-muted-foreground transition"
                            >
                              Downgrade Free
                            </button>
                          )}
                          {user.tier !== "PRO" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateTier(user.id, "PRO")}
                              className="px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-[10px] font-semibold text-indigo-400 transition"
                            >
                              Upgrade Pro
                            </button>
                          )}
                          {user.tier !== "ENTERPRISE" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateTier(user.id, "ENTERPRISE")}
                              className="px-2 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-[10px] font-semibold text-purple-400 transition"
                            >
                              Grant Enterprise
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LiquidGlassCard>
        )}

        {/* Tab 4: 5-Stage Loop Monitor */}
        {activeSubTab === "loop_engine" && (
          <LiquidGlassCard palette="indigo" className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h3 className="text-sm font-bold">Autonomous 5-Stage Loop Execution & Self-Healing Pipeline</h3>
                <p className="text-xs text-muted-foreground">Deterministic Perceive ➔ Act ➔ Self-Heal ➔ Consensus state machine</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Consensus: 100%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                { stage: "1. Perceive", status: "Active", desc: "AST AST lint & runtime telemetry capture" },
                { stage: "2. Plan", status: "Active", desc: "Topological dependency DAG generation" },
                { stage: "3. Act", status: "Active", desc: "Sandboxed execution & local mutations" },
                { stage: "4. Verify & Heal", status: "Optimal", desc: "Surgical AST error patch (MTTR 22ms)" },
                { stage: "5. Converge", status: "Complete", desc: "Multi-agent consensus signature stamp" },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{s.stage}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">{s.desc}</p>
                </div>
              ))}
            </div>
          </LiquidGlassCard>
        )}
      </main>
    </div>
  );
}

export default AdminControlCenter;
