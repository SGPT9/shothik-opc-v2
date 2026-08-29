import React from "react";
import {
  Presentation,
  Table2,
  BookOpen,
  Code2,
  ArrowUpRight,
  Sparkles,
  Truck,
  Users,
  Compass,
  FileText,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArtifactTab } from "./ArtifactPanel";

interface InlineArtifactCardProps {
  type: ArtifactTab;
  title?: string;
  subtitle?: string;
  onOpen: () => void;
  className?: string;
}

interface ArtifactMeta {
  label: string;
  badge: string;
  actionText: string;
  defaultTitle: string;
  defaultSubtitle: string;
  Icon: React.ElementType;
  gradient: string;
  borderHover: string;
  previewPills?: string[];
}

const CONFIGS: Partial<Record<ArtifactTab, ArtifactMeta>> = {
  slides: {
    label: "Slide Studio",
    badge: "16:9 Presentation Ready",
    actionText: "Open Slide Studio",
    defaultTitle: "Executive Pitch Deck & Strategy Slides",
    defaultSubtitle: "5 interactive slides with presenter notes, 3D viewer & Marp export",
    Icon: Presentation,
    gradient: "from-indigo-500/10 via-purple-500/5 to-transparent",
    borderHover: "hover:border-indigo-500/50 hover:shadow-indigo-500/10",
    previewPills: ["1. Executive Overview", "2. Market Opportunity", "3. Unit Economics", "4. Roadmap"],
  },
  sheet: {
    label: "Financial Sheet",
    badge: "Live Formula Matrix",
    actionText: "Open Spreadsheet",
    defaultTitle: "3-Scenario Financial Model (BDT)",
    defaultSubtitle: "Dynamic Excel formula engine with live CAGR & KPI recalculation",
    Icon: Table2,
    gradient: "from-cyan-500/10 via-blue-500/5 to-transparent",
    borderHover: "hover:border-cyan-500/50 hover:shadow-cyan-500/10",
    previewPills: ["Base MRR: ৳22.5M", "Aggressive: ৳83.2M", "Gross Margin: 76.6%", "=CAGR()"],
  },
  research: {
    label: "Deep Research",
    badge: "Grounded Web Intelligence",
    actionText: "Open Research Dossier",
    defaultTitle: "Market Sizing & Competitor Investigation",
    defaultSubtitle: "Multi-hop verified source synthesis with high-DPI citations",
    Icon: BookOpen,
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    borderHover: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
    previewPills: ["14 Verified Sources", "Competitor Matrix", "Regulatory Analysis", "Full Citations"],
  },
  doc: {
    label: "Document Studio",
    badge: "Multi-Section Document",
    actionText: "Open Document Studio",
    defaultTitle: "Executive Agreement & Formal Briefing",
    defaultSubtitle: "3 typography modes (Sans/Serif/Mono) with 1-click Print-to-PDF",
    Icon: FileText,
    gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    borderHover: "hover:border-amber-500/50 hover:shadow-amber-500/10",
    previewPills: ["Section 1: Summary", "Section 2: Economics", "Section 3: Security & RLS"],
  },
  code: {
    label: "Code Engine",
    badge: "Fullstack Sandbox",
    actionText: "Open Code Workspace",
    defaultTitle: "Executable React & API Workspace",
    defaultSubtitle: "Full syntax highlighting, copy-paste snippets & MicroVM execution",
    Icon: Code2,
    gradient: "from-emerald-500/10 via-cyan-500/5 to-transparent",
    borderHover: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
    previewPills: ["TypeScript / TSX", "Next.js App Router", "Tailwind CSS", "Zero Errors"],
  },
  boimela: {
    label: "বইমেলা 3D",
    badge: "Royal Demy Publication",
    actionText: "Open Book Studio",
    defaultTitle: "Amar Ekushey 6×9 Publication Studio",
    defaultSubtitle: "Interactive 3D page-flip preview with Bengali typography & PDF export",
    Icon: Sparkles,
    gradient: "from-rose-500/10 via-pink-500/5 to-transparent",
    borderHover: "hover:border-rose-500/50 hover:shadow-rose-500/10",
    previewPills: ["6×9 Royal Demy", "Bengali Typography", "3D Page-Flip", "Print Ready"],
  },
  commerce: {
    label: "Commerce & MFS",
    badge: "Logistics & Settlement",
    actionText: "Open Commerce Hub",
    defaultTitle: "F-Commerce & Multi-Carrier Courier Hub",
    defaultSubtitle: "Automated Steadfast/Pathao rate routing & bKash/Nagad TrxID verification",
    Icon: Truck,
    gradient: "from-emerald-500/10 via-green-500/5 to-transparent",
    borderHover: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
    previewPills: ["Steadfast COD", "bKash TrxID", "Pathao Express", "Auto Reconciliation"],
  },
  swarm: {
    label: "Swarm Fleet",
    badge: "3-Agent Adversarial Debate",
    actionText: "Open Swarm Space",
    defaultTitle: "Multi-Agent Consensus & Strategy Workspace",
    defaultSubtitle: "Parallel agent swarm execution space with live visual status",
    Icon: Users,
    gradient: "from-purple-500/10 via-indigo-500/5 to-transparent",
    borderHover: "hover:border-purple-500/50 hover:shadow-purple-500/10",
    previewPills: ["Architect Agent", "Security Auditor", "Financial Analyst", "Consensus Score: 96%"],
  },
  twin: {
    label: "Digital Twin",
    badge: "Autonomous Cockpit",
    actionText: "Open Twin Cockpit",
    defaultTitle: "SecondMe 2.0 Autonomous Company Twin",
    defaultSubtitle: "Autonomous task queue, epistemic DAG memory & operational telemetry",
    Icon: Sparkles,
    gradient: "from-amber-500/10 via-yellow-500/5 to-transparent",
    borderHover: "hover:border-amber-500/50 hover:shadow-amber-500/10",
    previewPills: ["Epistemic DAG", "Autonomous Queue", "Zero Hallucinations", "Founder Preferences"],
  },
};

export function InlineArtifactCard({
  type,
  title,
  subtitle,
  onOpen,
  className,
}: InlineArtifactCardProps) {
  const config = CONFIGS[type] || CONFIGS.slides!;
  const {
    Icon,
    label,
    badge,
    actionText,
    defaultTitle,
    defaultSubtitle,
    gradient,
    borderHover,
    previewPills,
  } = config;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group my-4 w-full rounded-2xl border border-border/70 bg-gradient-to-br p-4 text-left transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer select-none",
        gradient,
        borderHover,
        className
      )}
    >
      {/* ── Top Header Strip ── */}
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background/80 border border-border/80 text-brand shadow-xs">
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-foreground font-mono tracking-tight">
            {label}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-background/60 border border-border/60 text-[10px] font-mono text-muted-foreground font-medium">
            {badge}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-brand group-hover:translate-x-0.5 transition-transform">
          <span>{actionText}</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* ── Title & Description ── */}
      <div className="space-y-1 mb-3">
        <h4 className="text-sm font-bold text-foreground group-hover:text-brand transition-colors">
          {title || defaultTitle}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {subtitle || defaultSubtitle}
        </p>
      </div>

      {/* ── Genspark-Style Mini Interactive Preview Pills ── */}
      {previewPills && previewPills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {previewPills.map((pill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background/70 border border-border/60 text-[11px] font-mono text-foreground/80 group-hover:border-brand/30 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand/60" />
              <span>{pill}</span>
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

export default InlineArtifactCard;
