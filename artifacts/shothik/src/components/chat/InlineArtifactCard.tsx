import React from "react";
import { Presentation, Table2, BookOpen, Code2, ArrowUpRight, Sparkles, Truck, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArtifactTab } from "./ArtifactPanel";

interface InlineArtifactCardProps {
  type: ArtifactTab;
  title?: string;
  subtitle?: string;
  onOpen: () => void;
  className?: string;
}

const CONFIGS: Partial<Record<ArtifactTab, {
  label: string;
  defaultTitle: string;
  defaultSubtitle: string;
  Icon: React.ElementType;
  color: string;
  border: string;
  bg: string;
  badgeBg: string;
}>> = {
  slides: {
    label: "Interactive Slides",
    defaultTitle: "Presentation Deck",
    defaultSubtitle: "Click to open interactive slide deck in Canvas",
    Icon: Presentation,
    color: "text-indigo-400",
    border: "border-indigo-500/30 hover:border-indigo-500/60",
    bg: "bg-indigo-500/5 hover:bg-indigo-500/10",
    badgeBg: "bg-indigo-500/15 text-indigo-300",
  },
  sheet: {
    label: "Financial Sheet",
    defaultTitle: "3-Scenario Financial Model",
    defaultSubtitle: "Click to open interactive spreadsheet model",
    Icon: Table2,
    color: "text-cyan-400",
    border: "border-cyan-500/30 hover:border-cyan-500/60",
    bg: "bg-cyan-500/5 hover:bg-cyan-500/10",
    badgeBg: "bg-cyan-500/15 text-cyan-300",
  },
  research: {
    label: "Deep Research Report",
    defaultTitle: "Keyless Intelligence Report",
    defaultSubtitle: "Click to open comprehensive research synthesis",
    Icon: BookOpen,
    color: "text-violet-400",
    border: "border-violet-500/30 hover:border-violet-500/60",
    bg: "bg-violet-500/5 hover:bg-violet-500/10",
    badgeBg: "bg-violet-500/15 text-violet-300",
  },
  code: {
    label: "Code Artifact",
    defaultTitle: "Executable Code Workspace",
    defaultSubtitle: "Click to open full code artifact in Canvas",
    Icon: Code2,
    color: "text-emerald-400",
    border: "border-emerald-500/30 hover:border-emerald-500/60",
    bg: "bg-emerald-500/5 hover:bg-emerald-500/10",
    badgeBg: "bg-emerald-500/15 text-emerald-300",
  },
  boimela: {
    label: "বইমেলা 3D",
    defaultTitle: "Amar Ekushey 6×9 Publication Studio",
    defaultSubtitle: "Interactive 3D 6×9 page-flip preview, Bengali typography, & PDF",
    Icon: Sparkles,
    color: "text-rose-400",
    border: "border-rose-500/30 hover:border-rose-500/60",
    bg: "bg-rose-500/5 hover:bg-rose-500/10",
    badgeBg: "bg-rose-500/15 text-rose-300",
  },
  commerce: {
    label: "Commerce & MFS",
    defaultTitle: "F-Commerce & Logistics Hub",
    defaultSubtitle: "Liquid glass bKash TrxID verification & Steadfast booking card",
    Icon: Truck,
    color: "text-emerald-400",
    border: "border-emerald-500/30 hover:border-emerald-500/60",
    bg: "bg-emerald-500/5 hover:bg-emerald-500/10",
    badgeBg: "bg-emerald-500/15 text-emerald-300",
  },
  swarm: {
    label: "Swarm Fleet",
    defaultTitle: "Autonomous Swarm Execution Space",
    defaultSubtitle: "Parallel agent swarm execution space with live visual status",
    Icon: Users,
    color: "text-purple-400",
    border: "border-purple-500/30 hover:border-purple-500/60",
    bg: "bg-purple-500/5 hover:bg-purple-500/10",
    badgeBg: "bg-purple-500/15 text-purple-300",
  },
  doc: {
    label: "Document Canvas",
    defaultTitle: "Executive Document Briefing",
    defaultSubtitle: "Click to open interactive multi-page document viewer",
    Icon: BookOpen,
    color: "text-blue-400",
    border: "border-blue-500/30 hover:border-blue-500/60",
    bg: "bg-blue-500/5 hover:bg-blue-500/10",
    badgeBg: "bg-blue-500/15 text-blue-300",
  },
  diagram: {
    label: "Architecture Diagram",
    defaultTitle: "System Topology & Flowchart",
    defaultSubtitle: "Click to open vector diagram & export SVG",
    Icon: Sparkles,
    color: "text-amber-400",
    border: "border-amber-500/30 hover:border-amber-500/60",
    bg: "bg-amber-500/5 hover:bg-amber-500/10",
    badgeBg: "bg-amber-500/15 text-amber-300",
  },
};

export function InlineArtifactCard({
  type,
  title,
  subtitle,
  onOpen,
  className,
}: InlineArtifactCardProps) {
  const config = CONFIGS[type] || CONFIGS.slides;
  const { Icon, color, badgeBg, label, defaultTitle, defaultSubtitle } = config;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group my-3 flex w-full items-center justify-between gap-3 rounded-2xl border border-zinc-200 dark:border-white/[0.12] bg-zinc-100/90 dark:bg-black/60 backdrop-blur-xl p-3.5 text-left transition-all duration-200 shadow-sm hover:border-zinc-300 dark:hover:border-white/[0.25] hover:shadow-lg cursor-pointer",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 dark:border-white/[0.12] bg-white dark:bg-white/[0.04] shadow-xs", color)}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase font-mono", badgeBg)}>
              <Sparkles className="h-2.5 w-2.5" />
              {label}
            </span>
          </div>
          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-400 transition-colors">
            {title || defaultTitle}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
            {subtitle || defaultSubtitle}
          </p>
        </div>
      </div>

      <div className="flex h-8 items-center gap-1 rounded-xl bg-white dark:bg-white/[0.08] px-3 text-xs font-semibold text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-white/[0.15] group-hover:bg-emerald-500 group-hover:text-zinc-950 group-hover:border-emerald-500 transition-all shrink-0">
        <span>Open Canvas</span>
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </button>
  );
}
