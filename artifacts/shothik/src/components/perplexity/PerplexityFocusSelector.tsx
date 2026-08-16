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
    icon: "",
    description: "Search across full web + AI reasoning",
  },
  {
    value: "pro_search",
    label: "Pro Search",
    icon: "",
    description: "Multi-step deep research & TAM analysis",
  },
  {
    value: "academic",
    label: "Academic",
    icon: "",
    description: "Scholarly papers, journals & BCS prep",
  },
  {
    value: "finance_tax",
    label: "Finance & Tax",
    icon: "",
    description: "NBR tax clearance, invoices & bKash accounting",
  },
  {
    value: "merchant",
    label: "Merchant Logistics",
    icon: "",
    description: "Courier tracking, inventory & storefront operations",
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
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] transition-all cursor-pointer ${
              isSelected
                ? "bg-muted/80 border border-border text-foreground font-medium"
                : "bg-transparent border border-transparent text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted/40"
            }`}
          >
            {opt.icon && <span>{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
