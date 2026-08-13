"use client";

import React from "react";
import {
  Sparkles,
  Rocket,
  Table2,
  Presentation,
  Globe,
  ArrowRight,
  Zap,
  TrendingUp,
  FlaskConical,
  Code2,
} from "lucide-react";
import { type ChatPersona } from "@/lib/chat/types";

interface EmptyChatGreetingProps {
  onSelectPrompt?: (prompt: string, mode?: ChatPersona, tab?: "slides" | "sheet" | "research" | "code") => void;
}

const STARTER_CHIPS: Array<{
  icon: React.ElementType;
  title: string;
  subtitle: string;
  prompt: string;
  mode: ChatPersona;
  tab?: "slides" | "sheet" | "research" | "code";
  tag: string;
}> = [
  {
    icon: Rocket,
    title: "Pro Search: TAM Market Sizing",
    subtitle: "South Asian e-commerce logistics & unit economics",
    prompt: "Calculate TAM SAM SOM market sizing for e-commerce logistics in Bangladesh with 75% margin",
    mode: "cofounder",
    tab: "slides",
    tag: "Strategy",
  },
  {
    icon: Table2,
    title: "3-Scenario Financial Model",
    subtitle: "Base, Aggressive & Conservative MRR projection",
    prompt: "Simulate 3 pricing scenarios in ScenarioLab for BDT 1500 retail price with BDT 350 cost",
    mode: "coworker",
    tab: "sheet",
    tag: "Finance",
  },
  {
    icon: Code2,
    title: "Build Full-Stack Code",
    subtitle: "React components, Node API & InsForge BaaS",
    prompt: "Generate a responsive React UI component with InsForge BaaS PostgreSQL schema and API bindings",
    mode: "cofounder",
    tab: "code",
    tag: "Software Engineering",
  },
  {
    icon: Presentation,
    title: "Generate Investor Pitch Deck",
    subtitle: "10-slide presentation deck",
    prompt: "Generate a 10-slide pitch deck for an AI-powered e-commerce business in Bangladesh",
    mode: "cofounder",
    tab: "slides",
    tag: "Slides",
  },
];

export function EmptyChatGreeting({ onSelectPrompt }: EmptyChatGreetingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 py-8 text-center animate-fade-in">
      {/* ── Perplexity Hero Title ── */}
      <div className="max-w-xl space-y-3 mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 tracking-wide uppercase shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span>Shothik Intelligence</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Where knowledge begins.
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
          AI-powered research, financial modeling, slides, and real-world execution for South Asia.
        </p>
      </div>

      {/* ── Perplexity Glassmorphic Starter Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full mb-6">
        {STARTER_CHIPS.map((chip) => (
          <button
            key={chip.title}
            type="button"
            onClick={() => onSelectPrompt?.(chip.prompt, chip.mode, chip.tab)}
            className="group relative flex items-start gap-3.5 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-left transition-all duration-200 hover:border-emerald-500/50 hover:bg-slate-900 shadow-md backdrop-blur-md overflow-hidden"
          >
            {/* Icon */}
            <div className="relative shrink-0 mt-0.5 p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400">
              <chip.icon className="h-4 w-4" />
            </div>

            {/* Text */}
            <div className="relative min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-slate-100 group-hover:text-white leading-tight">
                  {chip.title}
                </span>
                <span className="shrink-0 text-[9px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-0.5">
                  {chip.tag}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                {chip.subtitle}
              </p>
            </div>

            {/* Arrow */}
            <ArrowRight className="absolute bottom-3 right-3 h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}
