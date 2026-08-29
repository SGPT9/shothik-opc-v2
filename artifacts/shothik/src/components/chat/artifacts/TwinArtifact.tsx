import { useState, useEffect } from "react";
import {
  Bot,
  Play,
  Moon,
  Zap,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Send,
  Sparkles,
  Terminal,
  Activity,
  Layers,
  Brain,
} from "lucide-react";
import { LiquidGlassCard } from "../LiquidGlassCard";
import { cn } from "@/lib/utils";
import { epistemicGraphMemory } from "@/lib/memory/EpistemicGraphMemory";

export interface AutonomousTask {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: "todo" | "in_progress" | "completed";
}

const INITIAL_TWIN_TASKS: AutonomousTask[] = [
  {
    id: "twin-t1",
    title: "Steadfast 64-District COD Settlement & Auto-Payouts",
    description: "Reconcile daily parcel deliveries and automate bKash merchant payouts.",
    tags: ["LOGISTICS", "TONIGHT", "1 CREDIT"],
    status: "in_progress",
  },
  {
    id: "twin-t2",
    title: "NBR Income Tax Act Section 78 Rebate Verification",
    description: "Audit investment rebate allowances and generate export tax clearance filing.",
    tags: ["TAX & COMPLIANCE", "1 CREDIT"],
    status: "todo",
  },
  {
    id: "twin-t3",
    title: "Automate Cold Outreach to 45 Emerging Market Tech Founders",
    description: "Personalized outbound pitch notes with TAM/SAM metrics and traction deck.",
    tags: ["GROWTH", "TONIGHT"],
    status: "todo",
  },
];

export function TwinArtifact() {
  const [tasks, setTasks] = useState<AutonomousTask[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("shothik_twin_tasks");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_TWIN_TASKS;
  });

  const [isAutoMode, setIsAutoMode] = useState(true);
  const [isNightshift, setIsNightshift] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [activeEpistemicNodes, setActiveEpistemicNodes] = useState<any[]>([]);

  const [feed, setFeed] = useState([
    {
      id: "f-1",
      sender: "Shothik (Autonomous Twin)",
      time: "12:16 AM",
      text: "Nightshift active: Executing priority backlog tasks at 2:00 AM. Learned rules synced with Epistemic Memory DAG.",
    },
  ]);

  // Load epistemic nodes and persistent feed
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedFeed = localStorage.getItem("shothik_twin_feed");
        if (storedFeed) {
          const parsed = JSON.parse(storedFeed);
          if (Array.isArray(parsed) && parsed.length > 0) setFeed(parsed);
        }
        setActiveEpistemicNodes(epistemicGraphMemory.getActiveNodes());
      } catch {}
    }
  }, []);

  // Sync tasks to localStorage whenever modified
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("shothik_twin_tasks", JSON.stringify(tasks));
        window.dispatchEvent(new CustomEvent("shothik_twin_tasks_updated", { detail: { tasks } }));
      } catch {}
    }
  }, [tasks]);

  // Sync feed to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("shothik_twin_feed", JSON.stringify(feed));
      } catch {}
    }
  }, [feed]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");

    // 1. Commit directive into Epistemic DAG
    epistemicGraphMemory.addDecision(userMsg, "DECISION", 0.95);
    setActiveEpistemicNodes(epistemicGraphMemory.getActiveNodes());

    // 2. Synthesize new autonomous task
    const newTask: AutonomousTask = {
      id: `task-${Date.now()}`,
      title: userMsg.slice(0, 50),
      description: userMsg,
      tags: ["AUTONOMOUS", "1 CREDIT", "TONIGHT"],
      status: "in_progress",
    };
    setTasks((prev) => [newTask, ...prev]);

    setFeed((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "Founder (You)",
        time: "Just now",
        text: userMsg,
      },
      {
        id: `twin-${Date.now()}`,
        sender: "Shothik (Autonomous Twin)",
        time: "Just now",
        text: `Understood: "${userMsg}". I have synthesized a priority execution task and linked this rule to the Epistemic Memory DAG with automated conflict superseding.`,
      },
    ]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: t.status === "completed" ? "todo" : "completed",
            }
          : t
      )
    );
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Header ── */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Autonomous Twin Founder Studio</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 font-semibold">
                Polsia AI Engine
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Autonomous task scheduler, nightshift execution, and direct cockpit telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAutoMode(!isAutoMode)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border",
              isAutoMode
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isAutoMode ? "Auto Mode: ON" : "Auto Mode: OFF"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNightshift(!isNightshift)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border",
              isNightshift
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Nightshift: {isNightshift ? "Active" : "Paused"}</span>
          </button>

          <a
            href="/twin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-xs transition"
          >
            <span>Open Cockpit</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* ── Main Viewport Grid ── */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Left Column: Autonomous Task Backlog */}
        <div className="md:col-span-6 flex flex-col h-full bg-card/40 overflow-hidden">
          <div className="h-11 px-4 border-b border-border flex items-center justify-between bg-muted/20 shrink-0">
            <span className="text-xs font-bold text-foreground flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              <span>Queued Autonomous Tasks ({tasks.length})</span>
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Auto-Executed at Night</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={cn(
                  "p-3.5 rounded-xl border transition cursor-pointer space-y-2",
                  task.status === "completed"
                    ? "bg-muted/20 border-border/40 opacity-60"
                    : "bg-background border-border/80 hover:border-violet-500/40 shadow-xs"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2
                      className={cn(
                        "w-4 h-4 mt-0.5 shrink-0 transition",
                        task.status === "completed" ? "text-emerald-400" : "text-muted-foreground"
                      )}
                    />
                    <div className="space-y-1">
                      <h4
                        className={cn(
                          "text-xs font-bold leading-snug",
                          task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"
                        )}
                      >
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pl-6">
                  {task.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/50"
                    >
                      {tag}
                    </span>
                  ))}
                  {task.status === "in_progress" && (
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <Activity className="w-2.5 h-2.5 animate-pulse" />
                      <span>IN PROGRESS</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Founder Standup Feed & Epistemic DAG */}
        <div className="md:col-span-6 flex flex-col h-full bg-background overflow-hidden">
          <div className="h-11 px-4 border-b border-border flex items-center justify-between bg-muted/20 shrink-0">
            <span className="text-xs font-bold text-foreground flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Founder Standup & Epistemic DAG</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">● Live Connection</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Epistemic DAG Rules Pill Box */}
            {activeEpistemicNodes.length > 0 && (
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30 space-y-1.5 mb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-300">
                  <Brain className="w-3.5 h-3.5 text-violet-400" />
                  <span>Authoritative Epistemic DAG Rules ({activeEpistemicNodes.length})</span>
                </div>
                <div className="space-y-1 max-h-28 overflow-y-auto custom-scrollbar">
                  {activeEpistemicNodes.map((node) => (
                    <div key={node.id} className="text-[10px] text-zinc-300 flex items-start gap-1 font-mono">
                      <span className="text-emerald-400 font-bold">• [{node.topic}]:</span>
                      <span className="truncate">{node.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {feed.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "p-3.5 rounded-xl border text-xs space-y-1.5 leading-relaxed",
                  msg.sender.includes("You")
                    ? "bg-violet-500/5 border-violet-500/20 ml-6"
                    : "bg-muted/30 border-border mr-6"
                )}
              >
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="font-bold text-foreground">{msg.sender}</span>
                  <span>{msg.time}</span>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Directive Input */}
          <div className="p-3 border-t border-border bg-muted/10 shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Give autonomous directive (e.g., 'Switch courier to Steadfast')..."
                className="flex-1 text-xs bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-violet-400"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-xs transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwinArtifact;
