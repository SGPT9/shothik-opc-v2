"use client";

import { useState, useEffect } from "react";
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
import { VTuberPresentationStage } from "./VTuberPresentationStage";
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
  { id: "business", label: "Demo Day Pitch", icon: "📊", themeClass: "from-slate-950 via-indigo-950/80 to-slate-950", accent: "text-indigo-400", border: "border-indigo-500/30" },
  { id: "vc_pitch", label: "VC Pitch Premium", icon: "🏆", themeClass: "from-slate-950 via-amber-950/40 to-slate-900", accent: "text-amber-400", border: "border-amber-500/40" },
  { id: "emerald", label: "Emerald Nature", icon: "🌿", themeClass: "from-emerald-950 via-teal-950/60 to-slate-950", accent: "text-emerald-300", border: "border-emerald-500/30" },
  { id: "obsidian", label: "Obsidian Gradient", icon: "🔮", themeClass: "from-neutral-950 via-purple-950/50 to-neutral-950", accent: "text-purple-300", border: "border-purple-500/30" },
  { id: "cyber_midnight", label: "Cyber Midnight", icon: "⚡", themeClass: "from-black via-cyan-950/50 to-purple-950/40 font-mono", accent: "text-cyan-400", border: "border-cyan-500/40" },
  { id: "blueprint", label: "Blueprint Grid", icon: "📐", themeClass: "from-blue-950/90 via-slate-900 to-blue-950/90", accent: "text-sky-300", border: "border-sky-500/30" },
  { id: "editorial", label: "Editorial Serif", icon: "📰", themeClass: "from-stone-900 via-neutral-900 to-stone-950", accent: "text-amber-300", border: "border-amber-500/30" },
  { id: "minimal", label: "Minimalist Mono", icon: "⬜", themeClass: "from-zinc-900 via-zinc-950 to-black", accent: "text-zinc-300", border: "border-zinc-700/40" },
];

const PIPELINE_STEPS = ["Outline", "Design", "Content", "Formatting", "Review"];

export function buildDynamicDeck(topicTitle: string): SlideData[] {
  const cleanTopic = topicTitle || "Next-Gen Autonomous Platform";
  const lower = cleanTopic.toLowerCase();

  if (lower.includes("health") || lower.includes("med") || lower.includes("clinic") || lower.includes("doctor")) {
    return [
      {
        id: 1,
        layout: "hero",
        tag: "Executive Vision",
        title: cleanTopic,
        subtitle: "Transforming Healthcare Access & Automated Diagnostics across Emerging Markets",
        bullets: [
          "AI-driven preliminary triage & prescription verification for underserved regions",
          "Telemedicine consultation integrated with local pharmacy fulfillment",
          "Secure HIPAA/GDPR compliant electronic health records (EHR) on edge devices",
        ],
        metrics: [
          { label: "Target Patients", value: "120M+", trend: "+22% YoY" },
          { label: "Diagnostic Accuracy", value: "98.4%", trend: "Clinical Grade" },
          { label: "Consultation Cost", value: "৳250 BDT", trend: "$2.10 USD" },
        ],
        speakerNotes: "Begin with the critical healthcare infrastructure deficit and how digital triage expands primary care reach.",
      },
      {
        id: 2,
        layout: "split",
        tag: "Clinical Problem vs Solution",
        title: "Overcoming Diagnostic Bottlenecks",
        subtitle: "Bridging the Specialist Shortage in Rural & Peri-Urban Clinics",
        bullets: [],
        splitLeft: {
          heading: "⚠️ Traditional Healthcare Friction",
          points: [
            "Doctor-Patient Ratio: 1:1,800 leading to 4+ hour waiting times",
            "Counterfeit Medication: 15% of retail drugs lack verifiable supply chains",
            "Fragmented Paper Records: Lost patient history and adverse drug interactions",
          ],
        },
        splitRight: {
          heading: "✅ Our Digital Health Solution",
          points: [
            "Instant AI-assisted symptom triage resolving 70% of non-emergency visits",
            "Batch barcode authentication on all dispensed prescriptions",
            "Unified digital patient wallet accessible offline via SMS / QR code",
          ],
        },
        speakerNotes: "Highlight how our platform reduces doctor burnout while elevating patient diagnostic precision.",
      },
      {
        id: 3,
        layout: "stats",
        tag: "Market Opportunity",
        title: "South Asian Digital Health TAM",
        subtitle: "A $6.8B Market Accelerating at 28.2% CAGR",
        bullets: [
          "Rapid growth in out-of-pocket health expenditure seeking transparent pricing",
          "Government digital health initiatives encouraging public-private API integration",
        ],
        metrics: [
          { label: "Total Addressable Market", value: "$6.8B", trend: "+28.2% CAGR" },
          { label: "Partner Clinics", value: "1,450+", trend: "Networked" },
          { label: "Monthly Tele-visits", value: "85,000+", trend: "+40% MoM" },
          { label: "Average Patient Savings", value: "62%", trend: "Per Episode" },
        ],
        speakerNotes: "Present the immense addressable market and explosive growth in digital health consultations.",
      },
      {
        id: 4,
        layout: "timeline",
        tag: "Clinical Milestones",
        title: "Clinical Rollout & Hospital Integration",
        subtitle: "Phased Deployment across Secondary & Tertiary Care Networks",
        bullets: [],
        timelineSteps: [
          { step: "Phase 1", title: "Diagnostic MVP", desc: "Launch AI symptom checker & prescription OCR", status: "completed" },
          { step: "Phase 2", title: "Pharmacy Rails", desc: "Doorstep delivery integration with verified distributors", status: "active" },
          { step: "Phase 3", title: "Insurance Direct", desc: "Instant cashless micro-insurance claim settlements", status: "upcoming" },
          { step: "Phase 4", title: "Regional Hubs", desc: "Cross-border specialist second-opinion network", status: "upcoming" },
        ],
        speakerNotes: "Walk through the four-phase deployment plan from mobile triage to regional hospital integration.",
      },
      {
        id: 5,
        layout: "split",
        tag: "Clinical Architecture",
        title: "AI Symptom Triage & Electronic Health Records (EHR)",
        subtitle: "HIPAA-Compliant Encrypted Cloud Infrastructure",
        bullets: [],
        splitLeft: {
          heading: "🩺 Patient Mobile Experience",
          points: [
            "Bengali voice-enabled symptom intake with dial-in audio triage",
            "Instant digital prescription storage and lab report OCR parsing",
            "Integrated doorstep medicine delivery in under 90 minutes",
          ],
        },
        splitRight: {
          heading: "🏥 Doctor Clinical Workbench",
          points: [
            "Automated clinical decision support with drug-interaction alerts",
            "Structured ICD-10 diagnostic coding with 1-click audio dictation",
            "Instant bKash/Nagad fee disbursement per consultation",
          ],
        },
        speakerNotes: "Explain the patient intake workflow and the doctor EHR workbench that eliminates administrative charting overhead.",
      },
      {
        id: 6,
        layout: "stats",
        tag: "Unit Economics",
        title: "High-Margin Tele-consultation & Medicine Dispatch",
        subtitle: "Rapid Payback & Defensible Operating Contributions",
        bullets: [
          "Gross margin on tele-consultation platform fee exceeds 78%",
          "Pharmacy retail fulfillment margin delivers 22% net contribution",
        ],
        metrics: [
          { label: "Consultation Fee", value: "৳350", trend: "Per Session" },
          { label: "Gross Platform Margin", value: "78.4%", trend: "Software Model" },
          { label: "Patient LTV", value: "৳4,800", trend: "14-Month Cohort" },
          { label: "CAC Payback", value: "2.1 Mo", trend: "Highly Capital Efficient" },
        ],
        speakerNotes: "Detail the unit economics: ৳350 consultation fee with 78% software gross margin and 2.1 month payback.",
      },
      {
        id: 7,
        layout: "split",
        tag: "Defensibility",
        title: "Regulatory Compliance & Network Effects",
        subtitle: "BMDC Certified Clinical Protocol & Local Defensibility",
        bullets: [],
        splitLeft: {
          heading: "📜 Regulatory Compliance",
          points: [
            "100% verified BMDC doctor registration checks via automated API",
            "End-to-end encrypted medical tele-consultation data sovereignty",
            "Directorate General of Drug Administration (DGDA) certified pharmacies",
          ],
        },
        splitRight: {
          heading: "🛡️ Defensible Flywheel",
          points: [
            "Exclusive partnerships with 1,450+ grassroots rural diagnostic hubs",
            "Proprietary Bengali speech-to-text medical translation dataset",
            "Zero-data-cost operator partnership for low-income patients",
          ],
        },
        speakerNotes: "Highlight regulatory compliance and our proprietary Bengali medical speech dataset as our core defensible moat.",
      },
      {
        id: 8,
        layout: "timeline",
        tag: "Funding & Execution",
        title: "Seed Investment & Strategic Milestones",
        subtitle: "Deploying Capital for Nationwide Distribution",
        bullets: [],
        timelineSteps: [
          { step: "Q1", title: "Scale Dhaka & Sylhet", desc: "Reach 50,000 monthly active tele-consultations", status: "active" },
          { step: "Q2", title: "Launch Micro-Insurance", desc: "Deploy ৳50/month health micro-coverage with bKash", status: "upcoming" },
          { step: "Q3", title: "Enterprise B2B Triage", desc: "Onboard 40 RMG factory worker health programs", status: "upcoming" },
          { step: "Q4", title: "Series-A Readiness", desc: "Hit $2.5M ARR with positive operating cash flow", status: "upcoming" },
        ],
        speakerNotes: "Present the capital allocation roadmap: scaling Dhaka and Sylhet, launching bKash micro-insurance, and reaching $2.5M ARR.",
      },
    ];
  }

  // Default consulting-grade investor deck for commerce, SaaS, and technology
  return [
    {
      id: 1,
      layout: "hero",
      tag: "Executive Vision",
      title: cleanTopic,
      subtitle: "Unlocking Autonomous Commerce, MFS Settlement & Next-Gen Intelligence across Emerging Markets",
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
      tag: "Market Scale",
      title: "Massive Emerging Market TAM",
      subtitle: "Capturing the Digital Commerce Surge across Bangladesh & South Asia",
      bullets: [
        "Rapidly urbanizing demographic with 74% smartphone adoption among merchants",
        "Over $480M e-commerce parcel delivery volume growing at 24.5% annual CAGR",
      ],
      metrics: [
        { label: "Total Addressable Market", value: "$10.4B", trend: "+24.5% CAGR" },
        { label: "Daily Active Merchants", value: "320,000+", trend: "+34% YoY" },
        { label: "Digital MFS Volume", value: "$145B", trend: "Annual Flow" },
        { label: "Logistics Parcels / Day", value: "180k+", trend: "Nationwide" },
      ],
      speakerNotes: "Present the macroeconomic tailwinds: 650M consumer TAM and exploding MFS mobile payment adoption.",
    },
    {
      id: 4,
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
      id: 5,
      layout: "hero",
      tag: "Product Architecture",
      title: "Unified Agentic Operating Engine",
      subtitle: "Replacing Point Solutions with an All-in-One Autonomous Platform",
      bullets: [
        "Multi-Agent Swarm: Deep research, financial modeling, and slide synthesis",
        "Local First & Offline GPU: Instant Ollama fallback for 100% data privacy",
        "Integrated Commerce Rail: Instant bKash/Nagad webhook reconciliation and dispatch",
      ],
      metrics: [
        { label: "Latency", value: "<250ms", trend: "SSE Stream" },
        { label: "GPU Inference", value: "Local + Cloud", trend: "Hybrid Mesh" },
        { label: "Uptime SLA", value: "99.98%", trend: "Edge Ready" },
      ],
      speakerNotes: "Explain the technical moat: hybrid local-cloud agentic execution with sub-second SSE streaming.",
    },
    {
      id: 6,
      layout: "split",
      tag: "Competitive Moat",
      title: "Unfair Distribution & Localized Defensibility",
      subtitle: "How Shothik Creates an Unassailable Network Effect",
      bullets: [],
      splitLeft: {
        heading: "🌐 Global Competitors (US/EU)",
        points: [
          "No local MFS payment rails (bKash/Nagad/UPI blocked)",
          "No integration with Bangladesh couriers (Steadfast, Pathao, Paperfly)",
          "Monolithic pricing ($20-$50/month) unaffordable for local SMBs",
        ],
      },
      splitRight: {
        heading: "🛡️ Shothik Defensibility",
        points: [
          "Micro-pass billing in BDT matched to local purchasing power",
          "Automated courier API reconciliation preventing return losses",
          "Banglish & Bengali dialect NLP context memory",
        ],
      },
      speakerNotes: "Articulate the local defensibility: courier partnerships, micro-billing, and dialect NLP.",
    },
    {
      id: 7,
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
    {
      id: 8,
      layout: "hero",
      tag: "The Ask & Summary",
      title: "Fueling the Next Decade of Commerce",
      subtitle: "Raising Seed Round to Accelerate Developer & Merchant Adoption",
      bullets: [
        "Target Seed Raise: Accelerating engineering, merchant integrations & regional rollout",
        "Use of Funds: 60% Core Engineering, 25% Go-To-Market, 15% Strategic Partnerships",
        "Contact: Founders Office (founders@shothik.ai) · Polsia OPC Master Suite",
      ],
      metrics: [
        { label: "Target Round", value: "$1.5M", trend: "Seed Stage" },
        { label: "Runway", value: "24 Months", trend: "Capital Efficient" },
        { label: "Projected ARR", value: "$4.2M", trend: "Year 2 Target" },
      ],
      speakerNotes: "Close with a clear, confident investment ask, use of funds, and contact channels.",
    },
  ];
}

export function SlidesArtifact({ initialTopic, slides: customSlides, isStreaming }: SlidesArtifactProps) {
  const topicTitle = initialTopic || "AI-Powered E-Commerce & Logistics in South Asia";
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTemplate, setActiveTemplate] = useState("business");
  const [showNotes, setShowNotes] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVTuberStage, setShowVTuberStage] = useState(false);

  const [slideList, setSlideList] = useState<SlideData[]>(() => customSlides || buildDynamicDeck(topicTitle));

  // Listen for VTuber toggle events
  useEffect(() => {
    const handleToggle = () => setShowVTuberStage((prev) => !prev);
    window.addEventListener("shothik_toggle_vtuber", handleToggle);
    return () => window.removeEventListener("shothik_toggle_vtuber", handleToggle);
  }, []);

  // Sync with prop changes
  useEffect(() => {
    if (customSlides && customSlides.length > 0) {
      setSlideList(customSlides);
      setCurrentSlide(0);
    } else if (initialTopic) {
      setSlideList(buildDynamicDeck(initialTopic));
      setCurrentSlide(0);
    }
  }, [customSlides, initialTopic]);

  const active = slideList[currentSlide] || slideList[0];
  const currentTemplate = TEMPLATES.find((t) => t.id === activeTemplate) || TEMPLATES[0];

  // In-Place Slide Editing Handlers
  const handleUpdateActiveSlide = (updater: Partial<SlideData>) => {
    setSlideList((prev) =>
      prev.map((s, idx) => (idx === currentSlide ? { ...s, ...updater } : s))
    );
  };

  const handleAddSlide = () => {
    const newSlide: SlideData = {
      id: Date.now(),
      layout: "hero",
      tag: "Deep Dive",
      title: "New Strategic Slide",
      subtitle: "Click here to edit subtitle and key narrative points",
      bullets: ["First core breakthrough point", "Second actionable metric or strategic goal"],
      speakerNotes: "Presenter narration notes for this new slide.",
    };
    setSlideList((prev) => [...prev, newSlide]);
    setCurrentSlide(slideList.length);
  };

  const handleDeleteCurrentSlide = () => {
    if (slideList.length <= 1) return;
    setSlideList((prev) => prev.filter((_, idx) => idx !== currentSlide));
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const handleSpeakCurrentSlide = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const narrationText = `${active.title}. ${active.subtitle}. ${active.speakerNotes}`;
    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleExportHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${topicTitle} - Shothik Slides</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
    body { font-family: 'Inter', sans-serif; }
    .font-mono { font-family: 'JetBrains+Mono', monospace; }
  </style>
</head>
<body class="bg-zinc-950 text-white min-h-screen flex flex-col items-center justify-center p-6">
  <div class="w-full max-w-4xl space-y-8">
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-extrabold tracking-tight">${topicTitle}</h1>
      <p class="text-sm text-zinc-400">Generated by Shothik Operator Suite · Open Design Presentation</p>
    </div>
    <div class="space-y-6">
      ${slideList
        .map(
          (s, i) => `
        <div class="aspect-[16/9] rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 flex flex-col justify-between shadow-2xl">
          <div class="flex justify-between items-center">
            <span class="text-xs font-mono px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold uppercase">${s.tag}</span>
            <span class="text-xs font-mono text-zinc-500">Slide ${i + 1} / ${slideList.length}</span>
          </div>
          <div class="my-auto space-y-4">
            <h2 class="text-2xl font-bold">${s.title}</h2>
            <p class="text-sm text-zinc-300">${s.subtitle}</p>
            ${(s.bullets || []).length > 0 ? `<ul class="space-y-2 text-sm text-zinc-300">${s.bullets.map((b) => `<li class="flex gap-2"><span class="text-indigo-400 font-bold">•</span>${b}</li>`).join("")}</ul>` : ""}
          </div>
          <div class="pt-3 border-t border-zinc-800 flex justify-between text-xs font-mono text-zinc-500">
            <span>SHOTHIK OPERATOR SUITE</span>
            <span>POLSIA OPC MASTER</span>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topicTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}-deck.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarp = () => {
    const marpHeader = `---
marp: true
theme: uncover
class: invert
paginate: true
header: '${topicTitle} — Shothik Studio'
footer: 'CONFIDENTIAL & PROPRIETARY'
---
`;
    const marpSlides = slideList
      .map(
        (s, i) =>
          `<!-- _class: lead -->\n` +
          `# ${s.title}\n` +
          `### ${s.subtitle}\n\n` +
          (s.bullets || []).map((b) => `- ${b}`).join("\n") +
          `\n\n<!--\nSpeaker Notes:\n${s.speakerNotes}\n-->`
      )
      .join("\n\n---\n\n");

    const fullMarp = marpHeader + marpSlides;
    const blob = new Blob([fullMarp], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topicTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}.marp.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPPTX = async () => {
    try {
      const PptxGenJS = (await import("pptxgenjs")).default;
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_16x9";
      pptx.title = topicTitle;

      slideList.forEach((s) => {
        const slide = pptx.addSlide();
        slide.background = { color: "090D16" };

        slide.addText((s.tag || "SLIDE").toUpperCase(), {
          x: 0.8,
          y: 0.6,
          fontSize: 10,
          color: "818CF8",
          bold: true,
          fontFace: "Arial",
        });

        slide.addText(s.title, {
          x: 0.8,
          y: 1.1,
          w: 8.4,
          fontSize: 22,
          color: "FFFFFF",
          bold: true,
          fontFace: "Arial",
        });

        if (s.subtitle) {
          slide.addText(s.subtitle, {
            x: 0.8,
            y: 1.8,
            w: 8.4,
            fontSize: 13,
            color: "94A3B8",
            fontFace: "Arial",
          });
        }

        if (s.bullets && s.bullets.length > 0) {
          const bulletList = s.bullets.map((b) => ({
            text: b,
            options: { bullet: true, color: "CBD5E1", fontSize: 13, breakLine: true },
          }));
          slide.addText(bulletList, {
            x: 0.8,
            y: 2.6,
            w: 8.4,
            h: 3.0,
            fontFace: "Arial",
          });
        }

        if (s.speakerNotes) {
          slide.addNotes(s.speakerNotes);
        }
      });

      await pptx.writeFile({
        fileName: `${topicTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}.pptx`,
      });
    } catch (err) {
      console.error("PPTX export fallback:", err);
      handleExportHTML();
    }
  };

  const handleCopyMarkdown = () => {
    const md = slideList
      .map(
        (s, i) =>
          `---\n## Slide ${i + 1}: ${s.title}\n### ${s.subtitle}\n\n` +
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

  const [slideTouchStart, setSlideTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleSlideTouchStart = (e: React.TouchEvent) => {
    setSlideTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleSlideTouchEnd = (e: React.TouchEvent) => {
    if (!slideTouchStart) return;
    const deltaX = e.changedTouches[0].clientX - slideTouchStart.x;
    const deltaY = e.changedTouches[0].clientY - slideTouchStart.y;
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiped Left ➔ Next Slide
        setCurrentSlide((prev) => Math.min(slideList.length - 1, prev + 1));
      } else {
        // Swiped Right ➔ Previous Slide
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      }
    }
    setSlideTouchStart(null);
  };

  // Keyboard Navigation
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
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slideList.length, isFullscreen]);

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden select-none transition-colors duration-200">
      {/* ── Top Suite Header Bar ── */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 backdrop-blur-md px-3.5 py-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Presentation className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-foreground truncate">{topicTitle}</h3>
            <p className="text-[10px] text-muted-foreground font-mono truncate">
              Slide {currentSlide + 1} of {slideList.length} · 16:9 Presentation Stage
            </p>
          </div>
        </div>

        {/* Consolidated Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Theme Dropdown */}
          <div className="relative flex items-center">
            <select
              value={activeTemplate}
              onChange={(e) => setActiveTemplate(e.target.value)}
              className="h-7 pl-2 pr-6 rounded-lg text-[10px] font-semibold bg-muted/60 text-muted-foreground border border-border/40 hover:text-foreground focus:outline-none focus:ring-1 focus:ring-brand/40 transition cursor-pointer appearance-none"
              aria-label="Select slide theme"
            >
              {TEMPLATES.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.icon} {tpl.label}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3 w-3 text-muted-foreground absolute right-1.5 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={handleSpeakCurrentSlide}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer",
              isSpeaking
                ? "bg-amber-500/20 border-amber-500/40 text-amber-400 animate-pulse"
                : "bg-muted/40 border-border/50 text-foreground hover:bg-muted"
            )}
            title="Read aloud speaker notes"
          >
            <span>{isSpeaking ? "⏹️" : "🔊"}</span>
            <span className="hidden sm:inline">{isSpeaking ? "Stop" : "Narrate"}</span>
          </button>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("shothik_toggle_vtuber"))}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] shadow-sm shadow-emerald-500/20 transition cursor-pointer"
            title="Launch Fullscreen Presenter Mode"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Present</span>
          </button>

          {/* Quick Actions (Add Slide, Fullscreen, PPTX, Marp, Download) */}
          <button
            type="button"
            onClick={handleAddSlide}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg border border-border/50 bg-muted/40 hover:bg-muted text-foreground text-[11px] font-medium transition cursor-pointer"
            title="Add a new slide"
          >
            <span>+ Slide</span>
          </button>

          <button
            type="button"
            onClick={handleExportPPTX}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[11px] font-bold transition cursor-pointer"
            title="Export native 16:9 PowerPoint Presentation (.pptx)"
          >
            <Download className="h-3 w-3" />
            <span>PPTX</span>
          </button>

          <button
            type="button"
            onClick={handleExportMarp}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[11px] font-bold transition cursor-pointer"
            title="Export Marp Markdown Slide Deck (.marp.md)"
          >
            <span>Marp</span>
          </button>

          <button
            type="button"
            onClick={handleExportHTML}
            className="p-1.5 rounded-lg border border-border/50 bg-muted/40 hover:bg-muted text-foreground transition cursor-pointer"
            title="Download Standalone HTML Presentation"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-border/50 bg-muted/40 hover:bg-muted text-foreground transition cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Main 16:9 Presentation Stage ── */}
      <div className={cn(
        "flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-4 bg-zinc-950 transition-all gap-4 overflow-y-auto",
        isFullscreen && "fixed inset-0 z-50 p-8 sm:p-12 bg-black/95 backdrop-blur-xl"
      )}>
        {showVTuberStage && (
          <div className="w-full max-w-2xl">
            <VTuberPresentationStage
              currentSlideIndex={currentSlide + 1}
              totalSlides={slideList.length}
              slideTitle={active.title}
              narrationScript={`${active.title}. ${active.subtitle}. ${active.speakerNotes}`}
              onNextSlide={() => setCurrentSlide((prev) => Math.min(slideList.length - 1, prev + 1))}
              onPrevSlide={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            />
          </div>
        )}

        <div
          onTouchStart={handleSlideTouchStart}
          onTouchEnd={handleSlideTouchEnd}
          className={cn(
            "relative w-full max-w-2xl aspect-[16/9] rounded-2xl border shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden bg-gradient-to-br transition-all duration-300 shrink-0 select-none",
            isFullscreen && "max-w-4xl text-base shadow-indigo-500/10",
            currentTemplate.themeClass,
            currentTemplate.border
          )}
        >
          {/* Top Tag & Slide Number */}
          <div className="flex items-center justify-between shrink-0">
            <span className={cn("text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/[0.1] border border-white/[0.15]", currentTemplate.accent)}>
              {active.tag}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-zinc-400">
                {currentSlide + 1} / {slideList.length}
              </span>
              {isFullscreen && (
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="text-xs font-mono text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-white/10"
                >
                  ESC
                </button>
              )}
            </div>
          </div>

          {/* ── Polymorphic Layout Renderers (Full In-Place Editing) ── */}
          <div className="my-auto space-y-3">
            {/* 1. HERO LAYOUT */}
            {(!active.layout || active.layout === "hero") && (
              <div className="space-y-2.5">
                <input
                  type="text"
                  value={active.title}
                  onChange={(e) => handleUpdateActiveSlide({ title: e.target.value })}
                  className="w-full bg-transparent text-xl sm:text-2xl font-bold text-white tracking-tight outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400 transition"
                />
                <input
                  type="text"
                  value={active.subtitle}
                  onChange={(e) => handleUpdateActiveSlide({ subtitle: e.target.value })}
                  className="w-full bg-transparent text-xs text-zinc-300 leading-relaxed outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400 transition"
                />
                <ul className="space-y-1.5 pt-1 text-xs text-zinc-200">
                  {active.bullets?.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className={cn("font-bold mt-0.5", currentTemplate.accent)}>•</span>
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const updated = [...(active.bullets || [])];
                          updated[idx] = e.target.value;
                          handleUpdateActiveSlide({ bullets: updated });
                        }}
                        className="w-full bg-transparent text-xs text-zinc-200 outline-none border-b border-transparent hover:border-white/10 focus:border-indigo-400/50 transition"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 2. SPLIT 2-COLUMN LAYOUT */}
            {active.layout === "split" && (
              <div className="space-y-2">
                <div>
                  <input
                    type="text"
                    value={active.title}
                    onChange={(e) => handleUpdateActiveSlide({ title: e.target.value })}
                    className="w-full bg-transparent text-lg sm:text-xl font-bold text-white tracking-tight outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400"
                  />
                  <input
                    type="text"
                    value={active.subtitle}
                    onChange={(e) => handleUpdateActiveSlide({ subtitle: e.target.value })}
                    className="w-full bg-transparent text-[11px] text-zinc-300 outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400"
                  />
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
                  <input
                    type="text"
                    value={active.title}
                    onChange={(e) => handleUpdateActiveSlide({ title: e.target.value })}
                    className="w-full bg-transparent text-lg sm:text-xl font-bold text-white tracking-tight outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400"
                  />
                  <input
                    type="text"
                    value={active.subtitle}
                    onChange={(e) => handleUpdateActiveSlide({ subtitle: e.target.value })}
                    className="w-full bg-transparent text-[11px] text-zinc-300 outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400"
                  />
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
                  <input
                    type="text"
                    value={active.title}
                    onChange={(e) => handleUpdateActiveSlide({ title: e.target.value })}
                    className="w-full bg-transparent text-lg sm:text-xl font-bold text-white tracking-tight outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400"
                  />
                  <input
                    type="text"
                    value={active.subtitle}
                    onChange={(e) => handleUpdateActiveSlide({ subtitle: e.target.value })}
                    className="w-full bg-transparent text-[11px] text-zinc-300 outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400"
                  />
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

        {/* ── Filmstrip ── */}
        <div className="flex items-center gap-2 mt-3 w-full max-w-2xl px-1">
          <Button
            size="sm"
            variant="outline"
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            className="h-7 w-7 p-0 rounded-full border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white shrink-0 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {slideList.map((slide, idx) => (
              <button
                key={slide.id || idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-medium transition cursor-pointer shrink-0",
                  currentSlide === idx
                    ? "bg-indigo-500/20 border-indigo-500/60 text-white shadow-sm"
                    : "bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:bg-white/[0.08]"
                )}
              >
                <span className="font-mono text-[9px] opacity-70">#{idx + 1}</span>
                <span className="truncate max-w-[90px]">{slide.tag || slide.title}</span>
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            disabled={currentSlide === slideList.length - 1}
            onClick={() => setCurrentSlide((prev) => Math.min(slideList.length - 1, prev + 1))}
            className="h-7 w-7 p-0 rounded-full border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white shrink-0 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Presenter Speaker Notes Accordion (Editable) ── */}
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
          <textarea
            value={active.speakerNotes}
            onChange={(e) => handleUpdateActiveSlide({ speakerNotes: e.target.value })}
            className="mt-2 w-full text-xs text-zinc-800 dark:text-zinc-300 leading-relaxed font-mono bg-white dark:bg-white/[0.02] p-2.5 rounded-lg border border-zinc-200 dark:border-white/[0.04] outline-none hover:border-white/20 focus:border-indigo-400 resize-none h-16 transition"
            placeholder="Enter presenter narration script..."
          />
        )}
      </div>
    </div>
  );
}
