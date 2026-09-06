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
  Code2,
  CreditCard,
  ShoppingBag,
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
  children?: React.ReactNode;
}

interface SparkCardItem {
  id: string;
  category: "ALL" | "SHEETS" | "SLIDES" | "DOCS" | "RESEARCH" | "TWIN" | "DEV";
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
    id: "developer-self-heal",
    category: "DEV",
    icon: Code2,
    badge: "Pillar 11 · Dev Twin",
    badgeColor: "text-muted-foreground bg-muted/60 border-border/60",
    title: "Self-Healing Bug & Test Fixer",
    desc: "Run autonomous Red-Green-Refactor loop in isolated sandbox and inspect AST blast radius.",
    prompt: "Analyze the failing error in our test suite, run the self-healing loop in sandbox, and generate verified AST patch with blast radius report.",
    mode: "coworker",
    tab: "code",
  },
  {
    id: "mfs-reconciliation",
    category: "TWIN",
    icon: CreditCard,
    badge: "Pillar 12 · MFS Rails",
    badgeColor: "text-muted-foreground bg-muted/60 border-border/60",
    title: "bKash & Nagad MFS Settlement Ledger",
    desc: "Calculate 1.5% MFS cashout fees, reconcile merchant payments, and generate daily disbursement sheet.",
    prompt: "Generate a daily bKash and Nagad payment settlement ledger calculating 1.5% merchant transaction fees and net bank disbursements.",
    mode: "coworker",
    tab: "sheet",
  },
  {
    id: "fcommerce-sheet",
    category: "SHEETS",
    icon: FileSpreadsheet,
    badge: "Pillar 6 · Commerce",
    badgeColor: "text-muted-foreground bg-muted/60 border-border/60",
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
    badge: "Pillar 4 · Slides",
    badgeColor: "text-muted-foreground bg-muted/60 border-border/60",
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
    badge: "Pillar 2 & 10 · BoiMela",
    badgeColor: "text-muted-foreground bg-muted/60 border-border/60",
    title: "Academic Thesis & BoiMela Manuscript",
    desc: "Structure chapters with literature review, APA 7 citations, and Nilkhet 6×9 Royal Demy print format.",
    prompt: "Structure my research thesis into clean chapters with literature review, APA 7 citations, and standard 6x9 Royal Demy book dimensions for print publishing.",
    mode: "researcher",
  },
  {
    id: "deep-research-tam",
    category: "RESEARCH",
    icon: Search,
    badge: "Pillar 8 · Research",
    badgeColor: "text-muted-foreground bg-muted/60 border-border/60",
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
    badge: "Pillar 4 · Model",
    badgeColor: "text-muted-foreground bg-muted/60 border-border/60",
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
    badge: "Pillar 5 · Twin Ops",
    badgeColor: "text-muted-foreground bg-muted/60 border-border/60",
    title: "Automated Courier & WhatsApp Twin",
    desc: "Auto-dispatch delivery webhooks, verify 10-digit bKash TrxIDs, and draft customer replies.",
    prompt: "How can my Autonomous Twin monitor incoming customer orders, verify bKash TrxIDs, and auto-book parcels via Steadfast Courier API?",
    mode: "coworker",
  },
];

const CATEGORIES = [
  { id: "ALL", label: "✨ All Capabilities" },
  { id: "DEV", label: "💻 Dev Twin (Pillar 11)" },
  { id: "TWIN", label: "🏛️ Twin Ops (Pillar 5 & 12)" },
  { id: "SHEETS", label: "📊 GenOffice Sheets (Pillar 6)" },
  { id: "SLIDES", label: "📽️ GenOffice Slides (Pillar 4)" },
  { id: "DOCS", label: "📄 GenOffice Docs (Pillar 2 & 10)" },
  { id: "RESEARCH", label: "🔍 Deep Research (Pillar 8)" },
];

export function EmptyChatGreeting({
  onSelectPrompt,
  agentId = "core",
  children,
}: EmptyChatGreetingProps) {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const filteredCards =
    activeCategory === "ALL"
      ? GENSPARK_CARDS
      : GENSPARK_CARDS.filter((c) => c.category === activeCategory);

  return (
    <div className="flex flex-col items-center justify-center min-h-[38vh] px-3 sm:px-6 py-3 sm:py-6 text-center animate-fade-in space-y-4 max-w-4xl mx-auto">
      {/* ── Shothik Header — Crisp Badge + High Contrast Heading ── */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-[11px] font-medium shadow-2xs animate-in fade-in slide-in-from-bottom-1 duration-300">
          <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Shothik AI · Frontier Workspace</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 animate-in fade-in slide-in-from-bottom-2 duration-500">
          What are we building today?
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
          Create AI-native spreadsheets, pitch decks, book manuscripts, or autonomous business operations in seconds.
        </p>
      </div>

      {/* ── Center Hero Composer ── */}
      {children && (
        <div className="w-full max-w-3xl mx-auto text-left animate-in fade-in zoom-in-95 duration-300 delay-150">
          {children}
        </div>
      )}

      {/* ── Category Pill Strip ── */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-2xl mx-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer border ${
              activeCategory === cat.id
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-2xs font-semibold"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200/70 dark:hover:bg-zinc-800"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Interactive Card Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
        {filteredCards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPrompt?.(item.prompt, item.mode, item.tab)}
              className="group relative flex flex-col justify-between text-left p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/90 hover:border-zinc-400 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/90 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer text-zinc-900 dark:text-zinc-100 animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${idx * 40}ms`, animationFillMode: "both" }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium font-mono px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug mb-1 flex items-center justify-between">
                  <span>{item.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </h3>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
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
