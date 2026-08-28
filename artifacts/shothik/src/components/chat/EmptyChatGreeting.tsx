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
  agentId = "core",
}: EmptyChatGreetingProps) {
  const activeStarters = PERSONA_STARTER_MAP[agentId] || STARTER_PROMPTS;

  const mobilePills = [
    { icon: Sparkles, label: "বাংলায় লিখুন", prompt: "একটি সুন্দর ও প্রাতিষ্ঠানিক বাংলায় নিবন্ধ লিখে দিন।" },
    { icon: Search, label: "Search & Research", prompt: "বাংলাদেশের সাম্প্রতিক টেক ও স্টার্টআপ খাতের অগ্রগতি বিশ্লেষণ করুন।" },
    { icon: FileText, label: "বানান ও ব্যাকরণ", prompt: "আমার লেখার ব্যাকরণ ও বানান শুদ্ধ করে দিন।" },
    { icon: BookOpen, label: "বই ও গল্প রচনা", prompt: "একটি আকর্ষণীয় গল্পের প্রথম অধ্যায় ও চরিত্র রূপরেখা তৈরি করুন।" },
    { icon: Scale, label: "ব্যবসা ও হিসাব", prompt: "একটি নতুন ব্যবসার লাভ-ক্ষতি ও মাসিক খরচের হিসাব তৈরি করুন।" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[30vh] sm:min-h-[38vh] px-3 sm:px-4 py-4 sm:py-6 text-center animate-fade-in space-y-4 sm:space-y-6 max-w-2xl mx-auto">
      {/* ── Shothik Center Minimal Icon (ChatGPT / Perplexity Clean Minimal) ── */}
      <div className="relative group">
        <div className="absolute -inset-2 rounded-full bg-brand/10 blur-xl group-hover:bg-brand/20 transition-all duration-500 pointer-events-none" />
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/[0.05] dark:bg-zinc-900 border border-white/[0.1] backdrop-blur-2xl shadow-xl flex items-center justify-center">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
        </div>
      </div>

      {/* ── Heading & Subtitle ── */}
      <div className="space-y-1 sm:space-y-1.5 text-center">
        <h1 className="text-xl sm:text-3xl font-medium tracking-tight text-foreground">
          How can Shothik help you today?
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Ask questions, research topics, write drafts, or create plans.
        </p>
      </div>

      {/* ── Mobile Quick Action Horizontal Pill Scroll (ChatGPT / Perplexity Mobile Style) ── */}
      <div className="flex sm:hidden flex-wrap items-center justify-center gap-2 w-full pt-1">
        {mobilePills.map((pill) => {
          const Icon = pill.icon;
          return (
            <button
              key={pill.label}
              type="button"
              onClick={() => onSelectPrompt?.(pill.prompt)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-border/60 bg-secondary/40 active:bg-secondary text-xs font-medium text-foreground transition cursor-pointer shadow-xs"
            >
              <Icon className="w-3.5 h-3.5 text-brand" />
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Desktop 3 Intent-First Starter Prompts (Glassmorphic cards) ── */}
      <div className="hidden sm:flex flex-row items-stretch gap-3 w-full pt-1">
        {activeStarters.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelectPrompt?.(item.prompt, item.mode, item.tab)}
              className="flex-1 group flex flex-col justify-between text-left p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] dark:bg-black/40 backdrop-blur-xl hover:bg-white/[0.06] dark:hover:bg-white/[0.04] hover:border-emerald-500/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  <Icon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{item.category}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-200" />
              </div>
              <p className="text-xs font-medium text-zinc-300 leading-snug group-hover:text-white transition-colors">
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
