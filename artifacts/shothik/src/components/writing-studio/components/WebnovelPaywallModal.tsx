import React, { useState, useEffect } from "react";
import {
  X,
  Coins,
  Scissors,
  Lock,
  Unlock,
  Sparkles,
  TrendingUp,
  DollarSign,
  Check,
  Copy,
  AlertCircle,
  Eye,
  ShieldCheck,
  Zap,
  BookmarkCheck,
  ChevronRight
} from "lucide-react";

export interface CliffhangerHook {
  sentenceIndex: number;
  sentenceText: string;
  hookType: "abrupt_discovery" | "deadly_peril" | "secret_revelation" | "urgent_dilemma" | "unanswered_question";
  hookTypeLabelBn: string;
  tensionScore: number;
  paywallConversionProbability: number;
  recommendedCutPosition: "immediately_before_resolution" | "mid_sentence_gasp" | "chapter_tail";
}

export interface SerializedChapterSlice {
  chapterNumber: number;
  titleBn: string;
  wordCount: number;
  accessTier: "free_preview" | "premium_locked" | "vip_patron";
  unlockCostCoins: number;
  unlockCostBdt: number;
  cliffhangerHook: CliffhangerHook;
  freePreviewCutoffPercent: number;
  freePreviewText: string;
  lockedPremiumText: string;
}

export interface WebnovelMonetizationPlan {
  projectId: string;
  seriesTitleBn: string;
  monetizationModel: "freemium_bKash_micro_unlock" | "subscription_pass" | "coin_bundle";
  freeChapterCount: number;
  totalChapters: number;
  averageUnlockCostBdt: number;
  estimatedUnlockConversionRate: number;
  projectedArpuBdt: number;
  chapters: SerializedChapterSlice[];
}

interface WebnovelPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  onInsertProse?: (prose: string) => void;
}

export const WebnovelPaywallModal: React.FC<WebnovelPaywallModalProps> = ({
  isOpen,
  onClose,
  projectId = "proj_demo_bengali",
  onInsertProse
}) => {
  const [activeTab, setActiveTab] = useState<"chapters_slicer" | "paywall_preview" | "monetization_economics">("chapters_slicer");
  const [plan, setPlan] = useState<WebnovelMonetizationPlan | null>(null);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [injectedSuccess, setInjectedSuccess] = useState(false);
  const [copiedBanner, setCopiedBanner] = useState(false);
  const [customCostBdt, setCustomCostBdt] = useState<number>(15);

  useEffect(() => {
    if (isOpen) {
      fetchPlan();
    }
  }, [isOpen]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/v1/projects/${projectId}/webnovel-paywall`);
      if (res.ok) {
        const data = await res.json();
        if (data.plan) {
          setPlan(data.plan);
          if (data.plan.averageUnlockCostBdt) {
            setCustomCostBdt(data.plan.averageUnlockCostBdt);
          }
        }
      }
    } catch (e) {
      console.warn("Using fallback local webnovel paywall data", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentChapter = plan?.chapters && plan.chapters[selectedChapterIndex] ? plan.chapters[selectedChapterIndex] : plan?.chapters?.[0];

  const handleInjectPaywall = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/projects/${projectId}/webnovel-paywall/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterNumber: currentChapter?.chapterNumber || 3,
          unlockCostBdt: customCostBdt
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.paywallBanner && onInsertProse) {
          onInsertProse(data.paywallBanner);
          setInjectedSuccess(true);
          setTimeout(() => setInjectedSuccess(false), 3000);
        }
      }
    } catch (e) {
      console.error("Failed to inject paywall banner", e);
    }
  };

  const handleCopyBanner = () => {
    const banner = 
      `\n\n<!-- ========================================== -->\n` +
      `<!-- SHOTHIK WEBNOVEL PAYWALL GATE (CHAPTER ${currentChapter?.chapterNumber || 3}) -->\n` +
      `<!-- ========================================== -->\n` +
      `<div class="shothik-paywall-gate" style="margin: 24px 0; padding: 20px; border-radius: 12px; background: linear-gradient(135deg, #1e1b4b, #0f172a); border: 1px solid #6366f1; text-align: center; color: #fff;">\n` +
      `  <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #f59e0b;">🔒 পরবর্তী অংশ পড়তে আনলক করুন</h4>\n` +
      `  <p style="font-size: 13px; color: #cbd5e1; margin-bottom: 14px;">ক্লাইম্যাক্সের তীব্র রহস্য উদঘাটন করতে এখনই ১-ট্যাপে বিকাশ বা নগদ দিয়ে চ্যাপ্টারটি আনলক করুন।</p>\n` +
      `  <button style="background: #e11d48; color: #fff; font-weight: bold; padding: 8px 18px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px;">\n` +
      `    ⚡ বিকাশ / নগদ দিয়ে ৳${customCostBdt} এ আনলক করুন\n` +
      `  </button>\n` +
      `</div>\n` +
      `<!-- ========================================== -->\n`;

    navigator.clipboard.writeText(banner);
    setCopiedBanner(true);
    setTimeout(() => setCopiedBanner(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg text-slate-100">
                  ওয়েবনভেল পেওয়াল ও ক্লিফহ্যাঙ্গার মনিটাইজেশন স্লাইসার
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  InkOS #41
                </span>
              </div>
              <p className="text-xs text-slate-400">
                বাংলা ওয়েবনভেলের নাট্যময় সাসপেন্স পয়েন্টে স্বয়ংক্রিয় ক্লিফহ্যাঙ্গার স্লাইস ও বিকাশ ১-ট্যাপ মাইক্রোপেমেন্ট পেওয়াল গেট
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800 bg-slate-950/30 space-x-2">
          <button
            onClick={() => setActiveTab("chapters_slicer")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "chapters_slicer"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>ধারাবাহিক পর্ব ও সাসপেন্স স্লাইসার</span>
          </button>

          <button
            onClick={() => setActiveTab("paywall_preview")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "paywall_preview"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>পাঠকের পেওয়াল গেট প্রিভিউ</span>
          </button>

          <button
            onClick={() => setActiveTab("monetization_economics")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "monetization_economics"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>মনিটাইজেশন অর্থনীতি ও রাজস্ব প্রক্ষেপণ</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
              <p className="text-sm text-slate-400">ওয়েবনভেল অধ্যায় ও ক্লিফহ্যাঙ্গার বিশ্লেষণ চলছে...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: CHAPTERS & SUSPENSE SLICER */}
              {activeTab === "chapters_slicer" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Chapter List */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        ধারাবাহিক পর্ব তালিকা ({plan?.chapters.length || 0})
                      </span>
                      <span className="text-xs text-amber-400">
                        ফ্রি প্রিভিউ: প্রথম {plan?.freeChapterCount || 2} টি পর্ব
                      </span>
                    </div>

                    <div className="space-y-2">
                      {plan?.chapters.map((ch, idx) => (
                        <div
                          key={ch.chapterNumber}
                          onClick={() => setSelectedChapterIndex(idx)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                            selectedChapterIndex === idx
                              ? "bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-950/30"
                              : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-sm text-slate-200">
                                {ch.titleBn}
                              </span>
                              {ch.accessTier === "free_preview" ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  ফ্রি
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                                  <Lock className="w-2.5 h-2.5 inline mr-0.5" />
                                  <span>৳{ch.unlockCostBdt}</span>
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center space-x-2">
                              <span>{ch.wordCount} শব্দ</span>
                              <span>•</span>
                              <span className="text-rose-300 font-mono text-[11px]">
                                টেনশন: {ch.cliffhangerHook.tensionScore}%
                              </span>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${selectedChapterIndex === idx ? "text-amber-400" : "text-slate-600"}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Slicer Details */}
                  {currentChapter && (
                    <div className="lg:col-span-7 space-y-4">
                      <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-slate-200 flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>ক্লিফহ্যাঙ্গার পয়েন্ট বিশ্লেষণ: {currentChapter.titleBn}</span>
                          </h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                            {currentChapter.cliffhangerHook.hookTypeLabelBn}
                          </span>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/40 font-serif text-sm leading-relaxed text-amber-200/90">
                          "{currentChapter.cliffhangerHook.sentenceText}"
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                            <span className="text-[11px] text-slate-400 block">ড্রামাটিক সাসপেন্স স্কোর</span>
                            <div className="flex items-baseline space-x-2 mt-1">
                              <span className="text-xl font-bold text-rose-400">
                                {currentChapter.cliffhangerHook.tensionScore}/100
                              </span>
                              <span className="text-[10px] text-slate-400">সর্বোচ্চ কৌতূহল</span>
                            </div>
                          </div>

                          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                            <span className="text-[11px] text-slate-400 block">পেওয়াল আনলক কনভার্সন</span>
                            <div className="flex items-baseline space-x-2 mt-1">
                              <span className="text-xl font-bold text-emerald-400">
                                {currentChapter.cliffhangerHook.paywallConversionProbability}%
                              </span>
                              <span className="text-[10px] text-slate-400">প্রত্যাশিত কেনাকাটা</span>
                            </div>
                          </div>
                        </div>

                        {/* Cutoff Preview */}
                        <div className="space-y-2 pt-2">
                          <span className="text-xs font-medium text-slate-300 block">
                            স্লাইস প্রিভিউ ({currentChapter.freePreviewCutoffPercent}% ফ্রি প্রিভিউ):
                          </span>
                          <div className="text-xs bg-slate-950 p-3 rounded-lg border border-slate-800 font-serif leading-relaxed text-slate-300">
                            <p className="line-clamp-3">{currentChapter.freePreviewText}</p>
                            <div className="mt-2 text-rose-400 font-sans font-bold flex items-center space-x-1.5 text-[11px]">
                              <Scissors className="w-3.5 h-3.5" />
                              <span>[এখানে ক্লিফহ্যাঙ্গার পেওয়াল গেট স্থাপিত হবে]</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-3 pt-1">
                        <button
                          onClick={() => setActiveTab("paywall_preview")}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20"
                        >
                          <Eye className="w-4 h-4" />
                          <span>গেটের লাইভ প্রিভিউ দেখুন</span>
                        </button>

                        <button
                          onClick={handleInjectPaywall}
                          className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-600 transition flex items-center space-x-2"
                        >
                          {injectedSuccess ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span className="text-emerald-400">ইনজেক্ট হয়েছে!</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 text-amber-400" />
                              <span>পান্ডুলিপিতে গেট বসান</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PAYWALL PREVIEW */}
              {activeTab === "paywall_preview" && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="text-center space-y-1">
                    <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                      পাঠক অ্যাপ ভিউপোর্ট প্রিভিউ (স্মার্টফোন ইন্টারফেস)
                    </span>
                    <p className="text-xs text-slate-400">
                      পাঠক যখন এই অধ্যায়ে এসে পৌঁছাবেন, তখন ঠিক যেভাবে সাসপেন্স ব্রেক ও পেমেন্ট কার্ড উপস্থাপিত হবে
                    </p>
                  </div>

                  {/* Mobile Simulated Shell */}
                  <div className="rounded-3xl border-4 border-slate-700 bg-slate-950 shadow-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] text-slate-400">
                      <span>{plan?.seriesTitleBn || "অনন্ত নক্ষত্রবীথি"}</span>
                      <span>{currentChapter?.titleBn || "অধ্যায় ৩"}</span>
                    </div>

                    {/* Free preview text */}
                    <div className="font-serif text-sm leading-relaxed text-slate-200">
                      {currentChapter?.freePreviewText || "সোডিয়াম বাতির হলুদ আলো তখন সদরঘাটের ভাঙা সিঁড়িতে গড়িয়ে পড়া পানির ফোঁটার ওপর পিছলে পড়ছে..."}
                    </div>

                    {/* Blurred fade-out effect */}
                    <div className="relative">
                      <div className="font-serif text-sm leading-relaxed text-slate-500 blur-[2px] select-none">
                        {currentChapter?.lockedPremiumText || "কাঠের বেঞ্চে বসে থাকা হলুদ পাঞ্জাবি পরা যুবকটি নিঃশব্দে উঠে দাঁড়াল। তার চোখে তখন কোনো ভয় ছিল না, ছিল অচেনা এক প্রশান্তি..."}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950" />
                    </div>

                    {/* The 1-Tap Paywall Gate */}
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-purple-950/80 border border-indigo-500/40 p-5 text-center space-y-3 shadow-xl">
                      <div className="inline-flex p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-amber-300">
                          🔒 পরবর্তী অংশ পড়তে অধ্যায়টি আনলক করুন
                        </h4>
                        <p className="text-xs text-slate-300 mt-1">
                          ক্লাইম্যাক্সের রুদ্ধশ্বাস পরিণাম জানতে ১-ট্যাপে বিকাশ বা নগদ ওয়ালেট দিয়ে প্রিমিয়াম এক্সেস পান
                        </p>
                      </div>

                      <div className="pt-1">
                        <button className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 transition">
                          <Zap className="w-4 h-4 fill-current" />
                          <span>বিকাশ / নগদ দিয়ে ৳{customCostBdt} এ তাৎক্ষণিক আনলক</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-center space-x-4 text-[10px] text-slate-400 pt-1">
                        <span className="flex items-center space-x-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>নিরাপদ এসএসএল পেমেন্ট</span>
                        </span>
                        <span>•</span>
                        <span>আজীবন পাঠাধিকার</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions under preview */}
                  <div className="flex items-center justify-center space-x-3 pt-2">
                    <button
                      onClick={handleInjectPaywall}
                      className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center space-x-2 shadow-lg shadow-amber-500/20"
                    >
                      {injectedSuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>পান্ডুলিপিতে গেট সফলভাবে ইনজেক্ট হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>১-ক্লিকে পান্ডুলিপির এই অধ্যায়ে গেট ইনজেক্ট করুন</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleCopyBanner}
                      className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition flex items-center space-x-2"
                    >
                      {copiedBanner ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>কপি হয়েছে</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>এইচটিএমএল কোড কপি</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: MONETIZATION ECONOMICS */}
              {activeTab === "monetization_economics" && (
                <div className="space-y-6">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                      <div className="flex items-center space-x-2 text-slate-400 text-xs">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span>প্রত্যাশিত এআরপিইউ (ARPU)</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-100 mt-2">
                        ৳{plan?.projectedArpuBdt || 150}
                      </div>
                      <span className="text-[11px] text-emerald-400 mt-1 block">
                        প্রতি সক্রিয় পাঠক থেকে
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                      <div className="flex items-center space-x-2 text-slate-400 text-xs">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span>কনভার্সন রেট</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-100 mt-2">
                        {plan?.estimatedUnlockConversionRate || 41.8}%
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        ফ্রি থেকে পেইড পাঠক রূপান্তর
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                      <div className="flex items-center space-x-2 text-slate-400 text-xs">
                        <BookmarkCheck className="w-4 h-4 text-blue-400" />
                        <span>মোট অধ্যায় সংখ্যা</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-100 mt-2">
                        {plan?.totalChapters || 12} টি
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        পেইড চ্যাপ্টার: {(plan?.totalChapters || 12) - (plan?.freeChapterCount || 2)} টি
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                      <div className="flex items-center space-x-2 text-slate-400 text-xs">
                        <DollarSign className="w-4 h-4 text-rose-400" />
                        <span>গড় আনলক ফি</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-100 mt-2">
                        ৳{customCostBdt}
                      </div>
                      <span className="text-[11px] text-amber-300 mt-1 block">
                        মাইক্রো-পেমেন্ট অপ্টিমাইজড
                      </span>
                    </div>
                  </div>

                  {/* Pricing Tuning & Model */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-4">
                      <h4 className="font-semibold text-sm text-slate-200">
                        বিকাশ মাইক্রো-পেমেন্ট মূল্য নির্ধারণ (টাকা)
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        বাংলাদেশের মোবাইল আর্থিক সেবায় (MFS) ৫ টাকা থেকে ২৫ টাকার মধ্যে টিকিটিং সবচেয়ে দ্রুত কেনাকাটা নিশ্চিত করে।
                      </p>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">অধ্যায় প্রতি আনলক ফি:</span>
                          <span className="text-amber-400 font-bold">৳{customCostBdt}</span>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={35}
                          step={5}
                          value={customCostBdt}
                          onChange={(e) => setCustomCostBdt(Number(e.target.value))}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>৳৫ (হালকা)</span>
                          <span>৳১৫ (আদর্শ)</span>
                          <span>৳২৫ (ভিআইপি)</span>
                          <span>৳৩৫ (স্পেশাল)</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                        <span className="text-slate-400 block font-medium">প্রত্যাশিত সিরিজ আয় (১,০০০ পাঠকের জন্য):</span>
                        <div className="text-lg font-bold text-emerald-400">
                          ৳{Math.round(1000 * ((plan?.totalChapters || 12) - 2) * customCostBdt * ((plan?.estimatedUnlockConversionRate || 41.8) / 100)).toLocaleString("en-US")}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-4">
                      <h4 className="font-semibold text-sm text-slate-200">
                        সাসপেন্স-ড্রাইভেন মনস্তাত্ত্বিক রূপান্তর ফ্রেমওয়ার্ক
                      </h4>
                      <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                        <div className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                          <span>
                            <strong>জেইগারনিক ইফেক্ট (Zeigarnik Effect):</strong> পাঠক অসমাপ্ত নাটকীয় ঘটনার সমাপ্তি জানতে সবচেয়ে বেশি উদ্বেলিত থাকেন।
                          </span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                          <span>
                            <strong>জিরো-ফ্রিকশন MFS পেমেন্ট:</strong> বিকাশ ও নগদের ডাইরেক্ট পিন বা বায়োমেট্রিক অথেন্টিকেশনে ৩ সেকেন্ডে লেনদেন শেষ হয়।
                          </span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                          <span>
                            <strong>কয়েন বান্ডেল ও ভিআইপি টিকিট:</strong> ১০০ টাকার কয়েন বান্ডেল কিনলে ১৫% বোনাস কয়েন প্রদান করে পাঠক রিটেনশন বাড়ানো যায়।
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>সঠিক ওয়েব রাইটিং স্টুডিও • রিল-টাইম ক্লিফহ্যাঙ্গার ও বিকাশ পেওয়াল এআই</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
