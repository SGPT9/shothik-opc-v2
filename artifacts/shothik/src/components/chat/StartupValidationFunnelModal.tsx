import React, { useState, useEffect } from "react";
import { StartupValidationFunnelService, type FullStartupValidationReport } from "@/lib/infrastructure/startup-validation-funnel-service";

export interface StartupValidationFunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StartupValidationFunnelModal: React.FC<StartupValidationFunnelModalProps> = ({ isOpen, onClose }) => {
  const [ideaTopic, setIdeaTopic] = useState("B2B Quick Commerce for Dhaka Kirana Stores");
  const [targetRegion, setTargetRegion] = useState("Bangladesh & South Asia");
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  const [report, setReport] = useState<FullStartupValidationReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRunValidation = () => {
    setIsRunning(true);
    const result = StartupValidationFunnelService.runFullValidationFunnel(ideaTopic, targetRegion);
    setReport(result);
    setIsRunning(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🚀</span> 3-Step Startup Validation Funnel Engine
            </h2>
            <p className="text-xs text-slate-400">Step 1: Cofounder TAM/SAM/SOM ➔ Step 2: Live Web Validation ➔ Step 3: ScenarioLab Stress-Test</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer select-none">✕</button>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Startup Idea / Product Vision</label>
            <input
              type="text"
              value={ideaTopic}
              onChange={(e) => setIdeaTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isRunning) {
                  e.preventDefault();
                  handleRunValidation();
                }
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-500 transition"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Target Geographic Market</label>
            <input
              type="text"
              value={targetRegion}
              onChange={(e) => setTargetRegion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isRunning) {
                  e.preventDefault();
                  handleRunValidation();
                }
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-500 transition"
            />
          </div>
          <button
            type="button"
            onClick={handleRunValidation}
            disabled={isRunning}
            className="col-span-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl transition-colors cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? "Executing 3-Step Validation Funnel..." : "⚡ Execute Full 3-Step Validation Funnel"}
          </button>
        </div>

        {/* Funnel Step Tabs */}
        {report && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 border-b border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer select-none ${activeStep === 1 ? "bg-emerald-950/80 border-emerald-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400"}`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Step 1</div>
                <div className="font-bold text-xs mt-0.5">🚀 Cofounder Mode</div>
                <div className="text-[11px] text-slate-400">TAM / SAM / SOM Sizing</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer select-none ${activeStep === 2 ? "bg-sky-950/80 border-sky-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400"}`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider text-sky-400">Step 2</div>
                <div className="font-bold text-xs mt-0.5">🌐 Web Search Mode</div>
                <div className="text-[11px] text-slate-400">Competitors & NBR Regs</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer select-none ${activeStep === 3 ? "bg-purple-950/80 border-purple-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400"}`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Step 3</div>
                <div className="font-bold text-xs mt-0.5">🧪 ScenarioLab Mode</div>
                <div className="text-[11px] text-slate-400">2GB RAM & Fraud Stress</div>
              </button>
            </div>

            {/* Step 1: Cofounder Mode Content */}
            {activeStep === 1 && (
              <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 space-y-4 text-xs">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-emerald-400">🚀 Step 1: Cofounder Analysis & Market Sizing</h3>
                  <p className="text-slate-400 text-[11px]">Problem Statement, Proposed Solution, and TAM / SAM / SOM Metrics</p>
                </div>

                <div className="space-y-2 text-slate-300">
                  <p><strong className="text-white">Problem:</strong> {report.cofounder.problemStatement}</p>
                  <p><strong className="text-white">Solution:</strong> {report.cofounder.proposedSolution}</p>
                </div>

                {/* Market Sizing Cards */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase text-emerald-400 font-bold">TAM (Total Addressable)</span>
                    <p className="text-base font-bold text-white font-mono">{report.cofounder.tamBdtUsd.tamUsd}</p>
                    <p className="text-[11px] text-slate-400">{report.cofounder.tamBdtUsd.tamBdt}</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase text-emerald-300 font-bold">SAM (Serviceable)</span>
                    <p className="text-base font-bold text-white font-mono">{report.cofounder.samBdtUsd.samUsd}</p>
                    <p className="text-[11px] text-slate-400">{report.cofounder.samBdtUsd.samBdt}</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase text-emerald-200 font-bold">SOM (Obtainable 3Y)</span>
                    <p className="text-base font-bold text-white font-mono">{report.cofounder.somBdtUsd.somUsd}</p>
                    <p className="text-[11px] text-slate-400">{report.cofounder.somBdtUsd.somBdt}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Web Search Mode Content */}
            {activeStep === 2 && (
              <div className="bg-slate-950 p-5 rounded-2xl border border-sky-500/40 space-y-4 text-xs">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-sky-400">🌐 Step 2: Live Web Search Competitor & Regulatory Audit</h3>
                  <p className="text-slate-400 text-[11px]">{report.webSearch.liveWebCitationSummary}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs">Competitor Landscape Audit:</h4>
                  <div className="space-y-2">
                    {report.webSearch.competitorLandscape.map((comp, idx) => (
                      <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-slate-300">
                        <div>
                          <strong className="text-white">{comp.name}</strong>
                          <span className="text-slate-400 ml-2">({comp.marketShare} Share)</span>
                          <p className="text-[11px] text-slate-400">Strength: {comp.strength} | Weakness: {comp.weakness}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: ScenarioLab Mode Content */}
            {activeStep === 3 && (
              <div className="bg-slate-950 p-5 rounded-2xl border border-purple-500/40 space-y-4 text-xs">
                <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-purple-400">🧪 Step 3: ScenarioLab Stress-Test Report</h3>
                    <p className="text-slate-400 text-[11px]">2GB RAM, 3G Cellular Latency, MFS Fraud & Courier Return Risk</p>
                  </div>
                  <span className="bg-purple-500 text-slate-950 font-bold px-3 py-1 rounded-full text-[11px]">
                    RATING: {report.scenarioLab.overallStressTestRating}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[11px]">2GB RAM DOM Footprint</span>
                    <p className="text-base font-bold text-emerald-400 font-mono">{report.scenarioLab.hardwareLowRamFootprint.domMemoryMb} MB (Budget &lt;48MB)</p>
                    <p className="text-[11px] text-slate-400">{report.scenarioLab.hardwareLowRamFootprint.recommendation}</p>
                  </div>
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[11px]">bKash / Nagad Fraud Risk Score</span>
                    <p className="text-base font-bold text-emerald-400 font-mono">{report.scenarioLab.mfsBkashNagadFraudRiskScore} / 100 (Very Low)</p>
                    <p className="text-[11px] text-slate-400">Protected by 10-char TrxID SMS Webhook verification.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
