"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Download,
  Check,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DocumentPage {
  pageNumber: number;
  title?: string;
  content: string;
  bbox?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in [0, 1000] space
}

export interface DocArtifactProps {
  initialTitle?: string;
  initialContent?: string;
  targetPage?: number;
  targetBbox?: [number, number, number, number];
  sourceRef?: string;
  pages?: DocumentPage[];
  isStreaming?: boolean;
}

const DEFAULT_PAGES: DocumentPage[] = [
  {
    pageNumber: 1,
    title: "Executive Summary & Market Dynamics",
    content: `1. Executive Overview
South Asian emerging markets demonstrate massive momentum in digital commerce, with over 68% of transactions initiated through social platforms (Facebook, WhatsApp, and TikTok).

2. Structural Friction Points
- High Cash-on-Delivery (COD) default and return-to-origin (RTO) rates of 24.8%.
- Fragmented courier logistics with lack of automated dispatch reconciliation.
- Severe memory constraints on consumer devices (average 2GB RAM / 3G mobile connections).

3. The Shothik Solution
An autonomous AI BaaS platform providing 1-click merchant storefronts, automated bKash/Nagad checkout verification, and low-latency Edge/WASM execution.`,
    bbox: [120, 80, 380, 920],
  },
  {
    pageNumber: 2,
    title: "Revenue Model & Unit Economics",
    content: `1. Financial Projections (FY 2026-2027)
- Target Addressable Market (TAM): $2.4B in South Asian digital commerce enabling software.
- Serviceable Obtainable Market (SOM): $142M in Bangladesh and diaspora SME retail.

2. Unit Economics
- Average Revenue Per User (ARPU): $48/month.
- Customer Acquisition Cost (CAC): $12.40 via organic merchant-to-merchant referrals.
- LTV / CAC Ratio: 11.6x with net revenue retention of 134%.

3. Strategic Milestones
- Q1: Onboard 5,000 verified merchants across Dhaka, Chittagong, and Sylhet.
- Q2: Expand automated Steadfast courier routing across 64 administrative districts.`,
    bbox: [150, 100, 420, 900],
  },
  {
    pageNumber: 3,
    title: "Security, Governance & BaaS Architecture",
    content: `1. Zero-Trust Architecture
All merchant data, transactions, and LLM completions are guarded by:
- 100% PostgreSQL Row-Level Security (RLS) via InsForge BaaS.
- Ephemeral MicroVM sandboxing for untrusted code execution.
- Hardware-isolated key custody for payment API tokens.

2. Compliance & Export Incentives
Fully compliant with Bangladesh Bank Form C remittances and NBR SRO 0% tax exemptions for software exports.`,
    bbox: [100, 80, 350, 920],
  },
];

export function DocArtifact({
  initialTitle = "Shothik Executive Business Briefing",
  initialContent,
  targetPage = 1,
  targetBbox,
  sourceRef,
  pages = DEFAULT_PAGES,
  isStreaming = false,
}: DocArtifactProps) {
  const [currentPage, setCurrentPage] = useState<number>(targetPage);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeBbox, setActiveBbox] = useState<[number, number, number, number] | undefined>(targetBbox);
  const [copied, setCopied] = useState<boolean>(false);
  const [highlightPulse, setHighlightPulse] = useState<boolean>(true);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Sync targetPage or targetBbox whenever parent props change
  useEffect(() => {
    if (targetPage && targetPage >= 1 && targetPage <= pages.length) {
      setCurrentPage(targetPage);
    }
  }, [targetPage, pages.length]);

  useEffect(() => {
    if (targetBbox) {
      setActiveBbox(targetBbox);
      setHighlightPulse(true);
      const timer = setTimeout(() => setHighlightPulse(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [targetBbox, sourceRef]);

  // Parse sourceRef if targetPage / targetBbox wasn't explicitly passed
  useEffect(() => {
    if (sourceRef && !targetBbox) {
      const parts = sourceRef.split(":");
      if (parts[1]?.startsWith("p")) {
        const pageNum = parseInt(parts[1].replace(/\D/g, ""), 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pages.length) {
          setCurrentPage(pageNum);
        }
      }
      if (parts[2]?.includes(",")) {
        const coords = parts[2].split(",").map((n) => parseFloat(n.trim()));
        if (coords.length === 4 && coords.every((n) => !isNaN(n))) {
          setActiveBbox(coords as [number, number, number, number]);
          setHighlightPulse(true);
        }
      }
    }
  }, [sourceRef, pages.length, targetBbox]);

  const activeDocPage = pages.find((p) => p.pageNumber === currentPage) || pages[0];

  const handleExport = () => {
    const fullText = `# ${initialTitle}\n\n` + pages.map((p) => `## Page ${p.pageNumber}: ${p.title || ""}\n\n${p.content}`).join("\n\n---\n\n");
    const blob = new Blob([fullText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${initialTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < pages.length) setCurrentPage((prev) => prev + 1);
  };

  // Keyboard Navigation: ← and → to flip document pages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      if (e.key === "ArrowLeft") {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
      } else if (e.key === "ArrowRight") {
        if (currentPage < pages.length) setCurrentPage((prev) => prev + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, pages.length]);

  // Compute SVG highlight bounding box coordinates in normalized percentage space
  const currentBbox = activeBbox || activeDocPage?.bbox;
  const highlightStyle = currentBbox
    ? {
        top: `${(currentBbox[0] / 1000) * 100}%`,
        left: `${(currentBbox[1] / 1000) * 100}%`,
        height: `${((currentBbox[2] - currentBbox[0]) / 1000) * 100}%`,
        width: `${((currentBbox[3] - currentBbox[1]) / 1000) * 100}%`,
      }
    : null;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* ── Header Toolbar ── */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/80 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-slate-200 truncate max-w-[180px] sm:max-w-xs">
            {initialTitle}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono shrink-0">
            Page {currentPage} of {pages.length}
          </span>
        </div>

        {/* Navigation & Zoom controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center border border-slate-800 rounded-lg bg-slate-900/60 p-0.5">
            <Button
              size="icon"
              variant="ghost"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              aria-label="Previous Page"
              className="h-6 w-6 text-slate-300 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="px-1.5 text-[11px] font-mono text-slate-300 font-semibold">
              {currentPage}
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleNextPage}
              disabled={currentPage >= pages.length}
              aria-label="Next Page"
              className="h-6 w-6 text-slate-300 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="hidden sm:flex items-center border border-slate-800 rounded-lg bg-slate-900/60 p-0.5">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
              aria-label="Zoom out"
              className="h-6 w-6 text-slate-400 hover:text-white"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="px-1 text-[10px] font-mono text-slate-400">{zoomLevel}%</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
              aria-label="Zoom in"
              className="h-6 w-6 text-slate-400 hover:text-white"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            className="h-7 px-2.5 text-[11px] font-semibold border-slate-800 text-slate-300 hover:bg-slate-800 gap-1"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Download className="h-3 w-3 text-amber-400" />}
            <span>{copied ? "Copied" : "Export"}</span>
          </Button>
        </div>
      </div>

      {/* ── Document Canvas Stage ── */}
      <div
        ref={pageContainerRef}
        className="flex-1 min-h-0 p-4 sm:p-6 overflow-auto bg-slate-950/90 flex flex-col items-center custom-scrollbar"
      >
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
          className="relative w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl transition-transform duration-200"
        >
          {/* Document Page Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">
                {activeDocPage.title || `Document Section ${currentPage}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {currentBbox && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  <Crosshair className="h-3 w-3 text-amber-400" />
                  <span>Grounding Box Active</span>
                </span>
              )}
              <span className="text-[10px] font-mono text-slate-500">
                Sheet {currentPage}/{pages.length}
              </span>
            </div>
          </div>

          {/* Document Content View */}
          <div className="relative font-sans text-xs sm:text-sm text-slate-200 leading-relaxed space-y-4 whitespace-pre-wrap">
            {activeDocPage.content}

            {/* ── Pulsing Bounding Box Grounding Highlight ── */}
            {highlightStyle && (
              <div
                style={highlightStyle}
                className={cn(
                  "absolute pointer-events-none rounded-lg border-2 border-amber-400 bg-amber-400/10",
                  "shadow-[0_0_20px_rgba(251,191,36,0.35)] transition-all duration-300",
                  highlightPulse ? "animate-pulse ring-2 ring-amber-400/40" : "opacity-85"
                )}
              >
                <div className="absolute -top-3 -right-2 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-mono font-bold uppercase shadow-sm">
                  Cited Evidence
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Page Strip ── */}
      <div className="flex items-center justify-center gap-1.5 px-4 py-2 border-t border-slate-800 bg-slate-900/60 shrink-0 overflow-x-auto no-scrollbar">
        {pages.map((p) => (
          <button
            key={p.pageNumber}
            type="button"
            onClick={() => {
              setCurrentPage(p.pageNumber);
              setActiveBbox(p.bbox);
            }}
            className={cn(
              "px-3 py-1 rounded-md text-[10px] font-mono font-semibold transition cursor-pointer",
              currentPage === p.pageNumber
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs"
                : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            )}
          >
            Page {p.pageNumber}
          </button>
        ))}
      </div>
    </div>
  );
}

