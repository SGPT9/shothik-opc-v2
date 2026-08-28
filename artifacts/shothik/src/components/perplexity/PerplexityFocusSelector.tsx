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
    label: "All Web",
    icon: "🌐",
    description: "Search across full web + AI reasoning",
  },
  {
    value: "pro_search",
    label: "Pro Search",
    icon: "⚡",
    description: "Multi-step deep research & TAM analysis",
  },
  {
    value: "academic",
    label: "Academic",
    icon: "🎓",
    description: "Scholarly papers, journals & citations",
  },
  {
    value: "finance_tax",
    label: "Finance & Tax",
    icon: "📊",
    description: "NBR tax clearance, invoices & financial models",
  },
  {
    value: "merchant",
    label: "Merchant",
    icon: "📦",
    description: "Courier tracking, inventory & logistics",
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
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
      {PERPLEXITY_FOCUS_OPTIONS.map((opt) => {
        const isSelected = opt.value === currentFocus;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelectFocus(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-150 cursor-pointer ${
              isSelected
                ? opt.value === "pro_search"
                  ? "bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/20"
                  : "bg-zinc-800/90 border border-zinc-700/80 text-zinc-100 shadow-sm"
                : "bg-transparent border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
            }`}
            title={opt.description}
          >
            {opt.icon && <span className="text-xs">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
