import React from "react";

export type PerplexityFocusMode =
  | "all"
  | "pro_search"
  | "academic"
  | "finance_tax"
  | "merchant";

export interface PerplexityFocusOption {
  value: PerplexityFocusMode;
  label: string;
  icon: string;
  description: string;
}

export const PERPLEXITY_FOCUS_OPTIONS: PerplexityFocusOption[] = [
  {
    value: "all",
    label: "All Web & AI",
    icon: "🔍",
    description: "Search across full web + AI reasoning",
  },
  {
    value: "pro_search",
    label: "Pro Search",
    icon: "🚀",
    description: "Multi-step deep research & TAM analysis",
  },
  {
    value: "academic",
    label: "Academic & Papers",
    icon: "🎓",
    description: "PubMed, OpenAlex & Research Papers",
  },
  {
    value: "finance_tax",
    label: "Finance & NBR Tax",
    icon: "💼",
    description: "bKash ledger & Form 11GA Tax SROs",
  },
  {
    value: "merchant",
    label: "Merchant & Store",
    icon: "🛍️",
    description: "Polsia OPC store & Steadfast booking",
  },
];

export interface PerplexityFocusSelectorProps {
  currentFocus: PerplexityFocusMode;
  onSelectFocus: (mode: PerplexityFocusMode) => void;
}

export const PerplexityFocusSelector: React.FC<PerplexityFocusSelectorProps> = ({
  currentFocus,
  onSelectFocus,
}) => {
  const activeOpt = PERPLEXITY_FOCUS_OPTIONS.find((o) => o.value === currentFocus) || PERPLEXITY_FOCUS_OPTIONS[0];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
      {PERPLEXITY_FOCUS_OPTIONS.map((opt) => {
        const isSelected = opt.value === currentFocus;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelectFocus(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all ${
              isSelected
                ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold shadow-sm"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
