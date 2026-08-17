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
  Palette,
  ExternalLink,
  CheckCircle2,
  Play,
  Copy,
  Check,
  Printer,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SlideLayout = "hero" | "split" | "stats" | "timeline";

export interface SlideData {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  layout?: SlideLayout;
  bullets: string[];
  splitLeft?: { heading: string; points: string[] };
  splitRight?: { heading: string; points: string[] };
  timelineSteps?: { step: string; title: string; desc: string; status: "completed" | "active" | "upcoming" }[];
  metrics?: { label: string; value: string; trend?: string }[];
  speakerNotes: string;
  bgGradient?: string;
}

interface SlidesArtifactProps {
  initialTopic?: string;
  slides?: SlideData[];
  isStreaming?: boolean;
}

const TEMPLATES = [
  { id: "business", label: "Business", icon: "📊", themeClass: "from-slate-900 via-indigo-950/70 to-slate-900", accent: "text-indigo-400", border: "border-indigo-500/30" },
  { id: "creative", label: "Creative", icon: "🎨", themeClass: "from-purple-950/80 via-slate-900 to-indigo-950/80", accent: "text-purple-400", border: "border-purple-500/30" },
  { id: "minimal",  label: "Minimal",  icon: "⬜", themeClass: "from-zinc-900 via-zinc-950 to-black", accent: "text-zinc-300", border: "border-zinc-700/40" },
  { id: "modern",   label: "Modern",   icon: "✨", themeClass: "from-slate-900 via-emerald-950/60 to-slate-900", accent: "text-emerald-400", border: "border-emerald-500/30" },
];

const PIPELINE_STEPS = ["Outline", "Design", "Content", "Formatting", "Review"];

export function SlidesArtifact({ initialTopic, slides: customSlides, isStreaming }: SlidesArtifactProps) {
  const topicTitle = initialTopic || "AI-Powered E-Commerce & Logistics in South Asia";
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTemplate, setActiveTemplate] = useState("business");
  const [showNotes, setShowNotes] = useState(true);
  const [copied, setCopied] = useState(false);

  const defaultSlides: SlideData[] = [
    {
      id: 1,
      layout: "hero",
      tag: "Executive Vision",
      title: topicTitle,
      subtitle: "Unlocking Autonomous Commerce, MFS Settlement & Next-Gen Logistics across Emerging Markets",
      bullets: [
        "Democratizing venture creation for 650M+ South Asian digital consumers",
        "Unified operator platform replacing 5 fragmented subscriptions",
        "Prepaid local credit wallets with instant bKash, Nagad & UPI checkout",
      ],
      metrics: [
        { label: "Target Market", value: "650M+", trend: "+18% YoY" },
        { label: "Gross Margin", value: "76.6%", trend: "Unit Profitable" },
        { label: "Payback Period", value: "3.2 Mo", trend: "High Efficiency" },
      ],
      speakerNotes: "Open the pitch by framing the $10B market opportunity across South Asia and how Shothik unifies fragmented tooling.",
    },
    {
      id: 2,
      layout: "split",
      tag: "Problem vs Solution",
      title: "The Fragmented Tooling Crisis",
      subtitle: "Why Western Subscriptions Fail in Emerging Markets",
      bullets: [],
      splitLeft: {
        heading: "⚠️ Current Reality (Friction)",
        points: [
          "USD Credit Card Barrier: <3% dual-currency card penetration in South Asia",
          "High Subscription Stack: Paying $120+/mo across 5 separate point tools",
          "High COD Return Friction: 18%-25% parcel dropouts without automated verification",
        ],
      },
      splitRight: {
        heading: "✅ The Shothik Edge (Operator)",
        points: [
          "Native bKash & Nagad MFS micro-passes starting at ৳100 BDT ($0.85 USD)",
          "Unified workspace: Search, Slides, Financial Models & Book Studio in one",
          "1-Click Steadfast & Pathao courier dispatch with automated WhatsApp DMs",
        ],
      },
      speakerNotes: "Highlight the contrast between expensive Western USD tools and Shothik's hyper-localized BDT infrastructure.",
    },
    {
      id: 3,
      layout: "stats",
      tag: "Unit Economics",
      title: "Scalable Margins & Profitability",
      subtitle: "3-Scenario Financial Projection (Base vs Aggressive)",
      bullets: [
        "High LTV/CAC Ratio driven by organic viral WhatsApp sharing loops",
        "Sub-second container deployment via Dokploy PaaS running <88MB memory footprints",
      ],
      metrics: [
        { label: "LTV / CAC", value: "12 : 1", trend: "Top Quartile" },
        { label: "ARPU (Monthly)", value: "৳990 BDT", trend: "$8.50 USD" },
        { label: "Net Profit Margin", value: "38.5%", trend: "Post COD Buffer" },
        { label: "Cloud Cost / Slot", value: "<$0.50 / mo", trend: "Dokploy PaaS" },
      ],
      speakerNotes: "Demonstrate strong unit economics and low infrastructure overhead running on standalone containers.",
    },
    {
      id: 4,
      layout: "timeline",
      tag: "Execution Roadmap",
      title: "Strategic Growth & Deployment Milestones",
      subtitle: "From Regional MVP to Pan-South Asian Scale",
      bullets: [],
      timelineSteps: [
        { step: "Q1", title: "Core Platform", desc: "Launch unified Search, Slide Studio & bKash rails", status: "completed" },
        { step: "Q2", title: "Logistics Hub", desc: "Steadfast & Pathao automated parcel dispatch API", status: "active" },
        { step: "Q3", title: "Regional Expansion", desc: "India (UPI) & Pakistan (Easypaisa) rollout", status: "upcoming" },
        { step: "Q4", title: "Creator Marketplace", desc: "Prompt & Agent monetization with direct MFS cashout", status: "upcoming" },
      ],
      speakerNotes: "Walk through quarterly milestones from Bangladesh market leadership to regional pan-South Asian expansion.",
    },
  ];

  const [slideList, setSlideList] = useState<SlideData[]>(customSlides || defaultSlides);

  useEffect(() => {
    if (customSlides && customSlides.length > 0) {
      setSlideList(customSlides);
      setCurrentSlide(0);
    }
  }, [customSlides]);

  const active = slideList[currentSlide] || slideList[0];
  const currentTemplate = TEMPLATES.find((t) => t.id === activeTemplate) || TEMPLATES[0];

  const handleCopyMarkdown = () => {
    const md = slideList
      .map(
        (s) =>
          `---\n# ${s.title}\n### ${s.subtitle}\n\n` +
          (s.bullets || []).map((b) => `- ${b}`).join("\n") +
          `\n\n> **Speaker Notes:** ${s.speakerNotes}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Keyboard Navigation: ←, →, Space, PgUp/PgDn, Home/End to flip slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(slideList.length - 1, prev + 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        setCurrentSlide(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setCurrentSlide(slideList.length - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slideList.length]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0d0e10] text-zinc-900 dark:text-[#e3e3e3] overflow-hidden select-none transition-colors duration-200">
      {/* ── Top Suite Header Bar ── */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] bg-white/95 dark:bg-white/[0.02] px-3.5 py-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/30">
            <Presentation className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white truncate">{topicTitle}</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
              Slide {currentSlide + 1} of {slideList.length} · 16:9 Presentation Stage
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Advanced Voice Presenter Launcher */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("shothik_toggle_vtuber"))}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25 text-purple-600 dark:text-purple-300 text-[11px] font-medium transition cursor-pointer"
            title="Launch Voice Presentation with Lip-Sync Narration"
          >
            <Play className="h-3 w-3 fill-current" />
            <span className="hidden sm:inline">Present</span>
          </button>

          {/* Print / Export */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-zinc-100 dark:bg-white/[0.04] hover:bg-zinc-200 dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
            title="Print Slide Deck"
          >
            <Printer className="h-3 w-3" />
          </button>

          {/* Copy Markdown */}
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-zinc-100 dark:bg-white/[0.04] hover:bg-zinc-200 dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
            title="Copy Deck Markdown"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* ── Pipeline Steps Bar ── */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] bg-zinc-100/70 dark:bg-black/20 px-3.5 py-1 text-[10px] font-mono text-zinc-500 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {PIPELINE_STEPS.map((step, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{step}</span>
              {idx < PIPELINE_STEPS.length - 1 && <span className="text-zinc-400 dark:text-zinc-600">→</span>}
            </div>
          ))}
        </div>

        {/* Template Selector */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <Palette className="h-3 w-3 text-zinc-400" />
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => setActiveTemplate(tpl.id)}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer",
                activeTemplate === tpl.id
                  ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/40"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {tpl.icon} {tpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main 16:9 Presentation Stage ── */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-4 bg-zinc-950">
        <div
          className={cn(
            "relative w-full max-w-2xl aspect-[16/9] rounded-2xl border shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden bg-gradient-to-br transition-all duration-300",
            currentTemplate.themeClass,
            currentTemplate.border
          )}
        >
          {/* Top Tag & Slide Number */}
          <div className="flex items-center justify-between shrink-0">
            <span className={cn("text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/[0.1] border border-white/[0.15]", currentTemplate.accent)}>
              {active.tag}
            </span>
            <span className="text-xs font-mono font-semibold text-zinc-400">
              {currentSlide + 1} / {slideList.length}
            </span>
          </div>

          {/* ── Polymorphic Layout Renderers ── */}
          <div className="my-auto space-y-3">
            {/* 1. HERO LAYOUT */}
            {(!active.layout || active.layout === "hero") && (
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  {active.title}
                </h2>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-xl">
                  {active.subtitle}
                </p>
                <ul className="space-y-1.5 pt-1 text-xs text-zinc-200">
                  {active.bullets?.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className={cn("font-bold mt-0.5", currentTemplate.accent)}>•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 2. SPLIT 2-COLUMN LAYOUT */}
            {active.layout === "split" && (
              <div className="space-y-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{active.title}</h2>
                  <p className="text-[11px] text-zinc-300">{active.subtitle}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-xs space-y-1.5">
                    <p className="font-bold text-red-400">{active.splitLeft?.heading}</p>
                    <ul className="space-y-1 text-[11px] text-zinc-300">
                      {active.splitLeft?.points.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-red-400 font-bold shrink-0">✕</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-1.5">
                    <p className="font-bold text-emerald-400">{active.splitRight?.heading}</p>
                    <ul className="space-y-1 text-[11px] text-zinc-300">
                      {active.splitRight?.points.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold shrink-0">✓</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 3. STATS CALLOUT LAYOUT */}
            {active.layout === "stats" && (
              <div className="space-y-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{active.title}</h2>
                  <p className="text-[11px] text-zinc-300">{active.subtitle}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {active.metrics?.map((m, idx) => (
                    <div key={idx} className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 text-center space-y-0.5">
                      <p className="text-[10px] text-zinc-400">{m.label}</p>
                      <p className={cn("text-base font-bold font-mono", currentTemplate.accent)}>{m.value}</p>
                      {m.trend && <p className="text-[9px] text-emerald-400 flex items-center justify-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" /> {m.trend}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. TIMELINE ROADMAP LAYOUT */}
            {active.layout === "timeline" && (
              <div className="space-y-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{active.title}</h2>
                  <p className="text-[11px] text-zinc-300">{active.subtitle}</p>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {active.timelineSteps?.map((s, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-purple-400">{s.step}</span>
                        <span className="text-[8px] uppercase px-1 py-0.2 rounded bg-white/10 text-zinc-300">{s.status}</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate">{s.title}</p>
                      <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Logo */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] text-zinc-500 font-mono shrink-0">
            <span>SHOTHIK OPERATOR SUITE</span>
            <span>POLSIA OPC MASTER</span>
          </div>
        </div>

        {/* ── Navigation Carousel Controls ── */}
        <div className="flex items-center justify-center gap-3 mt-3 w-full">
          <Button
            size="sm"
            variant="outline"
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            className="h-7 w-7 p-0 rounded-full border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {slideList.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={cn(
                  "h-1.5 rounded-full transition-all cursor-pointer",
                  currentSlide === idx ? "w-5 bg-indigo-500" : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                )}
              />
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            disabled={currentSlide === slideList.length - 1}
            onClick={() => setCurrentSlide((prev) => Math.min(slideList.length - 1, prev + 1))}
            className="h-7 w-7 p-0 rounded-full border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Presenter Speaker Notes Accordion ── */}
      <div className="border-t border-zinc-200 dark:border-white/[0.06] bg-zinc-100/90 dark:bg-[#111214] p-3 shrink-0">
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center justify-between w-full text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Presenter Lip-Sync Narration Notes</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">{showNotes ? "Hide" : "Show"}</span>
        </button>

        {showNotes && (
          <p className="mt-2 text-xs text-zinc-800 dark:text-zinc-300 leading-relaxed font-mono bg-white dark:bg-white/[0.02] p-2.5 rounded-lg border border-zinc-200 dark:border-white/[0.04]">
            "{active.speakerNotes}"
          </p>
        )}
      </div>
    </div>
  );
}
