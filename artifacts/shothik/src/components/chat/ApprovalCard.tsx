"use client";

import React, { useState } from "react";
import { ShieldAlert, Check, X, ChevronDown, ChevronUp } from "lucide-react";

interface ApprovalCardProps {
  /** Optional checkpoint ID for orchestrator control layer tracking */
  checkpointId?: string;
  /** Brief description of the action requiring approval */
  actionSummary: string;
  /** Why the user needs to approve this */
  reason: string;
  /** Detailed context (optional, shown on expand) */
  details?: string;
  /** Called when user approves */
  onApprove?: () => void;
  /** Called when user denies */
  onDeny?: () => void;
  /** Whether the approval has been resolved */
  resolved?: boolean;
  /** The resolution outcome */
  outcome?: "approved" | "denied";
}

/**
 * ApprovalCard — DeepSeek-close spec control surface.
 *
 * Appears distinctly from normal message bubbles.
 * Summarizes the requested action, explains why approval is needed,
 * and lets the user approve or deny clearly.
 * Collapses into a short historical record once resolved.
 */
export function ApprovalCard({
  actionSummary,
  reason,
  details,
  onApprove,
  onDeny,
  resolved = false,
  outcome,
}: ApprovalCardProps) {
  const [expanded, setExpanded] = useState(false);

  // ── Collapsed historical record ──
  if (resolved && outcome) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-xs">
        {outcome === "approved" ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">Approved:</span>{" "}
              {actionSummary}
            </span>
          </>
        ) : (
          <>
            <X className="h-3.5 w-3.5 text-rose-500 shrink-0" />
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">Denied:</span>{" "}
              {actionSummary}
            </span>
          </>
        )}
      </div>
    );
  }

  // ── Active approval request ──
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-sm p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground leading-snug">
            Approval Required
          </p>
          <p className="text-xs text-foreground/90 leading-relaxed">
            {actionSummary}
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {reason}
          </p>
        </div>
      </div>

      {/* Expandable details */}
      {details && (
        <div>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition cursor-pointer select-none"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? "Hide details" : "Show details"}
          </button>
          {expanded && (
            <pre className="mt-2 rounded-lg bg-muted/40 border border-border/50 p-3 text-[11px] text-foreground/80 font-mono whitespace-pre-wrap overflow-x-auto max-h-40 custom-scrollbar">
              {details}
            </pre>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onApprove}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition cursor-pointer select-none"
        >
          <Check className="h-3.5 w-3.5" />
          Approve
        </button>
        <button
          type="button"
          onClick={onDeny}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted/80 px-4 py-2 text-xs font-semibold text-foreground transition cursor-pointer select-none"
        >
          <X className="h-3.5 w-3.5" />
          Deny
        </button>
      </div>
    </div>
  );
}

export default ApprovalCard;
