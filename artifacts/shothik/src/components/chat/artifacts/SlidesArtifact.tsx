"use client";

import { useState, useEffect } from "react";
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Sparkles,
  Layers,
  MessageSquare,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SlideData {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  bullets: string[];
  metrics?: { label: string; value: string; trend?: string }[];
  speakerNotes: string;
  bgGradient: string;
}

interface SlidesArtifactProps {
  initialTopic?: string;
  slides?: SlideData[];
  isStreaming?: boolean;
}

export function SlidesArtifact({ initialTopic, slides: customSlides, isStreaming }: SlidesArtifactProps) {
  const topicTitle = initialTopic || "AI-Powered E-Commerce & Retail in Bangladesh";
  const [currentSlide, setCurrentSlide] = useState(0);

  const defaultSlides: SlideData[] = [
    {
      id: 1,
      tag: "Executive Summary",
      title: topicTitle,
      subtitle: "Strategic Opportunity & Market Entry Analysis for South Asia",
      bullets: [
        "Unlocking $2.4B Addressable Market across major urban hubs in Bangladesh",
        "Proprietary AI cofounder engine with BaaS database & realtime event pipeline",
        "Targeting 75%+ gross margin through direct supplier relationships & AI automation",
      ],
      metrics: [
        { label: "TAM", value: "$2.4B", trend: "+24% YoY" },
        { label: "Target Margin", value: "75.4%", trend: "High Efficiency" },
        { label: "Payback", value: "3.2 Mo", trend: "Fast ROI" },
      ],
      speakerNotes: "Introduce the problem statement, regional market timing, and automated BaaS infrastructure.",
      bgGradient: "from-slate-900 via-indigo-950/60 to-slate-900",
    },
    {
      id: 2,
      tag: "Market Analysis",
      title: "Problem & Regional Opportunity",
      subtitle: "Why Legacy Solutions Fail in South Asian E-Commerce",
      bullets: [
        "Fragmented logistics & high Cash-on-Delivery (COD) reconciliation friction",
        "Manual inventory management leading to 22% stockout losses",
        "High Customer Acquisition Cost (CAC) without hyper-localized AI personalization",
      ],
      metrics: [
        { label: "COD Friction", value: "68%", trend: "Pain Point" },
        { label: "Stockout Loss", value: "22%", trend: "Opportunity" },
      ],
      speakerNotes: "Detail regional operational bottlenecks and how AI automation addresses COD reconciliation.",
      bgGradient: "from-slate-900 via-emerald-950/50 to-slate-900",
    },
    {
      id: 3,
      tag: "Product Architecture",
      title: "Shothik 3-Fold Operating System",
      subtitle: "Thread, Canvas & ScenarioLab Integration",
      bullets: [
        "Interactive Dual-Pane Workspace: Realtime SSE Streaming & Live Canvas",
        "InsForge Postgres BaaS + PostgREST API with Vector RAG Context Memory",
        "Instant Export to Marp Slides, Interactive Sheets & Deep Research Reports",
      ],
      metrics: [
        { label: "Latency", value: "<120ms", trend: "Realtime" },
        { label: "RAG Accuracy", value: "99.2%", trend: "Vector Search" },
      ],
      speakerNotes: "Walk investors through the technical architecture and modular dual-pane workspace.",
      bgGradient: "from-slate-900 via-purple-950/50 to-slate-900",
    },
    {
      id: 4,
      tag: "Financial Model",
      title: "Unit Economics & Profitability",
      subtitle: "3-Scenario Financial Projection (BDT / USD)",
      bullets: [
        "Customer Acquisition Cost (CAC): BDT 350 / $2.90",
        "Average Order Value (AOV): BDT 1,500 / $12.50",
        "Projected Year 1 MRR: BDT 22.5M / $187.5K at 23.3x LTV/CAC ratio",
      ],
      metrics: [
        { label: "LTV / CAC", value: "23.3x", trend: "Top Tier" },
        { label: "Year 1 MRR", value: "BDT 22.5M", trend: "Base Case" },
      ],
      speakerNotes: "Emphasize exceptional LTV/CAC efficiency driven by organic founder community loops.",
      bgGradient: "from-slate-900 via-cyan-950/50 to-slate-900",
    },
    {
      id: 5,
      tag: "Execution Roadmap",
      title: "Growth & Milestone Timeline",
      subtitle: "Scaling from Launch to Market Leadership",
      bullets: [
        "Q1 2026: Beta Cohort Onboarding & RAG Memory Indexing",
        "Q2 2026: Enterprise BaaS Deployment & ScenarioLab Engine",
        "Q3 2026: Regional Expansion across South Asia & API Marketplace",
      ],
      metrics: [
        { label: "Q1 Milestone", value: "500 Founders", trend: "On Track" },
        { label: "Q3 Target", value: "5,000 SMEs", trend: "Expansion" },
      ],
      speakerNotes: "Conclude with key execution milestones and open Q&A.",
      bgGradient: "from-slate-900 via-amber-950/40 to-slate-900",
    },
  ];

  const slideList = customSlides || defaultSlides;
  // Pillar 4: Web Speech AI Voice Narration
  const [isNarrating, setIsNarrating] = useState(false);

  const handleVoiceNarration = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Web Speech API is not supported in this browser environment.");
      return;
    }

    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      return;
    }

    window.speechSynthesis.cancel();
    const activeSlide = slideList[currentSlide];
    const textToSpeak = `${activeSlide.title}. ${activeSlide.subtitle}. ${activeSlide.bullets.join(". ")}`;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      setIsNarrating(false);
      if (currentSlide < slideList.length - 1) {
        setCurrentSlide((c) => c + 1);
      }
    };

    utterance.onerror = () => setIsNarrating(false);

    setIsNarrating(true);
    window.speechSynthesis.speak(utterance);
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slideList.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slideList.length) % slideList.length);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden select-none">
      
      {/* ── Genspark-Style Canvas Header Bar ── */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Presentation className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-foreground truncate">{topicTitle}</h3>
            <p className="text-[10px] text-muted-foreground font-mono">
              Presentation Stage · Slide {currentSlide + 1} of {slideList.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Slide Navigation Buttons */}
          <div className="flex items-center rounded-lg border border-border/60 bg-background/80 p-0.5 mr-2">
            <button
              onClick={prevSlide}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition"
              title="Previous slide"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono font-bold text-foreground">
              {currentSlide + 1} / {slideList.length}
            </span>
            <button
              onClick={nextSlide}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition"
              title="Next slide"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => alert("Downloading presentation deck (.pptx / .pdf)...")}
            className="h-7 px-2.5 text-[11px] font-semibold gap-1.5"
          >
            <Download className="h-3 w-3" />
            Export
          </Button>

          {/* Pillar 4: AI Voice Presenter Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleVoiceNarration}
            className={cn(
              "h-7 px-2 text-[11px] font-semibold gap-1 transition",
              isNarrating ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "border-border/60 text-muted-foreground hover:text-foreground"
            )}
            title={isNarrating ? "Stop Slide Voice Narration" : "Start Web Speech AI Slide Narration"}
          >
            {isNarrating ? <VolumeX className="h-3 w-3 text-emerald-400 animate-pulse" /> : <Volume2 className="h-3 w-3 text-indigo-400" />}
            <span className="hidden sm:inline">{isNarrating ? "Stop Voice" : "Narrate"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const link = `https://papermark.shothik.app/view/deck_${Math.random().toString(36).substring(2, 9)}`;
              prompt("🔗 Papermark Trackable Investor Link generated (with view analytics & page time tracking):", link);
            }}
            className="h-7 px-2 text-[11px] font-semibold border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 gap-1"
          >
            <Share2 className="h-3 w-3 text-indigo-400" />
            <span className="hidden sm:inline">Trackable Link</span>
          </Button>

          <Button
            size="sm"
            className="h-7 px-2.5 text-[11px] font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white"
            onClick={() => {
              if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
              }
            }}
          >
            <Maximize2 className="h-3 w-3" />
            Present
          </Button>
        </div>
      </div>

      {/* ── Live Agentic Step Progress Banner (Genspark / Manus / ChatGPT pattern) ── */}
      {isStreaming && (
        <div className="flex items-center justify-between border-b border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs text-indigo-300 font-mono shrink-0 animate-pulse">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
            <span>AI Swarm Agent: Building slide presentation live in Canvas…</span>
          </div>
          <span className="font-bold text-indigo-400">Step 3/4 · Compiling Layout</span>
        </div>
      )}

      {/* ── Main Slide Display Canvas ── */}
      <div className="flex-1 min-h-0 p-4 md:p-6 overflow-y-auto flex flex-col justify-between items-center">
        
        {/* Slide 16:9 Stage */}
        <div
          className={cn(
            "relative w-full max-w-3xl aspect-[16/9] rounded-2xl border border-white/10 bg-gradient-to-br p-6 md:p-8 flex flex-col justify-between shadow-2xl transition-all duration-300 overflow-hidden",
            activeSlide.bgGradient
          )}
        >
          {/* Subtle ambient lighting grid overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

          {/* Top Stage Header */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
              <Sparkles className="h-3 w-3" />
              {activeSlide.tag}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground/60">
              0{activeSlide.id}
            </span>
          </div>

          {/* Center Stage Title & Bullets (Editable In-Place) */}
          <div className="relative z-10 space-y-3 my-auto">
            <h2
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const text = e.currentTarget.textContent || "";
                setSlideList((prev) =>
                  prev.map((s, idx) => (idx === currentSlide ? { ...s, title: text } : s))
                );
              }}
              className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight outline-none focus:ring-1 focus:ring-indigo-400/50 rounded px-1 transition hover:bg-white/5 cursor-text"
              title="Click to edit slide title inline"
            >
              {activeSlide.title}
            </h2>
            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const text = e.currentTarget.textContent || "";
                setSlideList((prev) =>
                  prev.map((s, idx) => (idx === currentSlide ? { ...s, subtitle: text } : s))
                );
              }}
              className="text-xs md:text-sm text-indigo-200/80 font-medium outline-none focus:ring-1 focus:ring-indigo-400/50 rounded px-1 transition hover:bg-white/5 cursor-text"
              title="Click to edit slide subtitle inline"
            >
              {activeSlide.subtitle}
            </p>

            {/* Bullets (Editable In-Place) */}
            <div className="pt-2 space-y-1.5">
              {activeSlide.bullets.map((b, i) => (
                <p key={i} className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans flex items-start gap-2">
                  <span className="text-indigo-400 font-bold mt-0.5">•</span>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const text = e.currentTarget.textContent || "";
                      setSlideList((prev) =>
                        prev.map((s, idx) =>
                          idx === currentSlide
                            ? {
                                ...s,
                                bullets: s.bullets.map((item, bIdx) => (bIdx === i ? text : item)),
                              }
                            : s
                        )
                      );
                    }}
                    className="outline-none focus:ring-1 focus:ring-indigo-400/50 rounded px-1 transition hover:bg-white/5 cursor-text flex-1"
                    title="Click to edit bullet inline"
                  >
                    {b}
                  </span>
                </p>
              ))}
            </div>

            {/* Key Metrics Cards if present */}
            {activeSlide.metrics && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 pt-3">
                {activeSlide.metrics.map((m, idx) => (
                  <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-md">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{m.label}</p>
                    <p className="text-sm font-bold text-white mt-0.5">{m.value}</p>
                    {m.trend && <p className="text-[9px] text-emerald-400 font-mono mt-0.5">{m.trend}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Stage Footer */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3 mt-2 text-[10px] text-slate-400">
            <span className="font-semibold text-slate-300">{topicTitle}</span>
            <span>Slide {currentSlide + 1} of {slideList.length}</span>
          </div>
        </div>

        {/* Speaker Notes Drawer */}
        <div className="w-full max-w-3xl mt-4 rounded-xl border border-border/60 bg-muted/20 p-3 flex items-start gap-2 text-xs">
          <MessageSquare className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="font-bold text-foreground mr-1">Speaker Notes:</span>
            <span className="text-muted-foreground">{activeSlide.speakerNotes}</span>
          </div>
        </div>
      </div>

      {/* ── Slide Thumbnail Navigation Rail ── */}
      <div className="border-t border-border/60 bg-muted/10 p-2 shrink-0">
        <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
          {slideList.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={cn(
                "group flex flex-col items-start gap-1 rounded-xl border p-2 text-left transition-all w-36 shrink-0",
                currentSlide === idx
                  ? "border-indigo-500 bg-indigo-500/10 shadow-sm"
                  : "border-border/60 bg-background/60 hover:bg-background"
              )}
            >
              <div className="flex items-center justify-between w-full text-[9px] font-mono text-muted-foreground">
                <span>Slide {idx + 1}</span>
                {currentSlide === idx && <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />}
              </div>
              <p className="text-[10px] font-bold text-foreground truncate w-full group-hover:text-indigo-400 transition-colors">
                {s.title}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
