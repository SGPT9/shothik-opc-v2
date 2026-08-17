

import { useState, useEffect, useRef } from "react";
import { 
  Globe, 
  Play, 
  Pause, 
  X, 
  Terminal, 
  Database,
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  Layers,
  Check,
  RefreshCw,
  Copy,
  Laptop,
  Smartphone,
  TabletIcon,
  Server,
  Lock,
  User,
  AlertTriangle,
  ArrowRight,
  Table,
  FileText,
  Presentation,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkspaceType = "browser" | "sheet" | "slides" | "staging" | "editor";

export interface ParallelAgentSpaceProps {
  isOpen: boolean;
  onClose: () => void;
  spaceTitle?: string;
  runId?: string | null;
  sessionId?: string | null;
  stagingUrl?: string | null;
  appName?: string | null;
  dbName?: string | null;
  dbConnectionString?: string | null;
  workspaceType?: WorkspaceType;
  onCommentSelection?: (text: string) => void;
}

interface SimulatedLog {
  timestamp: string;
  level: "INFO" | "WARN" | "SUCCESS" | "ERROR";
  message: string;
}

export function ParallelAgentSpace({
  isOpen,
  onClose,
  spaceTitle = "Workspace Canvas",
  runId,
  sessionId,
  stagingUrl,
  appName,
  dbName,
  dbConnectionString,
  workspaceType = "browser", // default to browser to show web tasks!
  onCommentSelection,
}: ParallelAgentSpaceProps) {
  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedDb, setCopiedDb] = useState(false);
  const [logs, setLogs] = useState<SimulatedLog[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Browser Agent State Simulated Controls
  const [isHumanInLoop, setIsHumanInLoop] = useState(true);
  const [browserUrl, setBrowserUrl] = useState("https://linkedin.com/login");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [automationStep, setAutomationStep] = useState<"login" | "searching" | "extracted">("login");
  const [scrapedProfiles, setScrapedProfiles] = useState<Array<{ name: string; title: string; location: string }>>([]);

  // Editor selection comment state
  const [floatingMenuCoords, setFloatingMenuCoords] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  // Spreadsheet mockup state
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  // Slides mockup state
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const slides = [
    { title: "Shothik Platform Overview", subtitle: "Building Next-Gen Autonomous AI Agents" },
    { title: "System Architecture", subtitle: "Combining Browser-Use, Page-Agent & PaaS staging" },
    { title: "Market Growth & Strategy", subtitle: "Expanding regional developer workspaces" },
  ];

  const resolvedAppName = appName || (runId ? `shothik-app-${runId.slice(0, 8)}` : "shothik-staging-app");
  const resolvedDbName = dbName || `${resolvedAppName}-db`;
  const resolvedDbConn = dbConnectionString || `postgresql://postgres:postgres@187.127.125.115:5432/${resolvedDbName}`;

  // Simulated live build logs generator
  useEffect(() => {
    if (!isOpen) return;

    setLogs([
      { timestamp: "10:15:00", level: "INFO", message: `[workspace] Preparing active environment for run: ${runId || "active-run"}` },
      { timestamp: "10:15:02", level: "INFO", message: "[workspace] Loading template files..." },
      { timestamp: "10:15:05", level: "SUCCESS", message: `[workspace] Syncing workspace code branch...` },
      { timestamp: "10:15:07", level: "INFO", message: "[workspace] Resolving workspace address..." },
    ]);

    let logCounter = 0;
    const logInterval = setInterval(() => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const mockLogPool: SimulatedLog[] = [
        { timestamp: time, level: "INFO", message: "[workspace] Preparing application files..." },
        { timestamp: time, level: "INFO", message: "[workspace] Updating workspace packages..." },
        { timestamp: time, level: "INFO", message: "[workspace] Launching preview server..." },
        { timestamp: time, level: "SUCCESS", message: "[workspace] Preview server successfully created" },
        { timestamp: time, level: "INFO", message: `[storage] Creating workspace database: ${resolvedDbName}` },
        { timestamp: time, level: "SUCCESS", message: `[storage] Database active` },
        { timestamp: time, level: "INFO", message: "[workspace] Routing secure preview link..." },
        { timestamp: time, level: "SUCCESS", message: `[workspace] Preview is online and running` },
      ];

      if (logCounter < mockLogPool.length) {
        setLogs(prev => [...prev, mockLogPool[logCounter]]);
        logCounter++;
      } else {
        clearInterval(logInterval);
      }
    }, 3000);

    return () => clearInterval(logInterval);
  }, [isOpen, runId, resolvedDbName]);

  // Scroll to bottom of terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, workspaceType]);

  // Handle global Escape key to close space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle document editor text selection
  const handleEditorMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setFloatingMenuCoords(null);
      setSelectedText("");
      return;
    }

    const text = selection.toString().trim();
    if (text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const parentRect = editorRef.current?.getBoundingClientRect();

      if (parentRect) {
        setFloatingMenuCoords({
          x: rect.left - parentRect.left + rect.width / 2,
          y: rect.top - parentRect.top - 40,
        });
        setSelectedText(text);
      }
    }
  };

  const handleTriggerComment = () => {
    if (onCommentSelection && selectedText) {
      onCommentSelection(selectedText);
      setFloatingMenuCoords(null);
      // Clear selection
      window.getSelection()?.removeAllRanges();
    }
  };

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    if (!stagingUrl) return;
    navigator.clipboard.writeText(stagingUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyDb = () => {
    navigator.clipboard.writeText(resolvedDbConn);
    setCopiedDb(true);
    setTimeout(() => setCopiedDb(false), 2000);
  };

  // Human-in-the-Loop simulation action trigger
  const handleSimulateLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput) return;
    
    setIsHumanInLoop(false);
    setAutomationStep("searching");
    setBrowserUrl("https://linkedin.com/search?q=Frontend+Engineers+London");

    // Simulate search automation sequence
    setTimeout(() => {
      setScrapedProfiles([
        { name: "Sarah Jenkins", title: "Senior Frontend Architect", location: "London, UK" },
        { name: "David Miller", title: "Lead React Engineer", location: "Greater London" },
        { name: "Alisha Patel", title: "Staff UI Engineer", location: "London Area" },
      ]);
      setAutomationStep("extracted");
    }, 3500);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 border-l border-slate-800 shadow-2xl text-slate-100 transition-all duration-300 ease-in-out font-sans">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className={cn(
              "animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-75",
              isHumanInLoop && workspaceType === "browser" ? "bg-amber-400" : "bg-emerald-400"
            )}></span>
            <span className={cn(
              "relative inline-flex rounded-full h-2.5 w-2.5",
              isHumanInLoop && workspaceType === "browser" ? "bg-amber-500" : "bg-emerald-500"
            )}></span>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-100 flex items-center gap-2">
              <span className="truncate max-w-[200px]">{spaceTitle}</span>
              <span className={cn(
                "px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold border",
                workspaceType === "browser"
                  ? isHumanInLoop 
                    ? "bg-amber-950/80 text-amber-300 border-amber-700/60 animate-pulse"
                    : "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
                  : "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
              )}>
                {workspaceType === "browser"
                  ? isHumanInLoop 
                    ? "⚠️ Action Needed"
                    : "⚡ Running Task"
                  : workspaceType === "sheet" 
                    ? "📊 Spreadsheet"
                    : workspaceType === "slides"
                      ? "🎬 Presentation"
                      : workspaceType === "editor"
                        ? "📝 Code Canvas"
                        : "● Online"}
              </span>
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition cursor-pointer select-none"
          aria-label="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-hidden relative bg-slate-950 flex flex-col">
        
        {/* BROWSER WORKSPACE VIEW */}
        {workspaceType === "browser" && (
          <div className="flex-1 p-4 flex flex-col overflow-hidden">
            
            {/* Address Bar */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800/80 rounded-t-xl px-3 py-2 border-b-0 shrink-0 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <div className="flex-1 flex items-center bg-slate-950 border border-slate-800/60 px-2 py-0.5 rounded text-slate-300 font-mono text-[10px] select-none">
                {browserUrl}
              </div>
            </div>

            {/* Browser frame */}
            <div className="flex-1 bg-slate-900 border border-slate-800/80 rounded-b-xl overflow-hidden shadow-inner flex flex-col relative">
              
              {/* HITL Warning */}
              {isHumanInLoop && (
                <div className="bg-amber-950/80 border-b border-amber-800/60 px-3 py-2 flex items-start gap-2 text-amber-200 text-xs select-none">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>Attention Needed:</strong> A login check is required. You can interact directly with the form below to complete it.
                  </div>
                </div>
              )}

              {/* Viewport Page Body */}
              <div className="flex-1 p-6 flex flex-col items-center justify-center overflow-y-auto">
                {automationStep === "login" && (
                  <form onSubmit={handleSimulateLoginSubmit} className="w-full max-w-sm bg-slate-950 border border-slate-800/80 rounded-xl p-5 shadow-2xl space-y-4">
                    <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm mb-2 pb-2 border-b border-slate-900 select-none">
                      <Lock className="w-4 h-4 text-cyan-400" />
                      <span>LinkedIn Login</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase select-none">Username</label>
                      <div className="flex items-center bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500 mr-2" />
                        <input 
                          type="text"
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          placeholder="twin@shothik.app"
                          className="bg-transparent border-0 outline-none text-xs text-slate-300 w-full placeholder:text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase select-none">Password</label>
                      <div className="flex items-center bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-500 mr-2" />
                        <input 
                          type="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="••••••••"
                          className="bg-transparent border-0 outline-none text-xs text-slate-300 w-full placeholder:text-slate-700"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!usernameInput || !passwordInput}
                      className={cn(
                        "w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-lg select-none",
                        usernameInput && passwordInput
                          ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20 cursor-pointer"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      )}
                    >
                      <span>Log In & Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}

                {automationStep === "searching" && (
                  <div className="flex flex-col items-center justify-center gap-3 select-none text-slate-400">
                    <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                    <p className="text-xs font-mono">Working: Searching LinkedIn for Frontend Engineers in London...</p>
                  </div>
                )}

                {automationStep === "extracted" && (
                  <div className="w-full max-w-md bg-slate-950 border border-slate-800/80 rounded-xl p-4 shadow-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2 text-xs select-none">
                      <span className="font-semibold text-slate-200">Extracted Contacts</span>
                      <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                        ✓ Done
                      </span>
                    </div>

                    <div className="divide-y divide-slate-900">
                      {scrapedProfiles.map((p, i) => (
                        <div key={i} className="py-2.5 flex items-start justify-between">
                          <div>
                            <p className="text-xs font-semibold text-indigo-300">{p.name}</p>
                            <p className="text-[11px] text-slate-400">{p.title}</p>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">{p.location}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* SPREADSHEET CANVAS VIEW */}
        {workspaceType === "sheet" && (
          <div className="flex-1 p-4 flex flex-col overflow-hidden">
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
              <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs select-none shrink-0">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-emerald-400" />
                  Sourced Startups leads list.csv
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Formula bar: {selectedCell ? `${selectedCell} selected` : "Select a cell"}</span>
              </div>

              {/* SpreadSheet Grid */}
              <div className="flex-1 overflow-auto bg-slate-950">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-mono text-[10px] sticky top-0">
                    <tr>
                      <th className="p-2 border border-slate-800/80 text-center w-10"></th>
                      <th className="p-2 border border-slate-800/80">A (Startup)</th>
                      <th className="p-2 border border-slate-800/80">B (Sector)</th>
                      <th className="p-2 border border-slate-800/80">C (Funding)</th>
                      <th className="p-2 border border-slate-800/80">D (Region)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300 font-sans">
                    {[
                      { row: 1, name: "ShopUp", sector: "B2B E-Commerce", funding: "$75M", region: "Bangladesh" },
                      { row: 2, name: "Chaldal", sector: "Grocery Logistics", funding: "$35M", region: "Bangladesh" },
                      { row: 3, name: "Razorpay", sector: "Fintech Payments", funding: "$375M", region: "India" },
                      { row: 4, name: "Pathao", sector: "Logistics & Fintech", funding: "$25M", region: "Bangladesh" },
                      { row: 5, name: "Khatabook", sector: "SME Accounting", funding: "$100M", region: "India" },
                    ].map((r) => (
                      <tr key={r.row} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-2 border border-slate-800/80 bg-slate-900 text-center font-mono text-[10px] text-slate-500 select-none">{r.row}</td>
                        <td 
                          onClick={() => setSelectedCell(`A${r.row}`)}
                          className={cn("p-2 border border-slate-800/80 cursor-pointer font-semibold", selectedCell === `A${r.row}` && "bg-indigo-950/80 text-indigo-200 border-indigo-500")}
                        >
                          {r.name}
                        </td>
                        <td 
                          onClick={() => setSelectedCell(`B${r.row}`)}
                          className={cn("p-2 border border-slate-800/80 cursor-pointer", selectedCell === `B${r.row}` && "bg-indigo-950/80 text-indigo-200 border-indigo-500")}
                        >
                          {r.sector}
                        </td>
                        <td 
                          onClick={() => setSelectedCell(`C${r.row}`)}
                          className={cn("p-2 border border-slate-800/80 cursor-pointer text-emerald-400 font-mono", selectedCell === `C${r.row}` && "bg-indigo-950/80 text-indigo-200 border-indigo-500")}
                        >
                          {r.funding}
                        </td>
                        <td 
                          onClick={() => setSelectedCell(`D${r.row}`)}
                          className={cn("p-2 border border-slate-800/80 cursor-pointer", selectedCell === `D${r.row}` && "bg-indigo-950/80 text-indigo-200 border-indigo-500")}
                        >
                          {r.region}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Contextual Cell action menu */}
              {selectedCell && (
                <div className="bg-slate-900 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs select-none shrink-0 animation-in fade-in">
                  <span className="text-slate-400">Selected cell: <strong className="text-indigo-400">{selectedCell}</strong></span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        if (onCommentSelection) onCommentSelection(`Analyze data for cell ${selectedCell}`);
                        setSelectedCell(null);
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold flex items-center gap-1.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Ask about {selectedCell}</span>
                    </button>
                    <button 
                      onClick={() => setSelectedCell(null)}
                      className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded text-[11px]"
                    >
                      Deselect
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* SLIDES VIEW */}
        {workspaceType === "slides" && (
          <div className="flex-1 p-4 flex flex-col overflow-hidden">
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between p-6">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs select-none shrink-0">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Presentation className="w-3.5 h-3.5 text-cyan-400" />
                  Presentation: Pitch Deck.key
                </span>
                <span className="text-slate-500 font-mono">Slide {activeSlideIndex + 1} of {slides.length}</span>
              </div>

              {/* Slide Screen Canvas */}
              <div className="flex-1 bg-slate-950 border border-slate-850 rounded-xl p-8 flex flex-col justify-center items-center text-center shadow-2xl relative transition-all duration-300">
                <span className="absolute top-4 left-4 text-[10px] text-slate-700 font-mono font-bold uppercase select-none">SHOTHIK AI SLIDE ENGINE</span>
                <h2 className="text-2xl font-bold text-slate-100 max-w-md mb-2">{slides[activeSlideIndex].title}</h2>
                <p className="text-sm text-cyan-400/90 max-w-sm font-light">{slides[activeSlideIndex].subtitle}</p>
              </div>

              {/* Slide Navigation controls */}
              <div className="flex items-center justify-between mt-6 shrink-0 select-none">
                <button 
                  onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                  disabled={activeSlideIndex === 0}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded text-xs transition"
                >
                  Previous
                </button>
                <div className="flex gap-1.5">
                  {slides.map((_, i) => (
                    <span 
                      key={i}
                      className={cn("w-2 h-2 rounded-full transition", i === activeSlideIndex ? "bg-cyan-400" : "bg-slate-800")}
                    />
                  ))}
                </div>
                <button 
                  onClick={() => setActiveSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                  disabled={activeSlideIndex === slides.length - 1}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded text-xs transition"
                >
                  Next Slide
                </button>
              </div>

            </div>
          </div>
        )}

        {/* DOCUMENT / CODE CANVAS EDITOR VIEW */}
        {workspaceType === "editor" && (
          <div className="flex-1 p-4 flex flex-col overflow-hidden">
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col relative">
              <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs select-none shrink-0">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  workspace-client.ts
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Interactive Editor Mode</span>
              </div>

              {/* Editor Workspace Canvas */}
              <div 
                ref={editorRef}
                onMouseUp={handleEditorMouseUp}
                className="flex-1 p-6 overflow-y-auto bg-slate-950 font-mono text-xs leading-relaxed text-slate-300 outline-none select-text relative"
              >
                {/* Float comment-like button overlay */}
                {floatingMenuCoords && (
                  <button 
                    onClick={handleTriggerComment}
                    className="absolute bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg shadow-xl border border-indigo-500 text-[11px] font-semibold flex items-center gap-1 transition-all animate-in zoom-in-95 duration-100 z-50 hover:scale-105"
                    style={{
                      left: `${floatingMenuCoords.x}px`,
                      top: `${floatingMenuCoords.y}px`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-100 shrink-0" />
                    <span>Ask Shothik</span>
                  </button>
                )}

                <span className="text-slate-600 block select-none mb-2">// Redesigned workspace client code block</span>
                <p className="mb-3">
                  <span className="text-purple-400">import</span> &#123; <span className="text-cyan-400">execSync</span> &#125; <span className="text-purple-400">from</span> <span className="text-emerald-400">"child_process"</span>;
                </p>
                <p className="mb-3">
                  <span className="text-purple-400">export class</span> <span className="text-yellow-400">GitWorkspaceClient</span> &#123;
                </p>
                <p className="pl-4 mb-2">
                  <span className="text-purple-400">private</span> <span className="text-slate-400">baseDir</span>: <span className="text-cyan-400">string</span>;
                </p>
                <p className="pl-4 mb-3">
                  <span className="text-purple-400">constructor</span>() &#123;
                </p>
                <p className="pl-8 mb-2">
                  <span className="text-purple-400">this</span>.<span className="text-slate-400">baseDir</span> = <span className="text-emerald-400">"tmp/workspaces"</span>;
                </p>
                <p className="pl-4 mb-3">
                  &#125;
                </p>
                <p className="pl-4 mb-3">
                  <span className="text-purple-400">async</span> <span className="text-blue-400">prepareWorkspace</span>(<span className="text-slate-400">runId</span>: <span className="text-cyan-400">string</span>) &#123;
                </p>
                <p className="pl-8 mb-2">
                  <span className="text-purple-400">const</span> <span className="text-slate-400">path</span> = <span className="text-purple-400">await this</span>.<span className="text-blue-400">resolvePath</span>(<span className="text-slate-400">runId</span>);
                </p>
                <p className="pl-8 mb-2">
                  <span className="text-cyan-400">logger</span>.<span className="text-blue-400">info</span>(<span className="text-emerald-400">"[workspace] Preparing path"</span>, &#123; <span className="text-slate-400">path</span> &#125;);
                </p>
                <p className="pl-4 mb-2">
                  &#125;
                </p>
                <p className="mb-2">
                  &#125;
                </p>
              </div>

              <div className="bg-slate-905 px-4 py-2.5 border-t border-slate-800 text-[10px] text-slate-500 select-none leading-relaxed shrink-0">
                💡 Highlight any line of code or text above to trigger the inline <strong className="text-indigo-400">Ask Shothik</strong> commentary overlay.
              </div>

            </div>
          </div>
        )}

        {/* ONLINE APP PREVIEW WORKSPACE */}
        {workspaceType === "staging" && stagingUrl && (
          <div className="flex-1 p-4 flex flex-col overflow-hidden">
            
            {/* Target Address Info Bar */}
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800/80 rounded-t-xl px-3.5 py-2 shrink-0 border-b-0 text-xs">
              <div className="flex items-center gap-2 truncate max-w-[70%]">
                <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-mono text-[11px] text-slate-300 truncate">{stagingUrl}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCopyUrl}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                  title="Copy URL"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a 
                  href={stagingUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Embedded Iframe Container */}
            <div className="flex-1 bg-white border border-slate-800/80 rounded-b-xl overflow-hidden shadow-inner relative flex justify-center items-center">
              <iframe 
                src={stagingUrl} 
                className={cn(
                  "border-0 transition-all duration-300 bg-white h-full",
                  viewportMode === "desktop" && "w-full",
                  viewportMode === "tablet" && "w-[768px]",
                  viewportMode === "mobile" && "w-[375px]"
                )}
                title="Staging Preview"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
