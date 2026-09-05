"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Zap,
  GraduationCap,
  PenTool,
  Palette,
  Bot,
  ShoppingBag,
  Truck,
  Rocket,
  MessageSquare,
  BookOpen,
  Cpu,
  CreditCard,
  Search,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ServiceTriad = "all" | "writing" | "creative" | "twin";

export interface PlatformService {
  id: number;
  slug: string;
  name: string;
  triad: "writing" | "creative" | "twin";
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  tagColor: string;
  headline: string;
  capabilities: string[];
  status: "active" | "operational";
}

/* ------------------------------------------------------------------ */
/* Canonical 12 Services Data                                         */
/* ------------------------------------------------------------------ */

export const PLATFORM_SERVICES: PlatformService[] = [
  {
    id: 1,
    slug: "ai-execution",
    name: "AI Execution",
    triad: "twin",
    icon: Zap,
    tag: "Core Engine",
    tagColor: "border-cyan-500/40 text-cyan-400 bg-cyan-950/20",
    headline: "Turn user intent into completed work",
    capabilities: [
      "AI agents, workflows, tool use, and human approvals",
      "Text, voice, PDF, URL, and multimodal input",
      "Observe → Understand → Decide → Execute → Learn pulse",
      "Zero-leak hermetic sandbox container isolation",
    ],
    status: "active",
  },
  {
    id: 2,
    slug: "academic-research",
    name: "Academic & Research",
    triad: "writing",
    icon: GraduationCap,
    tag: "Scholarly",
    tagColor: "border-sky-500/40 text-sky-400 bg-sky-950/20",
    headline: "Rigorous research & thesis acceleration",
    capabilities: [
      "Research assistance & literature synthesis",
      "Thesis & dissertation creation workspaces",
      "Research paper creation and peer-review proofing",
      "APA, MLA, Chicago, IEEE citation & reference formatting",
    ],
    status: "active",
  },
  {
    id: 3,
    slug: "writing-content",
    name: "Writing & Content Creation",
    triad: "writing",
    icon: PenTool,
    tag: "Linguistics",
    tagColor: "border-blue-500/40 text-blue-400 bg-blue-950/20",
    headline: "Full-spectrum language & writing intelligence",
    capabilities: [
      "Multi-tone semantic paraphrasing (Standard, Academic, Creative)",
      "Contextual grammar & punctuation correction",
      "Bulleted & executive document summarization",
      "50+ language translation (Bengali bn-BD native) & humanization",
    ],
    status: "active",
  },
  {
    id: 4,
    slug: "creative-professional",
    name: "Creative & Professional Creation",
    triad: "creative",
    icon: Palette,
    tag: "Artifacts",
    tagColor: "border-purple-500/40 text-purple-400 bg-purple-950/20",
    headline: "High-value intellectual & creative assets",
    capabilities: [
      "Books and manuscripts with chapter pacing control",
      "Pitch decks via automated Slide Studio rendering",
      "Business proposals, whitepapers, and PRDs",
      "Interactive 3-scenario financial models & structured spreadsheets",
    ],
    status: "active",
  },
  {
    id: 5,
    slug: "twin-business",
    name: "Twin — Business Automation",
    triad: "twin",
    icon: Bot,
    tag: "OPC Operating Layer",
    tagColor: "border-violet-500/40 text-violet-400 bg-violet-950/20",
    headline: "Autonomous business execution for the One Person Company",
    capabilities: [
      "10 specialized functional AI workers",
      "Customer support automation with regional dialect handling",
      "Human-supervised business execution with Protected Actions",
      "Persistent 24/7 business workflows without context decay",
    ],
    status: "active",
  },
  {
    id: 6,
    slug: "commerce-automation",
    name: "Commerce & F-Commerce",
    triad: "twin",
    icon: ShoppingBag,
    tag: "E-Commerce",
    tagColor: "border-emerald-500/40 text-emerald-400 bg-emerald-950/20",
    headline: "Omnichannel commercial operations",
    capabilities: [
      "Facebook Page & Messenger conversational commerce",
      "WhatsApp Business commerce, order confirmation, & status pings",
      "WooCommerce & Daraz marketplace bi-directional sync",
      "End-to-end order lifecycle management",
    ],
    status: "active",
  },
  {
    id: 7,
    slug: "logistics-courier",
    name: "Logistics & Courier Automation",
    triad: "twin",
    icon: Truck,
    tag: "Fulfillment",
    tagColor: "border-amber-500/40 text-amber-400 bg-amber-950/20",
    headline: "Automated dispatch, courier telemetry, & COD",
    capabilities: [
      "Steadfast Courier direct API integration",
      "Pathao Courier automated consignment booking",
      "RedX courier gateway support & live parcel tracking",
      "Cash-on-Delivery (COD) reconciliation & bank/MFS settlement",
    ],
    status: "active",
  },
  {
    id: 8,
    slug: "venture-creation",
    name: "Venture Creation",
    triad: "creative",
    icon: Rocket,
    tag: "Entrepreneurship",
    tagColor: "border-rose-500/40 text-rose-400 bg-rose-950/20",
    headline: "From raw idea to operating enterprise",
    capabilities: [
      "Idea validation & competitive moat identification",
      "South Asian demographic demand modeling & market research",
      "Automated PRD generation & technical architecture roadmaps",
      "Financial modeling (CAC, LTV, gross margin) & investor decks",
    ],
    status: "active",
  },
  {
    id: 9,
    slug: "conversational-ai",
    name: "Conversational AI",
    triad: "writing",
    icon: MessageSquare,
    tag: "Voice & Chat",
    tagColor: "border-teal-500/40 text-teal-400 bg-teal-950/20",
    headline: "Contextual, multimodal conversational intelligence",
    capabilities: [
      "Fluid AI chat with dynamic Work Canvas rendering",
      "Real-time voice interaction & audio synthesis",
      "Low-latency Bengali, English, and Banglish speech-to-text",
      "Conversational-to-workflow handoff into executable tasks",
    ],
    status: "active",
  },
  {
    id: 10,
    slug: "publishing-pod",
    name: "Publishing & Print-on-Demand",
    triad: "creative",
    icon: BookOpen,
    tag: "POD Press",
    tagColor: "border-yellow-500/40 text-yellow-400 bg-yellow-950/20",
    headline: "Manuscript typesetting to doorstep delivery",
    capabilities: [
      "Manuscript-to-book automated typesetting & cover design",
      "Interactive 3D book preview with realistic page physics",
      "Print-ready PDF generation with CMYK bleeds & imposition calculation",
      "Nilkhet (Dhaka) offset press dispatch & courier delivery",
    ],
    status: "active",
  },
  {
    id: 11,
    slug: "ai-agent-services",
    name: "AI Agent Services",
    triad: "twin",
    icon: Cpu,
    tag: "Swarm Compute",
    tagColor: "border-fuchsia-500/40 text-fuchsia-400 bg-fuchsia-950/20",
    headline: "Autonomous agent execution & spot GPU infrastructure",
    capabilities: [
      "10 specialized autonomous AI agents (Developer, Sales, SEO, etc.)",
      "Multi-agent DAG task orchestration & deliberation",
      "Vast.ai spot GPU bid-and-launch compute failovers",
      "Human-in-the-loop approvals & complete execution audit trails",
    ],
    status: "active",
  },
  {
    id: 12,
    slug: "payments-monetization",
    name: "Payments & Monetization",
    triad: "twin",
    icon: CreditCard,
    tag: "Fintech Rails",
    tagColor: "border-green-500/40 text-green-400 bg-green-950/20",
    headline: "Outcome-based pricing & localized MFS rails",
    capabilities: [
      "Outcome-based payments (pay on verified milestone completion)",
      "Real-time token cost accounting (USD & BDT)",
      "Native bKash, Nagad, and Rocket MFS integration with 1.85% fee engine",
      "Instant checkout, TrxID verification, & cryptographic webhooks",
    ],
    status: "active",
  },
];

/* ------------------------------------------------------------------ */
/* Component Props                                                     */
/* ------------------------------------------------------------------ */

export interface PlatformServicesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectService?: (service: PlatformService) => void;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function PlatformServicesModal({
  open,
  onOpenChange,
  onSelectService,
}: PlatformServicesModalProps) {
  const [selectedTriad, setSelectedTriad] = useState<ServiceTriad>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = useMemo(() => {
    return PLATFORM_SERVICES.filter((service) => {
      const matchesTriad =
        selectedTriad === "all" || service.triad === selectedTriad;
      const matchesSearch =
        searchQuery.trim() === "" ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.capabilities.some((c) =>
          c.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      return matchesTriad && matchesSearch;
    });
  }, [selectedTriad, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-[95vw] xl:max-w-6xl bg-[#090d16] border-slate-800 text-slate-100 p-0 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>ShothikGPT Platform Services</span>
                <Badge
                  variant="outline"
                  className="border-violet-500/40 text-violet-400 text-[10px] font-mono"
                >
                  12 CORE PILLARS
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Turn high-level intent into completed work across research, creation, and business operations.
              </DialogDescription>
            </div>
          </div>
          <DialogClose asChild>
            <button
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogClose>
        </div>

        {/* Core Principle Banner */}
        <div className="p-3.5 px-5 bg-gradient-to-r from-violet-950/40 via-indigo-950/20 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-violet-400 font-bold uppercase tracking-wider">Core Principle:</span>
            <span className="text-slate-300">
              ShothikGPT combines these services into a single <strong className="text-white">AI execution platform</strong> where users describe what they want, and AI agents help execute the outcome.
            </span>
          </div>
          <span className="hidden lg:inline-block text-[10px] text-emerald-400 font-bold">
            100% OPERATIONAL
          </span>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 px-5 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Triad Filter Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedTriad("all")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition ${
                selectedTriad === "all"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
              }`}
            >
              All (12)
            </button>
            <button
              onClick={() => setSelectedTriad("writing")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition ${
                selectedTriad === "writing"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
              }`}
            >
              ✍️ Writing Suite (3)
            </button>
            <button
              onClick={() => setSelectedTriad("creative")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition ${
                selectedTriad === "creative"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
              }`}
            >
              🎨 Creative Studio (3)
            </button>
            <button
              onClick={() => setSelectedTriad("twin")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition ${
                selectedTriad === "twin"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
              }`}
            >
              🏛️ Twin Business Layer (6)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services (e.g. bkash, thesis, code)..."
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-lg focus:border-violet-500 outline-none placeholder:text-slate-500 font-mono"
            />
          </div>
        </div>

        {/* Services Grid (Scrollable) */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700 transition flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    {/* Top Row: Icon + Number + Tag */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 border border-slate-800 text-slate-200 group-hover:border-violet-500/40 group-hover:text-violet-400 transition">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 block">
                            PILLAR #{String(service.id).padStart(2, "0")}
                          </span>
                          <h4 className="text-xs font-bold text-slate-100 group-hover:text-white transition">
                            {service.name}
                          </h4>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[9px] font-mono uppercase ${service.tagColor}`}>
                        {service.tag}
                      </Badge>
                    </div>

                    {/* Headline */}
                    <p className="text-[11px] text-slate-300 font-medium">
                      {service.headline}
                    </p>

                    {/* Capability Bullets */}
                    <ul className="space-y-1 pt-1 border-t border-slate-800/80">
                      {service.capabilities.map((cap, i) => (
                        <li
                          key={i}
                          className="text-[10px] text-slate-400 flex items-start gap-1.5 leading-tight"
                        >
                          <CheckCircle2 className="w-3 h-3 text-violet-400 shrink-0 mt-0.5" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active & Operational
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSelectService?.(service)}
                      className="h-6 px-2 text-[10px] text-slate-400 hover:text-white hover:bg-slate-800 font-mono gap-1"
                    >
                      <span>Explore</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredServices.length === 0 && (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              No services match "{searchQuery}". Try searching for "courier", "thesis", "code", or "bkash".
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 px-5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0 font-mono text-[10px]">
          <span className="text-slate-500">
            ShothikGPT OS · Continuous Execution:{" "}
            <strong className="text-slate-400">Observe → Understand → Decide → Execute → Learn</strong>
          </span>
          <span className="text-violet-400 font-bold uppercase">
            12 Canonical Services Unified
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
