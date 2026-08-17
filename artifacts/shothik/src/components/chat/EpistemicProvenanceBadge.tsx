import React, { useState } from "react";
import { CheckCircle2, AlertCircle, HelpCircle, ShieldCheck, Info } from "lucide-react";

export type EpistemicStatus = "consensus" | "supported" | "contested" | "hypothesis";

export interface ProvenanceDetails {
  modelHandle?: string;
  sourceCount?: number;
  confidenceScore?: number; // e.g. 98.4
  checkedAt?: string;
}

export interface EpistemicProvenanceBadgeProps {
  status?: EpistemicStatus;
  provenance?: ProvenanceDetails;
  className?: string;
}

const STATUS_CONFIG: Record<
  EpistemicStatus,
  { label: string; icon: any; color: string; bg: string; border: string; desc: string }
> = {
  consensus: {
    label: "Consensus",
    icon: ShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    desc: "100% verified against multiple trusted primary sources & cross-checked",
  },
  supported: {
    label: "Supported",
    icon: CheckCircle2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    desc: "Backed by verbatim scraped source citations with verified quotes",
  },
  contested: {
    label: "Contested",
    icon: AlertCircle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    desc: "Disputed claims found during multi-agent analysis or cross-examination",
  },
  hypothesis: {
    label: "Hypothesis",
    icon: HelpCircle,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    desc: "Exploratory AI reasoning; requires human verification",
  },
};

export function EpistemicProvenanceBadge({
  status = "supported",
  provenance,
  className = "",
}: EpistemicProvenanceBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.supported;
  const IconComponent = cfg.icon;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider ${cfg.bg} ${cfg.color} ${cfg.border} border transition hover:scale-105 cursor-pointer select-none shadow-2xs`}
        title="View Provenance & Truth Status"
      >
        <IconComponent className="w-3 h-3" />
        <span>{cfg.label}</span>
      </button>

      {/* Hover / Click Provenance Card */}
      {showDetails && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-64 p-3 bg-popover/95 backdrop-blur-xl border border-border/70 rounded-xl shadow-2xl space-y-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
            <span className={`text-xs font-bold ${cfg.color} flex items-center gap-1`}>
              <IconComponent className="w-3.5 h-3.5" />
              {cfg.label} Truth Standard
            </span>
            {provenance?.confidenceScore && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-background/80 text-muted-foreground border border-border/40">
                {provenance.confidenceScore}% Trust
              </span>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {cfg.desc}
          </p>

          {provenance && (
            <div className="pt-1.5 border-t border-border/30 grid grid-cols-2 gap-1 text-[9px] font-mono text-muted-foreground">
              <div>
                Model: <span className="text-foreground font-semibold">{provenance.modelHandle || "Hermes 3"}</span>
              </div>
              <div>
                Sources: <span className="text-foreground font-semibold">{provenance.sourceCount ?? 0} Verified</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
