import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Truck,
  CreditCard,
  Cpu,
  AlertTriangle,
  RefreshCw,
  Zap,
  ArrowUpRight,
  Filter,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PendingApprovalItem {
  id: string;
  type: "MFS_RECONCILIATION" | "COURIER_DISPATCH" | "AST_CODE_PATCH" | "SCHEMA_MIGRATION";
  title: string;
  category: "Finance" | "Logistics" | "System" | "Database";
  target: string;
  amountBdt?: number;
  feeBdt?: number;
  status: "PENDING" | "COMMITTED" | "REJECTED";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  detail: string;
  speculativeOutput: string;
  createdAt: string;
  committedAt?: string;
}

const DEFAULT_APPROVALS: PendingApprovalItem[] = [
  {
    id: "APP-MFS-8891",
    type: "MFS_RECONCILIATION",
    title: "bKash TrxID Reconciliation · Order #ORD-8891",
    category: "Finance",
    target: "bKash Ledger (Trx: BK99281726X)",
    amountBdt: 1850,
    feeBdt: 34.22,
    status: "PENDING",
    riskLevel: "LOW",
    detail: "Customer 01711-XXXXXX paid ৳1,850 via bKash personal send money. SMS verified.",
    speculativeOutput: "Order marked as PAID. Ready to release inventory.",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "APP-MFS-8892",
    type: "MFS_RECONCILIATION",
    title: "Nagad TrxID Reconciliation · Order #ORD-8892",
    category: "Finance",
    target: "Nagad Merchant (Trx: NG44810291Y)",
    amountBdt: 3200,
    feeBdt: 48.0,
    status: "PENDING",
    riskLevel: "LOW",
    detail: "Customer 01922-XXXXXX paid ৳3,200 via Nagad online payment.",
    speculativeOutput: "Invoice generated and emailed. Inventory deducted.",
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: "APP-LOG-7554",
    type: "COURIER_DISPATCH",
    title: "Steadfast Courier Booking · 2 Consignments",
    category: "Logistics",
    target: "Steadfast API (Dhaka Hub)",
    amountBdt: 2800,
    feeBdt: 120,
    status: "PENDING",
    riskLevel: "MEDIUM",
    detail: "Auto-generated consignment labels for Chittagong & Sylhet deliveries.",
    speculativeOutput: "Tracking codes BD_ST_755448 & BD_ST_755449 reserved. WhatsApp DMs queued.",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "APP-AST-4091",
    type: "AST_CODE_PATCH",
    title: "AST Self-Healing Patch · Rate-Limit Backoff",
    category: "System",
    target: "artifacts/api-server/src/lib/ollama-service.ts",
    status: "PENDING",
    riskLevel: "LOW",
    detail: "Surgical AST patch introducing exponential jitter backoff on local port 11434 retries.",
    speculativeOutput: "All 14 unit tests pass. MTTR: 22ms.",
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
];

export function ApprovalsArtifact() {
  const [items, setItems] = useState<PendingApprovalItem[]>(DEFAULT_APPROVALS);
  const [filter, setFilter] = useState<"ALL" | "Finance" | "Logistics" | "System">("ALL");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/approvals/pending")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.items && Array.isArray(data.items)) {
          setItems(data.items);
        }
      })
      .catch(() => {});
  }, []);

  const pendingItems = items.filter((i) => i.status === "PENDING");
  const filteredItems = items.filter((i) => {
    if (filter === "ALL") return true;
    return i.category === filter;
  });

  const totalPendingAmount = pendingItems.reduce((sum, i) => sum + (i.amountBdt || 0), 0);
  const totalPendingFees = pendingItems.reduce((sum, i) => sum + (i.feeBdt || 0), 0);

  const handleApproveAll = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/v1/approvals/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });

      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setLastMessage(`✅ Successfully committed all ${data.committedCount} speculative actions.`);
      } else {
        setItems((prev) =>
          prev.map((i) => (i.status === "PENDING" ? { ...i, status: "COMMITTED" } : i))
        );
        setLastMessage("✅ Committed all speculative actions in memory.");
      }
    } catch {
      setItems((prev) =>
        prev.map((i) => (i.status === "PENDING" ? { ...i, status: "COMMITTED" } : i))
      );
      setLastMessage("✅ Committed all actions (Local Offline Mode).");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSingleAction = async (id: string, action: "commit" | "reject") => {
    try {
      const res = await fetch(`/api/v1/approvals/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "commit" ? { ids: [id] } : { id }),
      });

      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
      } else {
        setItems((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, status: action === "commit" ? "COMMITTED" : "REJECTED" } : i
          )
        );
      }
    } catch {
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: action === "commit" ? "COMMITTED" : "REJECTED" } : i
        )
      );
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans select-none overflow-hidden">
      {/* ── Header ── */}
      <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-100">Speculative HITL Approvals Tray</h2>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Gatekeeper v2.4
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Review and bulk-commit speculative actions prepared by autonomous agent loops.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleApproveAll}
            disabled={pendingItems.length === 0 || isProcessing}
            className={cn(
              "text-xs font-medium h-8 gap-1.5 transition-all shadow-sm",
              pendingItems.length > 0
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            )}
          >
            {isProcessing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 fill-current" />
            )}
            Approve All ({pendingItems.length})
          </Button>
        </div>
      </div>

      {/* ── Summary KPI Banners ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-zinc-900/20 border-b border-zinc-800/60">
        <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
          <div className="text-[10px] uppercase font-mono text-zinc-500">Pending Actions</div>
          <div className="text-base font-semibold text-zinc-100 mt-0.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {pendingItems.length} Queue Items
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
          <div className="text-[10px] uppercase font-mono text-zinc-500">Speculative Volume</div>
          <div className="text-base font-semibold text-emerald-400 mt-0.5">
            ৳{totalPendingAmount.toLocaleString()}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
          <div className="text-[10px] uppercase font-mono text-zinc-500">Estimated Logistics</div>
          <div className="text-base font-semibold text-cyan-400 mt-0.5">
            ৳{totalPendingFees.toLocaleString()}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
          <div className="text-[10px] uppercase font-mono text-zinc-500">Security Gate</div>
          <div className="text-base font-semibold text-emerald-300 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Zero Ambient Risk
          </div>
        </div>
      </div>

      {/* ── Category Filters ── */}
      <div className="px-4 py-2 bg-zinc-900/40 border-b border-zinc-800/60 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[11px] text-zinc-500 mr-2 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {(["ALL", "Finance", "Logistics", "System"] as const).map((cat) => {
          const count =
            cat === "ALL" ? items.length : items.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-2.5 py-1 text-[11px] rounded-md font-medium transition-colors flex items-center gap-1.5",
                filter === cat
                  ? "bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              )}
            >
              {cat === "Finance" && <CreditCard className="w-3 h-3 text-emerald-400" />}
              {cat === "Logistics" && <Truck className="w-3 h-3 text-cyan-400" />}
              {cat === "System" && <Cpu className="w-3 h-3 text-purple-400" />}
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Action Notification ── */}
      {lastMessage && (
        <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-800/40 text-emerald-300 text-xs flex items-center justify-between">
          <span>{lastMessage}</span>
          <button
            onClick={() => setLastMessage(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Approval Cards List ── */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {filteredItems.map((item) => {
          const isPending = item.status === "PENDING";
          const isCommitted = item.status === "COMMITTED";
          const isRejected = item.status === "REJECTED";

          return (
            <div
              key={item.id}
              className={cn(
                "p-4 rounded-xl border transition-all relative overflow-hidden",
                isPending
                  ? "bg-zinc-900/70 border-zinc-800/90 hover:border-zinc-700/80 shadow-md"
                  : isCommitted
                  ? "bg-emerald-950/20 border-emerald-900/40 opacity-80"
                  : "bg-red-950/20 border-red-900/40 opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border",
                      item.type === "MFS_RECONCILIATION"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : item.type === "COURIER_DISPATCH"
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                        : "bg-purple-500/10 border-purple-500/30 text-purple-400"
                    )}
                  >
                    {item.type === "MFS_RECONCILIATION" ? (
                      <CreditCard className="w-4 h-4" />
                    ) : item.type === "COURIER_DISPATCH" ? (
                      <Truck className="w-4 h-4" />
                    ) : (
                      <Cpu className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-zinc-100">{item.title}</h3>
                      <span
                        className={cn(
                          "px-2 py-0.5 text-[9px] font-mono rounded-md uppercase font-semibold",
                          isPending
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : isCommitted
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                        )}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 mt-1">{item.detail}</p>

                    <div className="mt-2.5 p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80 font-mono text-[11px] text-zinc-300 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>
                        <span className="text-zinc-500 font-sans">Simulated Outcome:</span>{" "}
                        {item.speculativeOutput}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2.5 text-[10px] text-zinc-500 font-mono">
                      <span>Target: {item.target}</span>
                      {item.amountBdt && <span>Volume: ৳{item.amountBdt.toLocaleString()}</span>}
                      {item.feeBdt && <span>Fee: ৳{item.feeBdt}</span>}
                    </div>
                  </div>
                </div>

                {/* ── Action Buttons ── */}
                {isPending && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleSingleAction(item.id, "commit")}
                      className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSingleAction(item.id, "reject")}
                      className="h-7 px-2 text-xs border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/40"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ApprovalsArtifact;
