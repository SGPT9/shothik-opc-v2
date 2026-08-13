import React, { useState } from "react";
import { type PerplexitySource } from "./PerplexitySourcesGrid";

export interface PerplexityCitationPreviewCardProps {
  source: PerplexitySource;
  children: React.ReactNode;
}

export const PerplexityCitationPreviewCard: React.FC<PerplexityCitationPreviewCardProps> = ({
  source,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <span className="cursor-pointer text-emerald-400 hover:text-emerald-300 font-mono font-bold text-xs px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 transition">
        {children}
      </span>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 border border-slate-700 text-slate-100 p-3 rounded-2xl shadow-2xl z-50 animate-fade-in backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-1.5 border-b border-slate-800 pb-1.5">
            <span className="w-5 h-5 rounded-md bg-slate-800 text-[10px] font-mono font-bold text-emerald-400 flex items-center justify-center border border-slate-700">
              {source.id}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 truncate">
              {source.domain}
            </span>
          </div>
          <p className="text-xs font-semibold text-white line-clamp-2 mb-1">
            {source.title}
          </p>
          {source.snippet && (
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              "{source.snippet}"
            </p>
          )}
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition"
          >
            <span>Jump to source</span>
            <span>➔</span>
          </a>
        </div>
      )}
    </div>
  );
};
