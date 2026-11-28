import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  SUBSCRIPTION_TIERS,
  TIER_ORDER,
  type SubscriptionTier,
  formatPrice,
  getCurrencyForCountry,
  mapTierToPackageId,
} from "@/lib/subscription-tiers";
import { useUserLocation } from "@/hooks/utils/useUserLocation";
import { Check, Zap, Crown, GraduationCap, FlaskConical, Smartphone } from "lucide-react";
import { Link } from "wouter";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier?: SubscriptionTier;
  toolName?: string;
  usageInfo?: {
    used: number;
    limit: number;
  };
}

const TIER_ICONS: Record<SubscriptionTier, React.ReactNode> = {
  free: <Zap className="h-5 w-5" />,
  student: <GraduationCap className="h-5 w-5" />,
  researcher: <FlaskConical className="h-5 w-5" />,
  pro: <Crown className="h-5 w-5" />,
};

export default function UpgradeModal({
  open,
  onOpenChange,
  currentTier = "free",
  toolName,
  usageInfo,
}: UpgradeModalProps) {
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const { countryCode } = useUserLocation();
  const currency = getCurrencyForCountry(countryCode);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [interval, setInterval] = useState<"month" | "year">("month");

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (!accessToken) {
      window.location.href = `/pricing/checkout?packageId=${mapTierToPackageId(tier)}&planId=${interval === "year" ? "yearly" : "monthly"}`;
      return;
    }

    setLoadingTier(tier);
    try {
      const res = await fetch("/api/stripe/subscription/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ tier, interval, currency }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setLoadingTier(null);
      }
    } catch {
      setLoadingTier(null);
    }
  };

  const upgradeTiers = TIER_ORDER.filter(
    (t) => t !== "free" && TIER_ORDER.indexOf(t) > TIER_ORDER.indexOf(currentTier),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[740px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Upgrade Your Universal Shothik Plan
          </DialogTitle>
          <DialogDescription>
            {toolName && usageInfo
              ? `You've used ${usageInfo.used} of ${usageInfo.limit} ${toolName} checks this month. Upgrade for higher limits & Instant Task Credits.`
              : "1 Universal Wallet unlocks Academic Tools, the 45-Capability InkOS Studio, Venture Twin & Enterprise ERP."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 my-3">
          <Button
            variant={interval === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setInterval("month")}
          >
            Monthly
          </Button>
          <Button
            variant={interval === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => setInterval("year")}
          >
            Yearly
            <Badge variant="secondary" className="ml-2 text-xs">
              Save 20%
            </Badge>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upgradeTiers.map((tierId) => {
            const tier = SUBSCRIPTION_TIERS[tierId];
            const price =
              interval === "year"
                ? tier.pricing[currency].yearly
                : tier.pricing[currency].monthly;
            const packageId = mapTierToPackageId(tierId);
            const planId = interval === "year" ? "yearly" : "monthly";

            return (
              <div
                key={tierId}
                className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all ${
                  tier.popular
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs">
                    Most Popular
                  </Badge>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {TIER_ICONS[tierId]}
                    </div>
                    <h3 className="font-semibold">{tier.name}</h3>
                  </div>

                  <div className="mb-3">
                    <span className="text-2xl font-bold">
                      {formatPrice(price, currency)}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      /{interval === "year" ? "yr" : "mo"}
                    </span>
                  </div>

                  <ul className="space-y-1.5 mb-4">
                    {tier.features.slice(0, 5).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/50">
                  <Button
                    className="w-full text-xs"
                    variant={tier.popular ? "default" : "outline"}
                    disabled={!!loadingTier}
                    onClick={() => handleSubscribe(tierId)}
                    data-testid={`button-upgrade-card-${tierId}`}
                  >
                    {loadingTier === tierId ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      `Get ${tier.name} (Card)`
                    )}
                  </Button>

                  <Link
                    href={`/pricing/checkout?packageId=${packageId}&planId=${planId}`}
                    onClick={() => onOpenChange(false)}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs gap-1.5 border-pink-500/40 text-pink-400 hover:bg-pink-500/10 cursor-pointer"
                      data-testid={`button-upgrade-mfs-${tierId}`}
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      <span>bKash / Nagad MFS</span>
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-2.5 text-xs">
          <span className="text-muted-foreground">
            Need a 1-Tap Outcome Micro-Pass (from <strong>৳49 BDT</strong>) for Thesis, BookTok, or Boi Mela Print?
          </span>
          <Link href="/pricing" onClick={() => onOpenChange(false)}>
            <Button variant="link" size="sm" className="text-emerald-400 font-semibold px-1 h-auto">
              Explore 4-Persona Pricing →
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
