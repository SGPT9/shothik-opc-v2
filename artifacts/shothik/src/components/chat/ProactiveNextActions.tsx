"use client";

import { Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NextActionItem {
  id: string;
  label: string;
  query: string;
  icon?: "slides" | "sheet" | "research" | "code";
}

export type ProactiveActionCategory =
  | "slides"
  | "sheet"
  | "research"
  | "code"
  | "general"
  | "commerce"
  | "writing";

interface ProactiveNextActionsProps {
  type?: ProactiveActionCategory;
  content?: string;
  agentId?: string;
  onSelectAction?: (query: string) => void;
  onOpenWritingStudio?: () => void;
  className?: string;
}

const ACTION_SETS: Record<ProactiveActionCategory, NextActionItem[]> = {
  general: [
    { id: "g1", label: "💡 Deepen Explanation", query: "Please explain the core reasoning, trade-offs, and underlying assumptions in more detail.", icon: "research" },
    { id: "g2", label: "📋 Convert to Action Checklist", query: "Convert this response into a prioritized step-by-step implementation checklist.", icon: "research" },
    { id: "g3", label: "🔍 Uncover Edge Cases", query: "What are the most likely failure modes, edge cases, and risks with this approach?", icon: "research" },
  ],
  slides: [
    { id: "a1", label: "📊 Add Financial Metrics Slide", query: "Add a financial metrics slide with ARR and payback breakdown", icon: "sheet" },
    { id: "a2", label: "🎯 Tailor for Investor Pitch", query: "Refine slide deck messaging specifically for Series A VC investors", icon: "slides" },
    { id: "a3", label: "🌐 Translate to Bengali/Spanish", query: "Translate all slide content and speaker notes into high-impact presentation copy", icon: "slides" },
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
  commerce: [
    { id: "e1", label: "🚚 Steadfast & Pathao Logistics", query: "Compare delivery success rates and API webhook formats for Steadfast and Pathao couriers.", icon: "research" },
    { id: "e2", label: "💳 bKash/Nagad MFS Settlement", query: "Calculate merchant transaction fees and settlement timelines for bKash and Nagad gateways.", icon: "sheet" },
    { id: "e3", label: "📦 Courier Return Policy", query: "Draft an e-commerce return & COD refund policy compliant with Bangladesh e-commerce regulations.", icon: "research" },
  ],
  writing: [
    { id: "w1", label: "🧹 De-Slop & Sensory Polish", query: "Strip AI clichés and enrich this draft with grounded 5-sense details and natural rhythm.", icon: "research" },
    { id: "w2", label: "🎭 Deepen Character & Pacing", query: "Analyze narrative tension, scene pacing, and emotional character arcs in this draft.", icon: "research" },
    { id: "w3", label: "📖 3D Boi Mela 6×9 Preview", query: "Format this manuscript in 6×9 Royal Demy and launch the 3D book flip viewer.", icon: "slides" },
    { id: "w4", label: "✍️ Refine in Literary Bengali", query: "Translate and polish this draft into rich, literary Bengali (বিশুদ্ধ বাংলা গদ্য).", icon: "research" },
  ],
};

export function inferProactiveActionCategory(
  explicitType?: string,
  content?: string,
  agentId?: string
): ProactiveActionCategory {
  if (
    explicitType &&
    explicitType !== "general" &&
    explicitType in ACTION_SETS
  ) {
    return explicitType as ProactiveActionCategory;
  }

  if (agentId === "writer") return "writing";
  if (agentId === "research") return "research";
  if (agentId === "presentation" || agentId === "slides") return "slides";
  if (agentId === "sheets") return "sheet";

  const text = (content || "").toLowerCase();
  if (
    /\b(chapter|manuscript|novel|protagonist|dialogue|scene|thesis|abstract|literature review|essay|boi mela|অধ্যায়|উপন্যাস|গল্প|পাণ্ডুলিপি|গবেষণা)\b/i.test(
      text
    )
  ) {
    return "writing";
  }
  if (/\b(bkash|nagad|steadfast|pathao|courier|cod|mfs|merchant)\b/i.test(text)) {
    return "commerce";
  }
  if (/\b(ebitda|dcf|cagr|balance sheet|unit economics|arr|mrr|spreadsheet)\b/i.test(text)) {
    return "sheet";
  }
  if (/\b(slide|pitch deck|keynote|presentation)\b/i.test(text)) {
    return "slides";
  }
  if (/```|\b(function|interface|typescript|react|api endpoint|sql)\b/i.test(text)) {
    return "code";
  }
  if (/\b(citation|source|study|findings|methodology|benchmark|market size)\b/i.test(text)) {
    return "research";
  }

  return "general";
}

export function ProactiveNextActions({
  type = "general",
  content,
  agentId,
  onSelectAction,
  onOpenWritingStudio,
  className,
}: ProactiveNextActionsProps) {
  const resolvedType = inferProactiveActionCategory(type, content, agentId);
  const actions = ACTION_SETS[resolvedType] || ACTION_SETS.general;
  const showStudioBridge =
    Boolean(onOpenWritingStudio) &&
    (resolvedType === "writing" ||
      resolvedType === "research" ||
      agentId === "writer" ||
      (content && content.length > 280));

  return (
    <div className={cn("my-2.5 pt-1 space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>Suggested Next Actions</span>
        </div>

        {showStudioBridge && (
          <button
            type="button"
            onClick={onOpenWritingStudio}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300 transition cursor-pointer shadow-2xs"
            title="Open this draft inside the 45-Capability InkOS Writing Studio"
          >
            <BookOpen className="h-3 w-3" />
            <span>🚀 Open in InkOS Writing Studio</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {actions.map((act) => (
          <button
            key={act.id}
            type="button"
            onClick={() => onSelectAction?.(act.query)}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#151B28] px-3.5 py-1.5 text-[13px] text-gray-700 dark:text-gray-300 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm cursor-pointer select-none group"
          >
            <span>{act.label}</span>
            <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        ))}
      </div>
    </div>
  );
}
