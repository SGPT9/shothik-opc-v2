"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { type ChatPersona } from "@/lib/chat/types";

interface EmptyChatGreetingProps {
  onSelectPrompt?: (prompt: string, mode?: ChatPersona, tab?: "slides" | "sheet" | "research" | "code") => void;
}

const STARTER_PROMPTS: Array<{
  icon: React.ElementType;
  title: string;
  subtitle: string;
  prompt: string;
  mode?: ChatPersona;
  tab?: "slides" | "sheet" | "research" | "code";
}> = [
  {
    icon: Sparkles,
    title: "Research a topic",
    subtitle: "Find and summarize information from across the web",
    prompt: "Research a market and summarize the findings",
    mode: "researcher",
    tab: "research",
  },
  {
    icon: Sparkles,
    title: "Analyze and compare",
    subtitle: "Evaluate options and get recommendations",
    prompt: "Compare options and recommend the best choice",
    mode: "cofounder",
  },
  {
    icon: Sparkles,
    title: "Create something",
    subtitle: "Generate reports, models, slides, or code",
    prompt: "Create a report, model, or draft from my idea",
    mode: "cofounder",
    tab: "slides",
  },
];

export function EmptyChatGreeting({ onSelectPrompt }: EmptyChatGreetingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-6 text-center animate-fade-in space-y-6 max-w-2xl mx-auto">
      {/* Hero Title */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-white/95">
          What do you want to work on?
        </h1>
        <p className="text-sm text-zinc-400">
          Ask anything. Shothik will route your request to the right capability.
        </p>
      </div>

      {/* Starter Prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt.title}
            type="button"
            onClick={() => onSelectPrompt?.(prompt.prompt, prompt.mode, prompt.tab)}
            className="group relative flex items-start gap-3 rounded-xl border border-white/[0.06] bg-[#161718]/80 p-3.5 text-left transition-all duration-150 hover:border-white/[0.15] hover:bg-[#1a1b1d] shadow-sm backdrop-blur-md overflow-hidden cursor-pointer"
          >
            <div className="relative shrink-0 mt-0.5 p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-300">
              <prompt.icon className="h-4 w-4" />
            </div>

            <div className="relative min-w-0 flex-1">
              <span className="text-xs font-medium text-zinc-200 group-hover:text-white leading-tight">
                {prompt.title}
              </span>
              <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-1 mt-0.5">
                {prompt.subtitle}
              </p>
            </div>

            <ArrowRight className="absolute bottom-3 right-3 h-3 w-3 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}
