"use client";

import { useState } from "react";
import {
  Sparkles,
  Rocket,
  Compass,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  Globe,
  DollarSign,
  ShieldCheck,
  Server,
  Layers,
  Cpu,
  Loader2,
  Check,
  CreditCard,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { saveOfflineTask, saveOfflineManuscript } from "@/lib/offline/offline-storage";
import { MfsGatewayModal } from "@/components/twin/MfsGatewayModal";
import { DatabaseSchemaModal } from "@/components/twin/DatabaseSchemaModal";
import Link from "next/link";

interface WayfinderTicketTemplate {
  id: string;
  title: string;
  category: "Code" | "Research" | "Marketing" | "Design";
  status: "todo" | "in_progress" | "completed";
  urgency: string;
  cost: string;
  dependencies: string[];
}

export default function NewCompanyWizardPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisStep, setSynthesisStep] = useState(0);
  const [showMfsModal, setShowMfsModal] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [industry, setIndustry] = useState("B2B SaaS / Emerging Markets");
  const [businessModel, setBusinessModel] = useState("Subscription (MRR) + bKash MFS");

  // Auto-slugify subdomain
  const handleNameChange = (name: string) => {
    setCompanyName(name);
    setSubdomain(
      name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    );
  };

  const SYNTHESIS_LOGS = [
    "🧠 Polsia Strategic Co-Founder: Estimating South Asia TAM ($10.0B), SAM ($1.5B), and SOM ($150M)...",
    "📝 AI Product Lead: Synthesizing Product Requirements Document (PRD) & User Stories...",
    "🏗️ Autonomous Tech Lead: Decomposing features into 10 unblocked Wayfinder tickets...",
    "🐳 Dokploy SRE Agent: Configuring standalone Docker container (<88MB RAM budget) & Ingress...",
    "✨ Complete! Ready to launch autonomous company.",
  ];

  const INITIAL_WAYFINDER_TICKETS: WayfinderTicketTemplate[] = [
    {
      id: "wf-1",
      title: "Bootstrap Next.js standalone container on Dokploy PaaS (<88MB RAM)",
      category: "Code",
      status: "todo",
      urgency: "P0",
      cost: "5 Credits",
      dependencies: [],
    },
    {
      id: "wf-2",
      title: "Configure InsForge BaaS database schema & RLS security policies",
      category: "Code",
      status: "todo",
      urgency: "P0",
      cost: "5 Credits",
      dependencies: ["wf-1"],
    },
    {
      id: "wf-3",
      title: "Integrate 1-Tap bKash & Nagad MFS payment webhooks (1.85% fee)",
      category: "Code",
      status: "todo",
      urgency: "P0",
      cost: "10 Credits",
      dependencies: ["wf-2"],
    },
    {
      id: "wf-4",
      title: "Set up Steadfast Courier API for hyper-local parcel dispatch & COD",
      category: "Code",
      status: "todo",
      urgency: "P1",
      cost: "5 Credits",
      dependencies: ["wf-3"],
    },
    {
      id: "wf-5",
      title: "Build responsive customer onboarding funnel with Banglish NLP support",
      category: "Design",
      status: "todo",
      urgency: "P1",
      cost: "5 Credits",
      dependencies: ["wf-1"],
    },
    {
      id: "wf-6",
      title: "Automate Meta Ads copy & audience targeting ($50/day spend budget)",
      category: "Marketing",
      status: "todo",
      urgency: "P1",
      cost: "10 Credits",
      dependencies: ["wf-3"],
    },
    {
      id: "wf-7",
      title: "Establish Twitter/X & LinkedIn autonomous product announcement pipeline",
      category: "Marketing",
      status: "todo",
      urgency: "P2",
      cost: "5 Credits",
      dependencies: ["wf-6"],
    },
    {
      id: "wf-8",
      title: "Run ScenarioLab 2GB low-end RAM hardware audit & 3G latency injection",
      category: "Research",
      status: "todo",
      urgency: "P1",
      cost: "5 Credits",
      dependencies: ["wf-1"],
    },
    {
      id: "wf-9",
      title: "Implement real-time Cash Flow & P&L margin tracker in Founder Dashboard",
      category: "Code",
      status: "todo",
      urgency: "P2",
      cost: "5 Credits",
      dependencies: ["wf-3"],
    },
    {
      id: "wf-10",
      title: "Prepare 10-slide Investor Pitch Deck with 3D VTuber Presenter narration",
      category: "Research",
      status: "todo",
      urgency: "P2",
      cost: "10 Credits",
      dependencies: ["wf-8"],
    },
  ];

  const handleStartSynthesis = async () => {
    setIsSynthesizing(true);
    setStep(2);
    for (let i = 0; i < SYNTHESIS_LOGS.length; i++) {
      setSynthesisStep(i);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    setIsSynthesizing(false);
    setStep(3);
  };

  const handleLaunchCompany = () => {
    const slug = subdomain || "company";

    // 1. Save 10 Wayfinder tickets to offline storage
    INITIAL_WAYFINDER_TICKETS.forEach((t) => {
      saveOfflineTask({
        id: `${slug}-${t.id}`,
        title: t.title,
        category: t.category,
        status: t.status,
        cost: t.cost,
        urgency: t.urgency,
        dependencies: t.dependencies.map((d) => `${slug}-${d}`),
        updatedAt: Date.now(),
      });
    });

    // 2. Save generated PRD to offline storage
    const prdContent = `# ${companyName || "Autonomous Company"} — Product Requirements Document (PRD)

## 1. Executive Summary
- **Subdomain:** \`https://${slug}.shothikgpt.com\`
- **Industry:** ${industry}
- **Monetization:** ${businessModel}

## 2. Problem Statement
${problemStatement || "Single-operator startups require 100% continuous autonomous execution across code, marketing, payments, and infrastructure."}

## 3. Market Sizing (TAM / SAM / SOM)
- **TAM:** $10.0B (Global Emerging Markets AI Commerce)
- **SAM:** $1.5B (South Asia & MENA Micro-Enterprises)
- **SOM:** $150M (Initial 18-Month Target)

## 4. Initial Tech Stack & Container Budget
- **Frontend/Backend:** Next.js Standalone Container (<88MB RAM)
- **BaaS:** InsForge Database + RLS Policies + Auth
- **PaaS Host:** Dokploy Container Engine with Let's Encrypt SSL
- **Payment & MFS:** bKash / Nagad 10-character TrxID Listener (1.85% fee)
`;

    saveOfflineManuscript({
      id: `${slug}-prd`,
      title: `${companyName || "New Startup"} PRD`,
      content: prdContent,
      updatedAt: Date.now(),
    });

    // 3. Navigate to Twin with company param
    if (typeof window !== "undefined") {
      window.location.href = `/twin?company=${slug}`;
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Building2 className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              New Autonomous Company Slot
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Instantiate an Operator-Powered Company (OPC) on 100% continuous autopilot.
          </p>
        </div>

        <Link href="/twin">
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Twin
          </Button>
        </Link>
      </div>

      {/* Wizard Progress Indicator */}
      <div className="mb-8 grid grid-cols-3 gap-2">
        <div
          className={cn(
            "rounded-xl border p-3 text-xs transition",
            step === 1
              ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400 font-semibold"
              : step > 1
              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
              : "border-border text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background border text-[10px]">
              {step > 1 ? <Check className="h-3 w-3" /> : "1"}
            </span>
            <span>1. Identity & Idea</span>
          </div>
        </div>

        <div
          className={cn(
            "rounded-xl border p-3 text-xs transition",
            step === 2
              ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400 font-semibold"
              : step > 2
              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
              : "border-border text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background border text-[10px]">
              {step > 2 ? <Check className="h-3 w-3" /> : "2"}
            </span>
            <span>2. AI Synthesis</span>
          </div>
        </div>

        <div
          className={cn(
            "rounded-xl border p-3 text-xs transition",
            step === 3
              ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400 font-semibold"
              : "border-border text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background border text-[10px]">
              3
            </span>
            <span>3. Review & Launch</span>
          </div>
        </div>
      </div>

      {/* Step 1: Input Form */}
      {step === 1 && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                placeholder="e.g. MediFlow AI"
                value={companyName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                data-testid="input-company-name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Assigned Subdomain (Dokploy Ingress)
              </label>
              <div className="flex items-center rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground font-mono">
                <Globe className="mr-2 h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-foreground font-bold">{subdomain || "your-subdomain"}</span>
                <span className="text-muted-foreground">.shothikgpt.com</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Core Problem Statement / Startup Thesis
              </label>
              <textarea
                rows={3}
                placeholder="What critical bottleneck does this autonomous startup solve?"
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none"
                data-testid="input-problem-statement"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Target Industry & Demographic
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <option value="B2B SaaS / Emerging Markets">B2B SaaS / Emerging Markets</option>
                  <option value="E-Commerce & Retail in South Asia">E-Commerce & Retail in South Asia</option>
                  <option value="Banglish NLP / EdTech">Banglish NLP / EdTech</option>
                  <option value="FinTech & MFS Payment Verification">FinTech & MFS Payment Verification</option>
                  <option value="HealthTech & Telemedicine">HealthTech & Telemedicine</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Primary Monetization Model
                </label>
                <select
                  value={businessModel}
                  onChange={(e) => setBusinessModel(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <option value="Subscription (MRR) + bKash MFS">Subscription (MRR) + bKash MFS</option>
                  <option value="Transaction Fee (1.85% MFS Reconciliation)">Transaction Fee (1.85% MFS Reconciliation)</option>
                  <option value="Freemium + Credit Top-ups">Freemium + Credit Top-ups</option>
                  <option value="Usage-Based API Metering">Usage-Based API Metering</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <Button
              className="rounded-xl px-5 gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
              disabled={!companyName.trim()}
              onClick={handleStartSynthesis}
              data-testid="button-synthesize-company"
            >
              <Sparkles className="h-4 w-4" /> Synthesize Company & Generate PRD
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Synthesis Engine Live Execution */}
      {step === 2 && (
        <div className="rounded-2xl border border-border/80 bg-card p-8 text-center space-y-6">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">
              Autonomous Co-Founder Swarm is Working
            </h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Drafting requirements, calculating unit economics, and breaking down architecture into 10 unblocked Wayfinder tickets.
            </p>
          </div>

          <div className="mx-auto max-w-md rounded-xl border border-border/70 bg-muted/40 p-4 text-left font-mono text-xs space-y-2.5">
            {SYNTHESIS_LOGS.map((log, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-start gap-2 transition-opacity",
                  idx <= synthesisStep ? "opacity-100" : "opacity-25 text-muted-foreground"
                )}
              >
                {idx < synthesisStep ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : idx === synthesisStep ? (
                  <Loader2 className="h-4 w-4 text-indigo-400 animate-spin shrink-0 mt-0.5" />
                ) : (
                  <span className="h-4 w-4 rounded-full border border-muted-foreground/40 shrink-0 mt-0.5" />
                )}
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Review & 1-Click Launch */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 to-background p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-base font-bold text-foreground">
                  {companyName} Successfully Synthesized
                </h2>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                Ingress: <span className="text-emerald-400 font-bold">https://{subdomain}.shothikgpt.com</span> · Dokploy PaaS Container Ready (&lt;88MB)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMfsModal(true)}
                className="rounded-xl border-pink-500/40 text-pink-400 hover:bg-pink-500/10 text-xs font-semibold gap-1.5 h-9 font-mono"
                data-testid="button-step3-mfs-gateway"
              >
                <CreditCard className="h-3.5 w-3.5" /> bKash Gateway
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDbModal(true)}
                className="rounded-xl border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 text-xs font-semibold gap-1.5 h-9 font-mono"
                data-testid="button-step3-db-schema"
              >
                <Database className="h-3.5 w-3.5" /> Postgres Schema
              </Button>
              <Button
                onClick={handleLaunchCompany}
                className="rounded-xl px-6 gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shrink-0 shadow-lg shadow-emerald-900/30 h-9"
                data-testid="button-launch-company"
              >
                <Rocket className="h-4 w-4" /> Launch in Autonomous Twin
              </Button>
            </div>
          </div>

          {/* First 10 Wayfinder Tickets Preview */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-foreground">
                  First 10 Wayfinder Delivery Tickets (Auto-Populated)
                </h3>
              </div>
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 font-mono text-[10px]">
                10 Tickets · Unblocked
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {INITIAL_WAYFINDER_TICKETS.map((ticket, idx) => (
                <div
                  key={ticket.id}
                  className="rounded-xl border border-border/70 bg-background/60 p-3 flex flex-col justify-between space-y-2 hover:border-indigo-500/40 transition"
                  data-testid={`preview-ticket-${ticket.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground leading-snug">
                      {idx + 1}. {ticket.title}
                    </span>
                    <Badge variant="secondary" className="text-[9px] font-mono shrink-0">
                      {ticket.urgency}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                    <span className="text-indigo-400 font-semibold">{ticket.category}</span>
                    <span>{ticket.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Solo Founder Modals */}
      <MfsGatewayModal
        open={showMfsModal}
        onOpenChange={setShowMfsModal}
        companyName={companyName || "New Startup"}
      />
      <DatabaseSchemaModal
        open={showDbModal}
        onOpenChange={setShowDbModal}
        companyName={companyName || "New Startup"}
      />
    </div>
  );
}
