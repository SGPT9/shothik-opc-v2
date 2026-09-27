import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, ArrowRight, Clock, FileText, Send, DollarSign, Truck } from "lucide-react";

export interface ActionProposalCardProps {
  id: string;
  kind: "bkash.payout" | "courier.dispatch" | "whatsapp.broadcast" | "invoice.issue";
  title: string;
  data: Record<string, any>;
  status: "awaiting_review" | "executing" | "succeeded" | "failed" | "denied" | "expired" | "outcome_unknown";
  hash: string;
  expiresAt: string;
  onApprove?: (id: string) => Promise<void>;
  onDeny?: (id: string) => Promise<void>;
}

export const ActionProposalCard: React.FC<ActionProposalCardProps> = ({
  id,
  kind,
  title,
  data,
  status,
  hash,
  expiresAt,
  onApprove,
  onDeny,
}) => {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      if (onApprove) {
        await onApprove(id);
      } else {
        const res = await fetch(`/api/action-proposals/${id}/approve`, { method: "POST" });
        if (!res.ok) throw new Error("Approval failed");
      }
      setCurrentStatus("succeeded");
    } catch (err: any) {
      setError(err.message || "Approval failed");
      setCurrentStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async () => {
    setLoading(true);
    setError(null);
    try {
      if (onDeny) {
        await onDeny(id);
      } else {
        const res = await fetch(`/api/action-proposals/${id}/deny`, { method: "POST" });
        if (!res.ok) throw new Error("Rejection failed");
      }
      setCurrentStatus("denied");
    } catch (err: any) {
      setError(err.message || "Rejection failed");
    } finally {
      setLoading(false);
    }
  };

  const getKindIcon = () => {
    switch (kind) {
      case "bkash.payout":
        return <DollarSign className="w-5 h-5 text-emerald-400" />;
      case "courier.dispatch":
        return <Truck className="w-5 h-5 text-amber-400" />;
      case "whatsapp.broadcast":
        return <Send className="w-5 h-5 text-green-400" />;
      case "invoice.issue":
        return <FileText className="w-5 h-5 text-blue-400" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="my-3 p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 shadow-lg text-slate-100 max-w-xl transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
            {getKindIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                Protected Action
              </span>
              <span className="text-xs text-slate-400 font-mono">#{hash.slice(0, 8)}</span>
            </div>
            <h4 className="text-sm font-medium text-slate-100 mt-0.5">{title}</h4>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {currentStatus === "awaiting_review" && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
              <Clock className="w-3.5 h-3.5 animate-pulse" /> Awaiting Review
            </span>
          )}
          {currentStatus === "succeeded" && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
              <CheckCircle className="w-3.5 h-3.5" /> Approved & Executed
            </span>
          )}
          {currentStatus === "denied" && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
              <XCircle className="w-3.5 h-3.5" /> Rejected
            </span>
          )}
          {currentStatus === "expired" && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
              Expired
            </span>
          )}
        </div>
      </div>

      {/* Payload Details */}
      <div className="my-3 space-y-2 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 font-mono">
        {kind === "bkash.payout" && (
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-slate-500">Recipient:</span> <span className="text-slate-200">{data.recipientPhone}</span></div>
            <div><span className="text-slate-500">Amount:</span> <span className="text-emerald-400 font-bold">৳{data.amount?.toLocaleString()} BDT</span></div>
            <div className="col-span-2"><span className="text-slate-500">Ref:</span> <span className="text-slate-300">{data.reference}</span></div>
          </div>
        )}

        {kind === "courier.dispatch" && (
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-slate-500">Courier:</span> <span className="text-amber-400 uppercase font-bold">{data.courier}</span></div>
            <div><span className="text-slate-500">COD:</span> <span className="text-emerald-400">৳{data.codAmount} BDT</span></div>
            <div><span className="text-slate-500">Customer:</span> <span className="text-slate-200">{data.recipientName} ({data.recipientPhone})</span></div>
            <div><span className="text-slate-500">Item:</span> <span className="text-slate-300">{data.itemDescription}</span></div>
            <div className="col-span-2"><span className="text-slate-500">Address:</span> <span className="text-slate-300">{data.deliveryAddress}</span></div>
          </div>
        )}

        {kind === "whatsapp.broadcast" && (
          <div className="space-y-1.5">
            <div><span className="text-slate-500">Segment:</span> <span className="text-slate-200 font-bold">{data.audienceSegment}</span> ({data.recipientCount} merchants)</div>
            <div className="text-slate-400 italic bg-slate-900 p-2 rounded border border-slate-800">"{data.previewSample}"</div>
          </div>
        )}

        {kind === "invoice.issue" && (
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-slate-500">Customer:</span> <span className="text-slate-200">{data.customerName}</span></div>
            <div><span className="text-slate-500">Total:</span> <span className="text-emerald-400 font-bold">৳{data.totalAmountBdt?.toLocaleString()} BDT</span></div>
            <div><span className="text-slate-500">VAT:</span> <span className="text-slate-300">{data.vatRatePercent}% NBR Mushak</span></div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Action Buttons */}
      {currentStatus === "awaiting_review" && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={handleDeny}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Reject Action
          </button>
          <button
            onClick={handleApprove}
            disabled={loading}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow transition flex items-center gap-1"
          >
            {loading ? "Authorizing..." : "Approve & Execute"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
