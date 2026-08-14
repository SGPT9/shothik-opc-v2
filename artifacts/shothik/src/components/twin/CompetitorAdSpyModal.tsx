"use client";

import { useState } from "react";
import {
  Search,
  Crosshair,
  TrendingUp,
  Globe,
  DollarSign,
  Zap,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Target,
  BarChart3,
  Layers,
  ArrowRight,
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

export interface CompetitorAd {
  id: string;
  headline: string;
  bodyCopy: string;
  cta: string;
  channel: "Meta (Facebook/Instagram)" | "Google Search" | "TikTok Ads";
  activeDays: number;
  estimatedDailySpend: string;
  creativeType: "Image Carousel" | "Short Video Reel" | "Search Ad";
  weaknessAngle: string;
}

export interface CompetitorProfile {
  domain: string;
  companyName: string;
  pricingStrategy: string;
  estimatedMonthlyAdSpend: string;
  topAudience: string;
  ads: CompetitorAd[];
}

export interface CompetitorAdSpyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName?: string;
}

const DEFAULT_PROFILE: CompetitorProfile = {
  domain: "competitor-shop.bd",
  companyName: "Rival Mart BD",
  pricingStrategy: "Premium (+25% above market, high delivery fee)",
  estimatedMonthlyAdSpend: "৳1,50,000 BDT (~$1,250 USD)",
  topAudience: "Dhaka & Chittagong urban professionals (Ages 22-38)",
  ads: [
    {
      id: "ad-1",
      headline: "Authentic Imported Skincare — 100% Genuine with Moneyback Guarantee",
      bodyCopy: "Stop using cheap duplicates. Get certified Korean & UK skincare delivered to your doorstep in 48 hours across Dhaka.",
      cta: "Shop Now (COD Available)",
      channel: "Meta (Facebook/Instagram)",
      activeDays: 24,
      estimatedDailySpend: "৳3,500/day",
      creativeType: "Short Video Reel",
      weaknessAngle: "High return rates due to delayed delivery outside Dhaka.",
    },
    {
      id: "ad-2",
      headline: "Eid Mega Sale — Up to 40% Off on Premium Fashion Bundles",
      bodyCopy: "Exclusive cotton panjabi and salwar kameez collections for Eid. Order before stock runs out.",
      cta: "Order on WhatsApp",
      channel: "Meta (Facebook/Instagram)",
      activeDays: 14,
      estimatedDailySpend: "৳5,000/day",
      creativeType: "Image Carousel",
      weaknessAngle: "No instant 1-tap bKash checkout — requires manual WhatsApp bank transfers.",
    },
    {
      id: "ad-3",
      headline: "Fastest Grocery & Organic Snacks Delivery in Gulshan/Banani",
      bodyCopy: "Fresh farm produce delivered in under 60 minutes. Zero delivery fee on orders over ৳1,500.",
      cta: "Order Now",
      channel: "Google Search",
      activeDays: 45,
      estimatedDailySpend: "৳2,000/day",
      creativeType: "Search Ad",
      weaknessAngle: "Limited strictly to Gulshan & Banani — excludes Dhanmondi, Uttara, and Mirpur.",
    },
  ],
};

export function CompetitorAdSpyModal({
  open,
  onOpenChange,
  companyName = "VerifiQ AI",
}: CompetitorAdSpyModalProps) {
  const [targetUrl, setTargetUrl] = useState("https://rivalmartbd.com");
  const [isScanning, setIsScanning] = useState(false);
  const [profile, setProfile] = useState<CompetitorProfile | null>(DEFAULT_PROFILE);
  const [generatedCounterAngle, setGeneratedCounterAngle] = useState<string | null>(null);

  const handleScanCompetitor = () => {
    if (!targetUrl) return;
    setIsScanning(true);
    setGeneratedCounterAngle(null);

    setTimeout(() => {
      setIsScanning(false);
      setProfile({
        ...DEFAULT_PROFILE,
        domain: targetUrl.replace(/https?:\/\//, "").split("/")[0] || "scanned-rival.com",
        companyName: "Scanned Rival Store",
      });

      saveOfflineTask({
        id: `spy-task-${Date.now()}`,
        title: `Competitor Ad Spy scan completed for ${targetUrl}`,
        category: "Research",
        status: "completed",
        cost: "3 Credits",
        updatedAt: Date.now(),
      });
    }, 800);
  };

  const handleGenerateCounterCampaign = (ad: CompetitorAd) => {
    setGeneratedCounterAngle(
      `⚡ Counter-Strategy for ${companyName}:\n\n` +
      `• Winning Hook: "Why wait 48 hours and pay manual bKash charges? Get instant 1-Tap bKash payment + Same-day Steadfast dispatch across ALL 64 districts."\n` +
      `• Target Audience: Retarget users engaging with '${ad.creativeType}' in Dhaka, Chittagong, and Sylhet.\n` +
      `• Recommended Budget: ৳1,500/day Meta Ad campaign to siphon 30% of rival traffic.`
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] xl:max-w-5xl bg-[#0b101b] border-slate-800 text-slate-100 p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Crosshair className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Competitor Ad Spy & Intelligence Scanner</span>
                <Badge variant="outline" className="border-amber-500/40 text-amber-400 font-mono text-[10px]">
                  BYOW / User 2
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Reverse-engineer competitor Meta/Google ads, copy hooks, daily spend, and exploit weaknesses for {companyName}.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Search URL Input Toolbar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="relative flex-1 w-full font-mono">
            <Globe className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="Enter competitor website or Facebook page URL (e.g. https://rivalshop.bd)"
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-800 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <Button
            size="sm"
            onClick={handleScanCompetitor}
            disabled={isScanning}
            className="w-full sm:w-auto h-8 gap-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs font-mono"
            data-testid="button-scan-competitor"
          >
            {isScanning ? (
              <>
                <Sparkles className="h-3.5 w-3.5 animate-spin" /> Scanning Ad Library...
              </>
            ) : (
              <>
                <Search className="h-3.5 w-3.5" /> Spy Competitor (3 Credits)
              </>
            )}
          </Button>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {profile && (
            <>
              {/* Executive Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
                  <span className="text-[10px] text-slate-400 uppercase">Target Domain</span>
                  <p className="text-xs font-bold text-amber-400 mt-1 truncate">{profile.domain}</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
                  <span className="text-[10px] text-slate-400 uppercase">Estimated Monthly Spend</span>
                  <p className="text-xs font-bold text-slate-200 mt-1">{profile.estimatedMonthlyAdSpend}</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
                  <span className="text-[10px] text-slate-400 uppercase">Pricing Strategy</span>
                  <p className="text-[11px] font-semibold text-emerald-400 mt-1 truncate">{profile.pricingStrategy}</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
                  <span className="text-[10px] text-slate-400 uppercase">Core Demography</span>
                  <p className="text-[11px] font-semibold text-cyan-300 mt-1 truncate">{profile.topAudience}</p>
                </div>
              </div>

              {/* Counter Campaign Box (if generated) */}
              {generatedCounterAngle && (
                <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs font-mono text-amber-200 whitespace-pre-line leading-relaxed animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1.5">
                    <Sparkles className="h-4 w-4" />
                    <span>AI Counter-Strike Ad Angle Generated</span>
                  </div>
                  {generatedCounterAngle}
                </div>
              )}

              {/* Active Ads Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-amber-400" /> Active Competitor Ads ({profile.ads.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
                  {profile.ads.map((ad) => (
                    <div
                      key={ad.id}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-300">
                            {ad.channel}
                          </Badge>
                          <span className="text-[10px] text-slate-400">{ad.activeDays} days active</span>
                        </div>

                        <p className="text-xs font-bold text-slate-100 leading-snug">
                          "{ad.headline}"
                        </p>
                        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                          {ad.bodyCopy}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-800 text-[10px]">
                        <div className="flex justify-between text-slate-400">
                          <span>Est. Spend:</span>
                          <span className="text-slate-200 font-bold">{ad.estimatedDailySpend}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-300">
                          <span className="font-bold text-rose-400 block mb-0.5">Exploitable Weakness:</span>
                          {ad.weaknessAngle}
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleGenerateCounterCampaign(ad)}
                          className="w-full h-7 text-[10px] gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg"
                        >
                          <Zap className="h-3 w-3" /> Counter-Strike Angle
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
