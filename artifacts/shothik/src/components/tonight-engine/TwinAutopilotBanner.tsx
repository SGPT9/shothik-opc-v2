"use client";

import { useState } from "react";
import {
  Moon,
  Sparkles,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe,
  Table2,
  Presentation,
  Code2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TwinAutopilotBannerProps {
  /** Prompt that initiated the autopilot run */
  prompt?: string;
  /** Callback to open a specific artifact tab in the side panel */
  onOpenArtifact?: (tab: "slides" | "sheet" | "research" | "code") => void;
  /** Callback to close/dismiss the autopilot banner */
  onClose?: () => void;
}

export type ExecutionStepId = "plan" | "scan" | "swarm" | "verify" | "deploy";

interface StepConfig {
  id: ExecutionStepId;
  label: string;
  desc: string;
}

const STEPS: StepConfig[] = [
  { id: "plan",   label: "1. Swarm Plan",  desc: "DAG topology & step assignment" },
  { id: "scan",   label: "2. Deep Scan",   desc: "Wigolo search & RAG memory vault" },
  { id: "swarm",  label: "3. Swarm Execution", desc: "DeerFlow multi-agent DAG" },
  { id: "verify", label: "4. Audit & Verify", desc: "ScenarioLab 100-run simulation" },
  { id: "deploy", label: "5. Deliver & Deploy", desc: "Dokploy SSL & bKash monetization" },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Polsia-style Twin Autopilot Execution Card.
 * Appears above the transcript when Twin Autopilot is enabled.
 * Displays live step-by-step state graph execution, extracted metrics,
 * and direct links to open generated Artifacts in the right panel.
 */
export function TwinAutopilotBanner({
  prompt = "Build pitch deck, financial sheet, & deploy custom domain site",
  onOpenArtifact,
  onClose,
}: TwinAutopilotBannerProps) {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(2); // 3. Swarm Execution
  const [isExpanded, setIsExpanded]           = useState<boolean>(true);

  const currentStep = STEPS[activeStepIndex] ?? STEPS[0];
  const progressPercent = Math.round(((activeStepIndex + 1) / STEPS.length) * 100);

  return (
    <div className="mx-auto max-w-3xl w-full my-3 px-1 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-950 to-indigo-950/40 p-4 shadow-xl backdrop-blur-md">

        {/* ── Top Header ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
              <Moon className="h-4 w-4 text-purple-400 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-foreground tracking-wide">
                  Twin Autopilot Active
                </span>
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300 border border-purple-500/30">
                  Overnight Mode
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Step {activeStepIndex + 1} of {STEPS.length} ({progressPercent}%)
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                Objective: <span className="text-foreground/90 font-medium">{prompt}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Dismiss banner"
                className="h-6 w-6 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Expanded Content (Polsia Step Graph + Deliverables) ── */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-purple-500/20 space-y-3">

            {/* Step timeline bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {STEPS.map((step, idx) => {
                const isDone    = idx < activeStepIndex;
                const isCurrent = idx === activeStepIndex;
                return (
                  <div
                    key={step.id}
                    className={cn(
                      "rounded-xl border p-2 text-left transition-all",
                      isCurrent
                        ? "bg-purple-500/15 border-purple-500/50 text-purple-200 shadow-sm"
                        : isDone
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-muted/30 border-border/40 text-muted-foreground/60",
                    )}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold truncate">{step.label}</span>
                      {isDone && <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />}
                      {isCurrent && <Loader2 className="h-3 w-3 text-purple-400 animate-spin shrink-0" />}
                    </div>
                    <p className="text-[9px] text-muted-foreground/80 mt-0.5 line-clamp-1">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Real-time Deliverables Shortcuts */}
            <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
              <span className="text-[11px] font-semibold text-purple-300/90 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-purple-400" />
                Live Artifact Deliverables:
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Slides deliverable shortcut */}
                <button
                  type="button"
                  onClick={() => onOpenArtifact?.("slides")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 transition shadow-sm"
                >
                  <Presentation className="h-3 w-3" />
                  <span>Slides Deck</span>
                  <ChevronRight className="h-2.5 w-2.5" />
                </button>

                {/* Sheet deliverable shortcut */}
                <button
                  type="button"
                  onClick={() => onOpenArtifact?.("sheet")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition shadow-sm"
                >
                  <Table2 className="h-3 w-3" />
                  <span>Financial Sheet</span>
                  <ChevronRight className="h-2.5 w-2.5" />
                </button>

                {/* Research deliverable shortcut */}
                <button
                  type="button"
                  onClick={() => onOpenArtifact?.("research")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30 hover:bg-violet-500/25 transition shadow-sm"
                >
                  <Globe className="h-3 w-3" />
                  <span>Research Report</span>
                  <ChevronRight className="h-2.5 w-2.5" />
                </button>

                {/* Code deliverable shortcut */}
                <button
                  type="button"
                  onClick={() => onOpenArtifact?.("code")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition shadow-sm"
                >
                  <Code2 className="h-3 w-3" />
                  <span>Code Sandbox</span>
                  <ChevronRight className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
