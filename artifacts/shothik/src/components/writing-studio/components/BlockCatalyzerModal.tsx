import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Flame,
  Zap,
  RotateCcw,
  Check,
  Copy,
  ArrowRight,
  ShieldAlert,
  Brain,
  Layers,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  DoorOpen,
  FileText,
  Activity,
} from "lucide-react";

export type CatalyticSparkType = "intrusion" | "revelation" | "hazard";

export interface CatalyticSpark {
  id: string;
  type: CatalyticSparkType;
  typeLabelBangla: string;
  typeLabelEnglish: string;
  icon: string;
  badgeColor: string;
  headlineBangla: string;
  promptSparkBangla: string;
  dramaticPurposeBangla: string;
}

export interface ReverseStoryBeat {
  id: string;
  beatIndex: number;
  beatNameBangla: string;
  beatNameEnglish: string;
  synopsisBangla: string;
  detectedExcerpt: string;
  status: "solid" | "weak" | "missing";
  recommendationBangla: string;
}

export interface BlockCatalyzerResult {
  projectId: string;
  sparks: CatalyticSpark[];
  flowStateTipBangla: string;
  timestamp: string;
}

export interface ReverseOutlineResult {
  projectId: string;
  totalWordCount: number;
  structuralHealthScore: number;
  pacingAssessmentBangla: string;
  beats: ReverseStoryBeat[];
  timestamp: string;
}

interface BlockCatalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEditorText?: string;
  onApplyToManuscript?: (insertedText: string) => void;
  projectId?: string;
}

export const BlockCatalyzerModal: React.FC<BlockCatalyzerModalProps> = ({
  isOpen,
  onClose,
  activeEditorText = "",
  onApplyToManuscript,
  projectId = "proj_demo_bengali",
}) => {
  const [activeTab, setActiveTab] = useState<"catalyzer" | "outline">("catalyzer");
  const [selectedTone, setSelectedTone] = useState<"thriller" | "literary" | "mystery" | "drama">("thriller");
  const [isLoading, setIsLoading] = useState(false);
  const [catalyzerData, setCatalyzerData] = useState<BlockCatalyzerResult | null>(null);
  const [outlineData, setOutlineData] = useState<ReverseOutlineResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [appliedSparkId, setAppliedSparkId] = useState<string | null>(null);

  const fallbackText =
    activeEditorText && activeEditorText.trim().length > 20
      ? activeEditorText
      : `রাত নেমেছে শহরের বুকে। বৃষ্টির ফোঁটাগুলো কাঁচের জানালায় আছড়ে পড়ছে একঘেয়ে ছন্দে।
সে তার হাতের পুরনো নীল ফাইলটির দিকে স্তব্ধ হয়ে চেয়ে রইল।
কোনো শব্দ নেই, কেবল দেয়ালঘড়ির টিকটিক আওয়াজ যেন মৃত্যুর আগমনী বার্তা বাজাচ্ছে।
হঠাৎ বাইরে কোথাও কড়া ব্রেক কষার তীক্ষ্ণ চিৎকার। ঠিক তখনই দরজায় দুটো মৃদু অথচ নিশ্চিত কড়া নাড়ার শব্দ হলো।`;

  const fetchSparks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8080/api/v1/projects/${projectId}/block-catalyzer/sparks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            manuscriptContext: fallbackText,
            tone: selectedTone,
          }),
        }
      );
      if (res.ok) {
        const data: BlockCatalyzerResult = await res.json();
        setCatalyzerData(data);
      } else {
        simulateLocalSparks();
      }
    } catch {
      simulateLocalSparks();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOutline = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8080/api/v1/projects/${projectId}/block-catalyzer/reverse-outline`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            manuscriptText: fallbackText,
          }),
        }
      );
      if (res.ok) {
        const data: ReverseOutlineResult = await res.json();
        setOutlineData(data);
      } else {
        simulateLocalOutline();
      }
    } catch {
      simulateLocalOutline();
    } finally {
      setIsLoading(false);
    }
  };

  const simulateLocalSparks = () => {
    setCatalyzerData({
      projectId,
      sparks: [
        {
          id: `spark_intr_${Date.now()}_1`,
          type: "intrusion",
          typeLabelBangla: "অতর্কিত অনুপ্রবেশ",
          typeLabelEnglish: "The Sudden Intrusion",
          icon: "🚪",
          badgeColor: "sky",
          headlineBangla: "দরজায় ভেজা খামে একটি নামহীন পার্সেল",
          promptSparkBangla:
            "ঠিক এই মুহূর্তে দরজার নিচ দিয়ে নিঃশব্দে একটি ধূসর খাম ঢুকিয়ে দেওয়া হলো। খামের ওপর কোনো নাম নেই, শুধু রক্তিম কালিতে লেখা—'আর মাত্র সাত ঘণ্টা বাকি'...",
          dramaticPurposeBangla:
            "চরিত্রের অন্তর্দ্বন্দ্ব ভেঙে বাইরের জগত থেকে সরাসরি এক আকস্মিক বিপদ বা তাড়া দৃশ্যপটে ছুঁড়ে দেয়।",
        },
        {
          id: `spark_rev_${Date.now()}_2`,
          type: "revelation",
          typeLabelBangla: "গোপন সত্যের উন্মোচন",
          typeLabelEnglish: "The Shocking Revelation",
          icon: "📜",
          badgeColor: "amber",
          headlineBangla: "পুরনো নথির পেছনে লুকানো হাতের লেখা",
          promptSparkBangla:
            "ফাইলটি ওল্টাতে গিয়ে সে লক্ষ্য করল ভেতরের পাতার মার্জিনে পেন্সিলে খুব ছোট করে লেখা একটি পরিচিত টেলিফোন নম্বর—যা তার মৃত বন্ধুর ব্যক্তিগত ডায়েরির সাথে হুবহু মিলে যায়!",
          dramaticPurposeBangla:
            "চরিত্রকে নতুন তথ্যের মুখে ফেলে পূর্ববর্তী সব ধারণাকে ওলটপালট করে দেয়।",
        },
        {
          id: `spark_haz_${Date.now()}_3`,
          type: "hazard",
          typeLabelBangla: "তাৎক্ষণিক সংকট / বিপদ",
          typeLabelEnglish: "Immediate Hazard / Peril",
          icon: "⚡",
          badgeColor: "rose",
          headlineBangla: "বিদ্যুৎ বিভ্রাট ও পদশব্দ",
          promptSparkBangla:
            "এক লহমায় পুরো বাড়ির আলো দপ করে নিভে গেল। ঘোর কৃষ্ণবর্ণ অন্ধকারে কাঠের সিঁড়িতে ভারী বুটের অতি সন্তর্পণে এগিয়ে আসার শব্দ...",
          dramaticPurposeBangla:
            "শারীরিক টিকে থাকার তাগিদ তৈরি করে লেখাকে তাৎক্ষণিক স্নায়ুচাপ ও অ্যাকশনে উন্নীত করে।",
        },
      ],
      flowStateTipBangla:
        "টিপ: লজিক বা পারফেকশন নিয়ে চিন্তা না করে যেকোনো একটি স্পার্ক দিয়ে পরবর্তী ১০ মিনিট টানা লিখে যান।",
      timestamp: new Date().toISOString(),
    });
  };

  const simulateLocalOutline = () => {
    setOutlineData({
      projectId,
      totalWordCount: fallbackText.trim().split(/\s+/).length,
      structuralHealthScore: 83,
      pacingAssessmentBangla:
        "শক্তিশালী নাটকীয় কাঠামো: ৬টি মূল বিটের বেশিরভাগই পাণ্ডুলিপিতে সুদৃঢ়ভাবে উপস্থিত।",
      beats: [
        {
          id: "beat_1",
          beatIndex: 1,
          beatNameBangla: "১. সূচনা ও পরিবেশের প্রতিষ্ঠা",
          beatNameEnglish: "Opening Image & Status Quo",
          synopsisBangla: "প্রধান চরিত্রের বর্তমান জগৎ ও পরিপার্শ্বের মেজাজ তুলে ধরা হয়েছে।",
          detectedExcerpt: "রাত নেমেছে শহরের বুকে। বৃষ্টির ফোঁটাগুলো জানালায় আছড়ে পড়ছে।",
          status: "solid",
          recommendationBangla: "পরিবেশ বেশ জীবন্ত; চরিত্রের প্রাথমিক আকাঙ্ক্ষা আরেকটু স্পষ্ট করা যায়।",
        },
        {
          id: "beat_2",
          beatIndex: 2,
          beatNameBangla: "২. ঘটনার স্ফুলিঙ্গ",
          beatNameEnglish: "Inciting Incident / Catalyst",
          synopsisBangla: "একটি অজানা ফাইল বা নথির আগমন স্বাভাবিক জীবনকে নাড়িয়ে দেয়।",
          detectedExcerpt: "সে তার হাতের পুরনো নীল ফাইলটির দিকে স্তব্ধ হয়ে চেয়ে রইল।",
          status: "solid",
          recommendationBangla: "এই নথির তাৎক্ষণিক বিপদ ও গুরুত্ব পাঠকদের কাছে পরিষ্কার হয়েছে।",
        },
        {
          id: "beat_3",
          beatIndex: 3,
          beatNameBangla: "৩. সংশয় ও অন্তর্দ্বন্দ্ব",
          beatNameEnglish: "Rising Complication & Doubt",
          synopsisBangla: "চরিত্রটি একা বসে হিসাব মেলাবার চেষ্টা করে।",
          detectedExcerpt: "কোনো শব্দ নেই, কেবল দেয়ালঘড়ির টিকটিক আওয়াজ...",
          status: "solid",
          recommendationBangla: "চরিত্রের ভাবনার সাথে বাইরের কোনো বাস্তব তাড়া যোগ করলে গতি বজায় থাকবে।",
        },
        {
          id: "beat_4",
          beatIndex: 4,
          beatNameBangla: "৪. মধ্যভাগের মোড়বদল",
          beatNameEnglish: "Midpoint Shift / Turning Point",
          synopsisBangla: "বাহ্যিক বিপদের উপস্থিতি অনুভূত হওয়া।",
          detectedExcerpt: "হঠাৎ বাইরে কোথাও কড়া ব্রেক কষার তীক্ষ্ণ চিৎকার।",
          status: "solid",
          recommendationBangla: "উত্তেজনা শক্তভাবে ধরে রাখা হয়েছে।",
        },
        {
          id: "beat_5",
          beatIndex: 5,
          beatNameBangla: "৫. চরম সংকট",
          beatNameEnglish: "Crisis Peak",
          synopsisBangla: "আটকে পড়ার মুহূর্তে কোনো সাহায্য না পাওয়ার অনুভূতি।",
          detectedExcerpt: "পালানোর আর কোনো দৃশ্যমান পথ নেই...",
          status: "weak",
          recommendationBangla: "চরিত্রের মানসিক বিপর্যয়ের চিত্রায়ন আরেকটু গভীর করা দরকার।",
        },
        {
          id: "beat_6",
          beatIndex: 6,
          beatNameBangla: "৬. ক্লিফহ্যাংগার হুক",
          beatNameEnglish: "Climax / Cliffhanger Finish",
          synopsisBangla: "দরজায় অতর্কিত কড়া নাড়ার মাধ্যমে নাটকীয় উত্তেজনার শীর্ষে অধ্যায় সমাপ্ত।",
          detectedExcerpt: "দরজায় দুটো মৃদু অথচ নিশ্চিত কড়া নাড়ার শব্দ হলো।",
          status: "solid",
          recommendationBangla: "পরবর্তী অধ্যায় পড়ার দুর্নিবার আকর্ষণ তৈরি হয়েছে।",
        },
      ],
      timestamp: new Date().toISOString(),
    });
  };

  useEffect(() => {
    if (isOpen) {
      if (!catalyzerData) fetchSparks();
      if (!outlineData) fetchOutline();
    }
  }, [isOpen]);

  const handleApplySpark = (spark: CatalyticSpark) => {
    if (onApplyToManuscript) {
      onApplyToManuscript(spark.promptSparkBangla);
      setAppliedSparkId(spark.id);
      setToastMessage("স্পার্ক পাণ্ডুলিপিতে যোগ করা হয়েছে!");
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
            <div className="p-2.5 bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/40 rounded-xl text-amber-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-100 tracking-tight">
                  "Beat the Block" Flow-State Catalyzer & Reverse Outliner
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  Capability #25
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                  Block Buster
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                আটকে গেলে তাৎক্ষণিক ৩ নাটকীয় অনুঘটক (অনুপ্রবেশ, সত্যোন্মোচন, সংকট) • রিভার্স ৬-বিট আউটলাইনার
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
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher & Filter Bar */}
        <div className="px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab("catalyzer")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 border transition-all ${
                activeTab === "catalyzer"
                  ? "bg-slate-800 border-amber-500/60 text-amber-300 shadow"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ফ্লো-স্টেট ক্যাটালিজার (৩ স্পার্ক)</span>
            </button>
            <button
              onClick={() => setActiveTab("outline")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 border transition-all ${
                activeTab === "outline"
                  ? "bg-slate-800 border-sky-500/60 text-sky-300 shadow"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>রিভার্স আউটলাইনার (৬-বিট বিশ্লেষণ)</span>
            </button>
          </div>

          {activeTab === "catalyzer" && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">টোন:</span>
              {(["thriller", "literary", "mystery", "drama"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTone(t)}
                  className={`px-2.5 py-1 text-xs rounded-lg border capitalize transition-all ${
                    selectedTone === t
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {t}
                </button>
              ))}
              <button
                onClick={fetchSparks}
                disabled={isLoading}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs flex items-center space-x-1"
                title="নতুন চমক তৈরি করুন"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">রিলোড</span>
              </button>
            </div>
          )}

          {activeTab === "outline" && (
            <button
              onClick={fetchOutline}
              disabled={isLoading}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-xs flex items-center space-x-1.5"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>পুনরায় বিট বিশ্লেষণ</span>
            </button>
          )}
        </div>

        {/* Tab 1 Content: Catalytic Sparks */}
        {activeTab === "catalyzer" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {catalyzerData && (
              <>
                {/* Flow State Tip */}
                <div className="p-4 bg-gradient-to-r from-amber-950/30 via-slate-900 to-rose-950/30 border border-amber-500/30 rounded-xl flex items-start space-x-3">
                  <Brain className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                      Flow-State Catalyzer Rule
                    </h4>
                    <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                      {catalyzerData.flowStateTipBangla}
                    </p>
                  </div>
                </div>

                {/* 3 Catalytic Spark Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {catalyzerData.sparks.map((spark) => {
                    const isApplied = appliedSparkId === spark.id;
                    return (
                      <div
                        key={spark.id}
                        className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all shadow-lg ${
                          spark.type === "intrusion"
                            ? "bg-sky-950/20 border-sky-500/40"
                            : spark.type === "revelation"
                            ? "bg-amber-950/20 border-amber-500/40"
                            : "bg-rose-950/20 border-rose-500/40"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-3xl">{spark.icon}</span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                                spark.type === "intrusion"
                                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                                  : spark.type === "revelation"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              }`}
                            >
                              {spark.typeLabelBangla}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-100 leading-snug">
                            {spark.headlineBangla}
                          </h4>

                          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs font-serif italic text-slate-200 leading-relaxed">
                            "{spark.promptSparkBangla}"
                          </div>

                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            <strong>নাটকীয় উদ্দেশ্য:</strong> {spark.dramaticPurposeBangla}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center space-x-2">
                          <button
                            onClick={() => handleCopy(spark.promptSparkBangla)}
                            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-xl text-xs"
                            title="কপি করুন"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleApplySpark(spark)}
                            disabled={isApplied}
                            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow ${
                              isApplied
                                ? "bg-emerald-800 text-emerald-100"
                                : spark.type === "intrusion"
                                ? "bg-sky-600 hover:bg-sky-500 text-white"
                                : spark.type === "revelation"
                                ? "bg-amber-600 hover:bg-amber-500 text-white"
                                : "bg-rose-600 hover:bg-rose-500 text-white"
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>যুক্ত হয়েছে</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>পাণ্ডুলিপিতে যোগ করুন</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2 Content: Reverse Outliner */}
        {activeTab === "outline" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {outlineData && (
              <>
                {/* Structural Scorecard Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center space-x-4">
                    <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                        স্ট্রাকচারাল হেলথ স্কোর
                      </span>
                      <div className="text-2xl font-black text-sky-300 flex items-baseline gap-1">
                        {outlineData.structuralHealthScore}%
                        <span className="text-xs text-emerald-400 ml-1 font-normal">
                          ({outlineData.structuralHealthScore >= 80 ? "Solid" : "Needs Complication"})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center space-x-4">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                        বিশ্লেষিত শব্দসংখ্যা
                      </span>
                      <div className="text-xl font-bold text-amber-300">
                        {outlineData.totalWordCount} শব্দ
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center space-x-4">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                        শনাক্তকৃত বিটস
                      </span>
                      <div className="text-xl font-bold text-emerald-300">
                        {outlineData.beats.length} / 6 পূর্ণাঙ্গ
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed">
                  <strong>সার্বিক পেসিং ও আর্কিটেকচার মূল্যায়ন:</strong> {outlineData.pacingAssessmentBangla}
                </div>

                {/* 6-Beat Story Roadmap */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    রিভার্স ৬-বিট স্টোরি রোডম্যাপ (Reverse Beat Sheet)
                  </h4>

                  <div className="space-y-3">
                    {outlineData.beats.map((beat) => (
                      <div
                        key={beat.id}
                        className="p-4 bg-slate-950/70 border border-slate-800 hover:border-sky-500/40 rounded-xl transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-sky-300 border border-slate-700 rounded">
                              বিট #{beat.beatIndex}
                            </span>
                            <h5 className="text-xs font-bold text-slate-200">
                              {beat.beatNameBangla}
                            </h5>
                          </div>

                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                              beat.status === "solid"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {beat.status === "solid" ? "✓ Solid Beat" : "⚠️ Weak / Gap"}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {beat.synopsisBangla}
                        </p>

                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs font-serif italic text-slate-400">
                          "{beat.detectedExcerpt}"
                        </div>

                        <p className="text-[11px] text-sky-300/80 bg-sky-950/30 p-2 rounded border border-sky-500/20">
                          💡 <strong>পরামর্শ:</strong> {beat.recommendationBangla}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
