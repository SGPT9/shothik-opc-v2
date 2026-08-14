"use client";

import { useState } from "react";
import {
  Rocket,
  BookOpen,
  Sparkles,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Mail,
  Globe,
  Share2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Printer,
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

export interface CommercializeBookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manuscriptTitle?: string;
  wordCount?: number;
}

export function CommercializeBookModal({
  open,
  onOpenChange,
  manuscriptTitle = "Echoes of the River",
  wordCount = 45200,
}: CommercializeBookModalProps) {
  const [priceBdt, setPriceBdt] = useState(450);
  const [targetAudience, setTargetAudience] = useState("Fiction & Historical Book Lovers in South Asia");
  const [isDeploying, setIsDeploying] = useState(false);

  const slug = manuscriptTitle.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  const pageEstimate = Math.max(24, Math.ceil(wordCount / 250));

  const handleLaunchCommercialization = () => {
    setIsDeploying(true);

    // Seed 4 autonomous commercialization tasks in Twin
    saveOfflineTask({
      id: `${slug}-comm-1`,
      title: `Publish interactive landing page for "${manuscriptTitle}" with 1-Tap bKash payments`,
      category: "Code",
      status: "todo",
      cost: "5 Credits",
      urgency: "TONIGHT",
      updatedAt: Date.now(),
    });

    saveOfflineTask({
      id: `${slug}-comm-2`,
      title: `Execute 3-step cold email outreach to 50 literary book reviewers and podcast hosts`,
      category: "Marketing",
      status: "todo",
      cost: "10 Credits",
      urgency: "P0",
      updatedAt: Date.now(),
    });

    saveOfflineTask({
      id: `${slug}-comm-3`,
      title: `Configure Meta Ads campaign ($20/day) targeting avid book readers in Dhaka & Kolkata`,
      category: "Marketing",
      status: "todo",
      cost: "5 Credits",
      urgency: "P1",
      updatedAt: Date.now(),
    });

    saveOfflineTask({
      id: `${slug}-comm-4`,
      title: `Set up Steadfast COD parcel dispatch & Nilkhet POD physical preflight fulfillment`,
      category: "Research",
      status: "todo",
      cost: "5 Credits",
      urgency: "P1",
      updatedAt: Date.now(),
    });

    onOpenChange(false);

    if (typeof window !== "undefined") {
      window.location.href = `/twin?company=${slug}&source=writing-studio`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl bg-[#0b101b] border-slate-800 text-slate-100 p-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Commercialize with Autonomous Co-Founder</span>
                <Badge variant="outline" className="border-purple-500/40 text-purple-400 font-mono text-[10px]">
                  Dual-Creative Synergy
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                1-Click push your completed book manuscript to Twin to market, run ads, and sell on autopilot.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Manuscript Meta Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-bold text-slate-100">{manuscriptTitle}</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {wordCount.toLocaleString()} words · ~{pageEstimate} pages
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2 border-t border-slate-800/80">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Book Retail Price (BDT)</label>
                <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-100">
                  <span>৳</span>
                  <input
                    type="number"
                    value={priceBdt}
                    onChange={(e) => setPriceBdt(Number(e.target.value))}
                    className="ml-1 bg-transparent w-full outline-none font-bold text-emerald-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Subdomain Ingress</label>
                <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-300 truncate">
                  {slug}.polsia.app
                </div>
              </div>
            </div>
          </div>

          {/* Autonomous Channels Generated */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-200">
              Autonomous Growth Pipelines Generated for Twin:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex items-start gap-2.5">
                <Globe className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-semibold text-slate-200">1-Tap bKash Checkout Storefront</p>
                  <p className="text-[11px] text-slate-400">Pre-built landing page at https://{slug}.polsia.app</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-semibold text-slate-200">Cold Email Reviewer Outreach</p>
                  <p className="text-[11px] text-slate-400">3-Step pitch sequence to 50 book critics & podcasts</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex items-start gap-2.5">
                <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-semibold text-slate-200">Meta Ads Target Audience</p>
                  <p className="text-[11px] text-slate-400">Optimized ad copy for literary communities in South Asia</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex items-start gap-2.5">
                <Printer className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <p className="font-semibold text-slate-200">Steadfast COD & POD Preflight</p>
                  <p className="text-[11px] text-slate-400">300 DPI spine layout & cash on delivery logistics</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <Button
              onClick={handleLaunchCommercialization}
              disabled={isDeploying}
              className="rounded-xl px-6 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs gap-1.5 shadow-lg shadow-purple-900/30"
              data-testid="button-launch-commercialization"
            >
              <Rocket className="h-4 w-4" /> Launch Commercialization in Twin
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
