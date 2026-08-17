import React from "react";
import { Presentation, Table2, BookOpen, Code2, ArrowUpRight, Sparkles } from "lucide-react";
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
};

export function InlineArtifactCard({
  type,
  title,
  subtitle,
  onOpen,
  className,
}: InlineArtifactCardProps) {
  const config = CONFIGS[type] || CONFIGS.slides;
  const { Icon, color, border, bg, badgeBg, label, defaultTitle, defaultSubtitle } = config;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group my-3 flex w-full items-center justify-between gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200 shadow-sm hover:shadow-md",
        border,
        bg,
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-background/80 shadow-inner", color)}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase font-mono", badgeBg)}>
              <Sparkles className="h-2.5 w-2.5" />
              {label}
            </span>
          </div>
          <p className="text-xs font-bold text-foreground truncate group-hover:text-brand transition-colors">
            {title || defaultTitle}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {subtitle || defaultSubtitle}
          </p>
        </div>
      </div>

      <div className="flex h-8 items-center gap-1 rounded-xl bg-background/80 px-2.5 text-xs font-semibold text-foreground border border-border/60 group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-all shrink-0">
        <span>Open Canvas</span>
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </button>
  );
}
