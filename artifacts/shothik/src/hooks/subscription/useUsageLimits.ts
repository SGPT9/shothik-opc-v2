import { useSelector } from "react-redux";
import { useState, useEffect, useMemo, useCallback } from "react";
import type { RootState } from "@/redux/store";
import {
  SUBSCRIPTION_TIERS,
  type SubscriptionTier,
  type UsageLimitKey,
  TOOL_TO_LIMIT_KEY,
} from "@/lib/subscription-tiers";

export interface UsageInfo {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  isUnlimited: boolean;
  isAtLimit: boolean;
}

export interface UsageLimitsState {
  usage: Record<UsageLimitKey, UsageInfo>;
  tier: SubscriptionTier;
  isLoading: boolean;
  periodEnd: number | null;
  checkTool: (tool: string) => UsageInfo;
  incrementTool: (tool: string) => Promise<{ success: boolean; used: number; limit: number }>;
}

export function useUsageLimits(): UsageLimitsState {
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?._id || user?.id || user?.email || "";

  const [subscription, setSubscription] = useState<any>(null);
  const [usageData, setUsageData] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsageAndSub = useCallback(async (uid: string) => {
    try {
      setIsLoading(true);
      const [subRes, usageRes] = await Promise.all([
        fetch("/api/v1/subscriptions/me", {
          headers: { "x-user-id": uid },
        }),
        fetch("/api/v1/subscriptions/usage", {
          headers: { "x-user-id": uid },
        }),
      ]);

      if (subRes.ok) {
        const subJson = await subRes.json();
        if (subJson.success) setSubscription(subJson.data);
      }

      if (usageRes.ok) {
        const usageJson = await usageRes.json();
        if (usageJson.success) setUsageData(usageJson.data || {});
      }
    } catch (err) {
      console.warn("[useUsageLimits] Failed to fetch subscription/usage data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      setSubscription({ tier: "free" });
      setUsageData({});
      setIsLoading(false);
    } else {
      fetchUsageAndSub(userId);
    }
  }, [userId, fetchUsageAndSub]);

  const tier = ((subscription?.tier as SubscriptionTier) || "free") as SubscriptionTier;
  const tierConfig = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.free;

  const usage = useMemo(() => {
    const result: Record<string, UsageInfo> = {};
    const limitKeys: UsageLimitKey[] = [
      "plagiarismChecks",
      "aiDetectorScans",
      "paraphraseUses",
      "grammarChecks",
      "humanizeUses",
      "summarizeUses",
      "translatorUses",
    ];

    for (const key of limitKeys) {
      const limit = tierConfig.limits[key];
      const used = usageData[key] || 0;
      const isUnlimited = limit === -1;
      const remaining = isUnlimited ? Infinity : Math.max(0, limit - used);
      const percentage = isUnlimited ? 0 : limit > 0 ? Math.min(100, (used / limit) * 100) : 100;

      result[key] = {
        used,
        limit,
        remaining,
        percentage,
        isUnlimited,
        isAtLimit: !isUnlimited && used >= limit,
      };
    }

    return result as Record<UsageLimitKey, UsageInfo>;
  }, [tierConfig, usageData]);

  const checkTool = useCallback(
    (tool: string): UsageInfo => {
      const key = TOOL_TO_LIMIT_KEY[tool];
      if (!key || !usage[key]) {
        return {
          used: 0,
          limit: -1,
          remaining: Infinity,
          percentage: 0,
          isUnlimited: true,
          isAtLimit: false,
        };
      }
      return usage[key];
    },
    [usage],
  );

  const incrementTool = useCallback(
    async (tool: string) => {
      if (!userId) {
        return { success: false, used: 0, limit: 0 };
      }
      try {
        const res = await fetch("/api/v1/subscriptions/increment-usage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
          body: JSON.stringify({ userId, tool }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setUsageData((prev) => ({
              ...prev,
              [tool]: json.used,
            }));
            const key = TOOL_TO_LIMIT_KEY[tool];
            const limit = key ? tierConfig.limits[key] : -1;
            return { success: true, used: json.used, limit };
          }
        }
      } catch (err) {
        console.error("[useUsageLimits] Failed to increment usage:", err);
      }
      return { success: false, used: 0, limit: 0 };
    },
    [userId, tierConfig],
  );

  return {
    usage,
    tier,
    isLoading,
    periodEnd: subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).getTime() : null,
    checkTool,
    incrementTool,
  };
}
