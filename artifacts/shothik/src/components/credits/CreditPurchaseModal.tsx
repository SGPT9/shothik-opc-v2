import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Coins, Sparkles, Zap, Crown, CreditCard, Smartphone, Landmark, CheckCircle2, GraduationCap, Rocket, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CREDIT_PACKS,
  type PackId,
  type PaymentProvider,
  getProviderForCountry,
  getPackPrice,
} from "@/lib/payment-config";
import { trackCreditPurchaseStarted } from "@/lib/posthog";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface OutcomePassItem {
  id: string;
  name: string;
  priceBdt: number;
  credits: number;
  outcome: string;
  tag: string;
  icon: typeof GraduationCap;
}

export const OUTCOME_PASSES_LIST: OutcomePassItem[] = [
  {
    id: "THESIS_PLAGIARISM_PASS",
    name: "Thesis Plagiarism & IEEE Export",
    priceBdt: 49,
    credits: 50,
    outcome: "Full thesis audit report with Turnitin-equivalent similarity index & PDF export",
    tag: "৳49 • Academic",
    icon: GraduationCap,
  },
  {
    id: "PROJECT_VENTURE_PASS",
    name: "Founder Project Pass",
    priceBdt: 299,
    credits: 300,
    outcome: "Editable PPTX pitch deck, 3-year model spreadsheet & container deployment",
    tag: "৳299 • Venture",
    icon: Rocket,
  },
  {
    id: "F_COMMERCE_MONTHLY_PASS",
    name: "Autonomous F-Commerce Operations",
    priceBdt: 999,
    credits: 1200,
    outcome: "24/7 Steadfast/Pathao courier tracking & WhatsApp query resolution",
    tag: "৳999/mo • Commerce",
    icon: ShoppingBag,
  },
];

const PACK_LIST: { id: PackId; icon: typeof Coins; popular?: boolean; tier: "starter" | "pro" | "team" | "enterprise" }[] = [
  { id: "starter", icon: Coins, tier: "starter" },
  { id: "popular", icon: Sparkles, popular: true, tier: "pro" },
  { id: "value", icon: Zap, tier: "team" },
  { id: "mega", icon: Crown, tier: "enterprise" },
];

const PROVIDER_LABELS: Record<PaymentProvider, { label: string; icon: typeof CreditCard }> = {
  stripe: { label: "Card", icon: CreditCard },
  bkash: { label: "bKash / Nagad", icon: Smartphone },
  razorpay: { label: "Razorpay", icon: Landmark },
};

interface CreditPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreditPurchaseModal({ open, onOpenChange }: CreditPurchaseModalProps) {
  const user = useSelector((state: any) => state.auth?.user);
  const accessToken = useSelector((state: any) => state.auth?.accessToken);
  const isAuthenticated = !!(user || accessToken);

  const [balance, setBalance] = useState<number>(550);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [provider, setProvider] = useState<PaymentProvider>("bkash");
  const [manualTrxId, setManualTrxId] = useState("");
  const [selectedTier, setSelectedTier] = useState<"starter" | "pro" | "team" | "enterprise">("pro");
  const [showTrxInput, setShowTrxInput] = useState(false);

  const [activeTab, setActiveTab] = useState<"outcome_passes" | "credit_packs">("outcome_passes");
  const [selectedPass, setSelectedPass] = useState<OutcomePassItem | null>(null);

  const fetchBalance = useCallback(() => {
    const userId = user?.id || user?._id || "guest";
    fetch("/api/v1/subscriptions/me", {
      headers: { "x-user-id": userId },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.subscription) {
          const tier = data.data.subscription.tier;
          const tierCredits = tier === "team" ? 50000 : tier === "pro" ? 15000 : 550;
          setBalance(tierCredits);
        }
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (open) {
      fetchBalance();
      setError(null);
      setSuccessMsg(null);
    }
  }, [open, fetchBalance]);

  const handleVerifyManualTrx = async () => {
    if (!manualTrxId.trim()) {
      setError("Please enter a valid 10-character Transaction ID (TrxID).");
      return;
    }

    setPurchasing("manual_trx");
    setError(null);
    setSuccessMsg(null);

    // If an outcome-based pass is selected
    if (selectedPass) {
      try {
        const userId = user?.id || user?._id || "usr_default";
        const idemKey = `pass_${selectedPass.id}_${Date.now()}`;
        const res = await fetch("/api/v1/subscriptions/passes:purchase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": idemKey,
          },
          body: JSON.stringify({
            userId,
            passId: selectedPass.id,
            trxId: manualTrxId.trim().toUpperCase(),
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || data.error || "Failed to activate outcome pass.");
        }
        setSuccessMsg(`Pass Activated! ${data.name} unlocked. (${data.outcomeUnlocked})`);
        setManualTrxId("");
        setSelectedPass(null);
        fetchBalance();
        return;
      } catch (err: any) {
        setError(err.message || "Failed to activate outcome pass.");
        return;
      } finally {
        setPurchasing(null);
      }
    }

    try {
      const tierBdtMap: Record<string, number> = {
        starter: 499,
        pro: 1499,
        team: 4999,
        enterprise: 9999,
      };

      const userId = user?.id || user?._id || "guest";
      const res = await fetch("/api/v1/mfs/verify-trx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          trxId: manualTrxId.trim().toUpperCase(),
          provider: "bkash",
          tier: selectedTier,
          amountBdt: tierBdtMap[selectedTier] || 1499,
          userId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to verify transaction ID.");
      }

      setSuccessMsg(data.message || "Transaction verified! Credits and plan updated.");
      setManualTrxId("");
      fetchBalance();
    } catch (err: any) {
      setError(err.message || "Verification failed. Please double check the TrxID.");
    } finally {
      setPurchasing(null);
    }
  };

  const handleBkashCheckout = async (packId: PackId) => {
    try {
      const res = await fetch("/api/bkash/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.bkashURL) {
          window.location.href = data.bkashURL;
          return;
        }
      }
    } catch {
      // Fallback
    }
    setShowTrxInput(true);
  };

  const handlePurchase = async (packId: PackId, tier: "starter" | "pro" | "team" | "enterprise") => {
    setSelectedTier(tier);
    setSelectedPass(null);
    setError(null);
    setSuccessMsg(null);
    trackCreditPurchaseStarted(provider, packId);

    if (provider === "bkash") {
      await handleBkashCheckout(packId);
    } else {
      setShowTrxInput(true);
    }
  };

  const handleSelectPass = (pass: OutcomePassItem) => {
    setSelectedPass(pass);
    setShowTrxInput(true);
    setError(null);
    setSuccessMsg(null);
  };

  const availableProviders: PaymentProvider[] = ["bkash", "stripe", "razorpay"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Coins className="h-6 w-6 fill-amber-400 text-amber-400" />
            Outcome Passes & Wallet
          </DialogTitle>
        </DialogHeader>

        {/* Top Balance Bar */}
        <div className="mb-3 flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
          <span className="text-sm text-muted-foreground">Available Credits</span>
          <div className="flex items-center gap-1.5 text-lg font-bold text-amber-400">
            <Coins className="h-5 w-5 fill-amber-400" />
            {balance.toLocaleString()}
          </div>
        </div>

        {/* Mode Switcher: Outcome Passes vs Credit Packs */}
        <div className="mb-3 flex gap-2 rounded-lg bg-muted/40 p-1">
          <button
            onClick={() => {
              setActiveTab("outcome_passes");
              setError(null);
            }}
            className={cn(
              "flex-1 rounded-md py-1.5 text-xs font-semibold transition-all",
              activeTab === "outcome_passes"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Outcome Micro-Passes
          </button>
          <button
            onClick={() => {
              setActiveTab("credit_packs");
              setError(null);
            }}
            className={cn(
              "flex-1 rounded-md py-1.5 text-xs font-semibold transition-all",
              activeTab === "credit_packs"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Compute Packs
          </button>
        </div>

        {/* Payment Provider Selector */}
        <div className="mb-3 flex gap-1 rounded-lg bg-muted/30 p-1" role="tablist" aria-label="Payment method">
          {availableProviders.map((p) => {
            const { label, icon: Icon } = PROVIDER_LABELS[p];
            return (
              <button
                key={p}
                role="tab"
                aria-selected={provider === p}
                onClick={() => {
                  setProvider(p);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  provider === p
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Instant TrxID Verification Drawer */}
        {showTrxInput && (
          <div className="mb-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <h4 className="text-sm font-semibold text-foreground mb-1">
              {selectedPass
                ? `Activate ${selectedPass.name} (৳${selectedPass.priceBdt} BDT)`
                : "bKash / Nagad Instant TrxID Verification"}
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Send <strong>৳{selectedPass ? selectedPass.priceBdt : "your tier amount"} BDT</strong> to Merchant Number <strong className="text-foreground">01700-000000</strong> and enter TrxID:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 9K72AX48LP"
                value={manualTrxId}
                onChange={(e) => setManualTrxId(e.target.value)}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleVerifyManualTrx}
                disabled={purchasing === "manual_trx"}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {purchasing === "manual_trx" ? "Verifying..." : "Verify & Unlock"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: OUTCOME PASSES */}
        {activeTab === "outcome_passes" && (
          <div className="grid grid-cols-1 gap-2.5" role="list">
            {OUTCOME_PASSES_LIST.map((pass) => {
              const Icon = pass.icon;
              const isSelected = selectedPass?.id === pass.id;
              return (
                <div
                  key={pass.id}
                  onClick={() => handleSelectPass(pass)}
                  className={cn(
                    "relative flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-muted/40 hover:border-primary/50 hover:bg-muted/60"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{pass.name}</span>
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {pass.tag}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{pass.outcome}</p>
                    </div>
                  </div>
                  <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shrink-0">
                    ৳{pass.priceBdt}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: CREDIT PACKS */}
        {activeTab === "credit_packs" && (
          <div className="grid grid-cols-2 gap-3" role="list" aria-label="Credit packs available for purchase">
            {PACK_LIST.map((packEntry) => {
              const pack = CREDIT_PACKS[packEntry.id];
              const Icon = packEntry.icon;
              const isLoading = purchasing === packEntry.id;
              const priceDisplay = getPackPrice(packEntry.id, provider);
              return (
                <button
                  key={packEntry.id}
                  onClick={() => handlePurchase(packEntry.id, packEntry.tier)}
                  disabled={!!purchasing}
                  role="listitem"
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-xl p-5 text-center transition-all",
                    "bg-muted/50 hover:bg-muted",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    packEntry.popular && "ring-2 ring-amber-500/40"
                  )}
                >
                  {packEntry.popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-background">
                      BEST VALUE
                    </span>
                  )}

                  {pack.bonus && (
                    <span className="rounded-full bg-emerald-950/30 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                      {pack.bonus}
                    </span>
                  )}

                  <Icon className="h-8 w-8 text-amber-400" />

                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {pack.credits.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Credits ({packEntry.tier.toUpperCase()})</div>
                  </div>

                  <div className="mt-1 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                    {isLoading ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Processing
                      </span>
                    ) : (
                      priceDisplay
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {successMsg && (
          <div className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs font-semibold text-emerald-500">
            <CheckCircle2 className="h-4 w-4" />
            {successMsg}
          </div>
        )}

        {error && (
          <p role="alert" className="mt-2 text-center text-xs text-destructive">
            {error}
          </p>
        )}

        <p className="mt-2 text-center text-xs text-muted-foreground">
          Instant bKash, Nagad & Card verification backed by PostgreSQL ledger.
        </p>
      </DialogContent>
    </Dialog>
  );
}
