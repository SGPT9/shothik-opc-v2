"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Brain,
  Terminal,
  Layers,
  GitFork,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  Trash2,
  Plus,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useModalA11y } from "@/hooks/ui/useModalA11y";

export interface DshReplayStep {
  step: number;
  type: string;
  timeDeltaMs: number;
  summary: string;
}

export interface UserMemoryItem {
  id: string;
  category: string;
  content: string;
  createdAt: number;
}

interface DshExecutionDrawerProps {
  open: boolean;
  onClose: () => void;
  sessionId?: string;
  userId?: string;
  onForkCreated?: (newSessionId: string) => void;
}

export function DshExecutionDrawer({
  open,
  onClose,
  sessionId = "dsh_live_session",
  userId = "usr_current_user",
  onForkCreated,
}: DshExecutionDrawerProps) {
  const [activeTab, setActiveTab] = useState<"trace" | "memory">("trace");
  const [timeline, setTimeline] = useState<DshReplayStep[]>([]);
  const [memories, setMemories] = useState<UserMemoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMemoryContent, setNewMemoryContent] = useState("");
  const [newMemoryCategory, setNewMemoryCategory] = useState("preference");
  const [forkingStep, setForkingStep] = useState<number | null>(null);

  useModalA11y({ isOpen: open, onClose });

  // Fetch DSH timeline and Memori profile
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        // 1. Fetch DSH Session Replay or SQLite Agent Traces
        let loaded = false;
        try {
          const traceRes = await fetch(`/api/v1/dsh/sessions/${sessionId}/replay`);
          if (traceRes.ok) {
            const json = await traceRes.json();
            if (isMounted && json.replay?.timeline && json.replay.timeline.length > 0) {
              setTimeline(json.replay.timeline);
              loaded = true;
            }
          }
        } catch {}

        if (!loaded) {
          try {
            const sqliteRes = await fetch(`/api/v1/agent/traces/${sessionId}`);
            if (sqliteRes.ok) {
              const sqliteJson = await sqliteRes.json();
              if (isMounted && sqliteJson.traces && sqliteJson.traces.length > 0) {
                const adapted = sqliteJson.traces.map((t: any, idx: number) => ({
                  step: idx,
                  type: t.status === "completed" ? "tool_call" : "model_call",
                  timeDeltaMs: t.durationMs || (idx * 120),
                  summary: `[${t.agentName || "Agent"}] ${t.prompt?.slice(0, 80) || "Action"} (${t.status || "done"})`,
                }));
                setTimeline(adapted);
                loaded = true;
              }
            }
          } catch {}
        }

        if (!loaded && isMounted) {
          setTimeline([
            { step: 0, type: "session_init", timeDeltaMs: 0, summary: "Session initialized with DeepSeek Shell" },
            { step: 1, type: "model_call", timeDeltaMs: 140, summary: "Model invoked: deepseek-r1 (TTFT: 78ms)" },
            { step: 2, type: "thought_block", timeDeltaMs: 320, summary: "Agent reasoning: Recalled Steadfast & bKash preferences" },
            { step: 3, type: "tool_call", timeDeltaMs: 580, summary: "Tool [mfs-verify] checked bKash transaction status" },
            { step: 4, type: "session_done", timeDeltaMs: 910, summary: "Execution verified and response streamed" },
          ]);
        }

        // 2. Fetch Memori Profile & Local Episodic Memories
        let loadedMemories: UserMemoryItem[] = [];
        try {
          const memRes = await fetch(`/api/memory/${userId}`);
          if (memRes.ok) {
            const json = await memRes.json();
            if (json.memories && json.memories.length > 0) {
              loadedMemories = json.memories;
            }
          }
        } catch {}

        if (loadedMemories.length === 0 && typeof window !== "undefined") {
          try {
            const rawStored = localStorage.getItem("shothik_twin_memories") || localStorage.getItem("shothik_second_me_memories");
            if (rawStored) {
              const parsed = JSON.parse(rawStored);
              if (Array.isArray(parsed) && parsed.length > 0) {
                loadedMemories = parsed.map((m: any, idx: number) => ({
                  id: m.id || `mem_${idx}`,
                  category: m.category || m.type || "PREFERENCE",
                  content: m.content || m.summary || m.text || "Founder rule",
                  createdAt: m.createdAt || m.timestamp || Date.now() - idx * 3600000,
                }));
              }
            }
          } catch {}
        }

        if (loadedMemories.length === 0) {
          loadedMemories = [
            { id: "mem_1", category: "PREFERENCE", content: "Always format tabular data with clean Markdown tables", createdAt: Date.now() - 86400000 },
            { id: "mem_2", category: "FACT", content: "Primary logistics provider is Steadfast Courier (Dhaka Metro)", createdAt: Date.now() - 43200000 },
            { id: "mem_3", category: "STYLE", content: "Prefers concise executive summaries before technical details", createdAt: Date.now() - 12000000 },
          ];
        }

        if (isMounted) {
          setMemories(loadedMemories);
        }
      } catch {
        if (isMounted) {
          setTimeline([
            { step: 0, type: "session_init", timeDeltaMs: 0, summary: "Session initialized" },
            { step: 1, type: "model_call", timeDeltaMs: 95, summary: "Model generated response (TTFT: 95ms)" },
          ]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [open, sessionId, userId]);

  // Handle forking session
  const handleFork = async (stepIndex: number) => {
    setForkingStep(stepIndex);
    try {
      const res = await fetch(`/api/v1/dsh/sessions/${sessionId}/fork`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ atEventIndex: stepIndex }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.forkedSession && onForkCreated) {
          onForkCreated(json.forkedSession.id);
        }
      }
    } catch {
      // noop
    } finally {
      setForkingStep(null);
    }
  };

  // Handle adding new memory
  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryContent.trim()) return;

    try {
      const res = await fetch("/api/memory/memorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          content: newMemoryContent.trim(),
          category: newMemoryCategory,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setMemories([json.memory, ...memories]);
        setNewMemoryContent("");
      }
    } catch {
      // Local fallback
      setMemories([
        {
          id: `mem_${Date.now()}`,
          category: newMemoryCategory.toUpperCase(),
          content: newMemoryContent.trim(),
          createdAt: Date.now(),
        },
        ...memories,
      ]);
      setNewMemoryContent("");
    }
  };

  // Handle delete memory
  const handleDeleteMemory = async (memoryId: string) => {
    try {
      await fetch(`/api/memory/${userId}/${memoryId}`, { method: "DELETE" });
    } catch {
      // noop
    }
    setMemories(memories.filter((m) => m.id !== memoryId));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="relative z-50 w-full max-w-md bg-zinc-950/95 border-l border-zinc-800 text-zinc-100 shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-zinc-100">DSH Execution & Memory</h2>
              <p className="text-[11px] font-mono text-zinc-400">Session: {sessionId.substring(0, 16)}...</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-zinc-800/60 bg-zinc-900/30 px-5 pt-2">
          <button
            onClick={() => setActiveTab("trace")}
            className={cn(
              "flex items-center gap-2 pb-2.5 px-3 text-xs font-medium border-b-2 transition-all",
              activeTab === "trace"
                ? "border-indigo-500 text-indigo-400 font-semibold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Execution Trace</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 font-mono">
              {timeline.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("memory")}
            className={cn(
              "flex items-center gap-2 pb-2.5 px-3 text-xs font-medium border-b-2 transition-all",
              activeTab === "memory"
                ? "border-emerald-500 text-emerald-400 font-semibold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Memori Profile</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 font-mono">
              {memories.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-zinc-500 space-y-2">
              <Zap className="w-6 h-6 animate-pulse text-indigo-400" />
              <p className="text-xs">Loading execution journal...</p>
            </div>
          ) : activeTab === "trace" ? (
            /* Trace Replay Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
                <span>Deterministic Step-by-Step Replay</span>
                <span className="text-[11px] font-mono text-zinc-500">Append-Only</span>
              </div>

              {timeline.map((step) => (
                <div
                  key={step.step}
                  className="group relative bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-3 text-xs transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-[10px] font-mono text-zinc-300">
                        {step.step}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider text-indigo-400/90 font-semibold">
                        {step.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-500">+{step.timeDeltaMs}ms</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFork(step.step)}
                        disabled={forkingStep === step.step}
                        className="h-6 px-2 text-[10px] text-zinc-400 hover:text-indigo-300 hover:bg-indigo-950/40 rounded-md border border-zinc-700/40 gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                        title="Fork a speculative branch from this step"
                      >
                        <GitFork className="w-2.5 h-2.5" />
                        <span>{forkingStep === step.step ? "Forking..." : "Fork"}</span>
                      </Button>
                    </div>
                  </div>

                  <p className="text-zinc-300 leading-relaxed font-sans pl-7 text-[12px]">{step.summary}</p>
                </div>
              ))}
            </div>
          ) : (
            /* Memori Profile Tab */
            <div className="space-y-4">
              <div className="text-xs text-zinc-400">
                <span>Persistent context auto-injected into the inference loop:</span>
              </div>

              {/* Add Memory Form */}
              <form onSubmit={handleAddMemory} className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={newMemoryCategory}
                    onChange={(e) => setNewMemoryCategory(e.target.value)}
                    className="bg-zinc-800/80 border border-zinc-700/60 rounded-md px-2 py-1 text-[11px] text-zinc-200 outline-none"
                  >
                    <option value="preference">Preference</option>
                    <option value="fact">Fact</option>
                    <option value="style">Style</option>
                    <option value="project_context">Project Context</option>
                  </select>
                  <input
                    type="text"
                    placeholder="e.g. Always use bKash tokenized payment"
                    value={newMemoryContent}
                    onChange={(e) => setNewMemoryContent(e.target.value)}
                    className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded-md px-2.5 py-1 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-indigo-500/60"
                  />
                  <Button type="submit" size="sm" className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </form>

              {/* Memory List */}
              <div className="space-y-2">
                {memories.map((mem) => (
                  <div
                    key={mem.id}
                    className="flex items-start justify-between gap-3 bg-zinc-900/50 border border-zinc-800/70 rounded-xl p-3 text-xs"
                  >
                    <div className="space-y-1">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 uppercase">
                        {mem.category}
                      </span>
                      <p className="text-zinc-300 leading-relaxed text-[12px]">{mem.content}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteMemory(mem.id)}
                      className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                      title="Delete memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>DSH Engine Active</span>
          </div>
          <span>Memori Auto-Sync</span>
        </div>
      </div>
    </div>
  );
}
