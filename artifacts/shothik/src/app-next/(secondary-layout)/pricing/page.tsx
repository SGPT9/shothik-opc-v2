import { PricingCard } from "@/components/(pricing-page)/PricingCard";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserLocation } from "@/hooks/utils/useUserLocation";
import {
  fetchPublicPackages,
  fetchPublicPlans,
} from "@/services/pricing.service";
import type { TPackage } from "@/types/package.type";
import type { TPlan } from "@/types/plan.type";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useRouter, useSearchParams } from "@/lib/navigation";
import { useTranslation } from "@/i18n";
import { useEffect, useState } from "react";

const FALLBACK_PLANS: TPlan[] = [
  { _id: "monthly", name: "Monthly", duration: 30, is_active: true } as any,
  { _id: "yearly", name: "Yearly (Save 20%)", duration: 365, is_active: true } as any,
];

const FALLBACK_PACKAGES: TPackage[] = [
  {
    _id: "starter-pass",
    name: "Starter Student Micro-Pass",
    description: "Ideal for university assignments, thesis Turnitin checks, and single slide deck creation.",
    package_for: "User",
    is_popular: false,
    price: { USD: 0.85, BDT: 100 },
    plans: [
      {
        plan: { _id: "monthly", name: "Monthly", duration: 30 },
        price: { USD: 0.85, BDT: 100 },
        is_initial: true,
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
    description: "Most popular for solo entrepreneurs, developers, and agency copywriters.",
    package_for: "User",
    is_popular: true,
    price: { USD: 8.50, BDT: 990 },
    plans: [
      {
        plan: { _id: "monthly", name: "Monthly", duration: 30 },
        price: { USD: 8.50, BDT: 990 },
        is_initial: true,
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
    description: "For active startups and digital businesses automating sales, marketing, and logistics.",
    package_for: "User",
    is_popular: false,
    price: { USD: 19.99, BDT: 2400 },
    plans: [
      {
        plan: { _id: "monthly", name: "Monthly", duration: 30 },
        price: { USD: 19.99, BDT: 2400 },
        is_initial: true,
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
    description: "High-throughput AI infrastructure, unlimited team members, and priority DeepSeek R1 nodes.",
    package_for: "User",
    is_popular: false,
    price: { USD: 49.99, BDT: 6000 },
    plans: [
      {
        plan: { _id: "monthly", name: "Monthly", duration: 30 },
        price: { USD: 49.99, BDT: 6000 },
        is_initial: true,
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

const PricingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>("all");

  const { isBangladesh } = useUserLocation();

  useEffect(() => {
    const planParam = searchParams.get("plan");
    if (planParam) {
      setSelectedPlanId(planParam);
    } else {
      setSelectedPlanId("all");
    }
  }, [searchParams]);

  const { data: plansResponse, isLoading: plansLoading, isError: isPlansError, refetch: refetchPlans } = useQuery({
    queryKey: ["public-plans"],
    queryFn: () => fetchPublicPlans({ is_active: true, sort: "sequence" }),
    retry: 0,
    staleTime: 5 * 60 * 1000,
  });

  const rawPlans = plansResponse?.data || [];
  const plans = rawPlans.length > 0 ? rawPlans : FALLBACK_PLANS;

  const {
    data: packagesResponse,
    isLoading: isPackagesLoading,
    isError: isPackagesError,
    refetch: refetchPackages,
  } = useQuery({
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
  const packages = rawPackages.length > 0 ? rawPackages : FALLBACK_PACKAGES;

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    if (planId === "all") {
      router.push("/pricing");
    } else {
      router.push(`/pricing?plan=${planId}`);
    }
  };

  const handleRetry = () => {
    refetchPlans();
    refetchPackages();
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
      <div
        style={{ backgroundImage: `url('/pricing_bg_img.webp')` }}
        className="dark text-foreground bg-cover bg-center bg-no-repeat"
      >
        <div className="text-primary-foreground bg-black/40 py-6 pb-36 lg:py-12 lg:pb-44 backdrop-blur-xs">
          <div>
            <div className="container mx-auto mb-6 max-w-4xl space-y-4 text-center px-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/20 text-brand border border-brand/30 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Transparent PPP & MFS Pricing
              </span>
              <h1 className="text-4xl font-bold capitalize text-white tracking-tight">
                Simple, Credit-Based Plans for Every Need
              </h1>
              <p className="text-base text-zinc-300 max-w-2xl mx-auto">
                No forced monthly credit card lock-ins. Pay in local currency with bKash, Nagad, or international cards.
              </p>
            </div>

            {/* Plan Tabs */}
            <div className="mb-6">
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

      <div className="container mx-auto pb-12 px-4">
        {/* ── 🇧🇩 Regional South Asian Student & Micro-Venture Pass ── */}
        <div className="relative -mt-20 mb-10 mx-auto max-w-4xl p-6 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-zinc-900/95 to-purple-950/90 border border-emerald-500/40 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                <span>🇧🇩</span>
                <span>South Asian Student & Micro-Venture Pass</span>
              </div>
              <h3 className="text-xl font-bold text-zinc-100">
                50 Instant Task Credits — Just <span className="text-emerald-400 font-mono">৳100 BDT</span> ($0.85 USD)
              </h3>
              <p className="text-xs text-zinc-400 max-w-xl">
                No monthly subscriptions or international credit card needed. Instant 1-tap checkout with <span className="text-pink-400 font-semibold">bKash</span> & <span className="text-orange-400 font-semibold">Nagad</span> for thesis checks, slide decks, and venture plans.
              </p>
            </div>
            <Link href="/pricing/checkout?packageId=starter-pass">
              <Button className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 transition cursor-pointer shrink-0">
                ⚡ Get Micro-Pass (৳100)
              </Button>
            </Link>
          </div>
        </div>

        {packages.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              {t("pricing.noPackages")}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {packages.map((pkg: TPackage) => (
              <PricingCard
                key={pkg._id}
                package={pkg}
                selectedPlanId={selectedPlanId}
                isBangladesh={isBangladesh}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingPage;
