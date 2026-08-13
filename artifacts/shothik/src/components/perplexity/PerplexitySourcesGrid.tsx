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

export const DEFAULT_MOCK_SOURCES: PerplexitySource[] = [
  {
    id: 1,
    title: "Chaldal Grocery E-Commerce Logistics & Market Sizing",
    domain: "chaldal.com",
    url: "https://chaldal.com",
    snippet: "Dhaka logistics hubs and 15-minute grocery delivery operations across 8 divisions.",
  },
  {
    title: "ShopUp F-Commerce Merchant Network & COD Returns",
    domain: "shopup.com.bd",
    id: 2,
    url: "https://shopup.com.bd",
    snippet: "B2B commerce platform connecting 500k+ micro-merchants with courier partners.",
  },
  {
    id: 3,
    title: "NBR Income Tax Act 2023 & SRO 228 SRO Guidelines",
    domain: "nbr.gov.bd",
    url: "https://nbr.gov.bd",
    snippet: "Official Bangladesh National Board of Revenue tax slabs and 15% Section 78 rebates.",
  },
];

export const PerplexitySourcesGrid: React.FC<PerplexitySourcesGridProps> = ({
  sources = DEFAULT_MOCK_SOURCES,
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
