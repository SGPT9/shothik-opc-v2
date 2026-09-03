import React from "react";

export interface PerplexitySource {
  id: number;
  title: string;
  domain: string;
  url: string;
  snippet?: string;
  faviconUrl?: string;
}

export interface PerplexitySourcesGridProps {
  sources?: PerplexitySource[];
}


export const DEFAULT_PERPLEXITY_SOURCES: PerplexitySource[] = [
  {
    id: 1,
    title: "Chaldal Grocery Delivery Network & Logistics Hubs",
    domain: "chaldal.com",
    url: "https://chaldal.com",
  },
  {
    id: 2,
    title: "ShopUp B2B Commerce & Merchant Financing in Bangladesh",
    domain: "shopup.com.bd",
    url: "https://shopup.com.bd",
  },
  {
    id: 3,
    title: "Steadfast Courier COD & Coverage Across 64 Districts",
    domain: "steadfast.com.bd",
    url: "https://steadfast.com.bd",
  },
];

export const PerplexitySourcesGrid: React.FC<PerplexitySourcesGridProps> = ({
  sources = DEFAULT_PERPLEXITY_SOURCES,
}) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="my-4 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
        <span className="text-emerald-400">🌐</span>
        <span>Sources ({sources.length})</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        {sources.map((src) => (
          <a
            key={src.id}
            href={src.url}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col justify-between w-56 shrink-0 bg-slate-900/95 border border-slate-800/90 hover:border-emerald-500/50 p-3.5 rounded-2xl transition-all duration-200 group shadow-md hover:shadow-emerald-500/10 backdrop-blur-md"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 rounded-md bg-slate-800 text-[10px] font-mono font-bold text-emerald-400 flex items-center justify-center border border-slate-700">
                {src.id}
              </span>
              <span className="text-[11px] font-mono font-medium text-slate-400 truncate">
                {src.domain}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-2 leading-snug">
              {src.title}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
};
