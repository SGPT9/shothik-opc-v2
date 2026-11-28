"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, Bot, Shield, Check, X, Sparkles, RefreshCw } from "lucide-react";
import { LiquidGlassCard } from "@/components/chat/LiquidGlassCard";
import { fetchAgents, createAgent, type Agent } from "@/services/agent-team.service";

export interface TeamPanelProps {
  className?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export function TeamPanel({ className = "", onClose, isModal = false }: TeamPanelProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [policy, setPolicy] = useState<"auto" | "manual">("auto");
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const data = await fetchAgents();
      setAgents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load agents");
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      setError("Agent name and role are required");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const newAgent = await createAgent({
        name: name.trim(),
        role: role.trim(),
        policy,
        description: description.trim() || undefined,
      });
      setAgents((prev) => [...prev, newAgent]);
      setName("");
      setRole("");
      setDescription("");
      setShowAddForm(false);
    } catch (err: any) {
      setError(err?.message || "Failed to create agent");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LiquidGlassCard
      intensity="vibrant"
      palette="indigo"
      className={`p-5 flex flex-col h-full select-text text-zinc-100 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Autonomous Agent Team
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {(agents || []).length} Active
              </span>
            </h3>
            <p className="text-xs text-zinc-400">Specialized subagents for dual-execution & delegation</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={loadAgents}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
            title="Refresh agents"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
              title="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Action / Add button */}
      <div className="mb-3">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 text-xs font-semibold text-indigo-200 transition shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New Specialist Agent</span>
          </button>
        ) : (
          <form onSubmit={handleCreateAgent} className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">New Agent Profile</span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Agent Name</label>
              <input
                type="text"
                placeholder="e.g. NBR Tax Specialist"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-400"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Role / Responsibility</label>
              <input
                type="text"
                placeholder="e.g. Validates Mushak 6.3 invoices and compliance"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-400"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Execution Policy</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPolicy("auto")}
                  className={`py-1.5 px-2 rounded-lg border text-center transition ${
                    policy === "auto"
                      ? "bg-indigo-500/20 border-indigo-500/60 text-indigo-200 font-semibold"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                  }`}
                >
                  ⚡ Autonomous
                </button>
                <button
                  type="button"
                  onClick={() => setPolicy("manual")}
                  className={`py-1.5 px-2 rounded-lg border text-center transition ${
                    policy === "manual"
                      ? "bg-amber-500/20 border-amber-500/60 text-amber-200 font-semibold"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                  }`}
                >
                  🛡️ Supervised
                </button>
              </div>
            </div>

            {error && <p className="text-[11px] text-rose-400">{error}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 rounded-lg text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Deploy Agent"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Agent Roster List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-zinc-400 text-xs gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
            <span>Loading agent team...</span>
          </div>
        ) : !agents || agents.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-xs">
            No agents registered yet. Click &quot;Add New Specialist Agent&quot; above.
          </div>
        ) : (
          (agents || []).map((agent) => (
            <div
              key={agent.id}
              className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition flex items-start gap-3"
            >
              <div className="h-7 w-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                <Bot className="h-3.5 w-3.5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-semibold text-white truncate">{agent.name}</h4>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider shrink-0 ${
                      agent.policy === "manual"
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {agent.policy || "auto"}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">{agent.role}</p>
                {agent.description && (
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">{agent.description}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </LiquidGlassCard>
  );
}

export default TeamPanel;
