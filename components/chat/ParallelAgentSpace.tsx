"use client";

import { useState, useEffect } from "react";
import { 
  Globe, 
  Play, 
  Pause, 
  X, 
  Table, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  Database,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export interface AgentSpaceLog {
  timestamp: string;
  type: "NAVIGATE" | "EXTRACT" | "DOM_SELECT" | "CANVAS_SYNC";
  message: string;
}

export interface ParallelAgentSpaceProps {
  isOpen: boolean;
  onClose: () => void;
  spaceTitle?: string;
  initialUrl?: string;
  onOpenDataSheet?: () => void;
}

export function ParallelAgentSpace({
  isOpen,
  onClose,
  spaceTitle = "Parallel Web Space #1: South Asian Market Research",
  initialUrl = "https://news.google.com/search?q=South+Asian+tech+startups+funding",
  onOpenDataSheet,
}: ParallelAgentSpaceProps) {
  const [url, setUrl] = useState(initialUrl);
  const [isRunning, setIsRunning] = useState(true);
  const [activeTab, setActiveTab] = useState<"live" | "extracted">("live");
  const [extractedRows, setExtractedRows] = useState([
    { id: 1, startup: "ShopUp", sector: "B2B E-Commerce", funding: "$75M", region: "Bangladesh 🇧🇩", year: "2025" },
    { id: 2, startup: "Chaldal", sector: "Grocery Logistics", funding: "$35M", region: "Bangladesh 🇧🇩", year: "2025" },
    { id: 3, startup: "Razorpay", sector: "Fintech Payments", funding: "$375M", region: "India 🇮🇳", year: "2025" },
    { id: 4, startup: "Pathao", sector: "Logistics & Fintech", funding: "$25M", region: "Bangladesh 🇧🇩", year: "2024" },
    { id: 5, startup: "Khatabook", sector: "SME Accounting", funding: "$100M", region: "India 🇮🇳", year: "2025" },
  ]);

  const [logs, setLogs] = useState<AgentSpaceLog[]>([
    { timestamp: "14:28:01", type: "NAVIGATE", message: "Navigating to https://news.google.com/search?q=South+Asian+tech+startups" },
    { timestamp: "14:28:03", type: "DOM_SELECT", message: "Selecting DOM nodes matching .article-card, .funding-table" },
    { timestamp: "14:28:05", type: "EXTRACT", message: "Extracted 5 South Asian startup funding entries" },
    { timestamp: "14:28:07", type: "CANVAS_SYNC", message: "Synced extracted data to Data Sheet Canvas" },
  ]);

  useEffect(() => {
    if (!isOpen || !isRunning) return;

    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const mockLogs: AgentSpaceLog[] = [
        { timestamp: time, type: "DOM_SELECT", message: "Inspecting Crunchbase & TechInAsia regional startup directories..." },
        { timestamp: time, type: "EXTRACT", message: "Identified $135M aggregate funding across 5 South Asian tech hubs" },
        { timestamp: time, type: "CANVAS_SYNC", message: "Updated Data Sheet Canvas with new sector valuations" }
      ];
      const randomLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];
      setLogs(prev => [randomLog, ...prev.slice(0, 19)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, isRunning]);

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 border-l border-slate-800 shadow-2xl text-slate-100 transition-all duration-300 ease-in-out">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
              <span>{spaceTitle}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                LIVE PARALLEL SPACE
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition ${
              isRunning 
                ? "bg-amber-950/60 border-amber-800/80 text-amber-300 hover:bg-amber-900/80"
                : "bg-emerald-950/60 border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/80"
            }`}
            title={isRunning ? "Pause Agent Browsing" : "Resume Agent Browsing"}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isRunning ? "Pause" : "Resume"}</span>
          </button>

          {onOpenDataSheet && (
            <button
              onClick={onOpenDataSheet}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-indigo-900/30 transition"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Data Sheet</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* URL & Search Control Bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border-b border-slate-800 text-xs">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <div className="flex-1 bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800 text-slate-300 font-mono text-[11px] truncate flex items-center justify-between">
          <span className="truncate">{url}</span>
          <span className="text-[10px] text-slate-500 shrink-0 ml-2">Shared Chrome Profile</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setActiveTab("live")}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
              activeTab === "live" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Live Web
          </button>
          <button 
            onClick={() => setActiveTab("extracted")}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
              activeTab === "extracted" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Extracted ({extractedRows.length})
          </button>
        </div>
      </div>

      {/* Main Viewport Content */}
      <div className="flex-1 overflow-hidden relative bg-slate-950 flex flex-col">
        {activeTab === "live" ? (
          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* Simulated Live Web Page Preview Container */}
            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-cyan-500 animate-pulse"></div>
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-slate-200 text-sm">South Asian Tech Market Intelligence Brief (2025-2026)</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" /> Auto-grounded
                </span>
              </div>

              {/* Sample Web Highlight Blocks */}
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-emerald-900/60 relative group">
                  <span className="absolute -top-2 right-3 text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono">
                    EXTRACTED DATA POINT
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-slate-100">Bangladesh Tech Sector Growth:</strong> Startup investments reached <strong>$75M+</strong> in 2025 led by ShopUp, Chaldal, and Pathao, expanding logistics & fintech coverage across Dhaka & Chittagong.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-cyan-900/60 relative group">
                  <span className="absolute -top-2 right-3 text-[9px] bg-cyan-600 text-white px-1.5 py-0.2 rounded font-mono">
                    SECTOR ANALYSIS
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-slate-100">India SME Digitalization:</strong> FinTech platforms (Razorpay, Khatabook) surged with <strong>$475M</strong> combined capital, driving automated payroll & digital invoicing adoption.
                  </p>
                </div>
              </div>
            </div>

            {/* Real-time Agent Action Stream Logs */}
            <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col min-h-[160px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  Agent Execution & DOM Stream Log
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Real-time Stream</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[11px] pr-1">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2 text-slate-300 py-0.5 border-b border-slate-800/40 last:border-0">
                    <span className="text-slate-500 shrink-0 text-[10px]">{log.timestamp}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                      log.type === "NAVIGATE" ? "bg-cyan-950 text-cyan-300 border border-cyan-800" :
                      log.type === "EXTRACT" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" :
                      log.type === "CANVAS_SYNC" ? "bg-indigo-950 text-indigo-300 border border-indigo-800" :
                      "bg-slate-800 text-slate-300"
                    }`}>
                      {log.type}
                    </span>
                    <span className="truncate text-slate-300">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Extracted Data View */
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-200">Extracted Startup Funding Table</span>
              {onOpenDataSheet && (
                <button
                  onClick={onOpenDataSheet}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                >
                  <span>Open Full Canvas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2 font-medium">Startup</th>
                    <th className="p-2 font-medium">Sector</th>
                    <th className="p-2 font-medium">Funding</th>
                    <th className="p-2 font-medium">Region</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {extractedRows.map(row => (
                    <tr key={row.id} className="hover:bg-slate-800/40">
                      <td className="p-2 font-semibold text-indigo-300">{row.startup}</td>
                      <td className="p-2 text-slate-300">{row.sector}</td>
                      <td className="p-2 text-emerald-400 font-mono font-medium">{row.funding}</td>
                      <td className="p-2 text-slate-400">{row.region}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
