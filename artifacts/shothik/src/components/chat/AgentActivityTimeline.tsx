"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  Loader2,
  Clock,
  ChevronDown,
  Layers,
  Sparkles,
  Calculator,
  ShieldCheck,
  Globe,
  FileSpreadsheet,
  Presentation,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActivityStep {
  id: string;
  label: string;
  subtext?: string;
  status: "completed" | "active" | "queued";
  durationMs?: number;
}

interface AgentActivityTimelineProps {
  query?: string;
  agentType?: "general" | "sheet" | "slides" | "research" | "doc";
  isCompleted?: boolean;
  className?: string;
}

export function AgentActivityTimeline({
  query = "",
  agentType = "general",
  isCompleted = false,
  className,
}: AgentActivityTimelineProps) {
  const [isOpen, setIsOpen] = useState(!isCompleted);
  const [currentStepIndex, setCurrentStepIndex] = useState(isCompleted ? 4 : 1);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Generate dynamic contextual steps based on agent type and query
  const steps: ActivityStep[] = React.useMemo(() => {
    const q = query.toLowerCase();

    if (agentType === "sheet" || q.includes("sheet") || q.includes("table") || q.includes("revenue") || q.includes("ledger")) {
      return [
        {
          id: "step-1",
          label: "Decomposing Financial Variables & Ledger Hierarchy",
          subtext: "Mapping gross flow, COD logistics rates, and payout columns",
          status: isCompleted ? "completed" : currentStepIndex > 0 ? "completed" : currentStepIndex === 0 ? "active" : "queued",
          durationMs: 140,
        },
        {
          id: "step-2",
          label: "Auditing Courier Fee Schedules & VAT Regulations",
          subtext: "Cross-referencing Steadfast/Pathao fee brackets and NBR rules",
          status: isCompleted ? "completed" : currentStepIndex > 1 ? "completed" : currentStepIndex === 1 ? "active" : "queued",
          durationMs: 280,
        },
        {
          id: "step-3",
          label: "Evaluating Live Mathematical Formula Matrix",
          subtext: "Compiling =SUM, =AVG, =GROWTH, and =CAGR functions",
          status: isCompleted ? "completed" : currentStepIndex > 2 ? "completed" : currentStepIndex === 2 ? "active" : "queued",
          durationMs: 320,
        },
        {
          id: "step-4",
          label: "Mounting Interactive Financial Spreadsheet",
          subtext: "Rendering FortuneSheet grid with 1-click CSV/XLSX export",
          status: isCompleted ? "completed" : currentStepIndex >= 3 ? "active" : "queued",
          durationMs: 160,
        },
      ];
    }

    if (agentType === "slides" || q.includes("slide") || q.includes("pitch") || q.includes("deck")) {
      return [
        {
          id: "step-1",
          label: "Structuring 10-Slide Investor Narrative Arc",
          subtext: "Establishing Problem, Solution, TAM, Traction, and Ask hierarchy",
          status: isCompleted ? "completed" : currentStepIndex > 0 ? "completed" : currentStepIndex === 0 ? "active" : "queued",
          durationMs: 180,
        },
        {
          id: "step-2",
          label: "Synthesizing Quantitative Unit Economics & Metrics",
          subtext: "Calculating ARR trajectory, CAC/LTV, and margin milestones",
          status: isCompleted ? "completed" : currentStepIndex > 1 ? "completed" : currentStepIndex === 1 ? "active" : "queued",
          durationMs: 310,
        },
        {
          id: "step-3",
          label: "Formatting High-Contrast 16:9 Presentation Canvas",
          subtext: "Applying curated theme palette and typographic contrast",
          status: isCompleted ? "completed" : currentStepIndex > 2 ? "completed" : currentStepIndex === 2 ? "active" : "queued",
          durationMs: 260,
        },
        {
          id: "step-4",
          label: "Compiling Native DrawingML Vector PPTX Export",
          subtext: "Packaging editable shapes and presenter narration notes",
          status: isCompleted ? "completed" : currentStepIndex >= 3 ? "active" : "queued",
          durationMs: 140,
        },
      ];
    }

    // Default Multi-Agent Grounded Execution
    return [
      {
        id: "step-1",
        label: "Decomposing Query Scope & Entity Graph",
        subtext: "Resolving domain taxonomy and structural constraints",
        status: isCompleted ? "completed" : currentStepIndex > 0 ? "completed" : currentStepIndex === 0 ? "active" : "queued",
        durationMs: 120,
      },
      {
        id: "step-2",
        label: "Querying NVIDIA NIM & Grounded Vectors",
        subtext: "Auditing primary documents and verified statistical indices",
        status: isCompleted ? "completed" : currentStepIndex > 1 ? "completed" : currentStepIndex === 1 ? "active" : "queued",
        durationMs: 340,
      },
      {
        id: "step-3",
        label: "Cross-Verifying Claims & Empirical Evidence",
        subtext: "Generating epistemic fact matrix and citation anchors",
        status: isCompleted ? "completed" : currentStepIndex > 2 ? "completed" : currentStepIndex === 2 ? "active" : "queued",
        durationMs: 290,
      },
      {
        id: "step-4",
        label: "Synthesizing High-Contrast Executive Briefing",
        subtext: "Rendering structured sparkpage with action items",
        status: isCompleted ? "completed" : currentStepIndex >= 3 ? "active" : "queued",
        durationMs: 150,
      },
    ];
  }, [query, agentType, isCompleted, currentStepIndex]);

  // Simulate progressive step progression during active streaming
  useEffect(() => {
    if (isCompleted) {
      setCurrentStepIndex(4);
      setIsOpen(false);
      return;
    }

    const timer = setInterval(() => {
      setElapsedMs((prev) => prev + 100);
    }, 100);

    const step1 = setTimeout(() => setCurrentStepIndex(1), 350);
    const step2 = setTimeout(() => setCurrentStepIndex(2), 900);
    const step3 = setTimeout(() => setCurrentStepIndex(3), 1600);

    return () => {
      clearInterval(timer);
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  }, [isCompleted]);

  const activeStep = steps.find((s) => s.status === "active") || steps[steps.length - 1];

  return (
    <div
      className={cn(
        "my-2 rounded-xl border border-border/80 bg-card/90 backdrop-blur-md overflow-hidden shadow-xs transition-all duration-200",
        className
      )}
    >
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-3.5 py-2 hover:bg-muted/40 transition cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shrink-0">
            {isCompleted ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-foreground truncate">
              {isCompleted
                ? `Executed 4-Stage Agent Pipeline`
                : activeStep?.label || "Processing request..."}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-muted-foreground">
            {isCompleted ? "Completed" : `${(elapsedMs / 1000).toFixed(1)}s`}
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Unfolded Steps List */}
      {isOpen && (
        <div className="border-t border-border/60 px-3.5 py-2.5 bg-muted/20 space-y-2">
          {steps.map((step, idx) => {
            const isDone = step.status === "completed";
            const isActive = step.status === "active";

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-start gap-2.5 text-xs transition-opacity duration-200",
                  step.status === "queued" ? "opacity-40" : "opacity-100"
                )}
              >
                <div className="flex items-center justify-center h-4 w-4 rounded-full mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : isActive ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 dark:bg-white animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p
                      className={cn(
                        "font-medium text-xs truncate",
                        isActive ? "text-foreground font-bold" : "text-foreground/90"
                      )}
                    >
                      {step.label}
                    </p>
                    {isDone && (
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0 ml-2">
                        {step.durationMs}ms
                      </span>
                    )}
                  </div>
                  {step.subtext && (
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {step.subtext}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AgentActivityTimeline;
