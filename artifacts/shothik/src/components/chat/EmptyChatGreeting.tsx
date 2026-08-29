import React, { useState } from "react";
import {
  Search,
  Scale,
  FileText,
  ArrowRight,
  BookOpen,
  Presentation,
  Sparkles,
  Truck,
  Rocket,
  Table,
  TrendingUp,
  Brain,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
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

interface SparkCardItem {
  id: string;
  category: "ALL" | "SHEETS" | "SLIDES" | "DOCS" | "RESEARCH" | "TWIN";
  icon: any;
  badge: string;
  badgeColor: string;
  title: string;
  desc: string;
  prompt: string;
  mode: ChatPersona;
  tab?: "slides" | "sheet" | "research" | "code";
}

const GENSPARK_CARDS: SparkCardItem[] = [
  {
    id: "fcommerce-sheet",
    category: "SHEETS",
    icon: FileSpreadsheet,
    badge: "Office Sheets",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    title: "Dhaka F-Commerce Order Ledger",
    desc: "Reconcile Steadfast & Pathao COD parcels, bKash fees, and return ratios with live charts.",
    prompt: "Generate a comprehensive Dhaka F-Commerce order ledger with columns: Order_ID, Customer_Name, District, Product_Name, Quantity, Unit_Price, Delivery_Charge, Payment_Method (bKash/Nagad/COD), Courier (Steadfast/Pathao), and Net_Payout.",
    mode: "coworker",
    tab: "sheet",
  },
  {
    id: "pitch-deck-slides",
    category: "SLIDES",
    icon: Presentation,
    badge: "Office Slides",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    title: "10-Slide Investor Pitch Deck",
    desc: "Generate an executive seed-round pitch deck covering Problem, Solution, TAM, Traction, and Ask.",
    prompt: "Generate a 10-slide investor pitch deck structure for a B2B SaaS startup with problem, solution, TAM, unit economics, traction, and ask in editable slide format.",
    mode: "cofounder",
    tab: "slides",
  },
  {
    id: "thesis-manuscript",
    category: "DOCS",
    icon: BookOpen,
    badge: "Office Docs",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    title: "Academic Thesis & BoiMela Manuscript",
    desc: "Structure chapters with literature review, APA 7 citations, and Nilkhet 6×9 Royal Demy print format.",
    prompt: "Structure my research thesis into clean chapters with literature review, APA 7 citations, and standard 6x9 Royal Demy book dimensions for print publishing.",
    mode: "researcher",
  },
  {
    id: "deep-research-tam",
    category: "RESEARCH",
    icon: Search,
    badge: "Deep Research",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    title: "Market TAM & Competitor Intelligence",
    desc: "Synthesize addressable market sizing, regulatory NBR tax codes, and competitor benchmarks.",
    prompt: "Conduct deep research on the addressable market size (TAM), unit economics, and major competitors in the South Asian e-commerce logistics sector with verified source citations.",
    mode: "cofounder",
    tab: "research",
  },
  {
    id: "financial-forecast",
    category: "SHEETS",
    icon: TrendingUp,
    badge: "Financial Model",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    title: "5-Year SaaS Financial & Burn Model",
    desc: "Forecast 3 scenarios for MRR expansion, CAC/LTV, headcount costs, and runway duration.",
    prompt: "Build a 3-scenario 5-year revenue forecast spreadsheet with gross margin, CAC/LTV, server costs, and headcount breakdown with formula calculations.",
    mode: "cofounder",
    tab: "sheet",
  },
  {
    id: "merchant-twin",
    category: "TWIN",
    icon: Brain,
    badge: "Autonomous Twin",
    badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    title: "Automated Courier & WhatsApp Twin",
    desc: "Auto-dispatch delivery webhooks, verify 10-digit bKash TrxIDs, and draft customer replies.",
    prompt: "How can my Autonomous Twin monitor incoming customer orders, verify bKash TrxIDs, and auto-book parcels via Steadfast Courier API?",
    mode: "coworker",
  },
];

const CATEGORIES = [
  { id: "ALL", label: "✨ All Capabilities" },
  { id: "SHEETS", label: "📊 GenOffice Sheets" },
  { id: "SLIDES", label: "📽️ GenOffice Slides" },
  { id: "DOCS", label: "📄 GenOffice Docs" },
  { id: "RESEARCH", label: "🔍 Deep Research" },
];

export function EmptyChatGreeting({
  onSelectPrompt,
  agentId = "core",
}: EmptyChatGreetingProps) {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const filteredCards =
    activeCategory === "ALL"
      ? GENSPARK_CARDS
      : GENSPARK_CARDS.filter((c) => c.category === activeCategory);

  return (
    <div className="flex flex-col items-center justify-center min-h-[42vh] px-3 sm:px-6 py-4 sm:py-8 text-center animate-fade-in space-y-6 max-w-4xl mx-auto">
      {/* ── GenSpark-Style Animated Ambient Halo & Header ── */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ShothikGPT GenOffice · Frontier AI Co-Founder</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
          What are we building today?
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Create AI-native spreadsheets, pitch decks, book manuscripts, or autonomous business operations in seconds.
        </p>
      </div>

      {/* ── GenSpark Category Pill Strip ── */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer border ${
              activeCategory === cat.id
                ? "bg-foreground text-background border-foreground shadow-sm scale-102"
                : "bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── GenSpark-Style 2x3 or 3x2 Interactive Card Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full pt-1">
        {filteredCards.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPrompt?.(item.prompt, item.mode, item.tab)}
              className="group relative flex flex-col justify-between text-left p-4 rounded-2xl border border-border/70 hover:border-emerald-500/50 bg-card/60 hover:bg-card dark:bg-zinc-900/60 dark:hover:bg-zinc-900/90 backdrop-blur-xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-foreground"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`p-2 rounded-xl border ${item.badgeColor} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug mb-1 flex items-center justify-between">
                  <span>{item.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default EmptyChatGreeting;
