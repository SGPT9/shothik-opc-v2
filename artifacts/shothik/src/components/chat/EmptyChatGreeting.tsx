import React from "react";
import { Search, Scale, FileText, ArrowRight, MessageSquare, LayoutTemplate, BookOpen, Presentation, Sparkles } from "lucide-react";
import { type ChatPersona } from "@/lib/chat/types";

interface EmptyChatGreetingProps {
  onSelectPrompt?: (
    prompt: string,
    mode?: ChatPersona,
    tab?: "slides" | "sheet" | "research" | "code"
  ) => void;
  isArtifactOpen?: boolean;
  onToggleArtifact?: (open: boolean) => void;
  agentId?: string;
}

interface StarterPromptItem {
  icon: any;
  category: string;
  label: string;
  prompt: string;
  mode: ChatPersona;
  tab?: "slides" | "sheet" | "research" | "code";
}

const STARTER_PROMPTS: StarterPromptItem[] = [
  {
    icon: Search,
    category: "Research",
    label: "Research a market and summarize findings",
    prompt: "Research the current market size, key competitors, and growth trends for e-commerce logistics in South Asia and summarize the key findings.",
    mode: "cofounder",
    tab: "research",
  },
  {
    icon: Scale,
    category: "Analysis",
    label: "Compare options and recommend the best choice",
    prompt: "Compare PostgreSQL with PostgREST vs MongoDB for a real-time collaborative writing app with version control, and recommend the best choice.",
    mode: "coworker",
  },
  {
    icon: FileText,
    category: "Create",
    label: "Create a report, model, or draft from my idea",
    prompt: "Create a 3-scenario revenue model and executive summary draft for a subscription SaaS tool targeting authors and creators.",
    mode: "cofounder",
    tab: "sheet",
  },
];

const PERSONA_STARTER_MAP: Record<string, StarterPromptItem[]> = {
  core: STARTER_PROMPTS,
  analyst: [
    {
      icon: Search,
      category: "Research",
      label: "Deep Research: TAM & Competitor Intelligence",
      prompt: "Research the addressable market size, unit economics, and major competitors in the South Asian e-commerce logistics sector.",
      mode: "cofounder" as ChatPersona,
      tab: "research" as const,
    },
    {
      icon: Scale,
      category: "Analysis",
      label: "Evidence Matrix & Regulatory Audit",
      prompt: "Analyze the NBR Income Tax Act 2023 for software export exemptions and provide an evidence comparison matrix.",
      mode: "coworker" as ChatPersona,
      tab: "research" as const,
    },
    {
      icon: FileText,
      category: "Synthesis",
      label: "Academic Literature & Whitepaper Synthesis",
      prompt: "Synthesize recent multi-agent LLM reasoning benchmarks into an executive briefing document with citations.",
      mode: "cofounder" as ChatPersona,
    },
  ],
  writer: [
    {
      icon: BookOpen,
      category: "Plot Beats",
      label: "Chapter 1 Scene Beat Sheet & Arc",
      prompt: "Outline a 3-act scene beat sheet with escalating conflict and emotional stakes for a Dhaka mystery thriller novel.",
      mode: "creative-partner" as ChatPersona,
    },
    {
      icon: Sparkles,
      category: "Character",
      label: "Psychological Character Dossier",
      prompt: "Design a deep psychological character dossier including fatal flaw, internal misbelief, and relational foil dynamics.",
      mode: "creative-partner" as ChatPersona,
    },
    {
      icon: Presentation,
      category: "Boi Mela 3D",
      label: "6×9 Royal Demy Book Manuscript Format",
      prompt: "Format manuscript chapters into standard 6×9 Royal Demy book dimensions with front matter and 3D preview metadata.",
      mode: "creative-partner" as ChatPersona,
      tab: "slides" as const,
    },
  ],
  business: [
    {
      icon: Presentation,
      category: "Pitch Deck",
      label: "10-Slide Investor Pitch Deck (Marp)",
      prompt: "Generate a 10-slide investor pitch deck structure for a B2B SaaS startup with problem, solution, TAM, traction, and ask.",
      mode: "cofounder" as ChatPersona,
      tab: "slides" as const,
    },
    {
      icon: Scale,
      category: "Financials",
      label: "5-Year Revenue & Cash Flow Spreadsheet",
      prompt: "Build a 3-scenario 5-year revenue forecast spreadsheet with gross margin, CAC/LTV, and headcount breakdown.",
      mode: "cofounder" as ChatPersona,
      tab: "sheet" as const,
    },
    {
      icon: FileText,
      category: "Proposals",
      label: "Enterprise Software License & SLA Agreement",
      prompt: "Draft an enterprise SaaS software licensing agreement with data governance, 99.9% uptime SLA, and liability clauses.",
      mode: "cofounder" as ChatPersona,
    },
  ],
};

export function EmptyChatGreeting({
  onSelectPrompt,
  isArtifactOpen = false,
  onToggleArtifact,
  agentId = "core",
}: EmptyChatGreetingProps) {
  const activeStarters = PERSONA_STARTER_MAP[agentId] || STARTER_PROMPTS;
  return (
    <div className="flex flex-col items-center justify-center min-h-[42vh] px-4 py-6 text-center animate-fade-in space-y-6 max-w-3xl mx-auto">
      {/* ── Center Mode Switcher (Chat | Work Canvas) ── */}
      {onToggleArtifact && (
        <div className="inline-flex items-center bg-secondary/70 p-1 rounded-2xl border border-border/50 text-xs shadow-xs backdrop-blur-md">
          <button
            type="button"
            onClick={() => onToggleArtifact(false)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl transition font-medium cursor-pointer ${
              !isArtifactOpen
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleArtifact(true)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl transition font-medium cursor-pointer ${
              isArtifactOpen
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>Work Canvas</span>
          </button>
        </div>
      )}

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
      <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full pt-1">
        {activeStarters.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelectPrompt?.(item.prompt, item.mode, item.tab)}
              className="flex-1 group flex flex-col justify-between text-left p-3.5 rounded-xl border border-border/70 bg-card/60 hover:bg-muted/70 hover:border-brand/40 hover:shadow-xs transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  <Icon className="w-3.5 h-3.5 text-brand" />
                  <span>{item.category}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-brand group-hover:translate-x-1 transition-transform duration-200" />
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
