import React, { useState, useEffect } from "react";
import {
  X,
  Sliders,
  BookOpen,
  GraduationCap,
  Sparkles,
  Zap,
  Check,
  Copy,
  Clock,
  Layers,
  Award,
  ChevronRight,
  TrendingUp,
  FileText
} from "lucide-react";

export type TargetReadingTier = "young_adult" | "scholarly_annotated" | "executive_digest";

export interface ReadabilityMetrics {
  lexileScore: string;
  averageWordsPerSentence: number;
  readabilityEaseScore: number;
  estimatedReadingTimeMinutes: number;
  typeTokenRatio: number;
  dialectPurity: string;
}

export interface ScaledEdition {
  tier: TargetReadingTier;
  titleBn: string;
  taglineBn: string;
  targetAudienceBn: string;
  metrics: ReadabilityMetrics;
  transformedExcerptBn: string;
  scholarlyAnnotations?: {
    term: string;
    originType: string;
    philologicalNoteBn: string;
  }[];
  executiveBeats?: {
    beatNumber: number;
    headingBn: string;
    takeawayBn: string;
  }[];
}

export interface ReadingScalerState {
  projectId: string;
  originalTextBn: string;
  originalMetrics: ReadabilityMetrics;
  editions: Record<TargetReadingTier, ScaledEdition>;
}

interface ReadingScalerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  onInsertProse?: (prose: string) => void;
}

export const ReadingScalerModal: React.FC<ReadingScalerModalProps> = ({
  isOpen,
  onClose,
  projectId = "proj_demo_bengali",
  onInsertProse
}) => {
  const [activeTier, setActiveTier] = useState<TargetReadingTier>("young_adult");
  const [activeTab, setActiveTab] = useState<"scaled_manuscript" | "annotations_beats" | "analytics">("scaled_manuscript");
  const [scalerState, setScalerState] = useState<ReadingScalerState | null>(null);
  const [loading, setLoading] = useState(false);
  const [injectedSuccess, setInjectedSuccess] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchScaler();
    }
  }, [isOpen]);

  const fetchScaler = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/v1/projects/${projectId}/reading-scaler`);
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setScalerState(data.state);
        }
      }
    } catch (e) {
      console.warn("Using fallback local reading scaler data", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentEdition = scalerState?.editions?.[activeTier];

  const handleApplyEdition = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/projects/${projectId}/reading-scaler/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetTier: activeTier })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.injectedText && onInsertProse) {
          onInsertProse(data.injectedText);
          setInjectedSuccess(true);
          setTimeout(() => setInjectedSuccess(false), 3000);
        }
      }
    } catch (e) {
      console.error("Failed to apply scaled edition", e);
    }
  };

  const handleCopyText = () => {
    if (currentEdition?.transformedExcerptBn) {
      navigator.clipboard.writeText(currentEdition.transformedExcerptBn);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg text-slate-100">
                  অ্যাডাপ্টিভ রিডিং লেভেল ও ভোকাবুলারি স্কেলার
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  InkOS #43
                </span>
              </div>
              <p className="text-xs text-slate-400">
                একই পান্ডুলিপিকে কিশোর সংস্করণ (YA), গবেষক ও টীকাসম্বলিত সংস্করণ এবং ৪৫-মিনিট এক্সিকিউটিভ ডাইজেস্টে রূপান্তর
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

        {/* 3 Target Format Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-6 py-3.5 border-b border-slate-800 bg-slate-950/40">
          {[
            {
              id: "young_adult",
              title: "কিশোর সংস্করণ (Young Adult)",
              tagline: "সহজ পাঠ্য, দ্রুতগতির থ্রিলার",
              lexile: "620L",
              ease: "৮৬/১০০",
              color: "text-amber-400 border-amber-500/40 bg-amber-950/20"
            },
            {
              id: "scholarly_annotated",
              title: "গবেষক ও টীকাসম্বলিত (Scholarly)",
              tagline: "ব্যুৎপত্তি ও ঐতিহাসিক পাদটীকা",
              lexile: "1280L",
              ease: "৪২/১০০",
              color: "text-purple-400 border-purple-500/40 bg-purple-950/20"
            },
            {
              id: "executive_digest",
              title: "৪৫-মিনিট ডাইজেস্ট (Executive)",
              tagline: "সারসংক্ষেপ ও ৫টি দৃশ্যপট",
              lexile: "810L",
              ease: "৭৮/১০০",
              color: "text-cyan-400 border-cyan-500/40 bg-cyan-950/20"
            }
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveTier(item.id as TargetReadingTier)}
              className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                activeTier === item.id
                  ? `${item.color} shadow-lg ring-1 ring-cyan-400/50`
                  : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-200">{item.title}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/80">
                  {item.lexile}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{item.tagline}</p>
              <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                <span>সহজপাঠ্যতা: {item.ease}</span>
                <span className="text-cyan-300">সিলেক্ট করুন →</span>
              </div>
            </div>
          ))}
        </div>

        {/* Subtabs Bar */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800 bg-slate-950/20 space-x-2">
          <button
            onClick={() => setActiveTab("scaled_manuscript")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "scaled_manuscript"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>দ্বৈত রূপান্তর তুলনা (Side-by-Side)</span>
          </button>

          <button
            onClick={() => setActiveTab("annotations_beats")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "annotations_beats"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>
              {activeTier === "scholarly_annotated"
                ? "শব্দব্যুৎপত্তি ও ঐতিহাসিক টীকা"
                : "টার্নিং পয়েন্ট ও ড্রামাটিক বিটস"}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "analytics"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>কগনিটিভ লোড ও পাঠক মেট্রিক্স</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
              <p className="text-sm text-slate-400">পান্ডুলিপির লেক্সাইল স্কেলিং বিশ্লেষণ চলছে...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: SIDE-BY-SIDE MANUSCRIPT */}
              {activeTab === "scaled_manuscript" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Original Prose */}
                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
                          <span className="text-xs font-bold text-slate-300">
                            মূল খসড়া (স্ট্যান্ডার্ড চলিত)
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700 font-mono">
                            লেক্সাইল: {scalerState?.originalMetrics.lexileScore || "950L"}
                          </span>
                        </div>
                        <p className="font-serif text-sm leading-relaxed text-slate-300 pt-3">
                          {scalerState?.originalTextBn || "সোডিয়াম বাতির হলুদ আলো তখন সদরঘাটের ভাঙা সিঁড়িতে গড়িয়ে পড়া পানির ফোঁটার ওপর পিছলে পড়ছে..."}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>গড় শব্দ/বাক্য: {scalerState?.originalMetrics.averageWordsPerSentence} টি</span>
                        <span>সহজপাঠ্যতা: {scalerState?.originalMetrics.readabilityEaseScore}%</span>
                      </div>
                    </div>

                    {/* Right: Scaled Edition */}
                    <div className="p-4 rounded-xl bg-slate-800/40 border border-cyan-500/30 flex flex-col justify-between space-y-3 shadow-lg shadow-cyan-950/20">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
                          <span className="text-xs font-bold text-cyan-300 flex items-center space-x-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{currentEdition?.titleBn}</span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                            লেক্সাইল: {currentEdition?.metrics.lexileScore}
                          </span>
                        </div>
                        <p className="font-serif text-sm leading-relaxed text-slate-100 pt-3 whitespace-pre-line">
                          {currentEdition?.transformedExcerptBn}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <span className="text-[11px] text-cyan-400">
                          টার্গেট পাঠক: {currentEdition?.targetAudienceBn}
                        </span>
                        <button
                          onClick={handleCopyText}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1 transition"
                        >
                          {copiedText ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">কপি হয়েছে</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>কপি</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center space-x-3 pt-2">
                    <button
                      onClick={handleApplyEdition}
                      className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center space-x-2 shadow-lg shadow-cyan-500/20"
                    >
                      {injectedSuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>সংস্করণ সফলভাবে পান্ডুলিপিতে রূপান্তর হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>১-ক্লিকে এই সংস্করণটি পান্ডুলিপিতে প্রয়োগ করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: ANNOTATIONS & BEATS */}
              {activeTab === "annotations_beats" && (
                <div className="space-y-4">
                  {activeTier === "scholarly_annotated" && currentEdition?.scholarlyAnnotations && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          ধ্রুপদী শব্দব্যুৎপত্তি ও ঐতিহাসিক পাদটীকা সম্ভার
                        </span>
                        <span className="text-xs text-purple-400">
                          পাণ্ডিত্যপূর্ণ টীকা: {currentEdition.scholarlyAnnotations.length} টি
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {currentEdition.scholarlyAnnotations.map((anno, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-slate-800/40 border border-purple-500/20 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-purple-300 font-serif">
                                {anno.term}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                                {anno.originType}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {anno.philologicalNoteBn}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTier !== "scholarly_annotated" && currentEdition?.executiveBeats && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          নাটকীয় টার্নিং পয়েন্ট ও এক্সিকিউটিভ সিন বিটস
                        </span>
                        <span className="text-xs text-cyan-400">
                          সিন সংখ্যা: {currentEdition.executiveBeats.length} টি
                        </span>
                      </div>

                      <div className="space-y-2">
                        {currentEdition.executiveBeats.map((beat) => (
                          <div
                            key={beat.beatNumber}
                            className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center font-bold">
                                  {beat.beatNumber}
                                </span>
                                <span className="font-semibold text-sm text-slate-200">
                                  {beat.headingBn}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 pl-7">{beat.takeawayBn}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: COGNITIVE LOAD & ANALYTICS */}
              {activeTab === "analytics" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                      <span className="text-xs text-slate-400">লেক্সাইল রেটিং (Lexile)</span>
                      <div className="text-2xl font-bold text-cyan-400 mt-2">
                        {currentEdition?.metrics.lexileScore}
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">কগনিটিভ টার্গেট ব্যান্ড</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                      <span className="text-xs text-slate-400">গড় বাক্য দৈর্ঘ্য (WPS)</span>
                      <div className="text-2xl font-bold text-emerald-400 mt-2">
                        {currentEdition?.metrics.averageWordsPerSentence} টি
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">শব্দ প্রতি বাক্যে</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                      <span className="text-xs text-slate-400">সহজপাঠ্যতা সূচক (Flesch)</span>
                      <div className="text-2xl font-bold text-amber-400 mt-2">
                        {currentEdition?.metrics.readabilityEaseScore}/১০০
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">ফ্লুয়েন্সি রেটিং</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                      <span className="text-xs text-slate-400">শব্দসম্ভার বৈচিত্র্য (TTR)</span>
                      <div className="text-2xl font-bold text-purple-400 mt-2">
                        {currentEdition?.metrics.typeTokenRatio}
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">টাইপ-টোকেন অনুপাত</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-3 text-xs text-slate-300 leading-relaxed">
                    <h4 className="font-semibold text-sm text-slate-200">
                      অ্যাডাপ্টিভ পাবলিশিং স্ট্র্যাটেজি
                    </h4>
                    <p className="text-slate-400">
                      একটি সফল উপন্যাসের একাধিক কমার্শিয়াল ফর্ম্যাট থাকে। কিশোর সংস্করণটি কিন্ডল ও ওয়াটপ্যাডে তরুণদের রিটেনশন নিশ্চিত করে, গবেষক সংস্করণটি সাহিত্য পুরস্কার ও লাইব্রেরি আর্কাইভিংয়ের পথ উন্মুক্ত করে, এবং ৪৫-মিনিট ডাইজেস্টটি স্টোরিটেল বা স্পটিফাই অডিওবুক রূপান্তরের ভিত্তি গড়ে তোলে।
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>সঠিক রাইটিং স্টুডিও • ট্রাই-টিয়ার অ্যাডাপ্টিভ রিডিং ও ভোকাবুলারি ইঞ্জিন</span>
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
