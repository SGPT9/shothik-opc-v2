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
}>> = {
  slides: {
    label: "Interactive Slides",
    defaultTitle: "Presentation Deck",
    defaultSubtitle: "Click to open interactive slide deck in Canvas",
    Icon: Presentation,
  },
  sheet: {
    label: "Financial Sheet",
    defaultTitle: "3-Scenario Financial Model",
    defaultSubtitle: "Click to open interactive spreadsheet model",
    Icon: Table2,
  },
  research: {
    label: "Deep Research Report",
    defaultTitle: "Keyless Intelligence Report",
    defaultSubtitle: "Click to open comprehensive research synthesis",
    Icon: BookOpen,
  },
  code: {
    label: "Code Artifact",
    defaultTitle: "Executable Code Workspace",
    defaultSubtitle: "Click to open full code artifact in Canvas",
    Icon: Code2,
  },
  boimela: {
    label: "বইমেলা 3D",
    defaultTitle: "Amar Ekushey 6×9 Publication Studio",
    defaultSubtitle: "Interactive 3D 6×9 page-flip preview, Bengali typography, & PDF",
    Icon: Sparkles,
  },
  commerce: {
    label: "Commerce & MFS",
    defaultTitle: "F-Commerce & Logistics Hub",
    defaultSubtitle: "Liquid glass bKash TrxID verification & Steadfast booking card",
    Icon: Truck,
  },
  swarm: {
    label: "Swarm Fleet",
    defaultTitle: "Autonomous Swarm Execution Space",
    defaultSubtitle: "Parallel agent swarm execution space with live visual status",
    Icon: Users,
  },
  doc: {
    label: "Document Canvas",
    defaultTitle: "Executive Document Briefing",
    defaultSubtitle: "Click to open interactive multi-page document viewer",
    Icon: BookOpen,
  },
  diagram: {
    label: "Architecture Diagram",
    defaultTitle: "System Topology & Flowchart",
    defaultSubtitle: "Click to open vector diagram & export SVG",
    Icon: Sparkles,
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
  const { Icon, label, defaultTitle, defaultSubtitle } = config;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group my-3 flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-200 dark:border-[#334155] bg-gray-50/50 dark:bg-white/5 p-3.5 text-left transition-all duration-200 shadow-sm hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md cursor-pointer",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 shadow-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase font-mono text-gray-400 dark:text-gray-500">
              {label}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title || defaultTitle}
          </p>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate">
            {subtitle || defaultSubtitle}
          </p>
        </div>
      </div>

      <div className="flex h-8 items-center gap-1 rounded-lg bg-white dark:bg-black/20 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 dark:group-hover:text-white group-hover:border-blue-600 transition-all shrink-0">
        <span>Open Canvas</span>
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </button>
  );
}
