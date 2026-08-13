import React, { useState } from "react";
import { PerplexityDesignSystemService, type PerplexityRoutingResult } from "@/lib/perplexity/perplexity-design-system-service";
import { PerplexitySourcesGrid } from "./PerplexitySourcesGrid";
import { PerplexityFocusSelector, type PerplexityFocusMode } from "./PerplexityFocusSelector";
import { PerplexityRelatedQueries } from "./PerplexityRelatedQueries";

export interface PerplexityDesignSystemPortalProps {
  initialQuery?: string;
}

export const PerplexityDesignSystemPortal: React.FC<PerplexityDesignSystemPortalProps> = ({
  initialQuery = "Calculate NBR Form 11GA Tax Rebate and verify bKash payment",
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [routeResult, setRouteResult] = useState<PerplexityRoutingResult>(() =>
    PerplexityDesignSystemService.routeQuery(initialQuery)
  );

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    const res = PerplexityDesignSystemService.routeQuery(newQuery);
    setRouteResult(res);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌐</span>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Shothik Perplexity Design System Specification
            </h1>
            <p className="text-xs text-slate-400">
              Intelligent Service Slot Router & Real-World Action Mapping
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold">
          Design System v2.5
        </span>
      </div>

      {/* Focus Mode Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400">
          Perplexity Focus Mode Slot
        </label>
        <PerplexityFocusSelector
          currentFocus={routeResult.detectedFocusMode}
          onSelectFocus={(mode) => {
            const res = PerplexityDesignSystemService.routeQuery(`${mode} query: ${query}`);
            setRouteResult(res);
          }}
        />
      </div>

      {/* Query Search Bar */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-2 focus-within:border-emerald-500/50 transition">
        <span className="pl-2 text-slate-400">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
          placeholder="Ask anything (e.g. bKash verify, Steadfast courier, NBR tax)..."
          className="flex-1 bg-transparent border-none text-sm text-slate-100 focus:outline-none placeholder-slate-500"
        />
        <button
          type="button"
          onClick={() => handleSearch(query)}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-md"
        >
          Route Query
        </button>
      </div>

      {/* Perplexity Sources Grid Slot */}
      <PerplexitySourcesGrid sources={routeResult.suggestedSources} />

      {/* Mapped Service Slots Table */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-400">
          Intelligent Service Slot Mappings ({routeResult.mappedServices.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {routeResult.mappedServices.map((srv) => (
            <div
              key={srv.serviceId}
              className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-1.5 hover:border-purple-500/40 transition"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-purple-400">
                <span className="uppercase tracking-wider font-bold">
                  Slot: {srv.slotName}
                </span>
                <span>{srv.creditCost} Credits</span>
              </div>
              <p className="text-xs font-bold text-slate-100">
                {srv.serviceTitle}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>UI: {srv.mappedComponent}</span>
                <span className="text-emerald-400">Engine: {srv.actionProvider}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Questions Slot */}
      <PerplexityRelatedQueries onSelectQuery={(q) => handleSearch(q)} />
    </div>
  );
};
