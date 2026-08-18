"use client";

import React, { useState, useEffect } from "react";
export interface ScheduledAgentTask {
  id: string;
  title: string;
  role: "Engineering" | "Research" | "Marketing" | "Design" | "Operations";
  schedule: string;
  scheduleTime?: string;
  output: string;
  targetOutput?: string;
  status: "idle" | "running" | "completed" | "failed";
  progress?: number;
  lastRun?: string;
  nextRun?: string;
}

export interface AgentActivityEvent {
  id: string;
  taskId?: string;
  agentRole?: string;
  role?: string;
  message: string;
  timestamp: string;
  type?: "info" | "success" | "warning" | "error";
  level?: string;
}

export default function TonightEngineDashboardPage() {
  const [tasks, setTasks] = useState<ScheduledAgentTask[]>([]);
  const [activity, setActivity] = useState<AgentActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newRole, setNewRole] = useState<ScheduledAgentTask["role"]>("Engineering");
  const [newSchedule, setNewSchedule] = useState("Overnight (03:00 AM)");
  const [newOutput, setNewOutput] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [taskRes, actRes] = await Promise.all([
        fetch("/api/tonight-engine/schedule").then((r) => r.json()),
        fetch("/api/tonight-engine/activity").then((r) => r.json()),
      ]);

      if (taskRes.success) setTasks(taskRes.tasks);
      if (actRes.success) setActivity(actRes.activity);
    } catch (err) {
      console.error("Failed to load tonight engine data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await fetch("/api/tonight-engine/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        role: newRole,
        scheduleTime: newSchedule,
        targetOutput: newOutput,
      }),
    }).then((r) => r.json());

    if (res.success) {
      setTasks((prev) => [res.task, ...prev]);
      setShowModal(false);
      setNewTitle("");
      setNewOutput("");
    }
  };

  const handleTriggerTaskNow = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "running" as const } : t))
    );

    const targetTask = tasks.find((t) => t.id === taskId);

    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: "completed" as const } : t))
      );
      setActivity((prev) => [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          role: targetTask?.role || "Engineering",
          message: `Manual execution finished: ${targetTask?.title || "Agent Job"}`,
          level: "success",
        },
        ...prev,
      ]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Pillar 2: 24/7 Overnight Agent Engine
              </span>
              <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mt-2">Tonight Engine & Digital Twin Orchestrator</h1>
            <p className="text-slate-400 text-sm mt-1">
              Autonomous overnight execution cycles across specialized personas (Strategy, Engineering, Comms, Ops).
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all shadow-lg hover:shadow-purple-500/20"
          >
            + Schedule Overnight Task
          </button>
        </div>

        {/* Morning Coffee Executive Voice Briefing Banner */}
        <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-8xl">☕</div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  ✨ Morning ROI Victory Pulse
                </span>
                <span className="text-xs text-slate-400">Overnight Cycle Complete</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Good morning! Your business grew while you slept.</h2>
              <p className="text-slate-300 text-sm max-w-2xl">
                Tonight Engine completed 3 tasks: generated investor pitch deck slides, reconciled 12 bKash payments (৳১২,৫০০ BDT), and answered 14 customer leads on WhatsApp.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => { window.location.href = "/voice"; }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg transition"
              >
                <span>🎙️ Play Spoken Voice Briefing</span>
              </button>
            </div>
          </div>
        </div>

        {/* Personas Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { role: "Strategy", icon: "📊", desc: "Competitor research, market trends, slide deck creation.", active: 2 },
            { role: "Engineering", icon: "⚡", desc: "Automated refactoring, code quality audits, performance tuning.", active: 4 },
            { role: "Comms", icon: "💬", desc: "Drafting customer replies, synthesis of feedback & emails.", active: 1 },
            { role: "Ops", icon: "⚙️", desc: "Database backups, log audits, security policy checks.", active: 3 },
          ].map((persona) => (
            <div key={persona.role} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{persona.icon}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {persona.active} Tasks
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-3">{persona.role} Agent</h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">{persona.desc}</p>
            </div>
          ))}
        </div>

        {/* Task Queue & Live Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Scheduled Tasks */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Overnight Task Schedule</span>
              <span className="text-xs text-slate-500">({tasks.length} Total)</span>
            </h2>

            {loading ? (
              <div className="py-12 text-center text-slate-500 animate-pulse">Loading scheduled agent jobs...</div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {task.role}
                        </span>
                        <h4 className="font-semibold text-white">{task.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400">{task.targetOutput}</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400 hidden sm:inline">{task.scheduleTime}</span>
                      <span
                        className={`px-2.5 py-1 rounded-full font-semibold capitalize ${
                          task.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : task.status === "running"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {task.status}
                      </span>
                      {task.status !== "running" && (
                        <button
                          onClick={() => handleTriggerTaskNow(task.id)}
                          className="px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-medium transition-all"
                        >
                          ▶ Run Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Col: Live Activity Stream */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Live Agent Activity</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h2>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl max-h-[500px] overflow-y-auto font-mono text-xs">
              {activity.map((evt) => (
                <div key={evt.id} className="border-b border-slate-800/60 pb-3 last:border-0 last:pb-0 space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span className="text-purple-400 font-semibold">{evt.role} Agent</span>
                    <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-300 leading-normal">{evt.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Schedule Overnight Agent Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Research AI Market Trends & Draft Slides"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Agent Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as ScheduledAgentTask["role"])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Strategy">Strategy Agent</option>
                    <option value="Engineering">Engineering Agent</option>
                    <option value="Comms">Comms Agent</option>
                    <option value="Ops">Ops Agent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Execution Schedule</label>
                  <select
                    value={newSchedule}
                    onChange={(e) => setNewSchedule(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Overnight (02:00 AM)">Overnight (02:00 AM)</option>
                    <option value="Overnight (04:00 AM)">Overnight (04:00 AM)</option>
                    <option value="Daily at Morning (08:00 AM)">Daily at Morning (08:00 AM)</option>
                    <option value="Continuous 4-Hour Cycle">Continuous 4-Hour Cycle</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Output Objective</label>
                <textarea
                  rows={3}
                  placeholder="Describe expected result (e.g. Generate 10-slide deck artifact and save to InsForge)..."
                  value={newOutput}
                  onChange={(e) => setNewOutput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium shadow-md"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
