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
    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-[#334155] space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
        <span className="text-blue-600 dark:text-blue-400">💡</span>
        <span>Related Questions</span>
      </div>

      <div className="flex flex-col gap-2">
        {queries.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectQuery(q)}
            className="flex items-center justify-between w-full bg-gray-50 dark:bg-[#151B28] border border-gray-200 dark:border-[#334155] hover:border-blue-500/50 p-2.5 rounded-xl text-left text-[13px] text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-all shadow-sm group"
          >
            <span className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold">+</span>
              <span>{q}</span>
            </span>
            <span className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-bold transition-colors">➔</span>
          </button>
        ))}
      </div>
    </div>
  );
};
