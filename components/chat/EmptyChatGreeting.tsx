"use client";

import {
  Sparkles,
  Rocket,
  Table2,
  Presentation,
  Globe,
  Brain,
  ArrowUpRight,
} from "lucide-react";
import { ChatPersona } from "@/lib/chat/types";

interface EmptyChatGreetingProps {
  /** Called when a user clicks a prompt starter chip */
  onSelectPrompt?: (prompt: string, mode?: ChatPersona, tab?: "slides" | "sheet" | "research" | "code") => void;
}

const STARTER_CHIPS: Array<{
  icon: React.ElementType;
  title: string;
  subtitle: string;
  prompt: string;
  mode: ChatPersona;
  tab?: "slides" | "sheet" | "research" | "code";
  color: string;
  bg: string;
  border: string;
}> = [
  {
    icon: Rocket,
    title: "Validate Startup Idea",
    subtitle: "South Asian market entry & unit economics",
    prompt: "Validate custom leather wallet business in Dhaka with 75% profit margin target",
    mode: "cofounder",
    tab: "slides",
    color: "text-brand",
    bg: "bg-brand/10",
    border: "border-brand/30",
  },
  {
    icon: Table2,
    title: "3-Scenario Financial Model",
    subtitle: "Base, Aggressive, & Conservative MRR",
    prompt: "Simulate 3 pricing scenarios in ScenarioLab for BDT 1500 retail price with BDT 350 cost",
    mode: "coworker",
    tab: "sheet",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
  },
  {
    icon: Presentation,
    title: "Generate Pitch Deck",
    subtitle: "10-slide investor presentation",
    prompt: "Generate a 10-slide pitch deck for an AI-powered e-commerce business in Bangladesh",
    mode: "cofounder",
    tab: "slides",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
  },
  {
    icon: Globe,
    title: "Live Market Research",
    subtitle: "Wigolo keyless web intelligence",
    prompt: "Research top 5 logistics & courier competitors in Dhaka with live web citations",
    mode: "coresearcher",
    tab: "research",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
  },
];

export function EmptyChatGreeting({ onSelectPrompt }: EmptyChatGreetingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in zoom-in-95 duration-300">
      
      {/* Hero Icon Orb */}
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-brand/20 animate-ping opacity-30" />
        <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-brand/20 via-purple-500/20 to-indigo-500/20 animate-pulse" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand via-purple-600 to-indigo-600 shadow-xl shadow-brand/20 border border-white/20">
          <Brain className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Hero Titles */}
      <div className="max-w-md space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          <Sparkles className="h-3.5 w-3.5" />
          Shothik AI Cofounder OS
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          What are we building today?
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Your AI operating partner for South Asian solo founders. Ask strategy questions, build financial sheets, or generate pitch decks.
        </p>
      </div>

      {/* 4 Starter Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
        {STARTER_CHIPS.map((chip) => (
          <button
            key={chip.title}
            type="button"
            onClick={() => onSelectPrompt?.(chip.prompt, chip.mode, chip.tab)}
            className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all hover:scale-[1.01] shadow-sm ${chip.bg} ${chip.border} group`}
          >
            <div className={`p-2.5 rounded-xl border ${chip.bg} ${chip.border} ${chip.color} shrink-0 mt-0.5`}>
              <chip.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-foreground group-hover:text-brand transition">
                  {chip.title}
                </span>
                <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-brand transition" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                {chip.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>

    </div>
  );
}
