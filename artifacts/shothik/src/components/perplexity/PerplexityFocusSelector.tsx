import React from "react";

export type PerplexityFocusMode =
  | "all"
  | "pro_search"
  | "academic";

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
    label: "Academic",
    icon: "🎓",
    description: "PubMed, OpenAlex & Research Papers",
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
              isSelected
                ? "bg-brand/15 border border-brand/40 text-brand font-semibold shadow-xs"
                : "bg-zinc-100 dark:bg-slate-800/80 border border-zinc-200/80 dark:border-slate-700/60 text-zinc-600 dark:text-slate-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-slate-700/60 hover:border-zinc-300 dark:hover:border-slate-600"
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
