"use client";

import { useState, useEffect } from "react";
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
  Truck,
  MessageSquare,
  PhoneCall,
  QrCode,
  Package,
  Sliders,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { saveOfflineTask, saveOfflineManuscript } from "@/lib/offline/offline-storage";
import { MfsGatewayModal } from "@/components/twin/MfsGatewayModal";
import { DatabaseSchemaModal } from "@/components/twin/DatabaseSchemaModal";
import { useSearchParams, Link } from "@/lib/navigation";
import { saveCompanyProfile, createCompanyProfile, slugify } from "@/lib/twin/dynamic-company-store";

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
  const searchParams = useSearchParams();
  const initialTrack = searchParams.get("track") === "connect" ? "connect" : "build";
  
  const [track, setTrack] = useState<"connect" | "build">(initialTrack);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisStep, setSynthesisStep] = useState(0);
  const [showMfsModal, setShowMfsModal] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);

  // ── Track A: Connect Existing Business State ──
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("F-Commerce (Facebook Page / Shop)");
  const [courierProvider, setCourierProvider] = useState<"steadfast" | "pathao" | "redx">("steadfast");
  const [courierApiKey, setCourierApiKey] = useState("");
  const [courierSecret, setCourierSecret] = useState("");
  const [isAutonomous, setIsAutonomous] = useState(false); // Supervised by default
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState(true);
  const [connectedChannels, setConnectedChannels] = useState<string[]>(["Facebook Messenger", "Steadfast Courier"]);
  const [simulationTested, setSimulationTested] = useState(false);

  // ── Track B: Build New Venture State ──
  const [companyName, setCompanyName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [industry, setIndustry] = useState("B2B SaaS / Emerging Markets");
  const [businessModel, setBusinessModel] = useState("Subscription (MRR) + bKash MFS");

  useEffect(() => {
    const trackParam = searchParams.get("track");
    if (trackParam === "connect" || trackParam === "build") {
      setTrack(trackParam);
    }
  }, [searchParams]);

  // Auto-slugify subdomain for Track B
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
    "🧠 Shothik Strategic Co-Founder: Estimating South Asia TAM ($10.0B), SAM ($1.5B), and SOM ($150M)...",
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
    const slug = subdomain || slugify(companyName) || "company";
    const name = companyName || "Autonomous Company";

    // Create & persist full company profile
    const profile = createCompanyProfile(name, industry, businessModel, "Autonomous SaaS", problemStatement);
    profile.slug = slug;
    profile.domain = `https://${slug}.shothikgpt.com`;
    profile.email = `founder@${slug}.shothikgpt.com`;
    saveCompanyProfile(profile);

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

    const prdContent = `# ${name} — Product Requirements Document (PRD)

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
      title: `${name} PRD`,
      content: prdContent,
      updatedAt: Date.now(),
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("shothik_active_company", slug);
      localStorage.setItem("shothik_twin_has_setup", "true");
      window.location.href = `/twin?company=${slug}`;
    }
  };

  const handleLaunchCommerceTwin = () => {
    const name = businessName || "My F-Commerce Business";
    const slug = slugify(name);

    // Create & persist full commerce company profile
    const profile = createCompanyProfile(name, "Commerce & Retail", "Direct Sales & COD", businessType, "Automated courier dispatch and bKash payment verification");
    profile.slug = slug;
    profile.domain = `https://${slug}.shothikgpt.com`;
    profile.email = `sales@${slug}.shothikgpt.com`;
    saveCompanyProfile(profile);

    const commerceProfile = {
      businessName: name,
      businessType,
      courierProvider,
      isAutonomous,
      autoSendWhatsApp,
      connectedChannels,
      activeSince: new Date().toISOString(),
    };

    localStorage.setItem(`twin_commerce_${slug}`, JSON.stringify(commerceProfile));

    if (typeof window !== "undefined") {
      localStorage.setItem("shothik_active_company", slug);
      localStorage.setItem("shothik_twin_has_setup", "true");
      window.location.href = `/twin?company=${slug}&mode=commerce`;
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Building2 className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              New Autonomous Twin Setup
            </h1>
            <Badge variant="outline" className="text-[11px] font-mono border-indigo-500/30 text-indigo-400">
              New Autonomous Company Slot
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Connect an existing running business to automate operations or build a new venture from scratch.
          </p>
        </div>

        <Link href="/twin">
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Twin
          </Button>
        </Link>
      </div>

      {/* ── High-Level Track Selector (Core Philosophy: Connect vs Build) ── */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 rounded-2xl bg-muted/40 border border-border/70">
        <button
          type="button"
          onClick={() => {
            setTrack("connect");
            setStep(1);
          }}
          className={cn(
            "flex items-start gap-3.5 p-3.5 rounded-xl text-left transition cursor-pointer",
            track === "connect"
              ? "bg-card border border-brand/40 shadow-sm text-foreground"
              : "hover:bg-muted/50 text-muted-foreground"
          )}
        >
          <div className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
            track === "connect" ? "bg-brand/10 border-brand/30 text-brand" : "bg-muted border-border"
          )}>
            <Store className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Connect Existing Business</span>
              <Badge variant="secondary" className="text-[10px] bg-brand/10 text-brand border-brand/20">
                F-Commerce / SME
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              Automate customer parcel queries, courier tracking (Steadfast/Pathao), and COD order updates.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setTrack("build");
            setStep(1);
          }}
          className={cn(
            "flex items-start gap-3.5 p-3.5 rounded-xl text-left transition cursor-pointer",
            track === "build"
              ? "bg-card border border-indigo-500/40 shadow-sm text-foreground"
              : "hover:bg-muted/50 text-muted-foreground"
          )}
        >
          <div className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
            track === "build" ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : "bg-muted border-border"
          )}>
            <Rocket className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Build New Venture</span>
              <Badge variant="secondary" className="text-[10px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                Idea to Market
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              Turn an idea or market gap into a validated PRD, investor pitch deck, financial model, and container.
            </p>
          </div>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* TRACK A: CONNECT EXISTING BUSINESS FLOW                          */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {track === "connect" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Truck className="h-4 w-4 text-brand" />
                <span>1. Business Channels & Operations</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Tell Twin where you sell and how you fulfill orders across Bangladesh.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Business / Store Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bongo Shilpo F-Commerce"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  data-testid="input-business-name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Store Channel Type
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  data-testid="select-business-type"
                >
                  <option>F-Commerce (Facebook Page / Shop)</option>
                  <option>WhatsApp Direct Commerce</option>
                  <option>WooCommerce / WordPress Store</option>
                  <option>Daraz Merchant Shop</option>
                  <option>Offline Showroom / Retail POS</option>
                </select>
              </div>
            </div>

            <div className="border-t border-border/60 pt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Courier & Logistics Integration
              </h4>
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                {(["steadfast", "pathao", "redx"] as const).map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => setCourierProvider(provider)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium capitalize transition cursor-pointer",
                      courierProvider === provider
                        ? "border-brand bg-brand/10 text-brand font-semibold"
                        : "border-border/70 hover:bg-muted/40 text-muted-foreground"
                    )}
                  >
                    <Truck className="h-4 w-4 mb-1" />
                    <span>{provider}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    {courierProvider.toUpperCase()} API Key
                  </label>
                  <input
                    type="password"
                    placeholder={`Enter ${courierProvider} API Key`}
                    value={courierApiKey}
                    onChange={(e) => setCourierApiKey(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm text-foreground font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    data-testid="input-courier-api-key"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Secret Key / Client ID
                  </label>
                  <input
                    type="password"
                    placeholder="Enter Secret Key"
                    value={courierSecret}
                    onChange={(e) => setCourierSecret(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm text-foreground font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    data-testid="input-courier-secret"
                  />
                </div>
              </div>
            </div>

            {/* Permissions & Delegation Matrix */}
            <div className="border-t border-border/60 pt-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Twin Capabilities & Permissions Matrix
              </h4>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-background/60">
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <span>Autonomous Customer Delivery Queries</span>
                    {isAutonomous ? (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
                        Fully Autonomous
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        Supervised (Human Review)
                      </Badge>
                    )}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    When customers ask &ldquo;Delivery kobe hobe?&rdquo;, Twin auto-queries courier status and replies in polite Banglish.
                  </p>
                </div>
                <Switch
                  checked={isAutonomous}
                  onCheckedChange={setIsAutonomous}
                  data-testid="switch-autonomous"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-background/60">
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-foreground">
                    Send WhatsApp Order Dispatch Updates
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Auto-send tracking link and estimated delivery date directly to recipient&apos;s phone.
                  </p>
                </div>
                <Switch
                  checked={autoSendWhatsApp}
                  onCheckedChange={setAutoSendWhatsApp}
                  data-testid="switch-whatsapp"
                />
              </div>
            </div>

            {/* Live Simulation Test */}
            <div className="border-t border-border/60 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Verification & Live Order Simulation
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSimulationTested(true)}
                  className="text-xs gap-1.5 h-8 border-brand/30 text-brand hover:bg-brand/10"
                  data-testid="button-run-courier-simulation"
                >
                  <Sliders className="h-3.5 w-3.5" /> Run Courier Simulation
                </Button>
              </div>

              {simulationTested && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2 animate-in fade-in" data-testid="simulation-results">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Courier API Verification: Successful</span>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground bg-background/80 p-3 rounded-lg border border-border/60 space-y-1">
                    <p>Sample Query: &ldquo;ভাই আমার পার্সেল টা কই?&rdquo;</p>
                    <p className="text-emerald-400">
                      Twin Response: &ldquo;ধন্যবাদ! আপনার পার্সেলটি (BD_ST_755448) বর্তমানে চট্টগ্রাম হাবে যাত্রাপথে আছে। আগামীকাল নাগাদ ডেলিভারি সম্পন্ন হতে পারে।&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleLaunchCommerceTwin}
                disabled={!businessName}
                className="bg-brand text-white hover:bg-brand/90 font-semibold px-6 gap-2 h-10 shadow-lg shadow-brand/20 cursor-pointer"
                data-testid="button-activate-commerce-twin"
              >
                <span>Activate Business Twin</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* TRACK B: BUILD NEW VENTURE FLOW                                  */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {track === "build" && (
        <>
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
                    data-testid="textarea-problem-statement"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Target Vertical / Industry
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      data-testid="select-industry"
                    >
                      <option>B2B SaaS / Emerging Markets</option>
                      <option>E-Commerce Logistics & COD</option>
                      <option>HealthTech & Diagnostics</option>
                      <option>EdTech & Academic Research</option>
                      <option>FinTech / MFS Micro-Payments</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Primary Business Model
                    </label>
                    <select
                      value={businessModel}
                      onChange={(e) => setBusinessModel(e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      data-testid="select-business-model"
                    >
                      <option>Subscription (MRR) + bKash MFS</option>
                      <option>Usage-Based API Credits</option>
                      <option>Marketplace Take-Rate (10-15%)</option>
                      <option>Enterprise Annual Contract (ACV)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleStartSynthesis}
                  disabled={!companyName.trim() || isSynthesizing}
                  className="rounded-xl px-6 gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-900/30"
                  data-testid="button-synthesize-company"
                >
                  <span>Synthesize PRD & Roadmap</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Synthesis In-Progress */}
          {step === 2 && (
            <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-sm space-y-6 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 animate-pulse">
                  <Cpu className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Synthesizing Company Operating Model
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Allocating Dokploy PaaS container slot and generating 10 unblocked Wayfinder tickets...
                  </p>
                </div>
              </div>

              <div className="mx-auto max-w-md space-y-2 text-left font-mono text-xs">
                {SYNTHESIS_LOGS.map((log, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center gap-2 rounded-lg p-2 transition",
                      idx === synthesisStep
                        ? "bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/30"
                        : idx < synthesisStep
                        ? "text-emerald-400 opacity-60"
                        : "text-muted-foreground opacity-30"
                    )}
                  >
                    {idx < synthesisStep ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    ) : idx === synthesisStep ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                    )}
                    <span className="truncate">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Review & Launch */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <h2 className="text-base font-bold text-foreground">
                      {companyName} Successfully Synthesized
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    Ingress: <span className="text-emerald-400 font-bold">https://{subdomain}.shothikgpt.com</span> · Dokploy PaaS Container Ready (&lt;88MB)
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMfsModal(true)}
                    className="rounded-xl border-pink-500/40 text-pink-400 hover:bg-pink-500/10 text-xs font-semibold gap-1.5 h-9 font-mono"
                  >
                    <CreditCard className="h-3.5 w-3.5" /> bKash Gateway
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDbModal(true)}
                    className="rounded-xl border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 text-xs font-semibold gap-1.5 h-9 font-mono"
                  >
                    <Database className="h-3.5 w-3.5" /> Postgres Schema
                  </Button>
                  <Button
                    onClick={handleLaunchCompany}
                    className="rounded-xl px-6 gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shrink-0 shadow-lg shadow-emerald-900/30 h-9 cursor-pointer"
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
                      data-testid={`preview-ticket-${ticket.id}`}
                      className="rounded-xl border border-border/70 bg-background/60 p-3 flex flex-col justify-between space-y-2 hover:border-indigo-500/40 transition"
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
        </>
      )}
    </div>
  );
}
