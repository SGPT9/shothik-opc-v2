import React from "react";

export interface PerplexityRelatedQueriesProps {
  queries?: string[];
  onSelectQuery: (query: string) => void;
}

export const DEFAULT_RELATED_QUERIES = [
  "bKash TrxID automated edge API verification rules for micro-merchants?",
  "Steadfast Courier API parcel tracking integration guide?",
  "NBR Income Tax Act 2023 Section 78 rebate calculation breakdown?",
];

export const PerplexityRelatedQueries: React.FC<PerplexityRelatedQueriesProps> = ({
  queries = DEFAULT_RELATED_QUERIES,
  onSelectQuery,
}) => {
  if (!queries || queries.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
        <span className="text-purple-400">💡</span>
        <span>Related Questions</span>
      </div>

      <div className="flex flex-col gap-2">
        {queries.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectQuery(q)}
            className="flex items-center justify-between w-full bg-slate-950/70 border border-slate-800/90 hover:border-purple-500/40 p-2.5 rounded-xl text-left text-xs text-slate-300 hover:text-white transition-all group"
          >
            <span className="flex items-center gap-2">
              <span className="text-purple-400 font-bold">+</span>
              <span>{q}</span>
            </span>
            <span className="text-slate-500 group-hover:text-purple-400 font-bold transition-colors">➔</span>
          </button>
        ))}
      </div>
    </div>
  );
};
