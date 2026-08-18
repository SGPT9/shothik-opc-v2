import React, { useState, useEffect } from "react";
import {
  FileText,
  Table,
  Network,
  Presentation,
  Globe,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Mic,
  Video,
  Rocket,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScenarioLabModal } from "@/components/scenariolab/ScenarioLabModal";
import { PrintPreflightModal } from "./PrintPreflightModal";
import { CommercializeBookModal } from "./CommercializeBookModal";
import { VTuberVoiceAvatarOverlay } from "@/components/voice/VTuberVoiceAvatarOverlay";
import { exportManuscriptToMarkdown, exportManuscriptToHTML } from "../utils/epubPdfExporter";

export type CanvasTab = "editor" | "sheet" | "mindmap" | "slides" | "web_preview";

export interface BookCenterCanvasProps {
  activeTab: CanvasTab;
  onTabChange: (tab: CanvasTab) => void;
  editorText: string;
  onEditorTextChange: (text: string) => void;
  livePreviewUrl?: string;
}

// ── Bijoy to Unicode Converter Engine ──
function convertBijoyToUnicode(src: string): string {
  if (!src) return "";
  let res = src;

  const bijoyPairs: [string, string][] = [
    ["Av", "আ"], ["A", "অ"], ["B", "ই"], ["C", "ঈ"], ["D", "উ"], ["E", "ঊ"], ["F", "ঋ"], ["G", "এ"], ["H", "ঐ"], ["I", "ও"], ["J", "ঔ"],
    ["k", "ক"], ["L", "খ"], ["g", "গ"], ["M", "ঘ"], ["N", "ঙ"],
    ["P", "চ"], ["Q", "ছ"], ["R", "জ"], ["S", "ঝ"], ["T", "ঞ"],
    ["U", "ট"], ["V", "ঠ"], ["W", "ড"], ["X", "ঢ"], ["Y", "ণ"],
    ["Z", "ত"], ["a", "থ"], ["b", "দ"], ["c", "ধ"], ["d", "ন"],
    ["e", "প"], ["f", "ফ"], ["h", "ব"], ["i", "ভ"], ["j", "ম"],
    ["l", "য"], ["m", "র"], ["n", "ল"], ["o", "শ"], ["p", "ষ"], ["q", "স"], ["r", "হ"],
    ["s", "ড়"], ["t", "ঢ়"], ["u", "য়"],
    ["v", "া"], ["w", "ি"], ["x", "ী"], ["y", "ু"], ["z", "ূ"], ["{", "ৃ"], ["|", "ে"], ["}", "ৈ"],
    ["~", "ৌ"],
  ];

  for (const [k, v] of bijoyPairs) {
    res = res.replaceAll(k, v);
  }
  return res;
}

export function BookCenterCanvas({
  activeTab,
  onTabChange,
  editorText,
  onEditorTextChange,
  livePreviewUrl = "https://yourbusiness.com",
}: BookCenterCanvasProps) {
  const [isInspectorActive, setIsInspectorActive] = useState(false);
  const [selectedElementInfo, setSelectedElementInfo] = useState<{ tagName: string; textContent: string } | null>(null);
  const [isScenarioLabOpen, setIsScenarioLabOpen] = useState(false);
  const [isPreflightOpen, setIsPreflightOpen] = useState(false);
  const [isVTuberOpen, setIsVTuberOpen] = useState(false);
  const [isCommercializeOpen, setIsCommercializeOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const wordCount = editorText.trim() ? editorText.trim().split(/\s+/).length : 0;
  const readingTimeMin = Math.ceil(wordCount / 200);

  const handleConvertBijoy = () => {
    const converted = convertBijoyToUnicode(editorText);
    onEditorTextChange(converted);
  };

  const SLIDES_DECK = [
    {
      title: "1. Problem: Zero Autonomy for Solopreneurs",
      points: [
        "Founders spend 80% of their time on mundane operations instead of core product.",
        "Emerging market founders lack affordable access to senior engineering & marketing teams.",
        "Manual payment reconciliation & logistics tracking leads to high drop-offs.",
      ],
      notes: "Explain how single-operator companies struggle with fragmented tooling in South Asia.",
    },
    {
      title: "2. Solution: Operator-Powered Company (OPC)",
      points: [
        "10 Autonomous Polsia Agent Personas working on 100% continuous autopilot.",
        "Automated Wayfinder ticket-to-code execution in isolated Docker containers.",
        "1-Click bKash MFS & Steadfast Courier integration out of the box.",
      ],
      notes: "Highlight the 100% autonomous delivery loop with zero human code turns.",
    },
    {
      title: "3. Market Opportunity & Sizing (TAM/SAM/SOM)",
      points: [
        "$10.0B Total Addressable Market for AI-first autonomous commerce.",
        "$1.5B Serviceable Addressable Market across South Asia & MENA.",
        "$150M Initial SOM targeted for 2026-2027 adoption.",
      ],
      notes: "Walk through the high TAM and low customer acquisition costs.",
    },
    {
      title: "4. Unit Economics & Cash Flow P&L",
      points: [
        "65.2% Net Margin with Dokploy PaaS running <88MB RAM containers ($0.50/day).",
        "Exact 1.85% bKash transaction fee reconciliation.",
        "4.1 Month CAC payback with automated Meta Ads & Twitter/X growth channels.",
      ],
      notes: "Demonstrate five-nines availability and low cloud hosting costs.",
    },
    {
      title: "5. Milestones & The Ask",
      points: [
        "14 Live Polsia Companies launched across Bangladesh & Emerging Markets.",
        "43 Vitest suites passing with 100% test coverage.",
        "Raising $500K Seed to scale Autonomous Delivery Loops & VTuber Avatar Studio.",
      ],
      notes: "Conclude with the clear investment ask and roadmap milestones.",
    },
  ];

  const tabs: { key: CanvasTab; label: string; icon: React.ElementType }[] = [
    { key: "editor", label: "Writing Studio", icon: FileText },
    { key: "sheet", label: "Fortune Sheet", icon: Table },
    { key: "mindmap", label: "Mind Map", icon: Network },
    { key: "slides", label: "Slides Pitch", icon: Presentation },
    { key: "web_preview", label: "Web Preview", icon: Globe },
  ];

  return (
    <div className="flex h-full flex-col bg-background relative overflow-hidden">
      {/* Top Canvas Bar */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => onTabChange(t.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition whitespace-nowrap cursor-pointer",
                  activeTab === t.key
                    ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                    : "text-muted-foreground hover:bg-muted/60"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Bijoy to Unicode 1-Click Tool */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleConvertBijoy}
            className="h-7 px-2 text-[10px] font-semibold border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 gap-1 cursor-pointer"
            title="Convert Bijoy/ANSI Bengali to Standard Unicode"
          >
            <Languages className="h-3 w-3 text-emerald-400" />
            Bijoy ➔ Unicode
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => exportManuscriptToMarkdown("Shothik Book Manuscript", [{ id: "c1", title: "Chapter 1", content: editorText }])}
            className="h-7 px-2 text-[10px] font-semibold border-border/60 text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
          >
            <Download className="h-3 w-3 text-indigo-400" />
            Export MD
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => exportManuscriptToHTML("Shothik Book Manuscript", [{ id: "c1", title: "Chapter 1", content: editorText }])}
            className="h-7 px-2 text-[10px] font-semibold border-border/60 text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
          >
            <Download className="h-3 w-3 text-purple-400" />
            Ebook HTML
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPreflightOpen(true)}
            className="h-7 px-2 text-[10px] font-semibold border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 gap-1 cursor-pointer"
          >
            <Printer className="h-3 w-3" />
            Preflight
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCommercializeOpen(true)}
            className="h-7 px-2.5 text-[10px] font-semibold bg-purple-600 hover:bg-purple-500 text-white gap-1 shadow-xs cursor-pointer"
            data-testid="button-sell-in-twin"
          >
            <Rocket className="h-3 w-3" />
            Sell in Twin
          </Button>
        </div>
      </div>

      {/* Mode View Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col">
        {activeTab === "editor" && (
          <div className="flex flex-col h-full space-y-2">
            <textarea
              value={editorText}
              onChange={(e) => onEditorTextChange(e.target.value)}
              className="flex-1 w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-foreground focus:outline-none"
              placeholder="Write your chapter manuscript here in Unicode Bengali or English…"
            />
            {/* Editor Stats Status Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] font-mono text-muted-foreground shrink-0">
              <div className="flex items-center gap-3">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{editorText.length} characters</span>
                <span>•</span>
                <span>~{readingTimeMin} min read</span>
              </div>
              <span className="text-emerald-500 font-semibold">UTF-8 Bengali & English</span>
            </div>
          </div>
        )}

        {activeTab === "sheet" && (
          <div className="rounded-xl border border-border/80 bg-card p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Table className="h-4 w-4 text-indigo-400" /> Fortune Sheet — ScenarioLab™ Monte Carlo System & Financial Model
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  900-run Monte Carlo stochastic stress-testing and TAM/SAM/SOM CAC payback modeling.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsScenarioLabOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl px-4 shadow-md shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                Launch ScenarioLab™ Console
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-3 text-xs font-mono">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-1">
                <p className="text-muted-foreground text-[10px]">Availability Target</p>
                <p className="text-lg font-bold text-emerald-400">99.999%</p>
                <p className="text-[9px] text-muted-foreground">Five-Nines reliability</p>
              </div>
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3 space-y-1">
                <p className="text-muted-foreground text-[10px]">P10 Pessimistic ARR</p>
                <p className="text-lg font-bold text-indigo-400">$105.0M</p>
                <p className="text-[9px] text-muted-foreground">Low market adoption</p>
              </div>
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3 space-y-1">
                <p className="text-muted-foreground text-[10px]">P50 Median ARR (Target)</p>
                <p className="text-lg font-bold text-cyan-400">$150.0M</p>
                <p className="text-[9px] text-muted-foreground">4.1 mo CAC payback</p>
              </div>
              <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-3 space-y-1">
                <p className="text-muted-foreground text-[10px]">P90 Optimistic ARR</p>
                <p className="text-lg font-bold text-purple-400">$210.0M</p>
                <p className="text-[9px] text-muted-foreground">High viral loop coefficient</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "mindmap" && (
          <div className="rounded-xl border border-border/80 bg-card p-6 text-center space-y-4">
            <Network className="h-10 w-10 text-indigo-400 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-foreground">Interactive Character & Scene Mind Map</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                Visual node graph showing character interactions, beat pacing, and thematic arcs across chapters.
              </p>
            </div>
          </div>
        )}

        {activeTab === "slides" && (
          <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-indigo-400 font-bold uppercase">
                Slide {currentSlide + 1} of {SLIDES_DECK.length}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentSlide === 0}
                  onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
                  className="h-7 w-7 p-0 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentSlide === SLIDES_DECK.length - 1}
                  onClick={() => setCurrentSlide((p) => Math.min(SLIDES_DECK.length - 1, p + 1))}
                  className="h-7 w-7 p-0 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 rounded-xl bg-muted/40 border border-border space-y-3">
              <h4 className="text-lg font-bold text-foreground">{SLIDES_DECK[currentSlide].title}</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {SLIDES_DECK[currentSlide].points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "web_preview" && (
          <div className="flex flex-col h-full rounded-xl border border-border overflow-hidden bg-card">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50 text-xs">
              <span className="font-mono text-muted-foreground">{livePreviewUrl}</span>
              <a href={livePreviewUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1">
                <span>Open in New Tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <iframe src={livePreviewUrl} className="w-full flex-1 border-0" title="Live Preview" />
          </div>
        )}
      </div>

      {/* Modals */}
      {isScenarioLabOpen && <ScenarioLabModal isOpen={isScenarioLabOpen} onClose={() => setIsScenarioLabOpen(false)} />}
      {isPreflightOpen && <PrintPreflightModal isOpen={isPreflightOpen} onClose={() => setIsPreflightOpen(false)} />}
      {isCommercializeOpen && <CommercializeBookModal open={isCommercializeOpen} onOpenChange={setIsCommercializeOpen} />}
    </div>
  );
}
