"use client";

import React from "react";
import {
  Sparkles,
  Rocket,
  Table2,
  Presentation,
  Check,
  ChevronRight,
  ArrowRight,
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-6 text-center animate-fade-in space-y-7 max-w-2xl mx-auto">
      {/* ── Perplexity Hero Title ── */}
      <div className="space-y-1.5 text-center">
        <span className="text-xs font-mono font-medium text-zinc-500 uppercase tracking-widest">
          Search
        </span>
        <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-white/95">
          What do you want to know?
        </h1>
      </div>

      {/* ── Perplexity Starter Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
        {STARTER_CHIPS.map((chip) => (
          <button
            key={chip.title}
            type="button"
            onClick={() => onSelectPrompt?.(chip.prompt, chip.mode, chip.tab)}
            className="group relative flex items-start gap-3 rounded-xl border border-white/[0.06] bg-[#161718]/80 p-3.5 text-left transition-all duration-150 hover:border-white/[0.15] hover:bg-[#1a1b1d] shadow-sm backdrop-blur-md overflow-hidden cursor-pointer"
          >
            <div className="relative shrink-0 mt-0.5 p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-300">
              <chip.icon className="h-4 w-4" />
            </div>

            <div className="relative min-w-0 flex-1">
              <div className="flex items-start justify-between gap-1 mb-0.5">
                <span className="text-xs font-medium text-zinc-200 group-hover:text-white leading-tight">
                  {chip.title}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-1">
                {chip.subtitle}
              </p>
            </div>

            <ArrowRight className="absolute bottom-3 right-3 h-3 w-3 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>

      {/* ── Set up Computer Checklist Card (Exact Perplexity Onboarding) ── */}
      <div className="w-full rounded-xl border border-white/[0.06] bg-[#151617]/90 p-3.5 text-left shadow-md">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.05]">
          <span className="text-xs font-medium text-zinc-200">Set up Computer</span>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
            <span>1/4</span>
            <div className="w-2.5 h-2.5 rounded-full border border-teal-400 border-t-transparent animate-spin" />
          </div>
        </div>

        <div className="divide-y divide-white/[0.04] text-xs">
          <div className="flex items-center justify-between py-2 text-zinc-400">
            <div className="flex items-center gap-2.5">
              <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="line-through text-zinc-500">Set up org connectors</span>
            </div>
          </div>

          <div 
            onClick={() => onSelectPrompt?.("Help me invite team members to our workspace")}
            className="flex items-center justify-between py-2 text-zinc-300 hover:text-white cursor-pointer group transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full border border-zinc-600 group-hover:border-zinc-400 shrink-0" />
              <span>Invite team members</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
          </div>

          <div 
            onClick={() => onSelectPrompt?.("I want to add credits to my Shothik workspace")}
            className="flex items-center justify-between py-2 text-zinc-300 hover:text-white cursor-pointer group transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full border border-zinc-600 group-hover:border-zinc-400 shrink-0" />
              <span>Add credits</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
          </div>

          <div 
            onClick={() => onSelectPrompt?.("How do I tag @Computer or @Shothik in Slack and WhatsApp?")}
            className="flex items-center justify-between py-2 text-zinc-300 hover:text-white cursor-pointer group transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full border border-zinc-600 group-hover:border-zinc-400 shrink-0" />
              <span>Tag @Computer in Slack</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-500 font-mono">⌘K</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
