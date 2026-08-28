import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Coins, Sparkles, Zap, Crown, CreditCard, Smartphone, Landmark, CheckCircle2 } from "lucide-react";
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
    // If backend direct gateway checkout exists:
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
      // Fallback to manual TrxID dialog
    }
    setShowTrxInput(true);
  };

  const handlePurchase = async (packId: PackId, tier: "starter" | "pro" | "team" | "enterprise") => {
    setSelectedTier(tier);
    setError(null);
    setSuccessMsg(null);
    trackCreditPurchaseStarted(provider, packId);

    if (provider === "bkash") {
      await handleBkashCheckout(packId);
    } else {
      setShowTrxInput(true);
    }
  };

  const availableProviders: PaymentProvider[] = ["bkash", "stripe", "razorpay"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Coins className="h-6 w-6 fill-amber-400 text-amber-400" />
            Get Credits & Upgrades
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
          <span className="text-sm text-muted-foreground">Your Balance</span>
          <div className="flex items-center gap-1.5 text-lg font-bold text-amber-400">
            <Coins className="h-5 w-5 fill-amber-400" />
            {balance.toLocaleString()}
          </div>
        </div>

        <div className="mb-4 flex gap-1 rounded-lg bg-muted/30 p-1" role="tablist" aria-label="Payment method">
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
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all",
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

        {showTrxInput && (
          <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <h4 className="text-sm font-semibold text-foreground mb-1">
              bKash / Nagad Instant TrxID Verification
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Send payment to Merchant Number <strong className="text-foreground">01700-000000</strong> and enter the 10-digit TrxID below:
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
                {purchasing === "manual_trx" ? "Verifying..." : "Verify & Credit"}
              </button>
            </div>
          </div>
        )}

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
