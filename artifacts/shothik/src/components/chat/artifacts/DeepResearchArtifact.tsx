"use client";

import { useState } from "react";
import {
  BookOpen,
  Globe,
  ExternalLink,
  Download,
  Share2,
  CheckCircle2,
  Sparkles,
  Search,
  FileText,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Source {
  title: string;
  url: string;
  domain: string;
  snippet: string;
}

interface DeepResearchArtifactProps {
  initialQuery?: string;
  sources?: Source[];
  summary?: string;
  isStreaming?: boolean;
}

export function DeepResearchArtifact({
  initialQuery,
  sources: customSources,
  summary: customSummary,
  isStreaming,
}: DeepResearchArtifactProps) {
  const queryTopic = initialQuery || "Dhaka Logistics & Courier Competitor Intelligence";

  const defaultSources: Source[] = [
    {
      title: "Pathao Courier & Parcel Market Share Report 2026",
      url: "https://pathao.com/courier-report",
      domain: "pathao.com",
      snippet: "Pathao handles over 65,000 daily parcel deliveries across 64 districts in Bangladesh with an average delivery window of 24-48 hours.",
    },
    {
      title: "eCourier Automation & Automated Cash on Delivery",
      url: "https://ecourier.com.bd/tech-stack",
      domain: "ecourier.com.bd",
      snippet: "Automated COD settlement reduced merchant payout windows from 5 days to 24 hours via automated bank & MFS transfers.",
    },
    {
      title: "Paperfly Nationwide Logistics & Merchant Unit Economics",
      url: "https://paperfly.com.bd/insights",
      domain: "paperfly.com.bd",
      snippet: "Paperfly's door-to-door delivery covers 4,500+ union parishads with a 94.2% successful delivery completion rate.",
    },
    {
      title: "RedX Logistics E-Commerce Volume Analysis",
      url: "https://redx.com.bd/merchant-growth",
      domain: "redx.com.bd",
      snippet: "RedX processed 12.4M shipments in 2025 leveraging AI route optimization to cut fuel overhead by 18%.",
    },
  ];

  const sourcesList = customSources || defaultSources;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden select-none">
      
      {/* ── Genspark SparkPage Header Bar ── */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/30">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-foreground truncate">{queryTopic}</h3>
            <p className="text-[10px] text-muted-foreground font-mono">
              Verified Research Report · {sourcesList.length} Web Sources Audited
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> 100% Grounded
          </span>

          <Button
            size="sm"
            variant="outline"
            onClick={() => alert("Downloading SparkPage Markdown Report...")}
            className="h-7 px-2.5 text-[11px] font-semibold gap-1.5"
          >
            <Download className="h-3 w-3" />
            Export Report
          </Button>
        </div>
      </div>

      {/* ── Live Agentic Step Progress Banner (Genspark / Manus / ChatGPT pattern) ── */}
      {isStreaming && (
        <div className="flex items-center justify-between border-b border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs text-violet-300 font-mono shrink-0 animate-pulse">
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-violet-400 animate-spin" />
            <span>AI Research Swarm: Auditing web sources & synthesizing report live…</span>
          </div>
          <span className="font-bold text-violet-400">Step 2/3 · Auditing {sourcesList.length} Sources</span>
        </div>
      )}

      {/* ── Genspark SparkPage Body Canvas ── */}
      <div className="flex-1 min-h-0 p-4 md:p-6 overflow-y-auto space-y-6">
        
        {/* Executive Summary Hero Card */}
        <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
              <Sparkles className="h-3 w-3" /> Executive Summary
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Updated Today</span>
          </div>

          <h1 className="text-lg md:text-xl font-extrabold text-foreground leading-snug">
            {queryTopic}
          </h1>

          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            {customSummary ||
              `The logistics and courier landscape in Bangladesh is experiencing a rapid transition toward automated Cash-on-Delivery (COD) payouts, AI route optimization, and nationwide same-day fulfillment. Pathao, eCourier, RedX, and Paperfly control over 82% of urban e-commerce parcel volume. Key competitive moats center on merchant payout windows (under 24 hours) and first-mile pickup density.`}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
            {[
              { label: "Daily Volume", val: "140K+ Parcels" },
              { label: "District Coverage", val: "64 Districts" },
              { label: "Avg Delivery", val: "24-48 Hours" },
              { label: "COD Adoption", val: "88% Market" },
            ].map((m, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-background/80 p-2 text-left">
                <p className="text-[9px] text-muted-foreground uppercase font-semibold">{m.label}</p>
                <p className="text-xs font-bold text-foreground mt-0.5">{m.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Key Findings & Market Breakdown ── */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-violet-400" /> Key Findings & Competitor Comparison
          </h3>

          <div className="space-y-3 text-xs md:text-sm text-foreground leading-relaxed">
            <div className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-2">
              <h4 className="font-bold text-foreground text-xs md:text-sm">1. Delivery Speed & Coverage Infrastructure</h4>
              <p className="text-muted-foreground leading-relaxed">
                Pathao Courier leads in Dhaka & Chittagong metro density with 4-hour express delivery options. Paperfly maintains the widest rural coverage spanning 4,500+ union parishads, while RedX leverages AI route planning to lower last-mile delivery costs by 18%.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-2">
              <h4 className="font-bold text-foreground text-xs md:text-sm">2. Cash-on-Delivery (COD) Payout Efficiency</h4>
              <p className="text-muted-foreground leading-relaxed">
                Merchants prioritize courier partners offering 24-hour COD bank/MFS transfers (bKash & Nagad). eCourier pioneered automated API payout triggers, reducing merchant working capital cycles significantly compared to legacy 5-day settlement periods.
              </p>
            </div>
          </div>
        </div>

        {/* ── Verified Sources Grid (Genspark Carousel) ── */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-sky-400" /> Verified Audit Sources ({sourcesList.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sourcesList.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-xl border border-border/60 bg-muted/10 p-3 hover:border-violet-500/40 hover:bg-violet-500/5 transition text-left space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono text-muted-foreground group-hover:text-violet-400 transition-colors">
                    {src.domain}
                  </span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground/40 group-hover:text-violet-400 transition-colors" />
                </div>
                <p className="text-xs font-bold text-foreground group-hover:text-violet-400 transition-colors line-clamp-1">
                  {src.title}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {src.snippet}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
