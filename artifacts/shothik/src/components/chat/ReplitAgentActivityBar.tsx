"use client";

import { useState } from "react";
import { Terminal, Loader2, CheckCircle2, ChevronDown, Sparkles, Cpu, Zap, FileText, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReplitStep {
  id: string;
  label: string;
  detail?: string;
  status: "pending" | "running" | "done" | "error";
  type?: "tool" | "search" | "code" | "think";
}

interface ReplitAgentActivityBarProps {
  isStreaming?: boolean;
  statusText?: string;
  steps?: ReplitStep[];
  className?: string;
}

export function ReplitAgentActivityBar({
  isStreaming = false,
  statusText = "Replit Agent active…",
  steps: customSteps,
  className,
}: ReplitAgentActivityBarProps) {
  const [expanded, setExpanded] = useState(false);

  const defaultSteps: ReplitStep[] = [
    { id: "s1", label: "Inspecting workspace files & RAG context", status: "done", type: "read" },
    { id: "s2", label: "Running Python calculation engine", status: isStreaming ? "running" : "done", type: "code" },
    { id: "s3", label: "Compiling presentation slide deck", status: isStreaming ? "pending" : "done", type: "tool" },
    { id: "s4", label: "Formatting markdown response", status: isStreaming ? "pending" : "done", type: "think" },
  ];

  const steps = customSteps || defaultSteps;
  const activeStep = steps.find((s) => s.status === "running") || steps.find((s) => s.status === "pending") || steps[steps.length - 1];
  const completedCount = steps.filter((s) => s.status === "done").length;
  const totalCount = steps.length;

  if (!isStreaming && completedCount === 0) return null;

  return (
    <div className={cn("my-3 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent overflow-hidden shadow-sm transition-all", className)}>
      
      {/* ── Main Activity Header Bar ── */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
            {isStreaming ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1">
                <Cpu className="h-3 w-3 text-indigo-400" />
                Replit Agent Activity
              </span>
              <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-2 py-0.5 text-[9px] font-mono font-bold text-indigo-300 border border-indigo-500/30">
                Step {completedCount + (isStreaming ? 1 : 0)}/{totalCount}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-mono">
              {isStreaming ? (activeStep?.label || statusText) : "All agent tasks completed"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-muted-foreground/60 font-mono hidden sm:inline">
            {expanded ? "Hide Details" : "View Logs"}
          </span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", expanded && "rotate-180")} />
        </div>
      </button>

      {/* ── Expandable Agent Step Drawer ── */}
      {expanded && (
        <div className="border-t border-border/40 bg-background/50 px-3.5 py-2.5 space-y-2">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-start gap-2.5 text-xs">
              <div className="shrink-0 mt-0.5">
                {step.status === "done" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : step.status === "running" ? (
                  <Loader2 className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full border border-border/60 bg-muted/40" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("font-mono text-[11px]", step.status === "running" ? "text-indigo-300 font-bold" : step.status === "done" ? "text-foreground" : "text-muted-foreground/60")}>
                  {idx + 1}. {step.label}
                </p>
                {step.detail && <p className="text-[10px] text-muted-foreground">{step.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
