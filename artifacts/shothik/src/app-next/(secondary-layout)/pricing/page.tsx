import { PricingCard } from "@/components/(pricing-page)/PricingCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserLocation } from "@/hooks/utils/useUserLocation";
import {
  fetchPublicPackages,
  fetchPublicPlans,
} from "@/services/pricing.service";
import type { TPackage } from "@/types/package.type";
import type { TPlan } from "@/types/plan.type";
import {
  PERSONA_LENSES,
  OUTCOME_MICRO_PASSES,
  type PersonaLensId,
  type PackageSlug,
} from "@/lib/subscription-tiers";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  QrCode,
  Zap,
  ShieldCheck,
  Coins,
  ArrowRight,
  Layers,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import { useRouter, useSearchParams } from "@/lib/navigation";
import { useTranslation } from "@/i18n";
import { useEffect, useMemo, useState } from "react";
import { MfsGatewayModal } from "@/components/twin/MfsGatewayModal";

const FALLBACK_PLANS: TPlan[] = [
  { _id: "monthly", name: "Monthly", duration: 30, is_active: true } as any,
  { _id: "yearly", name: "Yearly (Save 20%)", duration: 365, is_active: true } as any,
];

const FALLBACK_PACKAGES: TPackage[] = [
  {
    _id: "starter-pass",
    name: "Starter Student Micro-Pass",
    description:
      "Ideal for university assignments, thesis Turnitin checks, and single slide deck creation.",
    package_for: "User",
    is_popular: false,
    price: { USD: 0.85, BDT: 100 },
    plans: [
      {
        plan: { _id: "monthly", name: "Monthly", duration: 30 },
        price: { USD: 0.85, BDT: 100 },
        is_initial: true,
      },
      {
        plan: { _id: "yearly", name: "Yearly (Save 20%)", duration: 365 },
        price: { USD: 8.5, BDT: 960 },
        is_initial: false,
      },
    ],
    features: [
      { feature: { name: "50 Instant Task Credits" } },
      { feature: { name: "Academic Plagiarism & Turnitin Check" } },
      { feature: { name: "1 Full Presentation Generation" } },
      { feature: { name: "Bangla & English Spell Checking" } },
    ],
  } as any,
  {
    _id: "pro-operator",
    name: "Pro Operator Pack",
    description:
      "Most popular for solo entrepreneurs, novelists, developers, and agency copywriters.",
    package_for: "User",
    is_popular: true,
    price: { USD: 8.5, BDT: 990 },
    plans: [
      {
        plan: { _id: "monthly", name: "Monthly", duration: 30 },
        price: { USD: 8.5, BDT: 990 },
        is_initial: true,
      },
      {
        plan: { _id: "yearly", name: "Yearly (Save 20%)", duration: 365 },
        price: { USD: 81.6, BDT: 9500 },
        is_initial: false,
      },
    ],
    features: [
      { feature: { name: "550 Workspace Credits" } },
      { feature: { name: "Unlimited Pro Search & Deep Research" } },
      { feature: { name: "5-Step Slide Studio with 16:9 Canvas" } },
      { feature: { name: "30-Scenario Financial Stress Lab" } },
      { feature: { name: "Interactive Voice Dictation & Presenter" } },
    ],
  } as any,
  {
    _id: "venture-twin",
    name: "Venture Twin & OPC",
    description:
      "For active startups, publishing imprints, and digital businesses automating sales, marketing, and logistics.",
    package_for: "User",
    is_popular: false,
    price: { USD: 19.99, BDT: 2400 },
    plans: [
      {
        plan: { _id: "monthly", name: "Monthly", duration: 30 },
        price: { USD: 19.99, BDT: 2400 },
        is_initial: true,
      },
      {
        plan: { _id: "yearly", name: "Yearly (Save 20%)", duration: 365 },
        price: { USD: 191.9, BDT: 23000 },
        is_initial: false,
      },
    ],
    features: [
      { feature: { name: "1,500 Monthly Credits" } },
      { feature: { name: "1 Autonomous Company Slot" } },
      { feature: { name: "Tonight Engine Overnight Background Worker" } },
      { feature: { name: "Steadfast & Pathao Courier Auto-Dispatch" } },
      { feature: { name: "bKash & Nagad Merchant Reconciliation" } },
    ],
  } as any,
  {
    _id: "agency-scale",
    name: "Agency & Enterprise",
    description:
      "High-throughput AI infrastructure, unlimited team members, and priority DeepSeek R1 nodes.",
    package_for: "User",
    is_popular: false,
    price: { USD: 49.99, BDT: 6000 },
    plans: [
      {
        plan: { _id: "monthly", name: "Monthly", duration: 30 },
        price: { USD: 49.99, BDT: 6000 },
        is_initial: true,
      },
      {
        plan: { _id: "yearly", name: "Yearly (Save 20%)", duration: 365 },
        price: { USD: 479.9, BDT: 57600 },
        is_initial: false,
      },
    ],
    features: [
      { feature: { name: "5,000 High-Speed Credits" } },
      { feature: { name: "Unlimited Team Members & Seats" } },
      { feature: { name: "Dedicated Hostinger VPS DeepSeek R1 Failover" } },
      { feature: { name: "Custom API & Webhook Endpoints" } },
      { feature: { name: "Dedicated 24/7 WhatsApp Account Support" } },
    ],
  } as any,
];

const CHECKPOINT_TIERS = [
  {
    credits: "0 Credits",
    badge: "Always Free inside Studio",
    color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    items: [
      "Core Distraction-Free Manuscript & Academic Editor",
      "Basic Bangla & English Grammar & Spell Check",
      "Offline Zero-Latency Story Bible HUD (#10) — Ctrl+Shift+B",
      "Live 6x9 Trade Paperback & Split-Screen Preview",
    ],
  },
  {
    credits: "1 Credit",
    badge: "Fast AI Polish & Diagnostics",
    color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    items: [
      "Multi-Branch Narrative Forecast Engine (#1)",
      "Semantic Prose De-Slopper (#3) & Dialect Transpiler (#20)",
      "Chapter Tension EKG (#18) & Pacing Retention Radar (#17)",
      "Pre-Publication Legal & Defamation Shield (#45)",
    ],
  },
  {
    credits: "3 Credits",
    badge: "Multimodal Audio, Video & Print",
    color: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    items: [
      "24kHz Multi-Character Bangla Voice Cast (#11) & 3D Soundscape (#13)",
      "9:16 Viral BookTok / Reels Video Teaser Generator (#14)",
      "6x9 Nilkhet / Boi Mela Print PDF Preflight (#38) & 3D Jacket (#39)",
      "National Library CIP/ISBN Barcode (#40) & 6-Language Matrix (#42)",
    ],
  },
  {
    credits: "5 Credits",
    badge: "Heavy Audits & Venture Automation",
    color: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    items: [
      "Full Thesis Turnitin-Style Plagiarism & AI Detector Audit",
      "5-Step 16:9 Academic Defense or Investor Slide Deck",
      "30-Scenario Financial Stress Lab & Unit Economics Simulation",
      "Venture Twin Overnight Worker & Steadfast/Pathao Dispatch",
    ],
  },
];

const PricingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>("all");
  const [activeLens, setActiveLens] = useState<PersonaLensId>("author_inkos");
  const [mfsModalOpen, setMfsModalOpen] = useState(false);

  const { isBangladesh } = useUserLocation();

  useEffect(() => {
    const planParam = searchParams.get("plan");
    if (planParam) {
      setSelectedPlanId(planParam);
    } else {
      setSelectedPlanId("all");
    }
    const lensParam = searchParams.get("lens") as PersonaLensId | null;
    if (
      lensParam &&
      PERSONA_LENSES.some((l) => l.id === lensParam)
    ) {
      setActiveLens(lensParam);
    }
  }, [searchParams]);

  const { data: plansResponse } = useQuery({
    queryKey: ["public-plans"],
    queryFn: () => fetchPublicPlans({ is_active: true, sort: "sequence" }),
    retry: 0,
    staleTime: 5 * 60 * 1000,
  });

  const rawPlans = plansResponse?.data || [];
  const plans = rawPlans.length > 0 ? rawPlans : FALLBACK_PLANS;

  const { data: packagesResponse } = useQuery({
    queryKey: ["public-packages", selectedPlanId],
    queryFn: () => {
      const query: Record<string, unknown> = {
        is_active: true,
        sort: "sequence",
      };
      if (selectedPlanId && selectedPlanId !== "all") {
        query.plans = selectedPlanId;
      }
      return fetchPublicPackages(query);
    },
    retry: 0,
    staleTime: 5 * 60 * 1000,
  });

  const rawPackages = packagesResponse?.data || [];
  const basePackages = rawPackages.length > 0 ? rawPackages : FALLBACK_PACKAGES;

  const currentLensConfig = useMemo(
    () =>
      PERSONA_LENSES.find((l) => l.id === activeLens) || PERSONA_LENSES[1],
    [activeLens],
  );

  const lensTailoredPackages = useMemo(() => {
    return basePackages.map((pkg: TPackage) => {
      const slug = pkg._id as PackageSlug;
      const override = currentLensConfig.packageOverrides[slug];
      if (!override) return pkg;
      return {
        ...pkg,
        description: override.description,
        features: override.features.map((f, idx) => ({
          _id: `${pkg._id}_${activeLens}_${idx}`,
          name: f,
          feature: { name: f },
        })),
      } as TPackage;
    });
  }, [basePackages, currentLensConfig, activeLens]);

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    if (planId === "all") {
      router.push("/pricing");
    } else {
      router.push(`/pricing?plan=${planId}`);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
      <div
        style={{ backgroundImage: `url('/pricing_bg_img.webp')` }}
        className="dark text-foreground bg-cover bg-center bg-no-repeat"
      >
        <div className="text-primary-foreground bg-black/50 py-6 pb-36 lg:py-12 lg:pb-44 backdrop-blur-xs">
          <div>
            <div className="container mx-auto mb-6 max-w-4xl space-y-4 text-center px-4">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/20 text-brand border border-brand/30 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Transparent PPP & MFS Pricing
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                  <Layers className="w-3.5 h-3.5" /> 1 Universal Shothik Wallet Unlocks All 4 Modes
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                One Universal Credit Wallet. Built for Every Ambition.
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto">
                No forced credit card lock-ins or separate subscriptions. Switch your view below to see how your credits power Academic Research, the 45-Capability InkOS Studio, Venture Twin, and Enterprise ERP.
              </p>
            </div>

            {/* 4-Persona Lens Switcher */}
            <div
              className="container mx-auto max-w-4xl px-4 mb-6"
              data-testid="persona-lens-switcher"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-2 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-xl shadow-xl">
                {PERSONA_LENSES.map((lens) => {
                  const isActive = activeLens === lens.id;
                  return (
                    <button
                      key={lens.id}
                      type="button"
                      data-testid={`lens-${lens.id}`}
                      onClick={() => setActiveLens(lens.id)}
                      className={`flex flex-col items-start text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? "bg-gradient-to-br from-emerald-500/25 via-teal-500/15 to-zinc-900 border-emerald-400/60 text-white shadow-lg shadow-emerald-950/50"
                          : "bg-zinc-900/50 border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full gap-1 mb-1">
                        <span className="text-xs font-bold tracking-tight">
                          {lens.label}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          isActive
                            ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {lens.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2.5 text-center text-xs text-emerald-300/90 font-medium">
                {currentLensConfig.tagline}
              </p>
            </div>

            {/* Plan Tabs */}
            <div className="mb-4">
              {plans.length > 0 && (
                <div className="flex w-full justify-center p-0.5">
                  <Tabs
                    value={selectedPlanId || "all"}
                    onValueChange={handlePlanChange}
                    className="w-full max-w-4xl"
                  >
                    <TabsList className="border-border/40 mx-auto inline-flex w-full max-w-md flex-wrap justify-center gap-1 rounded-full border bg-black/30 backdrop-blur-xl p-1">
                      <TabsTrigger
                        value="all"
                        className="text-zinc-300 data-[state=active]:text-white data-[state=active]:bg-white/20 flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition"
                      >
                        All Packages
                      </TabsTrigger>
                      {plans.map((plan: TPlan) => (
                        <TabsTrigger
                          key={plan._id}
                          value={plan._id}
                          className="text-zinc-300 data-[state=active]:text-white data-[state=active]:bg-white/20 flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition"
                        >
                          {plan.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto pb-16 px-4 space-y-14">
        {/* ── 🇧🇩 Regional South Asian Student & Micro-Venture Pass ── */}
        <div className="relative -mt-20 mx-auto max-w-5xl p-6 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-zinc-900/95 to-purple-950/90 border border-emerald-500/40 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                <span>🇧🇩</span>
                <span>South Asian Student, Author & Micro-Venture Pass</span>
              </div>
              <h3 className="text-xl font-bold text-zinc-100">
                50 Instant Task Credits — Just{" "}
                <span className="text-emerald-400 font-mono">৳100 BDT</span> ($0.85 USD)
              </h3>
              <p className="text-xs text-zinc-400 max-w-xl">
                No monthly subscriptions or international credit card needed. Instant 1-tap checkout with{" "}
                <span className="text-pink-400 font-semibold">bKash</span> &{" "}
                <span className="text-orange-400 font-semibold">Nagad</span> for thesis checks, InkOS audiobooks, Nilkhet print PDFs, and venture plans.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link href="/pricing/checkout?packageId=starter-pass">
                <Button className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 transition cursor-pointer shrink-0">
                  ⚡ Get Micro-Pass (৳100)
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setMfsModalOpen(true)}
                className="border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-300 font-medium text-xs rounded-xl gap-1.5"
                data-testid="button-pricing-manual-trx"
              >
                <QrCode className="w-3.5 h-3.5 text-pink-400" />
                <span>Verify SMS TrxID</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ── 4 Core Subscription & Credit Packages (Persona-Tailored) ── */}
        {lensTailoredPackages.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">{t("pricing.noPackages")}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lensTailoredPackages.map((pkg: TPackage) => (
              <PricingCard
                key={pkg._id}
                package={pkg}
                selectedPlanId={selectedPlanId}
                isBangladesh={isBangladesh}
              />
            ))}
          </div>
        )}

        {/* ── 1-Tap Done-For-You Outcome Micro-Passes ── */}
        <section
          className="space-y-6 pt-4"
          data-testid="outcome-micro-passes-grid"
        >
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <Badge
              variant="outline"
              className="border-pink-500/40 bg-pink-500/10 text-pink-300 text-xs px-3 py-1"
            >
              🇧🇩 Pay Per Outcome · bKash / Nagad / Card
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              1-Tap Done-For-You Outcome Micro-Passes
            </h2>
            <p className="text-sm text-muted-foreground">
              Need a single thesis audit, a viral BookTok reel, or a Boi Mela print-ready book without a monthly plan? Grab an instant outcome pass and keep any leftover credits in your universal wallet.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {OUTCOME_MICRO_PASSES.map((pass) => (
              <div
                key={pass.id}
                data-testid={`outcome-pass-${pass.id}`}
                className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card/70 p-5 shadow-sm hover:border-emerald-500/50 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {pass.badge}
                    </span>
                    <span className="text-xs font-mono text-amber-400 font-semibold">
                      +{pass.credits} cr
                    </span>
                  </div>
                  <h3 className="font-bold text-base leading-snug">
                    {pass.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                      ৳{pass.priceBdt}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (${pass.priceUsd.toFixed(2)} USD)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {pass.outcome}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-border/50 flex flex-col gap-2">
                  <Link
                    href={`/pricing/checkout?packageId=${pass.packageId}&passId=${pass.id}`}
                  >
                    <Button
                      size="sm"
                      className="w-full text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>1-Tap bKash / Checkout</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Checkpoint Credit Transparency & Self-Liquidating Earn-Back Loop ── */}
        <section
          className="space-y-6 pt-4"
          data-testid="checkpoint-credit-guide"
        >
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <Badge
              variant="outline"
              className="border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs px-3 py-1"
            >
              <Coins className="w-3.5 h-3.5 mr-1 inline" /> Zero Hidden Token Drain
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Predictable Checkpoint Credits & Self-Liquidating Studio
            </h2>
            <p className="text-sm text-muted-foreground">
              Writing, editing, and your Offline Story Bible HUD are always 0 credits. You only spend predictable checkpoint credits when you trigger heavy AI synthesis or multimodal exports.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CHECKPOINT_TIERS.map((tier) => (
              <div
                key={tier.credits}
                className="rounded-2xl border border-border bg-card/60 p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${tier.color}`}
                  >
                    {tier.credits}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {tier.badge}
                  </span>
                </div>
                <ul className="space-y-2 text-xs text-foreground/90">
                  {tier.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Self-Liquidating Earn-Back Card */}
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-zinc-900/90 to-emerald-950/40 p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>SELF-LIQUIDATING CREATOR & VENTURE ECOSYSTEM</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Turn Your Shothik Credits Into Direct bKash, Nagad & Print Revenue
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Unlike tools that only charge you, Shothik includes built-in monetization rails:{" "}
                  <strong className="text-emerald-300">
                    Webnovel Paywall & bKash Micro-Unlock Slicer (#41)
                  </strong>{" "}
                  lets readers unlock cliffhanger chapters for ৳10–৳20;{" "}
                  <strong className="text-amber-300">
                    Co-Author Royalty Split & Cryptographic Ledger (#44)
                  </strong>{" "}
                  automates multi-creator payouts; and{" "}
                  <strong className="text-cyan-300">
                    Venture Twin Courier & MFS Auto-Pilot
                  </strong>{" "}
                  dispatches Steadfast/Pathao parcels while reconciling merchant TrxIDs.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link href="/writing-studio">
                  <Button className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs gap-1.5 cursor-pointer">
                    <span>Open InkOS Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMfsModalOpen(true)}
                  className="border-amber-500/40 text-amber-200 hover:bg-amber-500/10 text-xs gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verify MFS TrxID</span>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <MfsGatewayModal
        open={mfsModalOpen}
        onOpenChange={setMfsModalOpen}
        initialTab="manual_trx"
      />
    </div>
  );
};

export default PricingPage;
