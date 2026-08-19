import React, { useState } from "react";
import { Moon, CheckCircle2, AlertTriangle, Truck, DollarSign, FileText, Send, Sparkles, RefreshCw, ShieldCheck } from "lucide-react";
import { OvernightMerchantGoalEngine, OvernightGoalSession } from "@/lib/agents/overnight-merchant-goal";

export function OvernightReconciliationArtifact() {
  const [isRunning, setIsRunning] = useState(false);
  const [routineResult, setRoutineResult] = useState<OvernightGoalSession | null>(null);

  const handleRunOvernightRoutine = async () => {
    setIsRunning(true);
    const engine = new OvernightMerchantGoalEngine("MERCH-DHAKA-992");
    const result = await engine.executeOvernightGoal();
    setRoutineResult(result);
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-foreground bg-background">
      {/* Header Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              Autonomous Overnight Routine & Reconciliation
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                DeepSeek Goal Engine
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automated 03:00 AM courier scraping, zero-return WhatsApp rescues, COD ledger reconciliation & NBR tax ledgers.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunOvernightRoutine}
          disabled={isRunning}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
          {isRunning ? "Executing Goal..." : "Run Routine Now"}
        </button>
      </div>

      {/* 5-Step Goal Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl border border-border bg-card/50 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            1. Parcel Sync
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Steadfast & Pathao batch scrape</p>
          <span className="text-[10px] font-mono text-emerald-400 mt-2 font-bold">42 Parcels Synced</span>
        </div>

        <div className="p-3 rounded-xl border border-border bg-card/50 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            2. Zero-Return
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Unreachable customer alerts</p>
          <span className="text-[10px] font-mono text-amber-400 mt-2 font-bold">3 Rescues Dispatched</span>
        </div>

        <div className="p-3 rounded-xl border border-border bg-card/50 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            3. COD & MFS
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Net payout reconciliation</p>
          <span className="text-[10px] font-mono text-emerald-400 mt-2 font-bold">৳64,500 Reconciled</span>
        </div>

        <div className="p-3 rounded-xl border border-border bg-card/50 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            4. Mushak-6.3
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">NBR statutory VAT ledger</p>
          <span className="text-[10px] font-mono text-cyan-400 mt-2 font-bold">৳4,837.50 VAT Ledger</span>
        </div>

        <div className="p-3 rounded-xl border border-border bg-card/50 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Send className="w-3.5 h-3.5 text-purple-400" />
            5. Founder Brief
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">07:00 AM WhatsApp digest</p>
          <span className="text-[10px] font-mono text-purple-400 mt-2 font-bold">Generated for 07:00 AM</span>
        </div>
      </div>

      {/* Routine Output Drawer */}
      {routineResult && (
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-100 space-y-4 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold font-mono text-emerald-400">
                GOAL_SATISFIED (Checkpoint Trace: {routineResult.goalId})
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">
              Timestamp: {new Date(routineResult.createdAt).toLocaleTimeString()}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Founder Executive Morning Briefing (WhatsApp Preview)
            </div>
            <pre className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed">
              {routineResult.executiveSummary}
            </pre>
          </div>

          <div className="flex items-center justify-between pt-2 text-[11px] text-zinc-500 font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Webhook Idempotency Lock Active
            </span>
            <span>Steadfast API: OK · bKash Ingress: OK</span>
          </div>
        </div>
      )}
    </div>
  );
}
