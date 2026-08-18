"use client";

import { useState } from "react";
import {
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Receipt,
  UserCheck,
  MessageSquareWarning,
  Coins,
  Send,
} from "lucide-react";
import { LiquidGlassCard } from "../LiquidGlassCard";
import { cn } from "@/lib/utils";

export interface DisputeCase {
  id: string;
  orderId: string;
  customerName: string;
  phone: string;
  reason: string;
  amount: number;
  sentiment: "Frustrated" | "Urgent" | "Neutral";
  status: "Open" | "Refunded" | "Exchanged";
  resolutionPlan: string;
}

const DISPUTES: DisputeCase[] = [
  {
    id: "dsp-101",
    orderId: "ORD-9921",
    customerName: "Sultana Begum",
    phone: "+8801728394812",
    reason: "Steadfast rider delivered Panjabi with torn packaging and grease stain.",
    amount: 1850,
    sentiment: "Frustrated",
    status: "Open",
    resolutionPlan: "Immediate ৳200 bKash delivery refund + replacement piece dispatched within 24h.",
  },
  {
    id: "dsp-102",
    orderId: "ORD-9928",
    customerName: "Kamrul Islam",
    phone: "+8801839281744",
    reason: "Wrong shoe size delivered (Received Size 40 instead of Size 42).",
    amount: 2400,
    sentiment: "Urgent",
    status: "Open",
    resolutionPlan: "Free reverse parcel pickup via Steadfast + Size 42 expedited reship.",
  },
  {
    id: "dsp-103",
    orderId: "ORD-9844",
    customerName: "Zubair Rahman",
    phone: "+8801918273645",
    reason: "Duplicate bKash payment charged due to network timeout at checkout.",
    amount: 500,
    sentiment: "Neutral",
    status: "Refunded",
    resolutionPlan: "Automatic bKash refund processed via Merchant API transaction reversal.",
  },
];

export function DisputeResolutionArtifact() {
  const [cases, setCases] = useState<DisputeCase[]>(DISPUTES);
  const [selectedCase, setSelectedCase] = useState<DisputeCase>(DISPUTES[0]);
  const [isRefunding, setIsRefunding] = useState(false);

  const handleApproveRefund = () => {
    setIsRefunding(true);
    setTimeout(() => {
      setCases((prev) =>
        prev.map((c) => (c.id === selectedCase.id ? { ...c, status: "Refunded" } : c))
      );
      setSelectedCase((prev) => ({ ...prev, status: "Refunded" }));
      setIsRefunding(false);
    }, 1200);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Header ── */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Dispute & Refund Resolution Studio</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold">
                bKash Escrow Triage
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Automated damaged parcel handling, customer sentiment triage, and instant MFS refund disbursement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleApproveRefund}
            disabled={isRefunding || selectedCase.status === "Refunded"}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold shadow-xs transition cursor-pointer",
              selectedCase.status === "Refunded"
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-rose-600 hover:bg-rose-500"
            )}
          >
            {isRefunding ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Disbursing bKash ৳{selectedCase.amount}...</span>
              </>
            ) : selectedCase.status === "Refunded" ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Refund Completed</span>
              </>
            ) : (
              <>
                <Coins className="w-3.5 h-3.5" />
                <span>Disburse Refund (৳{selectedCase.amount})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Main Viewport Grid ── */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Left Column: Dispute Cases List */}
        <div className="md:col-span-5 flex flex-col h-full bg-card/40 overflow-y-auto p-4 space-y-3">
          <span className="text-xs font-bold text-muted-foreground uppercase font-mono tracking-wider">
            Active Disputes ({cases.filter((c) => c.status === "Open").length} Open)
          </span>

          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className={cn(
                "p-3.5 rounded-2xl border transition cursor-pointer space-y-2",
                selectedCase.id === c.id
                  ? "bg-rose-500/10 border-rose-500 shadow-sm ring-1 ring-rose-500/30"
                  : "bg-card border-border/70 hover:border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">{c.customerName}</h4>
                  <span className="text-[10px] font-mono text-muted-foreground">{c.orderId}</span>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border",
                    c.status === "Refunded"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse"
                  )}
                >
                  {c.status}
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                {c.reason}
              </p>

              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/50">
                <span>৳{c.amount} BDT</span>
                <span className="text-amber-400 font-semibold">{c.sentiment}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Case Deep-Dive & AI Remediation */}
        <div className="md:col-span-7 flex flex-col h-full bg-background p-6 overflow-y-auto space-y-5">
          <div className="p-5 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">{selectedCase.customerName}</h3>
                <span className="text-xs font-mono text-muted-foreground">{selectedCase.phone}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-muted-foreground block">Claim Amount</span>
                <span className="text-base font-bold font-mono text-rose-400">
                  ৳{selectedCase.amount} BDT
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider">
                Customer Grievance Report
              </span>
              <p className="text-xs text-foreground bg-muted/30 p-3 rounded-xl border border-border/60 leading-relaxed">
                "{selectedCase.reason}"
              </p>
            </div>
          </div>

          {/* AI Remediation Recommendation */}
          <div className="p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-foreground">
                DeepSeek AI Remediation Policy (Zero Churn Protocol)
              </h4>
            </div>

            <p className="text-xs text-foreground leading-relaxed">
              {selectedCase.resolutionPlan}
            </p>

            <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground pt-2">
              <span>Merchant Risk Score:</span>
              <span className="text-emerald-400 font-bold">0.12 (Verified Low Risk)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisputeResolutionArtifact;
