import React from "react";
import { Sparkles, ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PerplexityRelatedQueriesProps {
  queries?: string[];
  messageContent?: string;
  onSelectQuery: (query: string) => void;
  className?: string;
}

export function generateDynamicFollowUps(content: string = ""): string[] {
  const clean = content.trim();
  if (!clean) return [];

  const lower = clean.toLowerCase();

  // 0. SUPPRESS ALL FOLLOW-UPS for greetings, self-introductions, identity queries, apologies, or casual conversational chit-chat
  const isIntroOrGreeting =
    /^(i am|i'm|my name is|hello|hi|hey|good\s+(morning|afternoon|evening|day)|greetings|welcome)\b/i.test(lower) ||
    /\b(i am shothikgpt|i'm shothikgpt|ai co-founder|intelligent workspace assistant|what are you working on today\??|how can i help you today\??|how can i assist you\??)\b/i.test(lower) ||
    /\b(who are you|who r u|what is your name|tell me about yourself|what can you do)\b/i.test(lower) ||
    /\b(you're welcome|you are welcome|glad to help|happy to assist|no problem|anytime)\b/i.test(lower) ||
    /\b(i apologize|sorry for the confusion|stream error|error occurred)\b/i.test(lower);

  if (isIntroOrGreeting) {
    return [];
  }

  // Short conversational responses (< 120 characters) without code/formatting should not show suggestions
  if (clean.length < 120 && !clean.includes("```") && !clean.includes("###")) {
    return [];
  }

  // 1. Bangladesh Governance & Democracy
  if (/\b(tarique|tareq|prime minister of bangladesh|democracy|constitutional|governance|bangladesh government|interim government|dr\.?\s*muhammad yunus)\b/i.test(lower)) {
    return [
      "What are the upcoming parliamentary and governance priorities for Bangladesh?",
      "How does the separation of powers and judicial independence operate in practice?",
      "What was Dr. Muhammad Yunus's interim reform roadmap?",
    ];
  }

  // 2. Forex, Currency & Macro FX
  if (/\b(forex|usd\s*[\/-]?\s*bdt|exchange rate|currency depreciation|spot rate|forward hedging)\b/i.test(lower)) {
    return [
      "Show historical USD to BDT exchange rate trends over the last 6 months.",
      "How do remittances and export earnings affect foreign exchange reserves?",
      "Build an export hedging and cash-flow model on the spreadsheet canvas.",
    ];
  }

  // 3. Code Generation (Rust, Python, Go, TypeScript, React, SQL)
  if (/```(rust|python|go|typescript|javascript|tsx|jsx|cpp|sql|html|css|bash)/i.test(lower) || (clean.includes("```") && /\b(function|algorithm|struct|interface|class|endpoint|handler)\b/i.test(lower))) {
    return [
      "Write unit tests with edge cases and 100% boundary coverage for this code.",
      "Optimize this implementation for memory efficiency and $O(N)$ runtime.",
      "Add robust error handling and structured logging to this function.",
    ];
  }

  // 4. Presentation & Slide Decks (Only when a presentation deck was actually generated)
  if (/\b(presentation deck|slide deck|pitch deck|slides generated)\b/i.test(lower) && /\bslide\s*\d+/i.test(lower)) {
    return [
      "Add an Executive Summary slide highlighting key traction metrics.",
      "Generate detailed speaker notes and timing advice for Slide 1.",
      "Export this deck structure into an interactive 3D viewer.",
    ];
  }

  // 5. Financial Modeling & Spreadsheets (Only when financial numbers / model are present)
  if (/\b(financial model|sensitivity table|dcf valuation|cash runway|cac|ebitda|mrr forecast)\b/i.test(lower)) {
    return [
      "Simulate a 25% increase in customer acquisition costs (CAC).",
      "Add a 3-scenario cash runway forecast to the spreadsheet.",
      "Calculate the Net Present Value (NPV) and IRR for this forecast.",
    ];
  }

  // 6. E-Commerce & Logistics
  if (/\b(steadfast|pathao courier|paperfly|redx|cod return|mfs settlement)\b/i.test(lower)) {
    return [
      "Compare Steadfast vs Pathao Courier cash-on-delivery payout turnaround times.",
      "How to set up automated bKash/Nagad instant merchant webhook reconciliation?",
      "Design a 64-district delivery cost calculator for D2C brands.",
    ];
  }

  // 7. General Knowledge, Characters, Encyclopedic & Conversational responses:
  // Do not display unnatural or robotic follow-up questions.
  return [];
}

export const PerplexityRelatedQueries: React.FC<PerplexityRelatedQueriesProps> = ({
  queries,
  messageContent,
  onSelectQuery,
  className,
}) => {
  const dynamicQueries = queries && queries.length > 0 
    ? queries 
    : generateDynamicFollowUps(messageContent);

  if (!dynamicQueries || dynamicQueries.length === 0) return null;

  return (
    <div className={cn("mt-4 pt-3 border-t border-zinc-200 dark:border-white/[0.08] space-y-2 font-sans not-prose", className)}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        <Sparkles className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
        <span>Suggested Next Questions</span>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-1">
        {dynamicQueries.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectQuery(q)}
            className="inline-flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-300 transition-all duration-150 shadow-xs cursor-pointer group"
          >
            <span className="flex items-center gap-1.5">
              <Plus className="h-3 w-3 text-cyan-500 dark:text-cyan-400 shrink-0 group-hover:rotate-90 transition-transform duration-200" />
              <span className="line-clamp-1">{q}</span>
            </span>
            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 text-cyan-500 dark:text-cyan-400 shrink-0 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
};

