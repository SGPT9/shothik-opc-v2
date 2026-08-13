"use client";

import {
  Sparkles,
  Rocket,
  Table2,
  Presentation,
  Globe,
  Brain,
  ArrowRight,
  Zap,
  TrendingUp,
  FlaskConical,
  Code2,
} from "lucide-react";
import { ChatPersona } from "@/lib/chat/types";

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
  gradient: string;
  glow: string;
  tag: string;
}> = [
  {
    icon: Rocket,
    title: "Validate Startup Idea",
    subtitle: "South Asian market entry & unit economics",
    prompt: "Validate custom leather wallet business in Dhaka with 75% profit margin target",
    mode: "cofounder",
    tab: "slides",
    gradient: "from-brand/20 via-emerald-500/10 to-transparent",
    glow: "shadow-brand/20",
    tag: "Strategy",
  },
  {
    icon: Table2,
    title: "3-Scenario Financial Model",
    subtitle: "Base, Aggressive & Conservative MRR",
    prompt: "Simulate 3 pricing scenarios in ScenarioLab for BDT 1500 retail price with BDT 350 cost",
    mode: "coworker",
    tab: "sheet",
    gradient: "from-cyan-500/20 via-sky-500/10 to-transparent",
    glow: "shadow-cyan-500/20",
    tag: "Finance",
  },
  {
    icon: Code2,
    title: "Build Full-Stack App Code",
    subtitle: "React components, Node API & InsForge DB",
    prompt: "Generate a responsive React UI component with InsForge BaaS PostgreSQL schema and API bindings",
    mode: "cofounder",
    tab: "code",
    gradient: "from-purple-500/20 via-indigo-500/10 to-transparent",
    glow: "shadow-purple-500/20",
    tag: "Software Engineering",
  },
  {
    icon: Presentation,
    title: "Generate Pitch Deck",
    subtitle: "10-slide investor presentation",
    prompt: "Generate a 10-slide pitch deck for an AI-powered e-commerce business in Bangladesh",
    mode: "cofounder",
    tab: "slides",
    gradient: "from-violet-500/20 via-indigo-500/10 to-transparent",
    glow: "shadow-violet-500/20",
    tag: "Slides",
  },
  {
    icon: Globe,
    title: "Live Market Research",
    subtitle: "Wigolo keyless web intelligence",
    prompt: "Research top 5 logistics & courier competitors in Dhaka with live web citations",
    mode: "coresearcher",
    tab: "research",
    gradient: "from-sky-500/20 via-blue-500/10 to-transparent",
    glow: "shadow-sky-500/20",
    tag: "Research",
  },
];

const QUICK_ACTIONS = [
  { label: "Overnight deep-dive", icon: Zap, color: "text-amber-400" },
  { label: "Financial model", icon: TrendingUp, color: "text-emerald-400" },
  { label: "Stress-test idea", icon: FlaskConical, color: "text-violet-400" },
];

export function EmptyChatGreeting({ onSelectPrompt }: EmptyChatGreetingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-10 text-center">

      {/* ── Animated Hero Orb ── */}
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
        {/* Outer pulse rings */}
        <div className="absolute inset-0 rounded-full bg-brand/10 animate-ping opacity-20" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-brand/15 via-purple-500/15 to-indigo-500/15 animate-[spin_8s_linear_infinite]" />
        {/* Main orb */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-brand via-emerald-500 to-teal-600 shadow-2xl shadow-brand/30 border border-white/15">
          <div className="absolute inset-0 rounded-[22px] bg-gradient-to-tr from-white/10 to-transparent" />
          <Brain className="relative h-9 w-9 text-white drop-shadow-sm" />
        </div>
      </div>

      {/* ── Headline ── */}
      <div className="max-w-lg space-y-3 mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand/8 px-3.5 py-1 text-[11px] font-semibold text-brand tracking-wide uppercase">
          <Sparkles className="h-3 w-3" />
          Shothik · AI Cofounder OS
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent leading-[1.15]">
          What are we<br />building today?
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          Your AI operating partner for South Asian founders — strategy, research, decks, and financials in one conversation.
        </p>
      </div>

      {/* ── Starter Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full mb-6">
        {STARTER_CHIPS.map((chip) => (
          <button
            key={chip.title}
            type="button"
            onClick={() => onSelectPrompt?.(chip.prompt, chip.mode, chip.tab)}
            className={`group relative flex items-start gap-3.5 rounded-2xl border border-white/8 bg-gradient-to-br ${chip.gradient} p-4 text-left transition-all duration-200 hover:scale-[1.015] hover:border-white/15 shadow-lg ${chip.glow} overflow-hidden`}
          >
            {/* Card background shimmer on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-white/4 to-transparent" />

            {/* Icon */}
            <div className="relative shrink-0 mt-0.5 p-2.5 rounded-xl bg-white/8 border border-white/10">
              <chip.icon className="h-4 w-4 text-foreground" />
            </div>

            {/* Text */}
            <div className="relative min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-[13px] font-bold text-foreground leading-tight">
                  {chip.title}
                </span>
                <span className="shrink-0 text-[9px] font-semibold tracking-widest uppercase text-muted-foreground/70 border border-border/50 rounded-full px-2 py-0.5 mt-0.5">
                  {chip.tag}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                {chip.subtitle}
              </p>
            </div>

            {/* Arrow */}
            <ArrowRight className="absolute bottom-3 right-3 h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/70 group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>

      {/* ── Quick action pills ── */}
      <div className="flex items-center flex-wrap gap-2 justify-center">
        <span className="text-[11px] text-muted-foreground/50 mr-1">Quick start:</span>
        {QUICK_ACTIONS.map(({ label, icon: Icon, color }) => (
          <button
            key={label}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/20 px-3 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border transition-all"
          >
            <Icon className={`h-3 w-3 ${color}`} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
