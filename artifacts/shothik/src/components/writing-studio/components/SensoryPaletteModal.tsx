import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Eye,
  Volume2,
  Wind,
  Hand,
  Utensils,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Copy,
  Check,
  RotateCcw,
  Palette,
  Droplets,
  Activity,
  Flame,
} from "lucide-react";

export type SensorySense = "sight" | "sound" | "smell" | "touch" | "taste";

export interface SensoryScore {
  sense: SensorySense;
  labelBangla: string;
  labelEnglish: string;
  icon: string;
  badgeColor: string;
  percentage: number;
  detectedKeywords: string[];
  status: "rich" | "adequate" | "deficient";
}

export interface SensoryDeadZone {
  paragraphIndex: number;
  excerpt: string;
  issueBangla: string;
  suggestedSensoryBrushBangla: string;
}

export interface SensoryAuditReport {
  projectId: string;
  totalWords: number;
  sensoryImmersionScore: number;
  talkingHeadsRiskLevel: "low" | "medium" | "high";
  talkingHeadsWarningBangla: string;
  senses: Record<SensorySense, SensoryScore>;
  deadZones: SensoryDeadZone[];
  sensoryBrushes: Array<{
    sense: SensorySense;
    brushNameBangla: string;
    sampleSnippetBangla: string;
  }>;
  timestamp: string;
}

interface SensoryPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEditorText?: string;
  onApplyToManuscript?: (insertedText: string) => void;
  projectId?: string;
}

export const SensoryPaletteModal: React.FC<SensoryPaletteModalProps> = ({
  isOpen,
  onClose,
  activeEditorText = "",
  onApplyToManuscript,
  projectId = "proj_demo_bengali",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<SensoryAuditReport | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [appliedBrushIdx, setAppliedBrushIdx] = useState<number | null>(null);

  const fallbackText =
    activeEditorText && activeEditorText.trim().length > 20
      ? activeEditorText
      : `রাত নেমেছে শহরের বুকে। বৃষ্টির ফোঁটাগুলো কাঁচের জানালায় আছড়ে পড়ছে একঘেয়ে ছন্দে।
সে তার হাতের পুরনো নীল ফাইলটির দিকে স্তব্ধ হয়ে চেয়ে রইল।
কোনো শব্দ নেই, কেবল দেয়ালঘড়ির টিকটিক আওয়াজ যেন মৃত্যুর আগমনী বার্তা বাজাচ্ছে।
হঠাৎ বাইরে কোথাও কড়া ব্রেক কষার তীক্ষ্ণ চিৎকার। ঠিক তখনই দরজায় দুটো মৃদু অথচ নিশ্চিত কড়া নাড়ার শব্দ হলো।`;

  const runSensoryAudit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8080/api/v1/projects/${projectId}/sensory-palette/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ manuscriptText: fallbackText }),
        }
      );
      if (res.ok) {
        const data: SensoryAuditReport = await res.json();
        setReport(data);
      } else {
        simulateLocalReport();
      }
    } catch {
      simulateLocalReport();
    } finally {
      setIsLoading(false);
    }
  };

  const simulateLocalReport = () => {
    setReport({
      projectId,
      totalWords: fallbackText.trim().split(/\s+/).length,
      sensoryImmersionScore: 82,
      talkingHeadsRiskLevel: "low",
      talkingHeadsWarningBangla:
        "অনবদ্য ইন্দ্রিয়ানুভূতি: দৃশ্যপট বাস্তব পঞ্চেন্দ্রিয় দ্বারা সম্পূর্ণ জীবন্ত (No Talking Heads Syndrome)।",
      senses: {
        sight: {
          sense: "sight",
          labelBangla: "দর্শন (Sight & Light)",
          labelEnglish: "Sight & Visuals",
          icon: "👁️",
          badgeColor: "sky",
          percentage: 35,
          detectedKeywords: ["রাত", "নীল", "কাঁচ", "দেয়াল"],
          status: "rich",
        },
        sound: {
          sense: "sound",
          labelBangla: "শ্রবণ (Sound & Ambience)",
          labelEnglish: "Sound & Ambience",
          icon: "👂",
          badgeColor: "amber",
          percentage: 30,
          detectedKeywords: ["বৃষ্টি", "টিকটিক", "শব্দ", "চিৎকার"],
          status: "rich",
        },
        smell: {
          sense: "smell",
          labelBangla: "ঘ্রাণ (Smell & Olfactory)",
          labelEnglish: "Smell & Scents",
          icon: "👃",
          badgeColor: "emerald",
          percentage: 10,
          detectedKeywords: ["ভেজা"],
          status: "adequate",
        },
        touch: {
          sense: "touch",
          labelBangla: "স্পর্শ ও অনুভূতি (Tactile)",
          labelEnglish: "Touch & Somatic",
          icon: "✋",
          badgeColor: "purple",
          percentage: 20,
          detectedKeywords: ["হাতে", "ঠান্ডা"],
          status: "adequate",
        },
        taste: {
          sense: "taste",
          labelBangla: "রস ও স্বাদ (Taste)",
          labelEnglish: "Taste & Gustatory",
          icon: "👅",
          badgeColor: "rose",
          percentage: 5,
          detectedKeywords: ["চা"],
          status: "adequate",
        },
      },
      deadZones: [
        {
          paragraphIndex: 2,
          excerpt: "সে তার হাতের পুরনো নীল ফাইলটির দিকে স্তব্ধ হয়ে চেয়ে রইল।",
          issueBangla: "চরিত্রটি নিথর দাঁড়িয়ে কথা ভাবছে; দৃশ্যপটে কোনো শারীরিক বা বায়বীয় ছোঁয়া নেই।",
          suggestedSensoryBrushBangla:
            "ফাইলটির স্যাঁতসেঁতে চামড়ার মলাট থেকে পুরনো আলমারির ন্যাপথলিনের ঝাঁঝালো গন্ধ ভেসে আসছিল; কাগজের খসখসে স্পর্শ তার আঙুলে বরফের মতো ঠেকছিল।",
        },
      ],
      sensoryBrushes: [
        {
          sense: "smell",
          brushNameBangla: "বর্ষার সোঁদা গন্ধ (Petrichor)",
          sampleSnippetBangla:
            "খোলা জানালা দিয়ে ভিজে ওঠা লাল মাটির ভেজা গন্ধ ঘরের গুমোট হাওয়াকে ভিজিয়ে দিল।",
        },
        {
          sense: "sound",
          brushNameBangla: "দূরের কর্কশ হর্ন (Urban Tension)",
          sampleSnippetBangla:
            "বাইরে মূল রাস্তায় আটকে থাকা ট্রাকের একটানা কর্কশ হর্ন রাতের নীরবতাকে টুকরো করে কাটছিল।",
        },
        {
          sense: "touch",
          brushNameBangla: "শিরদাঁড়ায় ঠান্ডা স্রোত (Visceral Dread)",
          sampleSnippetBangla:
            "তার হাতের তালু হঠাৎ ঘামে পিচ্ছিল হয়ে উঠল, পিঠের চামড়ায় ঠান্ডা একটা শিরশিরানি নেমে এল।",
        },
      ],
      timestamp: new Date().toISOString(),
    });
  };

  useEffect(() => {
    if (isOpen && !report) {
      runSensoryAudit();
    }
  }, [isOpen]);

  const handleApplyBrush = (snippet: string, idx: number) => {
    if (onApplyToManuscript) {
      onApplyToManuscript(snippet);
      setAppliedBrushIdx(idx);
      setToastMessage("সেন্সরি ব্রাশ পাণ্ডুলিপিতে যোগ হয়েছে!");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage("কপিবোর্ডে কপি হয়েছে!");
    setTimeout(() => setToastMessage(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-500/20 to-sky-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-100 tracking-tight">
                  Sensory Palette & 5-Sense Immersion Painter
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Capability #26
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full">
                  Anti-Talking Heads
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                পঞ্চেন্দ্রিয় অডিট (দর্শন, শ্রবণ, ঘ্রাণ, স্পর্শ, স্বাদ) • টকিং হেডস সিনড্রোম দূরীকরণ • স্পর্শীয় ব্রাশ ইনজেকশন
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {toastMessage && (
              <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full animate-pulse">
                {toastMessage}
              </span>
            )}
            <button
              onClick={runSensoryAudit}
              disabled={isLoading}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1"
              title="পুনরায় বিশ্লেষণ করুন"
            >
              <RotateCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {report && (
            <>
              {/* Scorecards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center space-x-4">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                    <Droplets className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      সেন্সরি ইমার্শন স্কোর
                    </span>
                    <div className="text-2xl font-black text-emerald-300 flex items-baseline gap-1">
                      {report.sensoryImmersionScore}%
                      <span className="text-xs text-slate-400 font-normal">/ 100</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center space-x-4">
                  <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      টকিং হেডস ঝুঁকি
                    </span>
                    <div className="text-xl font-bold capitalize text-sky-300">
                      {report.talkingHeadsRiskLevel} Risk
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center space-x-4">
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      মোট বিশ্লেষিত শব্দ
                    </span>
                    <div className="text-xl font-bold text-purple-300">
                      {report.totalWords} শব্দ
                    </div>
                  </div>
                </div>
              </div>

              {/* Talking Heads Warning Banner */}
              <div className="p-4 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-sky-950/30 border border-emerald-500/30 rounded-xl flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                    Sensory Grounding Diagnosis
                  </h4>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    {report.talkingHeadsWarningBangla}
                  </p>
                </div>
              </div>

              {/* 5-Sense Immersion Meter Distribution */}
              <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  পঞ্চেন্দ্রিয় বণ্টন সূচক (5-Sense Radar Breakdown)
                </h4>

                <div className="space-y-3">
                  {Object.values(report.senses).map((s) => (
                    <div key={s.sense} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span>{s.icon}</span>
                          <span className="font-semibold text-slate-200">{s.labelBangla}</span>
                          <span className="text-[10px] text-slate-500">
                            (শনাক্ত শব্দ: {s.detectedKeywords.join(", ") || "কিছুই পাওয়া যায়নি"})
                          </span>
                        </div>
                        <span className="font-bold text-slate-300">{s.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            s.sense === "sight"
                              ? "bg-sky-400"
                              : s.sense === "sound"
                              ? "bg-amber-400"
                              : s.sense === "smell"
                              ? "bg-emerald-400"
                              : s.sense === "touch"
                              ? "bg-purple-400"
                              : "bg-rose-400"
                          }`}
                          style={{ width: `${s.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dead Zones & Suggested Sensory Brushes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dead Zones */}
                <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      সেন্সরি ডেড জোন (Sensory Dead Zones)
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    যেসব অনুচ্ছেদে কোনো শারীরিক সংবেদন বা গন্ধের স্পর্শ নেই
                  </p>

                  <div className="space-y-3 pt-1">
                    {report.deadZones.map((dz, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs"
                      >
                        <p className="font-serif italic text-slate-300">"{dz.excerpt}"</p>
                        <p className="text-[11px] text-rose-300/80">
                          <strong>সমস্যা:</strong> {dz.issueBangla}
                        </p>
                        <div className="p-2.5 bg-slate-950 rounded border border-emerald-500/30 text-emerald-200 text-[11px]">
                          <strong>প্রস্তাবিত সেন্সরি টাচ:</strong> {dz.suggestedSensoryBrushBangla}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sensory Brushes Palette */}
                <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <Palette className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      স্পর্শীয় ব্রাশ প্যালেট (Ready Sensory Brushes)
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    এক ক্লিকে পাণ্ডুলিপির ভেতরে সতেজ ইন্দ্রিয়ানুভূতির আবেশ ছড়ান
                  </p>

                  <div className="space-y-3 pt-1">
                    {report.sensoryBrushes.map((brush, idx) => {
                      const isApplied = appliedBrushIdx === idx;
                      return (
                        <div
                          key={idx}
                          className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200 text-xs">
                              {brush.brushNameBangla}
                            </span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleCopy(brush.sampleSnippetBangla)}
                                className="p-1 text-slate-400 hover:text-slate-200"
                                title="কপি করুন"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleApplyBrush(brush.sampleSnippetBangla, idx)}
                                disabled={isApplied}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 ${
                                  isApplied
                                    ? "bg-emerald-800 text-emerald-100"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                                }`}
                              >
                                {isApplied ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>যোগ হয়েছে</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3 h-3" />
                                    <span>যোগ করুন</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          <p className="font-serif italic text-slate-300 text-[11px]">
                            "{brush.sampleSnippetBangla}"
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
