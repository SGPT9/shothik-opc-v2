"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Terminal,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  DollarSign,
  Layers,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TrajectoryStep {
  id: number;
  timestamp: string;
  type: "prompt" | "tool_call" | "file_edit" | "assertion" | "output";
  title: string;
  detail: string;
  tokens: number;
  costUSD: number;
  status: "success" | "running" | "pending";
}

interface TrajectoryReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionTitle?: string;
  modelUsed?: string;
  steps?: TrajectoryStep[];
}

export function TrajectoryReceiptModal({
  open,
  onOpenChange,
  sessionTitle = "Billing Proration & Autonomous Task Execution",
  modelUsed = "DeepSeek V4 Flash",
  steps: customSteps,
}: TrajectoryReceiptModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);

  // Global Escape key listener to dismiss modal
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const defaultSteps: TrajectoryStep[] = [
    {
      id: 1,
      timestamp: "0.0s",
      type: "prompt",
      title: "Goal Received & Taxonomy Decomposed",
      detail: "Decomposed prompt into multi-step execution plan: inspect test harness, locate proration math, verify 14 test suites.",
      tokens: 420,
      costUSD: 0.003,
      status: "success",
    },
    {
      id: 2,
      timestamp: "0.8s",
      type: "tool_call",
      title: "Sandbox Test Execution (Initial State)",
      detail: "Executed `vitest run billing.test.ts`. Result: 14 tests, 8 passed, 6 failed on mid-cycle upgrade proration math.",
      tokens: 650,
      costUSD: 0.005,
      status: "success",
    },
    {
      id: 3,
      timestamp: "1.4s",
      type: "file_edit",
      title: "File Edit: `billing-engine.ts` (Lines 48-56)",
      detail: "Identified math error: proration math truncated before multiplication. Rewrote to: `Math.round((subtotal * days) / totalDays)` (Multiply first, round once). Did not touch test files.",
      tokens: 580,
      costUSD: 0.004,
      status: "success",
    },
    {
      id: 4,
      timestamp: "2.1s",
      type: "assertion",
      title: "Sandbox Test Verification (Post-Fix)",
      detail: "Re-ran test harness `vitest run billing.test.ts`. Result: 14 out of 14 passed (100% green suite in 260ms).",
      tokens: 410,
      costUSD: 0.003,
      status: "success",
    },
    {
      id: 5,
      timestamp: "2.5s",
      type: "output",
      title: "Final Output Synthesis & Audit Receipt",
      detail: "Grounded solution formatted with diff viewer and verified against PostgreSQL ledger.",
      tokens: 380,
      costUSD: 0.003,
      status: "success",
    },
  ];

  const steps = customSteps || defaultSteps;
  const totalTokens = steps.reduce((sum, s) => sum + s.tokens, 0);
  const totalCost = steps.reduce((sum, s) => sum + s.costUSD, 0);
  const totalCostBDT = Math.round(totalCost * 122 * 100) / 100; // 1 USD = ~122 BDT

  const handleCopyTrail = () => {
    const text = `--- SHOTHIK AUDIT RECEIPT TRAIL ---\nSession: ${sessionTitle}\nModel: ${modelUsed}\nTotal Tokens: ${totalTokens}\nTotal Cost: $${totalCost.toFixed(3)} (৳${totalCostBDT} BDT)\n\n` +
      steps.map((s) => `[${s.timestamp}] ${s.title}\nDetail: ${s.detail}\nTokens: ${s.tokens} ($${s.costUSD.toFixed(4)})\n`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden bg-card border-border shadow-2xl flex flex-col">
        {/* Top Header */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Trajectory View & Audit Receipt Trail
                </DialogTitle>
                <p className="text-xs text-muted-foreground font-mono">
                  Append-only replayable execution log · {modelUsed}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyTrail}
                aria-label={copied ? "Copied audit receipt" : "Copy audit receipt"}
                className="flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied Receipt" : "Copy Receipt"}</span>
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Metric Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-0 border-b border-border/80 bg-muted/10 px-6 py-3 text-xs font-mono shrink-0">
          <div>
            <p className="text-[10px] text-muted-foreground">MODEL ENGINE</p>
            <p className="font-bold text-indigo-400 truncate">{modelUsed}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">TOTAL TOKENS</p>
            <p className="font-bold text-foreground">{totalTokens.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">INFERENCE COST (USD)</p>
            <p className="font-bold text-emerald-400">${totalCost.toFixed(3)} (~1.8¢)</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">MFS RATE (BDT)</p>
            <p className="font-bold text-cyan-400">৳{totalCostBDT} BDT</p>
          </div>
        </div>

        {/* Trajectory Step Timeline Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-foreground pb-1">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" /> Step-by-Step Trajectory Replay:
            </span>
            <span className="text-[10px] font-mono text-emerald-500 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 14/14 Tests Green (Verified)
            </span>
          </div>

          <div className="space-y-2.5">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={cn(
                  "p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 text-xs",
                  activeStep === step.id
                    ? "bg-indigo-950/20 border-indigo-500/50 shadow-xs"
                    : "bg-muted/30 border-border hover:border-border/80"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">
                      {step.id}
                    </span>
                    <span className="font-bold text-foreground">{step.title}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="text-muted-foreground">{step.timestamp}</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ${step.costUSD.toFixed(3)}
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground text-[11px] leading-relaxed pl-7">
                  {step.detail}
                </p>

                {activeStep === step.id && (
                  <div className="ml-7 mt-2 p-2.5 rounded-lg bg-background/80 border border-border text-[10px] font-mono text-muted-foreground flex items-center justify-between">
                    <span>Token Footprint: {step.tokens} tokens</span>
                    <span className="text-emerald-400 font-bold">Status: Completed · 0 Errors</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Policy */}
        <div className="px-6 py-3 border-t border-border bg-muted/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Off-Peak Nightshift Rate: 50% discount active (02:00 AM BST)</span>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            aria-label="Close trajectory view modal"
            className="min-h-[36px] sm:h-8 px-4 text-xs bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
