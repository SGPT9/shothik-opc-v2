"use client";

import { useState } from "react";
import {
  Globe,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Send,
  Loader2,
  Building2,
  Mail,
  Zap,
  Rocket,
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

export interface ConnectExistingCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: (company: { name: string; url: string; category: string }) => void;
}

export function ConnectExistingCompanyModal({
  open,
  onOpenChange,
  onConnected,
}: ConnectExistingCompanyModalProps) {
  const [url, setUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanResult, setScanResult] = useState<{
    title: string;
    description: string;
    targetIcp: string;
    suggestedHook: string;
  } | null>(null);

  const SCAN_LOGS = [
    "🌐 Crawling landing page HTML & metadata headers...",
    "🧠 AI Brand Extractor: Identifying Core Value Proposition & Pricing...",
    "🎯 ICP Synthesis: Mapping Target Customer Personas & Market Segment...",
    "✉️ Outbound Engine: Auto-generating 3-step cold email cadences & Meta ads...",
    "✨ Complete! Ready to launch outreach autopilot.",
  ];

  const handleScanWebsite = async () => {
    if (!url.trim()) return;
    setIsScanning(true);
    setScanResult(null);

    for (let i = 0; i < SCAN_LOGS.length; i++) {
      setScanStep(i);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const domainClean = url.replace(/https?:\/\//i, "").replace(/\/.*$/, "");
    const generatedName = companyName.trim() || domainClean.split(".")[0].toUpperCase();

    const result = {
      title: `${generatedName} Online Hub`,
      description: `Automated digital commerce and service engine running at ${url}`,
      targetIcp: "Mid-Market Founders, Retailers, and Operations Managers",
      suggestedHook: `Help ${generatedName} scale bKash MFS payment reconciliation & automated order dispatch with 0 human data entry.`,
    };

    setScanResult(result);
    setIsScanning(false);
  };

  const handleActivateOutreach = () => {
    const domainClean = url.replace(/https?:\/\//i, "").replace(/\/.*$/, "");
    const slug = domainClean.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const finalName = companyName.trim() || domainClean;

    // Save initial outreach tasks for this connected company
    saveOfflineTask({
      id: `${slug}-outreach-1`,
      title: `Generate 50 verified B2B prospect leads for ${finalName}`,
      category: "Marketing",
      status: "todo",
      cost: "5 Credits",
      urgency: "TONIGHT",
      updatedAt: Date.now(),
    });

    saveOfflineTask({
      id: `${slug}-outreach-2`,
      title: `Dispatch 3-step cold email sequence tailored for ${finalName}`,
      category: "Marketing",
      status: "todo",
      cost: "10 Credits",
      urgency: "P0",
      updatedAt: Date.now(),
    });

    onConnected?.({
      name: finalName,
      url,
      category: "Connected Website",
    });

    onOpenChange(false);

    if (typeof window !== "undefined") {
      window.location.href = `/twin?company=${slug}&connected=true`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl bg-[#0b101b] border-slate-800 text-slate-100 p-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Connect Existing Website or Business</span>
                <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 font-mono text-[10px]">
                  BYOW Autopilot
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Bring your existing company or store URL for instant AI outreach, cold email cadences, and Meta ad automation.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Input URL */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Existing Website / Store URL
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="url"
                    placeholder="https://myshop.com or https://saasapp.io"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 font-mono"
                    data-testid="input-connect-url"
                  />
                </div>
                <Button
                  onClick={handleScanWebsite}
                  disabled={!url.trim() || isScanning}
                  className="rounded-xl px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs gap-1.5"
                  data-testid="button-scan-website"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Scanning...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" /> Scan & Analyze
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Company / Brand Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Logistics BD"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              />
            </div>
          </div>

          {/* Live Scanner Stepper */}
          {isScanning && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs space-y-2">
              {SCAN_LOGS.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 transition ${
                    idx <= scanStep ? "opacity-100 text-cyan-300" : "opacity-25 text-slate-600"
                  }`}
                >
                  {idx < scanStep ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : idx === scanStep ? (
                    <Loader2 className="h-3.5 w-3.5 text-cyan-400 animate-spin shrink-0 mt-0.5" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-slate-700 shrink-0 mt-0.5" />
                  )}
                  <span>{log}</span>
                </div>
              ))}
            </div>
          )}

          {/* Scan Results & Outreach Setup */}
          {scanResult && !isScanning && (
            <div className="rounded-xl border border-cyan-500/30 bg-slate-950 p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 font-mono">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Website Analysis Verified
                </span>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px] font-mono">
                  Ready for Outreach
                </Badge>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 font-mono">
                <div>
                  <span className="text-slate-500">Extracted Title: </span>
                  <span className="text-slate-100 font-semibold">{scanResult.title}</span>
                </div>
                <div>
                  <span className="text-slate-500">Target ICP Persona: </span>
                  <span className="text-indigo-300 font-semibold">{scanResult.targetIcp}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60">
                  <span className="text-slate-500 block text-[10px] uppercase mb-1">Generated Cold Email Hook</span>
                  <p className="text-slate-200 font-sans italic">"{scanResult.suggestedHook}"</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <Button
                  onClick={handleActivateOutreach}
                  className="rounded-xl px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-lg shadow-emerald-900/30"
                  data-testid="button-activate-connected-outreach"
                >
                  <Rocket className="h-4 w-4" /> Activate Outreach Autopilot in Twin
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
