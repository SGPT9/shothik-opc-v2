import { useState } from "react";
import { ChevronDown, Terminal, CheckCircle2, Loader2, Search, Globe, FileText, Zap, Database, Scale, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AgentStep {
  id: string;
  type: "tool_call" | "search" | "read" | "think" | "code" | "write" | "rag" | "verify" | "memory" | "mcp";
  label: string;
  detail?: string;
  status: "pending" | "running" | "done" | "error";
  durationMs?: number;
}

const STEP_ICONS: Record<AgentStep["type"], React.ElementType> = {
  tool_call: Terminal,
  search: Search,
  read: FileText,
  think: Zap,
  code: Terminal,
  write: FileText,
  rag: Database,
  verify: Scale,
  memory: Brain,
  mcp: Globe,
};

const STEP_COLORS: Record<AgentStep["type"], string> = {
  tool_call: "text-violet-400",
  search: "text-sky-400",
  read: "text-amber-400",
  think: "text-indigo-400",
  code: "text-emerald-400",
  write: "text-rose-400",
  rag: "text-cyan-400",
  verify: "text-amber-300",
  memory: "text-purple-400",
  mcp: "text-emerald-400",
};

interface AssistantStepsProps {
  steps: AgentStep[];
  collapsed?: boolean;
}

export function AssistantSteps({ steps, collapsed = true }: AssistantStepsProps) {
  const [open, setOpen] = useState(!collapsed);

  if (!steps || steps.length === 0) return null;

  const doneCount = steps.filter((s) => s.status === "done").length;
  const isRunning = steps.some((s) => s.status === "running");

  return (
    <div className="my-3 rounded-xl border border-border/60 bg-muted/10 overflow-hidden">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-muted/20 transition"
      >
        {isRunning ? (
          <Loader2 className="h-3.5 w-3.5 text-brand animate-spin shrink-0" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5 text-brand shrink-0" />
        )}
        <span className="flex-1 text-xs font-semibold text-muted-foreground">
          {isRunning
            ? `Running agent steps…`
            : `${doneCount} step${doneCount !== 1 ? "s" : ""} completed`}
        </span>
        <span className="text-[10px] text-muted-foreground/50 font-mono mr-1">
          {steps.length} actions
        </span>
        <ChevronDown className={cn(
          "h-3.5 w-3.5 text-muted-foreground/40 transition-transform duration-200",
          open && "rotate-180"
        )} />
      </button>

      {/* Steps list */}
      {open && (
        <div className="border-t border-border/40 divide-y divide-border/20">
          {steps.map((step, i) => {
            const Icon = STEP_ICONS[step.type] || Terminal;
            const color = STEP_COLORS[step.type] || "text-muted-foreground";

            return (
              <div key={step.id} className="flex items-start gap-3 px-3.5 py-2.5">
                {/* Step number + icon */}
                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                  <span className="text-[10px] font-mono text-muted-foreground/40 w-4 text-right">
                    {i + 1}
                  </span>
                  <div className={cn("h-5 w-5 flex items-center justify-center rounded-md bg-muted/30", color)}>
                    <Icon className="h-3 w-3" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-foreground truncate">{step.label}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {step.durationMs && (
                        <span className="text-[9px] text-muted-foreground/40 font-mono">
                          {step.durationMs < 1000
                            ? `${step.durationMs}ms`
                            : `${(step.durationMs / 1000).toFixed(1)}s`}
                        </span>
                      )}
                      {step.status === "running" && (
                        <Loader2 className="h-3 w-3 text-brand animate-spin" />
                      )}
                      {step.status === "done" && (
                        <CheckCircle2 className="h-3 w-3 text-brand" />
                      )}
                      {step.status === "error" && (
                        <span className="h-3 w-3 rounded-full bg-destructive/80 flex items-center justify-center">
                          <span className="text-[8px] text-white font-bold">!</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {step.detail && (
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5 leading-relaxed font-mono truncate">
                      {step.detail}
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
