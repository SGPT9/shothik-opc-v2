"use client";

import React, { useState } from "react";
import {
  Users,
  Award,
  Wallet,
  Copy,
  Check,
  Share2,
  TrendingUp,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import {
  CampusAmbassadorService,
  CampusAmbassador,
  CampusCode,
  CAMPUS_NAMES,
} from "@/lib/marketing/campus-ambassador-service";

interface CampusAmbassadorHubProps {
  initialAmbassadorCode?: string;
  className?: string;
}

export function CampusAmbassadorHub({
  initialAmbassadorCode = "DU_RAHIM_2026",
  className = "",
}: CampusAmbassadorHubProps) {
  const [ambassador, setAmbassador] = useState<CampusAmbassador | undefined>(() =>
    CampusAmbassadorService.getAmbassadorByCode(initialAmbassadorCode)
  );
  const [copied, setCopied] = useState(false);
  const [leaderboard] = useState(() => CampusAmbassadorService.getCampusLeaderboard());
  const payoutSchedule = CampusAmbassadorService.getNextPayoutSchedule();

  const referralUrl = `https://shothikgpt.com/?ref=${ambassador?.referralCode || "DU_RAHIM_2026"}`;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hey! Use my Shothik AI ambassador code *${ambassador?.referralCode}* to get 10 free bonus credits for research, thesis formatting, and slides assembly!\n\nLink: ${referralUrl}`
    );
    if (typeof window !== "undefined") {
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    }
  };

  return (
    <div className={`space-y-6 max-w-5xl mx-auto p-4 md:p-6 text-foreground ${className}`}>
      {/* ── 1. Ambassador Profile Banner ── */}
      <div className="relative overflow-hidden rounded-3xl border border-brand/25 bg-gradient-to-r from-brand/15 via-background to-secondary/30 p-6 md:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-brand/20 border border-brand/35 text-xs font-mono font-bold text-brand uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                {CAMPUS_NAMES[ambassador?.campus || "DU"]}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-mono font-semibold text-amber-400">
                🌟 {ambassador?.tier === "campus_lead" ? "Campus Lead Ambassador" : "Ambassador"}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              {ambassador?.name || "Campus Ambassador"}
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Refer classmates to Shothik AI Student Packs. Classmates get <strong>10 bonus credits</strong> and you earn <strong>৳20–৳50 cash commission</strong> sent to your bKash wallet.
            </p>
          </div>

          {/* Quick Referral Code Box */}
          <div className="bg-popover/80 border border-border/80 p-4 rounded-2xl space-y-2 min-w-[260px] shadow-lg">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold block">
              Your Referral Code
            </span>
            <div className="flex items-center justify-between bg-muted/60 px-3 py-2 rounded-xl border border-border/60 font-mono font-bold text-base text-brand">
              <span>{ambassador?.referralCode || "DU_RAHIM_2026"}</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1 text-muted-foreground hover:text-foreground transition cursor-pointer"
                title="Copy referral link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-1.5 rounded-xl bg-brand text-brand-foreground text-xs font-semibold hover:opacity-90 transition cursor-pointer text-center"
              >
                {copied ? "Copied Link!" : "Copy Link"}
              </button>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="py-1.5 px-3 rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-600/25 transition cursor-pointer flex items-center gap-1"
                title="Share to WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Performance Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Referrals */}
        <div className="p-5 rounded-2xl border border-border/60 bg-popover/60 backdrop-blur-md shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Classmates</span>
            <Users className="w-4 h-4 text-brand" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {ambassador?.totalReferrals || 0}
          </div>
          <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +18 this month
          </span>
        </div>

        {/* Pending bKash Commission */}
        <div className="p-5 rounded-2xl border border-border/60 bg-popover/60 backdrop-blur-md shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Pending Commission</span>
            <Wallet className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            ৳{ambassador?.pendingCommissionBdt.toLocaleString() || 0}
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            Wallet: {ambassador?.bkashNumber || "017XXXXXXXX"}
          </span>
        </div>

        {/* Lifetime Earnings */}
        <div className="p-5 rounded-2xl border border-border/60 bg-popover/60 backdrop-blur-md shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Lifetime Payouts</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            ৳{((ambassador?.paidCommissionBdt || 0) + (ambassador?.pendingCommissionBdt || 0)).toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            100% bKash Direct Settlement
          </span>
        </div>

        {/* Next Payout Date */}
        <div className="p-5 rounded-2xl border border-border/60 bg-popover/60 backdrop-blur-md shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Next Payout Cycle</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            {payoutSchedule.formattedDate}
          </div>
          <span className="text-[11px] text-sky-400 font-medium">
            In {payoutSchedule.daysRemaining} days (Bi-monthly 1st & 15th)
          </span>
        </div>
      </div>

      {/* ── 3. Inter-Campus Live Leaderboard ── */}
      <div className="rounded-3xl border border-border/60 bg-popover/60 backdrop-blur-md p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Inter-Campus Ambassador Leaderboard
            </h2>
            <p className="text-xs text-muted-foreground">
              Live ranking of university ambassador networks across Bangladesh.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-brand/10 border border-brand/25 text-brand font-semibold">
            Spring 2026 Semester
          </span>
        </div>

        <div className="divide-y divide-border/40">
          {leaderboard.map((item, idx) => (
            <div
              key={item.campus}
              className="flex items-center justify-between py-3 px-2 hover:bg-muted/40 rounded-xl transition"
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                  idx === 0 ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/30" :
                  idx === 1 ? "bg-slate-300 text-zinc-950" :
                  idx === 2 ? "bg-amber-700 text-white" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {idx + 1}
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <span>{item.campusName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-semibold">
                      {item.campus}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.activeAmbassadors} active student ambassadors
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold font-mono text-foreground">
                  {item.totalReferrals} referrals
                </div>
                <span className="text-xs font-mono text-emerald-500 font-semibold">
                  ৳{item.totalEarningsBdt.toLocaleString()} paid out
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
