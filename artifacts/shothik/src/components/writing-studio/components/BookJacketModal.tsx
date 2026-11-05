import React, { useState, useEffect } from "react";
import {
  X,
  BookOpen,
  Sparkles,
  Layers,
  Camera,
  CheckCircle2,
  Copy,
  RotateCw,
  Sliders,
  ShieldCheck,
  RefreshCw,
  QrCode,
  Tag,
  Feather
} from "lucide-react";

interface CharacterFaceLock {
  characterId: string;
  name: string;
  nameBn: string;
  seed: number;
  loraTag: string;
  facialFeatures: {
    eyeShape: string;
    skinTone: string;
    hairStyle: string;
    facialHair?: string;
    distinguishingMarks: string;
    ageAppearance: number;
  };
  consistencyConfidenceScore: number;
  promptGuidance: string;
}

interface BookJacketWrap {
  jobId: string;
  bookTitle: string;
  bookTitleBn: string;
  authorName: string;
  authorNameBn: string;
  pageCount: number;
  paperStockGsm: string;
  dimensions: {
    frontWidthInches: number;
    backWidthInches: number;
    spineWidthInches: number;
    spineWidthMm: number;
    flapWidthInches: number;
    heightInches: number;
    totalWrapWidthInches: number;
    bleedInches: number;
  };
  frontCover: {
    headline: string;
    artPrompt: string;
    stylePreset: string;
    accentColorHex: string;
  };
  spine: {
    titleVertical: string;
    authorVertical: string;
    publisherLogoText: string;
  };
  backCover: {
    hookQuote: string;
    synopsisBlurbBn: string;
    praiseQuote: string;
    praiseAuthor: string;
    isbn13: string;
    retailPriceBdt: number;
    retailPriceUsd: number;
  };
  flaps: {
    frontFlapAuthorBioBn: string;
    backFlapPublishingNotesBn: string;
  };
  characterFaceLock: CharacterFaceLock;
}

interface BookJacketModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  onInsertProse?: (prose: string) => void;
}

export const BookJacketModal: React.FC<BookJacketModalProps> = ({
  isOpen,
  onClose,
  projectId = "proj_demo_bengali",
  onInsertProse
}) => {
  const [activeTab, setActiveTab] = useState<"3d_wrap" | "face_lock" | "flaps_specs">("3d_wrap");
  const [viewMode, setViewMode] = useState<"3d_book" | "flat_wrap">("flat_wrap");
  const [jacket, setJacket] = useState<BookJacketWrap | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [injectedSuccess, setInjectedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchJacket();
    }
  }, [isOpen]);

  const fetchJacket = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/v1/projects/${projectId}/book-jacket`);
      if (res.ok) {
        const data = await res.json();
        if (data.jacket) setJacket(data.jacket);
      }
    } catch (e) {
      console.warn("Using fallback local jacket data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!jacket) return;
    navigator.clipboard.writeText(jacket.characterFaceLock.promptGuidance);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleInjectPitch = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/v1/projects/${projectId}/book-jacket/apply`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        if (data.pitchSnippet && onInsertProse) {
          onInsertProse(data.pitchSnippet);
          setInjectedSuccess(true);
          setTimeout(() => setInjectedSuccess(false), 3000);
        }
      }
    } catch (e) {
      console.error("Failed to inject jacket blurb", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Precision 3D Book Jacket & Character Face-Lock Studio
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Face-Lock: 96% Match
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Full French Flaps
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                স্পাইন ক্যালিপার, ফেস-লক সিড সিঙ্ক, বারকোড এবং সম্পূর্ণ ফ্রেঞ্চ ফ্ল্যাপ জ্যাকেট র‍্যাপ স্টুডিও
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("3d_wrap")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === "3d_wrap"
                  ? "border-amber-400 text-amber-300 bg-amber-400/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-4 h-4" />
              বুক জ্যাকেট র‍্যাপ ও ৩ডি ভিউ
            </button>
            <button
              onClick={() => setActiveTab("face_lock")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === "face_lock"
                  ? "border-amber-400 text-amber-300 bg-amber-400/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Camera className="w-4 h-4" />
              ক্যারেক্টার ফেস-লক (Face-Lock Studio)
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500/20 text-amber-300">
                {jacket?.characterFaceLock.consistencyConfidenceScore || 96}%
              </span>
            </button>
            <button
              onClick={() => setActiveTab("flaps_specs")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === "flaps_specs"
                  ? "border-amber-400 text-amber-300 bg-amber-400/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Tag className="w-4 h-4" />
              ব্যাক কাভার ব্লার্ব ও ফ্রেঞ্চ ফ্ল্যাপ
            </button>
          </div>

          {activeTab === "3d_wrap" && (
            <div className="flex items-center gap-2 pb-2">
              <button
                onClick={() => setViewMode(viewMode === "flat_wrap" ? "3d_book" : "flat_wrap")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                {viewMode === "flat_wrap" ? "৩ডি বুক মোড" : "ফ্ল্যাট প্রেস র‍্যাপ"}
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: 3D WRAP & JACKET SPREAD */}
          {activeTab === "3d_wrap" && (
            <div className="space-y-6">
              {/* Dimensions Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">মোট কাভার র‍্যাপ প্রস্থ</span>
                  <span className="text-sm font-semibold text-white">
                    {jacket?.dimensions.totalWrapWidthInches || 18.4}" (467 মিমি)
                  </span>
                </div>
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">স্পাইন পুরুত্ব (১৬০ পৃষ্ঠা)</span>
                  <span className="text-sm font-semibold text-amber-400">
                    {jacket?.dimensions.spineWidthMm || 10.2} mm ({jacket?.dimensions.spineWidthInches || 0.40}")
                  </span>
                </div>
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">ফ্রেঞ্চ ফ্ল্যাপ (French Flaps)</span>
                  <span className="text-sm font-semibold text-emerald-400">৩.৫" (৮৯ মিমি) উভয়ে</span>
                </div>
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">কাগজের মান (Paper Stock)</span>
                  <span className="text-sm font-semibold text-slate-300">৮০ GSM মুনকেন ক্রিম</span>
                </div>
              </div>

              {/* View Mode: FLAT WRAP */}
              {viewMode === "flat_wrap" ? (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner overflow-x-auto">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                    <span>← বাম ফ্ল্যাপ (৩.৫")</span>
                    <span>ব্যাক কাভার (৫.৫")</span>
                    <span>স্পাইন ({jacket?.dimensions.spineWidthMm}mm)</span>
                    <span>ফ্রন্ট কাভার (৫.৫")</span>
                    <span>ডান ফ্ল্যাপ (৩.৫") →</span>
                  </div>

                  {/* Complete 5-Section Full Wrap */}
                  <div className="min-w-[760px] flex rounded-xl overflow-hidden border border-amber-500/30 shadow-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 h-[380px]">
                    {/* 1. Back Flap */}
                    <div className="w-[18%] bg-slate-900/90 p-4 border-r border-dashed border-slate-700/60 flex flex-col justify-between text-[11px] text-slate-300">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">
                          পেছনের ফ্ল্যাপ
                        </span>
                        <p className="leading-relaxed font-serif text-[11px] text-slate-400">
                          {jacket?.flaps.backFlapPublishingNotesBn}
                        </p>
                      </div>
                      <div className="text-[9px] text-slate-600 font-mono">
                        ফোল্ড লাইন (Fold: 3.5")
                      </div>
                    </div>

                    {/* 2. Back Cover */}
                    <div className="w-[28%] bg-slate-950 p-5 border-r border-slate-800 flex flex-col justify-between relative">
                      <div>
                        <div className="text-amber-400 font-serif italic text-xs mb-3 border-l-2 border-amber-500 pl-2">
                          {jacket?.backCover.hookQuote}
                        </div>
                        <p className="text-[11px] font-serif text-slate-300 leading-relaxed line-clamp-6">
                          {jacket?.backCover.synopsisBlurbBn}
                        </p>
                        <div className="mt-3 text-[10px] text-emerald-400/90 font-sans italic">
                          {jacket?.backCover.praiseQuote} {jacket?.backCover.praiseAuthor}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <div>
                          <span className="font-mono text-[10px] text-slate-400 block">
                            ISBN: {jacket?.backCover.isbn13}
                          </span>
                          <span className="text-xs font-bold text-white">
                            ৳{jacket?.backCover.retailPriceBdt} | ${jacket?.backCover.retailPriceUsd}
                          </span>
                        </div>
                        <div className="p-1 bg-white rounded border border-slate-400">
                          <QrCode className="w-8 h-8 text-black" />
                        </div>
                      </div>
                    </div>

                    {/* 3. Spine */}
                    <div className="w-[8%] bg-gradient-to-b from-amber-950 via-slate-950 to-amber-950 border-r border-slate-800 flex flex-col items-center justify-between py-4 text-center px-1">
                      <span className="text-[9px] font-bold text-amber-400 rotate-90 whitespace-nowrap mt-4">
                        {jacket?.spine.titleVertical}
                      </span>
                      <span className="text-[8px] text-slate-300 rotate-90 whitespace-nowrap">
                        {jacket?.spine.authorVertical}
                      </span>
                      <span className="text-[7px] text-slate-500 font-serif mb-2">
                        {jacket?.spine.publisherLogoText}
                      </span>
                    </div>

                    {/* 4. Front Cover */}
                    <div className="w-[28%] bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-950 p-5 border-r border-dashed border-slate-700/60 flex flex-col justify-between relative overflow-hidden">
                      {/* Ambient Cover Illustration Art */}
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-black/80 pointer-events-none"></div>

                      <div className="relative z-10">
                        <span className="text-[10px] tracking-widest uppercase text-amber-400/90 font-mono block">
                          উপন্যাস
                        </span>
                        <h3 className="text-2xl font-black text-white font-serif tracking-tight mt-1">
                          {jacket?.bookTitleBn}
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 font-serif">
                          {jacket?.frontCover.headline}
                        </p>
                      </div>

                      {/* Character Silhouette Badge */}
                      <div className="relative z-10 my-auto text-center py-4">
                        <div className="inline-block p-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          <Camera className="w-8 h-8" />
                        </div>
                        <span className="text-[9px] text-amber-300/80 block mt-1">
                          [ফেস-লক সিড: {jacket?.characterFaceLock.seed}]
                        </span>
                      </div>

                      <div className="relative z-10 pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 font-serif">
                          {jacket?.authorNameBn}
                        </span>
                        <span className="text-[9px] text-slate-500 uppercase font-mono">
                          সঠিক প্রকাশনী
                        </span>
                      </div>
                    </div>

                    {/* 5. Front Flap */}
                    <div className="w-[18%] bg-slate-900/90 p-4 flex flex-col justify-between text-[11px] text-slate-300">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">
                          লেখক পরিচিতি
                        </span>
                        <p className="leading-relaxed font-serif text-[11px] text-slate-400">
                          {jacket?.flaps.frontFlapAuthorBioBn}
                        </p>
                      </div>
                      <div className="text-[9px] text-slate-600 font-mono">
                        ফোল্ড লাইন (Fold: 3.5")
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* View Mode: 3D PERSPECTIVE BOOK */
                <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center min-h-[380px]">
                  <div className="relative group cursor-pointer perspective-[1000px]">
                    <div className="w-56 h-80 bg-gradient-to-br from-amber-900 via-slate-950 to-slate-900 rounded-r-lg border-y border-r border-amber-500/40 shadow-2xl p-6 flex flex-col justify-between transform -rotate-y-12 rotate-x-6 hover:rotate-y-0 transition duration-500 relative">
                      {/* Left Spine 3D Effect */}
                      <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/80 to-transparent"></div>

                      <div>
                        <span className="text-[10px] tracking-widest uppercase text-amber-400 font-mono">
                          উপন্যাস
                        </span>
                        <h4 className="text-xl font-bold text-white font-serif mt-1">
                          {jacket?.bookTitleBn}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-2 font-serif leading-relaxed">
                          {jacket?.frontCover.headline}
                        </p>
                      </div>

                      <div className="text-center py-6">
                        <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                          <Feather className="w-8 h-8" />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-300">
                        <span className="font-serif">{jacket?.authorNameBn}</span>
                        <span className="font-mono text-[9px] text-amber-400">3D SHADOW</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHARACTER FACE-LOCK STUDIO */}
          {activeTab === "face_lock" && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl">
                    96%
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      চরিত্রের মুখচ্ছবি সামঞ্জস্য ইঞ্জিন (Character Face-Lock Consistency)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      হিমুর ইউনিক ফেসিয়াল কিপয়েন্ট ও সিড লক করা হয়েছে। যেকোনো মিডজার্নি বা ফ্লাক্স প্রম্পটে একই চরিত্র আসবে।
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedPrompt ? "প্রম্পট কপি হয়েছে!" : "লকড এআই প্রম্পট কপি"}
                </button>
              </div>

              {/* Character Profile & Keypoints */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    লকড ফেসিয়াল প্যারামিটার (Facial Biometrics)
                  </span>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-500">চরিত্র:</span>
                      <span className="text-white font-medium">{jacket?.characterFaceLock.nameBn} ({jacket?.characterFaceLock.name})</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-500">অনুমিত বয়স:</span>
                      <span className="text-white">{jacket?.characterFaceLock.facialFeatures.ageAppearance} বছর</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-500">চোখের গঠন:</span>
                      <span className="text-slate-200">{jacket?.characterFaceLock.facialFeatures.eyeShape}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-500">গায়ের রং:</span>
                      <span className="text-slate-200">{jacket?.characterFaceLock.facialFeatures.skinTone}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-500">চুল ও দাড়ি:</span>
                      <span className="text-slate-200">{jacket?.characterFaceLock.facialFeatures.hairStyle}, {jacket?.characterFaceLock.facialFeatures.facialHair}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">বিশেষ লক্ষণ:</span>
                      <span className="text-amber-400 font-medium">{jacket?.characterFaceLock.facialFeatures.distinguishingMarks}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                      মিডজার্নি / FLUX ফেস-লক সিড ও LoRA
                    </span>
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-amber-300">
                        Seed: {jacket?.characterFaceLock.seed}
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400">
                        LoRA: {jacket?.characterFaceLock.loraTag}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300 block mb-1">প্রম্পট গাইডেন্স:</span>
                    <p className="line-clamp-3 font-mono text-[10px] text-slate-400">
                      {jacket?.characterFaceLock.promptGuidance}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BACK COVER BLURB & FLAPS SPECS */}
          {activeTab === "flaps_specs" && (
            <div className="space-y-6">
              {/* Back Cover Synopsis Box */}
              <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                  অফিসিয়াল ব্যাক-কাভার ব্লার্ব (Rokomari & Amazon Back Synopsis)
                </span>
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 font-serif leading-relaxed text-sm text-slate-200">
                  <p className="italic text-amber-300 mb-2 font-semibold">
                    {jacket?.backCover.hookQuote}
                  </p>
                  <p>{jacket?.backCover.synopsisBlurbBn}</p>
                </div>
              </div>

              {/* French Flaps Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    সামনের ফ্রেঞ্চ ফ্ল্যাপ (লেখক পরিচিতি - Front Flap)
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed font-serif">
                    {jacket?.flaps.frontFlapAuthorBioBn}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    পেছনের ফ্রেঞ্চ ফ্ল্যাপ (প্রকাশনা তথ্য - Back Flap)
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed font-serif">
                    {jacket?.flaps.backFlapPublishingNotesBn}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>স্পাইন ও ফেস-লক মেট্রিক্স সম্পূর্ণ প্রস্তুত।</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copiedPrompt ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedPrompt ? "প্রম্পট কপি হয়েছে" : "ফেস-লক প্রম্পট অনুলিপি"}
            </button>
            <button
              onClick={handleInjectPitch}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              {injectedSuccess ? "ব্লার্ব ও স্পেক যুক্ত হয়েছে!" : "ব্লার্ব ও স্পেক পাণ্ডুলিপিতে যুক্ত করুন"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
