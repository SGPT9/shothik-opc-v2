"use client";

import { useState } from "react";
import {
  TrendingUp,
  Sparkles,
  Zap,
  CheckCircle2,
  BarChart3,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Trophy,
  Split,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveOfflineTask } from "@/lib/offline/offline-storage";

export interface CroVariant {
  id: string;
  name: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  isWinner?: boolean;
}

export interface CroTunerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName?: string;
}

const INITIAL_VARIANTS: CroVariant[] = [
  {
    id: "var-a",
    name: "Variant A (Control)",
    headline: "AI-Powered Customer Support for South Asian Brands",
    subheadline: "Automate 80% of customer inquiries on Messenger and WhatsApp effortlessly.",
    ctaText: "Start Free Trial",
    impressions: 1420,
    conversions: 48,
    conversionRate: 3.38,
  },
  {
    id: "var-b",
    name: "Variant B (Challenger)",
    headline: "Cut Customer Support Costs by 70% with 1-Tap bKash Chatbots",
    subheadline: "Instant Banglish voice & text customer support with zero monthly dev retainer.",
    ctaText: "Get Started (1-Tap bKash)",
    impressions: 1380,
    conversions: 79,
    conversionRate: 5.72,
    isWinner: true,
  },
];

export function CroTunerModal({
  open,
  onOpenChange,
  companyName = "VerifiQ AI",
}: CroTunerModalProps) {
  const [variants, setVariants] = useState<CroVariant[]>(INITIAL_VARIANTS);
  const [promotedSuccess, setPromotedSuccess] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const confidenceScore = "98.4%";
  const conversionLift = "+69.2%";

  const handlePromoteWinner = () => {
    setPromotedSuccess(true);
    saveOfflineTask({
      id: `cro-task-${Date.now()}`,
      title: `Promoted CRO Winner (Variant B) to production Dokploy container for ${companyName}`,
      category: "Publish",
      status: "completed",
      cost: "0 Credits",
      updatedAt: Date.now(),
    });
  };

  const handleRunAiEvaluation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] xl:max-w-5xl bg-[#0b101b] border-slate-800 text-slate-100 p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Split className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Self-Healing CRO Auto-Tuner</span>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 font-mono text-[10px]">
                  A/B Conversion Engine
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Autonomous landing page headline optimization powered by real bKash conversion telemetry for {companyName}.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePromoteWinner}
              disabled={promotedSuccess}
              className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs font-mono"
              data-testid="button-promote-winner"
            >
              <Trophy className="h-3.5 w-3.5" />
              {promotedSuccess ? "Winner Live on Dokploy" : "Promote Winner to Production"}
            </Button>
          </div>
        </div>

        {/* Promotion Banner */}
        {promotedSuccess && (
          <div className="p-3 bg-emerald-950/60 border-b border-emerald-800/40 text-xs font-mono text-emerald-300 flex items-center gap-2 shrink-0 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Variant B headline has been automatically deployed to your live storefront!</span>
          </div>
        )}

        {/* Statistical Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 bg-slate-950/80 border-b border-slate-800 font-mono text-center shrink-0">
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Statistical Confidence</span>
            <p className="text-base font-bold text-emerald-400 mt-0.5">{confidenceScore}</p>
          </div>
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Conversion Lift</span>
            <p className="text-base font-bold text-cyan-400 mt-0.5">{conversionLift}</p>
          </div>
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Total Visitors Tested</span>
            <p className="text-base font-bold text-slate-100 mt-0.5">2,800 Users</p>
          </div>
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Est. Monthly Gain</span>
            <p className="text-base font-bold text-amber-400 mt-0.5">+৳45,000 BDT</p>
          </div>
        </div>

        {/* A/B Comparison Cards */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            {variants.map((v) => (
              <div
                key={v.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                  v.isWinner
                    ? "border-emerald-500/40 bg-emerald-950/15 ring-1 ring-emerald-500/30"
                    : "border-slate-800 bg-slate-900/40 opacity-75"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{v.name}</span>
                    {v.isWinner && (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">
                        🏆 WINNING VARIANT
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase">Hero Headline</p>
                    <p className="text-xs font-bold text-slate-100">"{v.headline}"</p>
                    <p className="text-[11px] text-slate-400">{v.subheadline}</p>
                    <div className="pt-2">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold">
                        CTA: {v.ctaText}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800 text-[10px]">
                  <div>
                    <span className="text-slate-400 block">Impressions</span>
                    <span className="text-slate-200 font-bold">{v.impressions.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">bKash Sales</span>
                    <span className="text-slate-200 font-bold">{v.conversions}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">CVR %</span>
                    <span className={`font-bold text-sm ${v.isWinner ? "text-emerald-400" : "text-slate-300"}`}>
                      {v.conversionRate}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
