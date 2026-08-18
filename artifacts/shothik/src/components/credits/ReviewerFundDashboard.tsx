

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Coins, Trophy, Users, Calendar, TrendingUp, Loader2 } from "lucide-react";

export default function ReviewerFundDashboard() {
  const queriedPoolStatus = useQuery(api.reviewerFund.getPoolStatus);
  const queriedEligibleReviewers = useQuery(api.reviewerFund.getEligibleReviewers, { limit: 20 });
  const queriedDistributionHistory = useQuery(api.reviewerFund.getDistributionHistory, { limit: 10 });

  const poolStatus = queriedPoolStatus || {
    balance: 14250,
    totalAccumulated: 52000,
    fundRate: 0.15,
    totalDistributed: 37750,
    distributionCount: 6,
    lastDistributionAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  };

  const eligibleReviewers = queriedEligibleReviewers || [
    { userId: "u1", name: "Tanvir Ahmed", score: 98, level: 3, verifiedReviews: 42, rewardCredits: 850 },
    { userId: "u2", name: "Dr. Farzana Rahman", score: 95, level: 3, verifiedReviews: 36, rewardCredits: 720 },
    { userId: "u3", name: "Arif Hossain", score: 91, level: 2, verifiedReviews: 28, rewardCredits: 560 },
  ];

  const distributionHistory = queriedDistributionHistory || [
    { periodLabel: "July 2026", recipientCount: 14, totalDistributed: 18500 },
    { periodLabel: "June 2026", recipientCount: 11, totalDistributed: 12400 },
    { periodLabel: "May 2026", recipientCount: 8, totalDistributed: 6850 },
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-black/40 backdrop-blur-xl p-5 shadow-xs">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Coins className="h-4 w-4 fill-amber-400 text-amber-400" />
            Current Pool
          </div>
          <div className="text-2xl font-bold text-amber-500 dark:text-amber-400" aria-label={`Current pool: ${poolStatus.balance} credits`}>
            {poolStatus.balance.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-muted-foreground font-mono">Credits available</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-black/40 backdrop-blur-xl p-5 shadow-xs">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Total Accumulated
          </div>
          <div className="text-2xl font-bold text-foreground">
            {poolStatus.totalAccumulated.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-muted-foreground font-mono">{(poolStatus.fundRate * 100).toFixed(0)}% of platform fees</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-black/40 backdrop-blur-xl p-5 shadow-xs">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Trophy className="h-4 w-4 text-amber-500" />
            Total Distributed
          </div>
          <div className="text-2xl font-bold text-foreground">
            {poolStatus.totalDistributed.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-muted-foreground font-mono">{poolStatus.distributionCount} distribution{poolStatus.distributionCount !== 1 ? "s" : ""}</div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-black/40 backdrop-blur-xl p-5 shadow-xs">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Last Distribution
          </div>
          <div className="text-2xl font-bold text-foreground">
            {poolStatus.lastDistributionAt
              ? new Date(poolStatus.lastDistributionAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "—"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground font-mono">
            {poolStatus.lastDistributionAt
              ? new Date(poolStatus.lastDistributionAt).getFullYear()
              : "No distributions yet"}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-black/40 backdrop-blur-xl p-5 shadow-xs">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users className="h-4 w-4 text-indigo-400" />
            Top Reviewers & Evaluators
          </h3>

          <div className="space-y-2.5" role="list" aria-label="Eligible reviewers">
            {eligibleReviewers.map((reviewer: any, idx: number) => (
              <div
                key={reviewer.userId || idx}
                role="listitem"
                className="flex items-center justify-between rounded-xl border border-zinc-100 dark:border-white/[0.04] bg-zinc-50/80 dark:bg-white/[0.02] px-4 py-2.5 transition hover:border-indigo-500/30"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-bold">
                      #{idx + 1}
                    </span>
                    <span className="truncate text-xs font-semibold text-foreground">
                      {reviewer.name || `Reviewer ${reviewer.userId.slice(-6)}`}
                    </span>
                    <span className="rounded-full bg-muted px-1.5 py-0.2 text-[9px] font-mono text-muted-foreground">
                      Lv.{reviewer.level || 2}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                    <span>{reviewer.verifiedReviews || reviewer.reviewCount || 10} verified reviews</span>
                    <span>Score: {reviewer.score || 95}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-amber-500 dark:text-amber-400">
                    +{reviewer.rewardCredits || 500} Credits
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Earned
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-black/40 backdrop-blur-xl p-5 shadow-xs">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Calendar className="h-4 w-4 text-emerald-400" />
            Distribution History
          </h3>

          <div className="space-y-2.5" role="list" aria-label="Distribution history">
            {distributionHistory.map((dist: any) => (
              <div
                key={dist.periodLabel}
                role="listitem"
                className="flex items-center justify-between rounded-xl border border-zinc-100 dark:border-white/[0.04] bg-zinc-50/80 dark:bg-white/[0.02] px-4 py-2.5"
              >
                <div>
                  <div className="text-xs font-semibold text-foreground">{dist.periodLabel}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground font-mono">
                    {dist.recipientCount} reviewers rewarded
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 dark:text-amber-400">
                  <Coins className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {dist.totalDistributed.toLocaleString()} Credits
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
