"use client";

import React from "react";
import { Search, Scale, FileText, ArrowRight } from "lucide-react";
import { type ChatPersona } from "@/lib/chat/types";

interface EmptyChatGreetingProps {
  onSelectPrompt?: (
    prompt: string,
    mode?: ChatPersona,
    tab?: "slides" | "sheet" | "research" | "code"
  ) => void;
}

const STARTER_PROMPTS = [
  {
    icon: Search,
    category: "Research",
    label: "Research a market and summarize findings",
    prompt: "Research the current market size, key competitors, and growth trends for e-commerce logistics in South Asia and summarize the key findings.",
    mode: "cofounder" as ChatPersona,
    tab: "research" as const,
  },
  {
    icon: Scale,
    category: "Analysis",
    label: "Compare options and recommend the best choice",
    prompt: "Compare PostgreSQL with PostgREST vs MongoDB for a real-time collaborative writing app with version control, and recommend the best choice.",
    mode: "coworker" as ChatPersona,
  },
  {
    icon: FileText,
    category: "Create",
    label: "Create a report, model, or draft from my idea",
    prompt: "Create a 3-scenario revenue model and executive summary draft for a subscription SaaS tool targeting authors and creators.",
    mode: "cofounder" as ChatPersona,
    tab: "sheet" as const,
  },
];

export function EmptyChatGreeting({ onSelectPrompt }: EmptyChatGreetingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[42vh] px-4 py-8 text-center animate-fade-in space-y-6 max-w-2xl mx-auto">
      {/* ── Heading & Subtitle ── */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
          What do you want to accomplish today?
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Ask a question, research deeply, generate slides, build models, or automate workflows.
        </p>
      </div>

      {/* ── 3 Intent-First Starter Prompts ── */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full pt-1">
        {STARTER_PROMPTS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelectPrompt?.(item.prompt, item.mode, item.tab)}
              className="flex-1 group flex flex-col justify-between text-left p-3.5 rounded-xl border border-border/70 bg-card/60 hover:bg-muted/70 hover:border-border transition-all duration-150 shadow-xs cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  <Icon className="w-3.5 h-3.5 text-brand" />
                  <span>{item.category}</span>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs font-medium text-foreground/90 leading-snug group-hover:text-foreground">
                {item.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default EmptyChatGreeting;
