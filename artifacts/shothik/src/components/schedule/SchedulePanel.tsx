"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, Plus, CheckCircle2, Play, Pause, X, RefreshCw } from "lucide-react";
import { LiquidGlassCard } from "@/components/chat/LiquidGlassCard";
import {
  fetchScheduledTasks,
  createScheduledTask,
  toggleScheduledTask,
  type ScheduledTask,
} from "@/services/agent-team.service";

export interface SchedulePanelProps {
  className?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export function SchedulePanel({ className = "", onClose, isModal = false }: SchedulePanelProps) {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [cron, setCron] = useState<string>("0 9 * * *");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await fetchScheduledTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load schedule");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleToggle = async (id: string, currentEnabled: boolean) => {
    try {
      const updated = await toggleScheduledTask(id, !currentEnabled);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: updated.enabled } : t)));
    } catch (err: any) {
      setError(err?.message || "Failed to toggle task");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cron.trim()) {
      setError("Task name and cron expression are required");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const newTask = await createScheduledTask({
        name: name.trim(),
        cron: cron.trim(),
        enabled: true,
      });
      setTasks((prev) => [...prev, newTask]);
      setName("");
      setCron("0 9 * * *");
      setShowAddForm(false);
    } catch (err: any) {
      setError(err?.message || "Failed to schedule task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LiquidGlassCard
      intensity="vibrant"
      palette="tax_gold"
      className={`p-5 flex flex-col h-full select-text text-zinc-100 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Autonomous Scheduler
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {(tasks || []).filter((t) => t?.enabled).length} Active
              </span>
            </h3>
            <p className="text-xs text-zinc-400">Recurring cron jobs, digests & auto-maintenance</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={loadTasks}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
            title="Refresh schedule"
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
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 border border-amber-500/40 text-xs font-semibold text-amber-200 transition shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Scheduled Task</span>
          </button>
        ) : (
          <form onSubmit={handleCreateTask} className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">New Scheduled Job</span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Task Name</label>
              <input
                type="text"
                placeholder="e.g. Nightly Inventory Reconciliation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Cron Expression</label>
              <input
                type="text"
                placeholder="0 9 * * *"
                value={cron}
                onChange={(e) => setCron(e.target.value)}
                className="w-full font-mono px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-amber-300 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                required
              />
              <p className="text-[10px] text-zinc-500 mt-1">Standard 5-part cron: min hour dom mon dow</p>
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
                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? "Scheduling..." : "Schedule Task"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Scheduled Tasks List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-zinc-400 text-xs gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
            <span>Loading schedule...</span>
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-xs">
            No scheduled tasks configured yet.
          </div>
        ) : (
          (tasks || []).map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                task.enabled
                  ? "bg-white/[0.04] hover:bg-white/[0.08] border-white/10"
                  : "bg-black/20 border-white/5 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Clock className={`h-4 w-4 shrink-0 ${task.enabled ? "text-amber-400" : "text-zinc-600"}`} />
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">{task.name}</h4>
                  <span className="font-mono text-[10px] text-amber-300/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    {task.cron}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleToggle(task.id, task.enabled)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition ${
                  task.enabled
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-white"
                }`}
                title={task.enabled ? "Disable task" : "Enable task"}
              >
                {task.enabled ? (
                  <>
                    <Pause className="h-3 w-3" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3" />
                    <span>Paused</span>
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </LiquidGlassCard>
  );
}

export default SchedulePanel;
