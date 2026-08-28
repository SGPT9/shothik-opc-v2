import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  SUBSCRIPTION_TIERS,
  type SubscriptionTier,
} from "@/lib/subscription-tiers";

export interface SubscriptionState {
  tier: SubscriptionTier;
  tierName: string;
  status: string;
  interval: "month" | "year";
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  isLoading: boolean;
  isPaid: boolean;
  isActive: boolean;
  tierConfig: (typeof SUBSCRIPTION_TIERS)[SubscriptionTier];
}

export function useSubscription(): SubscriptionState {
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?._id || user?.id || user?.email || "";

  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setSubscription({
        tier: "free",
        status: "active",
        interval: "month",
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const res = await fetch("/api/v1/subscriptions/me", {
          headers: {
            "x-user-id": userId,
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && isMounted) {
            setSubscription(json.data);
          }
        }
      } catch (err) {
        console.warn("[useSubscription] Failed to load subscription, falling back to free:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return useMemo(() => {
    const tier = ((subscription?.tier as SubscriptionTier) || "free") as SubscriptionTier;
    const tierConfig = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.free;
    const interval = subscription?.interval === "year" ? "year" : "month";

    return {
      tier,
      tierName: tierConfig.name,
      status: subscription?.status || "active",
      interval,
      currentPeriodEnd: subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).getTime() : null,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
      stripeSubscriptionId: subscription?.stripeSubscriptionId,
      stripeCustomerId: subscription?.stripeCustomerId,
      isLoading,
      isPaid: tier !== "free",
      isActive: subscription?.status === "active" || tier === "free",
      tierConfig,
    };
  }, [subscription, isLoading]);
}
