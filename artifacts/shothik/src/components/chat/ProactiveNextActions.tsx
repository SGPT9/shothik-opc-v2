"use client";

import { Sparkles, ArrowRight, BarChart3, Presentation, Search, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NextActionItem {
  id: string;
  label: string;
  query: string;
  icon?: "slides" | "sheet" | "research" | "code";
}

interface ProactiveNextActionsProps {
  type?: "slides" | "sheet" | "research" | "code" | "general";
  onSelectAction?: (query: string) => void;
  className?: string;
}

const ACTION_SETS: Record<string, NextActionItem[]> = {
  slides: [
    { id: "a1", label: "📊 Add Financial Metrics Slide", query: "Add a financial metrics slide with ARR and payback breakdown", icon: "sheet" },
    { id: "a2", label: "🎯 Tailor for Investor Pitch", query: "Refine slide deck messaging specifically for Series A VC investors", icon: "slides" },
    { id: "a3", label: "🌐 Translate to Spanish", query: "Translate all slide content and speaker notes to Spanish", icon: "slides" },
  ],
  sheet: [
    { id: "b1", label: "📈 Add 5-Year Sensitivity Model", query: "Calculate a 5-year revenue sensitivity table for Base, Aggressive and Conservative scenarios", icon: "sheet" },
    { id: "b2", label: "💡 Calculate DCF Valuation", query: "Add a DCF valuation row using a 12% discount rate and 3% terminal growth", icon: "sheet" },
    { id: "b3", label: "📥 Summarize Executive Insights", query: "Provide an executive summary of key financial risks and unit economics", icon: "research" },
  ],
  research: [
    { id: "c1", label: "📰 Audit Competitor Pricing", query: "Audit top 3 direct competitor pricing models and feature tiers", icon: "research" },
    { id: "c2", label: "🎯 Outline Go-To-Market Plan", query: "Create a 90-day GTM execution roadmap based on research findings", icon: "slides" },
    { id: "c3", label: "📁 Generate Executive Brief", query: "Compile a 1-page C-suite executive brief highlighting key findings", icon: "research" },
  ],
  code: [
    { id: "d1", label: "⚡ Add Dark Mode Toggle", query: "Add Tailwind CSS dark mode toggle and state management to the component", icon: "code" },
    { id: "d2", label: "🔒 Add Input Validation", query: "Add Zod schema validation and error message feedback to input fields", icon: "code" },
    { id: "d3", label: "🚀 Deploy to BaaS Sandbox", query: "Generate InsForge BaaS database schema and API route bindings", icon: "code" },
  ],
};

export function ProactiveNextActions({
  type = "slides",
  onSelectAction,
  className,
}: ProactiveNextActionsProps) {
  const actions = ACTION_SETS[type] || ACTION_SETS.slides;

  return (
    <div className={cn("my-2.5 pt-1 space-y-1.5", className)}>
      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
        <Sparkles className="h-3 w-3 text-brand" />
        <span>Suggested Next Actions</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {actions.map((act) => (
          <button
            key={act.id}
            type="button"
            onClick={() => onSelectAction?.(act.query)}
            className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/20 px-3 py-1.5 text-xs text-foreground font-medium hover:bg-brand/10 hover:border-brand/40 hover:text-brand transition shadow-sm group"
          >
            <span>{act.label}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-brand group-hover:translate-x-0.5 transition-transform" />
          </button>
        ))}
      </div>
    </div>
  );
}
