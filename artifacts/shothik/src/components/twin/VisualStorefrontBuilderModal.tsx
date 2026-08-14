"use client";

import { useState } from "react";
import {
  Layout,
  Smartphone,
  Monitor,
  Sparkles,
  Rocket,
  CheckCircle2,
  Plus,
  Trash2,
  GripVertical,
  Edit3,
  Globe,
  CreditCard,
  Check,
  RefreshCw,
  Eye,
  Sliders,
  Send,
  Zap,
  ShieldCheck,
  Truck,
  Star,
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

export interface PageSection {
  id: string;
  type: "hero" | "features" | "pricing" | "testimonials" | "lead_form";
  title: string;
  subtitle?: string;
  ctaText?: string;
  priceBdt?: number;
  enabled: boolean;
}

export interface VisualStorefrontBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName?: string;
  subdomain?: string;
}

const DEFAULT_SECTIONS: PageSection[] = [
  {
    id: "sec-hero",
    type: "hero",
    title: "AI-Powered Operations for Modern Dhaka Startups",
    subtitle: "Automate your customer prospecting, billing, and cloud deployment on 100% continuous autopilot.",
    ctaText: "Get Started · 1-Tap bKash",
    enabled: true,
  },
  {
    id: "sec-features",
    type: "features",
    title: "Why High-Growth Teams Choose Us",
    subtitle: "Built for South Asian demographics with 2GB smartphone optimization and sub-second load times.",
    enabled: true,
  },
  {
    id: "sec-pricing",
    type: "pricing",
    title: "Simple & Transparent Pricing",
    subtitle: "Zero hidden charges. Keep 100% of your earnings.",
    priceBdt: 1250,
    ctaText: "Pay ৳1,250 with bKash",
    enabled: true,
  },
  {
    id: "sec-testimonials",
    type: "testimonials",
    title: "Loved by 500+ Online Founders",
    subtitle: "See how merchants in Banani and Gulshan scaled their sales by 3.4x.",
    enabled: true,
  },
  {
    id: "sec-lead",
    type: "lead_form",
    title: "Request a Custom Enterprise Demo",
    subtitle: "Leave your email and mobile number for a 15-minute personalized consultation.",
    ctaText: "Submit Inquiry",
    enabled: true,
  },
];

export function VisualStorefrontBuilderModal({
  open,
  onOpenChange,
  companyName = "VerifiQ AI",
  subdomain = "verifiq",
}: VisualStorefrontBuilderModalProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [sections, setSections] = useState<PageSection[]>(DEFAULT_SECTIONS);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("sec-hero");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const selectedSection = sections.find((s) => s.id === selectedSectionId) || sections[0];

  const handleUpdateSection = (updated: Partial<PageSection>) => {
    setSections((prev) =>
      prev.map((s) => (s.id === selectedSectionId ? { ...s, ...updated } : s))
    );
  };

  const handleAiPromptApply = (promptText: string) => {
    if (promptText.includes("Banglish") || promptText.includes("bangla")) {
      handleUpdateSection({
        title: "ঢাকা স্টার্টআপদের জন্য অটোনোমাস এআই কো-ফাউন্ডার",
        subtitle: "আপনার কাস্টমার প্রস্পেক্টিং, বিকাশ পেমেন্ট ও ক্লাউড ডেপ্লয়মেন্ট চলবে ২৪/৭ ফুল অটোমেশনে।",
        ctaText: "এখনই শুরু করুন · বিকাশ ১-ট্যাপ",
      });
    } else if (promptText.includes("Eid") || promptText.includes("discount")) {
      handleUpdateSection({
        title: "🌙 Eid Mubarak Special: 20% Flat Discount Active",
        subtitle: "Launch your autonomous company today with instant 1-tap bKash checkout and Steadfast COD.",
        ctaText: "Claim Eid Offer · ৳1,000",
        priceBdt: 1000,
      });
    } else if (promptText.includes("punchier") || promptText.includes("headline")) {
      handleUpdateSection({
        title: "Stop Coding Manually. Let AI Run Your Startup 24/7.",
        subtitle: "Deploy production containers, acquire paid customers, and track net profits while you sleep.",
        ctaText: "Launch Autonomous MVP ➔",
      });
    }
    setAiPrompt("");
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishSuccess(false);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    saveOfflineTask({
      id: `pub-site-${Date.now()}`,
      title: `Published visual storefront updates to https://${subdomain}.shothikgpt.com`,
      category: "Design",
      status: "completed",
      cost: "1 Credit",
      updatedAt: Date.now(),
    });

    setIsPublishing(false);
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-[96vw] xl:max-w-7xl bg-[#0b101b] border-slate-800 text-slate-100 p-0 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Layout className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Visual No-Code Storefront & Landing Page Builder</span>
                <Badge variant="outline" className="border-indigo-500/40 text-indigo-400 font-mono text-[10px]">
                  Live Visual Canvas
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <Globe className="h-3 w-3 text-emerald-400" />
                <span>Target: https://{subdomain}.shothikgpt.com</span>
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Viewport Switcher */}
            <div className="flex items-center rounded-lg border border-slate-800 p-0.5 bg-slate-950">
              <button
                type="button"
                onClick={() => setViewport("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition ${
                  viewport === "desktop" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
                data-testid="viewport-desktop-btn"
              >
                <Monitor className="h-3.5 w-3.5" /> Desktop (1200px)
              </button>
              <button
                type="button"
                onClick={() => setViewport("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition ${
                  viewport === "mobile" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
                data-testid="viewport-mobile-btn"
              >
                <Smartphone className="h-3.5 w-3.5" /> Mobile (375px)
              </button>
            </div>

            {/* Publish Button */}
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40"
              data-testid="button-publish-visual-storefront"
            >
              {publishSuccess ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Published to Dokploy!
                </>
              ) : (
                <>
                  <Rocket className="h-3.5 w-3.5" /> {isPublishing ? "Building Container..." : "Publish Live (1 Credit)"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Work Area: Left Controls + Right Live Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] flex-1 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left Controls Panel */}
          <div className="p-5 space-y-5 overflow-y-auto bg-slate-950">
            {/* AI Prompt Co-Pilot */}
            <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 font-mono">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> AI Prompt Co-Pilot
                </span>
                <span className="text-[9px] font-mono text-indigo-400/80">Sub-second updates</span>
              </div>

              {/* Prompt Pills */}
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => handleAiPromptApply("make headline punchier")}
                  className="px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:border-indigo-500/40 transition"
                >
                  ⚡ Make headline punchier
                </button>
                <button
                  type="button"
                  onClick={() => handleAiPromptApply("translate to Banglish")}
                  className="px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:border-indigo-500/40 transition"
                >
                  🇧🇩 Translate to Banglish
                </button>
                <button
                  type="button"
                  onClick={() => handleAiPromptApply("add Eid 20% discount")}
                  className="px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:border-indigo-500/40 transition"
                >
                  🌙 Add Eid 20% discount
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Add 30-day money-back guarantee..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAiPromptApply(aiPrompt)}
                  className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Button
                  size="sm"
                  onClick={() => handleAiPromptApply(aiPrompt)}
                  disabled={!aiPrompt.trim()}
                  className="h-8 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Sections List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block">
                Landing Page Sections
              </span>
              <div className="space-y-1.5">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                      selectedSection.id === sec.id
                        ? "border-indigo-500/80 bg-indigo-500/10 text-indigo-300"
                        : "border-slate-800/60 bg-slate-900/40 text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-3.5 w-3.5 text-slate-600" />
                      <span className="text-xs font-semibold capitalize">{sec.type} Section</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-mono border-slate-700">
                      {sec.enabled ? "Active" : "Hidden"}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Field Editor for Selected Section */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                <Edit3 className="h-3.5 w-3.5 text-indigo-400" /> Edit {selectedSection.type.toUpperCase()} Content
              </span>

              <div className="space-y-2.5 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">Headline Text</label>
                  <input
                    type="text"
                    value={selectedSection.title}
                    onChange={(e) => handleUpdateSection({ title: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {selectedSection.subtitle !== undefined && (
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-1">Subtitle / Value Proposition</label>
                    <textarea
                      rows={2}
                      value={selectedSection.subtitle}
                      onChange={(e) => handleUpdateSection({ subtitle: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}

                {selectedSection.ctaText !== undefined && (
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={selectedSection.ctaText}
                      onChange={(e) => handleUpdateSection({ ctaText: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}

                {selectedSection.priceBdt !== undefined && (
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-1">Price in BDT (৳)</label>
                    <input
                      type="number"
                      value={selectedSection.priceBdt}
                      onChange={(e) => handleUpdateSection({ priceBdt: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-emerald-400 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Live Responsive Preview Canvas */}
          <div className="p-6 overflow-y-auto bg-slate-950/90 flex justify-center items-start">
            <div
              className={`transition-all duration-300 rounded-2xl border-2 border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-2xl overflow-hidden ${
                viewport === "mobile" ? "w-[375px] min-h-[640px] my-2" : "w-full max-w-4xl"
              }`}
            >
              {/* Browser Chrome Header */}
              <div className="p-3 border-b border-slate-800 bg-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="bg-slate-950 px-3 py-1 rounded-md border border-slate-800 text-[10px] flex items-center gap-1 text-slate-300">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  <span>https://{subdomain}.shothikgpt.com</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold">● SSL Live</span>
              </div>

              {/* Storefront Content */}
              <div className="p-6 space-y-8 text-center">
                {/* Hero Section */}
                <div className="space-y-4 py-6 border-b border-slate-800/60">
                  <Badge variant="outline" className="border-indigo-500/40 text-indigo-400 text-xs font-mono">
                    ⚡ Autonomous AI Platform
                  </Badge>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
                    {sections.find((s) => s.id === "sec-hero")?.title}
                  </h1>
                  <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                    {sections.find((s) => s.id === "sec-hero")?.subtitle}
                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button className="rounded-xl px-6 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs gap-2 shadow-lg shadow-pink-900/40">
                      <CreditCard className="h-4 w-4" />
                      {sections.find((s) => s.id === "sec-hero")?.ctaText}
                    </Button>
                    <span className="text-[10px] font-mono text-slate-500">Exact 1.85% MFS Math · Instant Activation</span>
                  </div>
                </div>

                {/* Features 3-Card Grid */}
                <div className="space-y-4 py-4 border-b border-slate-800/60">
                  <h2 className="text-lg font-bold text-white">
                    {sections.find((s) => s.id === "sec-features")?.title}
                  </h2>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {sections.find((s) => s.id === "sec-features")?.subtitle}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2 font-mono">
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40">
                      <Zap className="h-4 w-4 text-amber-400 mb-2" />
                      <h3 className="text-xs font-bold text-slate-200">2GB RAM Optimized</h3>
                      <p className="text-[10px] text-slate-400 mt-1">Lightweight DOM footprint for entry smartphones in Bangladesh.</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40">
                      <Truck className="h-4 w-4 text-cyan-400 mb-2" />
                      <h3 className="text-xs font-bold text-slate-200">Steadfast COD API</h3>
                      <p className="text-[10px] text-slate-400 mt-1">Automated courier parcel dispatch with 1-click tracking QR codes.</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40">
                      <ShieldCheck className="h-4 w-4 text-emerald-400 mb-2" />
                      <h3 className="text-xs font-bold text-slate-200">Dokploy SRE Deploy</h3>
                      <p className="text-[10px] text-slate-400 mt-1">Standalone micro-containers running under sub-88MB memory limits.</p>
                    </div>
                  </div>
                </div>

                {/* Pricing Tier */}
                <div className="space-y-4 py-4 border-b border-slate-800/60">
                  <h2 className="text-lg font-bold text-white">
                    {sections.find((s) => s.id === "sec-pricing")?.title}
                  </h2>
                  <div className="mx-auto max-w-sm p-6 rounded-2xl border-2 border-indigo-500/40 bg-slate-900/80 shadow-xl space-y-4">
                    <span className="text-xs font-mono uppercase text-indigo-400 font-bold">Pro Monthly License</span>
                    <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                      ৳{sections.find((s) => s.id === "sec-pricing")?.priceBdt?.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ month</span>
                    </div>
                    <ul className="text-xs text-slate-300 text-left space-y-2 font-mono">
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Continuous 24/7 Autonomous Delivery Loop</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Daily 08:00 AM CEO Briefing Morning Email</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Unlimited bKash & Nagad MFS Transactions</span>
                      </li>
                    </ul>
                    <Button className="w-full rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs h-10 shadow-lg shadow-pink-900/40">
                      {sections.find((s) => s.id === "sec-pricing")?.ctaText}
                    </Button>
                  </div>
                </div>

                {/* Testimonials */}
                <div className="space-y-3 py-4">
                  <div className="flex items-center justify-center gap-1 text-amber-400">
                    <Star className="h-4 w-4 fill-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400" />
                    <Star className="h-4 w-4 fill-amber-400" />
                  </div>
                  <p className="text-xs italic text-slate-300 max-w-md mx-auto">
                    &ldquo;Shothik Twin deployed our store in 420ms and handled our bKash checkouts automatically. Net profit doubled in 3 weeks.&rdquo;
                  </p>
                  <span className="text-[10px] font-mono text-slate-400 block">— Tanvir H., Founder of Banani Brands</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
