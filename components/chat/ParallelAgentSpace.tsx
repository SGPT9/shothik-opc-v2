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
  ShieldCheck,
  Download,
  Send,
  RefreshCw,
  AlertTriangle,
  Layers,
  Check
} from "lucide-react";

export type AgentStateMode = "scraping" | "grounding" | "syncing" | "waiting";

export interface AgentSpaceLog {
  timestamp: string;
  type: "NAVIGATE" | "EXTRACT" | "DOM_SELECT" | "CANVAS_SYNC" | "VERIFY";
  message: string;
  mode: AgentStateMode;
}

export interface ExtractedRow {
  id: number;
  startup: string;
  sector: string;
  funding: string;
  region: string;
  trustScore: number;
  sourceUrl: string;
}

export interface ParallelAgentSpaceProps {
  isOpen: boolean;
  onClose: () => void;
  spaceTitle?: string;
  initialUrl?: string;
  onOpenDataSheet?: () => void;
  onSendToChat?: (text: string) => void;
}

export function ParallelAgentSpace({
  isOpen,
  onClose,
  spaceTitle = "Parallel Web Space #1: South Asian Tech Market Intelligence",
  initialUrl = "https://news.google.com/search?q=South+Asian+tech+startups+funding",
  onOpenDataSheet,
  onSendToChat,
}: ParallelAgentSpaceProps) {
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [activeUrl, setActiveUrl] = useState(initialUrl);
  const [isRunning, setIsRunning] = useState(true);
  const [agentMode, setAgentMode] = useState<AgentStateMode>("scraping");
  const [activeTab, setActiveTab] = useState<"live" | "extracted">("live");
  const [copiedNotification, setCopiedNotification] = useState(false);

  const [extractedRows, setExtractedRows] = useState<ExtractedRow[]>([
    { id: 1, startup: "ShopUp", sector: "B2B E-Commerce", funding: "$75M", region: "Bangladesh 🇧🇩", trustScore: 99, sourceUrl: "https://daily-star.com/business" },
    { id: 2, startup: "Chaldal", sector: "Grocery Logistics", funding: "$35M", region: "Bangladesh 🇧🇩", trustScore: 98, sourceUrl: "https://techinasia.com/chaldal" },
    { id: 3, startup: "Razorpay", sector: "Fintech Payments", funding: "$375M", region: "India 🇮🇳", trustScore: 100, sourceUrl: "https://economic-times.indiatimes.com" },
    { id: 4, startup: "Pathao", sector: "Logistics & Fintech", funding: "$25M", region: "Bangladesh 🇧🇩", trustScore: 97, sourceUrl: "https://tbaj.com/pathao" },
    { id: 5, startup: "Khatabook", sector: "SME Accounting", funding: "$100M", region: "India 🇮🇳", trustScore: 99, sourceUrl: "https://yourstory.com/khatabook" },
  ]);

  const [logs, setLogs] = useState<AgentSpaceLog[]>([
    { timestamp: "14:38:01", type: "NAVIGATE", message: `Dispatched agent to ${initialUrl}`, mode: "scraping" },
    { timestamp: "14:38:03", type: "DOM_SELECT", message: "Extracting verified financial tables from DOM nodes", mode: "scraping" },
    { timestamp: "14:38:05", type: "VERIFY", message: "Cross-checked 5 startup citations with regional press sources", mode: "grounding" },
    { timestamp: "14:38:07", type: "CANVAS_SYNC", message: "Synced structured entries to Data Sheet Canvas", mode: "syncing" },
  ]);

  // Periodic Agent Simulation Loop with State Modes
  useEffect(() => {
    if (!isOpen || !isRunning) return;

    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const modes: AgentStateMode[] = ["scraping", "grounding", "syncing"];
      const nextMode = modes[Math.floor(Math.random() * modes.length)];
      setAgentMode(nextMode);

      let mockLog: AgentSpaceLog;
      if (nextMode === "scraping") {
        mockLog = { timestamp: time, type: "DOM_SELECT", message: "Inspecting Crunchbase & TechInAsia regional funding feeds...", mode: "scraping" };
      } else if (nextMode === "grounding") {
        mockLog = { timestamp: time, type: "VERIFY", message: "Grounding citation accuracy against primary news sources (98.6% match)", mode: "grounding" };
      } else {
        mockLog = { timestamp: time, type: "CANVAS_SYNC", message: "Persisting live extracted table state into Data Sheet Canvas", mode: "syncing" };
      }

      setLogs(prev => [mockLog, ...prev.slice(0, 19)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, isRunning]);

  // Handle Custom URL Dispatching
  const handleDispatchAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setActiveUrl(urlInput);
    setIsRunning(true);
    setAgentMode("scraping");
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dispatchLog: AgentSpaceLog = {
      timestamp: time,
      type: "NAVIGATE",
      message: `Dispatched agent to custom target URL: ${urlInput}`,
      mode: "scraping",
    };
    setLogs(prev => [dispatchLog, ...prev.slice(0, 19)]);
  };

  // CSV Exporter Utility
  const handleExportCSV = () => {
    const headers = "Startup,Sector,Funding,Region,TrustScore,Source\n";
    const csvContent = "data:text/csv;charset=utf-8," + headers + extractedRows.map(r => 
      `"${r.startup}","${r.sector}","${r.funding}","${r.region}",${r.trustScore}%,"${r.sourceUrl}"`
    ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "shothik_extracted_market_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Push Extracted Table Payload to Chat Composer Bridge
  const handlePushToChat = () => {
    const tableMarkdown = `### 📊 Extracted Market Intelligence Table\n\n` +
      `| Startup | Sector | Funding | Region | Citation Trust |\n` +
      `|---|---|---|---|---|\n` +
      extractedRows.map(r => `| ${r.startup} | ${r.sector} | ${r.funding} | ${r.region} | ${r.trustScore}% |`).join("\n") +
      `\n\n*Source Grounding URL*: ${activeUrl}`;
    
    if (onSendToChat) {
      onSendToChat(tableMarkdown);
    } else {
      navigator.clipboard.writeText(tableMarkdown);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 border-l border-slate-800 shadow-2xl text-slate-100 transition-all duration-300 ease-in-out font-sans">
      
      {/* 🟢 FUNCTIONAL STATE HEADER BAR */}
      <div className={`flex items-center justify-between px-4 py-3 border-b backdrop-blur-md transition-colors duration-500 ${
        agentMode === "scraping" ? "bg-emerald-950/80 border-emerald-800/80" :
        agentMode === "grounding" ? "bg-cyan-950/80 border-cyan-800/80" :
        agentMode === "syncing" ? "bg-indigo-950/80 border-indigo-800/80" :
        "bg-amber-950/80 border-amber-800/80"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className={`animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-75 ${
              agentMode === "scraping" ? "bg-emerald-400" :
              agentMode === "grounding" ? "bg-cyan-400" :
              agentMode === "syncing" ? "bg-indigo-400" :
              "bg-amber-400"
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              agentMode === "scraping" ? "bg-emerald-500" :
              agentMode === "grounding" ? "bg-cyan-500" :
              agentMode === "syncing" ? "bg-indigo-500" :
              "bg-amber-500"
            }`}></span>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-100 flex items-center gap-2">
              <span className="truncate max-w-[200px]">{spaceTitle}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                agentMode === "scraping" ? "bg-emerald-900/80 text-emerald-300 border-emerald-700" :
                agentMode === "grounding" ? "bg-cyan-900/80 text-cyan-300 border-cyan-700" :
                agentMode === "syncing" ? "bg-indigo-900/80 text-indigo-300 border-indigo-700" :
                "bg-amber-900/80 text-amber-300 border-amber-700"
              }`}>
                {agentMode === "scraping" ? "⚡ DEEP SCRAPING" :
                 agentMode === "grounding" ? "🔬 GROUNDING CITATIONS" :
                 agentMode === "syncing" ? "📊 CANVAS SYNCING" :
                 "⚠️ HUMAN ASSIST"}
              </span>
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
              isRunning 
                ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                : "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500"
            }`}
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
              <span className="hidden sm:inline">Data Sheet</span>
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

      {/* 🚀 INTERACTIVE AGENT DISPATCHER & URL BAR */}
      <form onSubmit={handleDispatchAgent} className="flex items-center gap-2 px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <div className="flex-1 flex items-center bg-slate-950 rounded-md border border-slate-800 px-2 py-1 focus-within:border-indigo-500 transition">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Type any target URL for agent scraping..."
            className="w-full bg-transparent text-slate-200 font-mono text-[11px] outline-none placeholder:text-slate-600"
          />
        </div>
        <button
          type="submit"
          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold rounded flex items-center gap-1 shadow transition"
        >
          <Search className="w-3 h-3" />
          <span>Dispatch Agent</span>
        </button>
      </form>

      {/* AGENT MODE & VIEWPORT TAB CONTROLLER */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/40 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setAgentMode("scraping")}
            className={`px-2 py-1 rounded text-[10px] font-mono transition border ${
              agentMode === "scraping" ? "bg-emerald-950 text-emerald-300 border-emerald-700 font-bold" : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            ⚡ Scraper
          </button>
          <button 
            onClick={() => setAgentMode("grounding")}
            className={`px-2 py-1 rounded text-[10px] font-mono transition border ${
              agentMode === "grounding" ? "bg-cyan-950 text-cyan-300 border-cyan-700 font-bold" : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            🔬 Grounder
          </button>
          <button 
            onClick={() => setAgentMode("syncing")}
            className={`px-2 py-1 rounded text-[10px] font-mono transition border ${
              agentMode === "syncing" ? "bg-indigo-950 text-indigo-300 border-indigo-700 font-bold" : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            📊 Canvas Sync
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setActiveTab("live")}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
              activeTab === "live" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Live Web View
          </button>
          <button 
            onClick={() => setActiveTab("extracted")}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
              activeTab === "extracted" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Extracted Table ({extractedRows.length})
          </button>
        </div>
      </div>

      {/* MAIN VIEWPORT BODY */}
      <div className="flex-1 overflow-hidden relative bg-slate-950 flex flex-col">
        {activeTab === "live" ? (
          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* Live Web Space Container */}
            <div className={`w-full bg-slate-900 border rounded-xl p-4 shadow-inner relative overflow-hidden transition-colors duration-500 ${
              agentMode === "scraping" ? "border-emerald-800/80" :
              agentMode === "grounding" ? "border-cyan-800/80" :
              "border-indigo-800/80"
            }`}>
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                agentMode === "scraping" ? "from-emerald-500 via-teal-500 to-emerald-400 animate-pulse" :
                agentMode === "grounding" ? "from-cyan-500 via-blue-500 to-sky-400 animate-pulse" :
                "from-indigo-500 via-purple-500 to-indigo-400 animate-pulse"
              }`}></div>
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-slate-200 text-sm truncate max-w-[280px]">{activeUrl}</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" /> 98.8% Grounded
                </span>
              </div>

              {/* Live Extraction Cards */}
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-emerald-900/80 relative">
                  <span className="absolute -top-2 right-3 text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono font-bold">
                    EXTRACTED STARTUP DATA
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-slate-100">Bangladesh Tech Funding:</strong> Regional platforms (ShopUp, Chaldal, Pathao) aggregate <strong>$135M+</strong> total raised capital across 2024–2025.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-cyan-900/80 relative">
                  <span className="absolute -top-2 right-3 text-[9px] bg-cyan-600 text-white px-1.5 py-0.2 rounded font-mono font-bold">
                    CITATION VERIFIED
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-slate-100">Fintech Expansion:</strong> Razorpay & Khatabook SME payments digital volume crossed <strong>$475M</strong> with verified bank integrations.
                  </p>
                </div>
              </div>
            </div>

            {/* REAL-TIME LOG & EXECUTION STREAM */}
            <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col min-h-[160px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  Live Execution & DOM Log Stream
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Real-time Stream</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[11px] pr-1">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2 text-slate-300 py-0.5 border-b border-slate-800/40 last:border-0">
                    <span className="text-slate-500 shrink-0 text-[10px]">{log.timestamp}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                      log.mode === "scraping" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" :
                      log.mode === "grounding" ? "bg-cyan-950 text-cyan-300 border border-cyan-800" :
                      log.mode === "syncing" ? "bg-indigo-950 text-indigo-300 border border-indigo-800" :
                      "bg-amber-950 text-amber-300 border border-amber-800"
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
          /* EXTRACTED TABLE UTILITY VIEW */
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Extracted Structured Table Payload</span>
              
              {/* UTILITY BUTTONS */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition"
                  title="Export Extracted Rows as CSV File"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handlePushToChat}
                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1 shadow transition"
                  title="Send Table Markdown to Chat Composer"
                >
                  {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{copiedNotification ? "Copied!" : "Send to Chat"}</span>
                </button>
              </div>
            </div>

            {/* EXTRACTED DATA GRID */}
            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                  <tr>
                    <th className="p-2.5 font-medium">Startup</th>
                    <th className="p-2.5 font-medium">Sector</th>
                    <th className="p-2.5 font-medium">Funding</th>
                    <th className="p-2.5 font-medium">Region</th>
                    <th className="p-2.5 font-medium">Trust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {extractedRows.map(row => (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-2.5 font-semibold text-indigo-300">{row.startup}</td>
                      <td className="p-2.5 text-slate-300">{row.sector}</td>
                      <td className="p-2.5 text-emerald-400 font-mono font-medium">{row.funding}</td>
                      <td className="p-2.5 text-slate-300">{row.region}</td>
                      <td className="p-2.5 font-mono text-cyan-400 font-semibold">{row.trustScore}%</td>
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
