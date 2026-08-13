import React, { useState } from "react";

export interface ResearchStep {
  id: string;
  stepName: string;
  status: "completed" | "in_progress" | "pending";
  detail: string;
  timestamp: string;
}

export interface PerplexityDeepResearchDrawerProps {
  steps?: ResearchStep[];
}

export const DEFAULT_RESEARCH_STEPS: ResearchStep[] = [
  {
    id: "step_1",
    stepName: "Querying NBR Tax API & SRO Database",
    status: "completed",
    detail: "Fetched 15% Section 78 income tax rebate clauses under Income Tax Act 2023.",
    timestamp: "10:14:02 AM",
  },
  {
    id: "step_2",
    stepName: "Checking bKash Micro-Merchant Ledger",
    status: "completed",
    detail: "Validated 550 credits and verified automated TrxID webhooks.",
    timestamp: "10:14:04 AM",
  },
  {
    id: "step_3",
    stepName: "Synthesizing Pro Search Executive Report",
    status: "in_progress",
    detail: "Formatting 3-column comparative audit & 1-tap Form 11GA E-Challan card.",
    timestamp: "10:14:06 AM",
  },
];

export const PerplexityDeepResearchDrawer: React.FC<PerplexityDeepResearchDrawerProps> = ({
  steps = DEFAULT_RESEARCH_STEPS,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="my-3 bg-slate-900/80 border border-purple-500/30 rounded-2xl overflow-hidden shadow-lg backdrop-blur-md">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-950/60 hover:bg-slate-950 transition text-left"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <span>🚀 Pro Search: Deep Research Execution ({steps.length} Steps)</span>
        </div>
        <span className="text-slate-400 text-xs font-mono">{isOpen ? "▲ Hide" : "▼ Show Steps"}</span>
      </button>

      {isOpen && (
        <div className="p-4 space-y-3 divide-y divide-slate-800/80">
          {steps.map((step) => (
            <div key={step.id} className="pt-2 first:pt-0 flex items-start gap-3">
              <span className="text-sm mt-0.5">
                {step.status === "completed" ? "✅" : step.status === "in_progress" ? "⏳" : "⚪"}
              </span>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-100">
                  <span>{step.stepName}</span>
                  <span className="text-[10px] font-mono text-slate-500">{step.timestamp}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
