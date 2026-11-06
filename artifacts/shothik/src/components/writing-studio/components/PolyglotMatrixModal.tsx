import React, { useState, useEffect } from "react";
import {
  X,
  Languages,
  Globe,
  BookOpen,
  Sparkles,
  Check,
  Copy,
  ChevronRight,
  ShieldCheck,
  Zap,
  Coffee,
  Utensils,
  BookMarked,
  FileText
} from "lucide-react";

export type SupportedTargetLanguage = "en" | "hi" | "es" | "fr" | "ar" | "ja" | "de";
export type LocalizationStrategy = "domestication" | "foreignization" | "dynamic_equivalence" | "hybrid_glossary";

export interface CultureBoundItem {
  id: string;
  sourceBengali: string;
  category: "food_and_drink" | "kinship_and_honorific" | "idiom_and_proverb" | "social_ritual_and_setting";
  categoryLabelBn: string;
  culturalContextBn: string;
  literalTranslationEn: string;
  localizations: Record<
    SupportedTargetLanguage,
    {
      targetLanguageName: string;
      domestication: string;
      foreignization: string;
      dynamicEquivalence: string;
      culturalNote: string;
    }
  >;
}

export interface PolyglotMatrixState {
  projectId: string;
  detectedCbiCount: number;
  overallCulturalDensityScore: number;
  cultureBoundItems: CultureBoundItem[];
  sampleManuscriptExcerptBn: string;
  translatedSamples: Record<
    SupportedTargetLanguage,
    {
      languageName: string;
      nativeName: string;
      flagEmoji: string;
      sampleText: string;
      strategyUsed: LocalizationStrategy;
    }
  >;
}

interface PolyglotMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  onInsertProse?: (prose: string) => void;
}

const LANGUAGE_CONFIGS: { code: SupportedTargetLanguage; label: string; flag: string; native: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧", native: "English (Literary)" },
  { code: "hi", label: "Hindi", flag: "🇮🇳", native: "हिन्दी" },
  { code: "es", label: "Spanish", flag: "🇪🇸", native: "Español" },
  { code: "fr", label: "French", flag: "🇫🇷", native: "Français" },
  { code: "ar", label: "Arabic", flag: "🇸🇦", native: "العربية" },
  { code: "ja", label: "Japanese", flag: "🇯🇵", native: "日本語" },
  { code: "de", label: "German", flag: "🇩🇪", native: "Deutsch" }
];

export const PolyglotMatrixModal: React.FC<PolyglotMatrixModalProps> = ({
  isOpen,
  onClose,
  projectId = "proj_demo_bengali",
  onInsertProse
}) => {
  const [selectedLang, setSelectedLang] = useState<SupportedTargetLanguage>("en");
  const [activeTab, setActiveTab] = useState<"localization_matrix" | "culture_bound_items" | "bilingual_appendix">("localization_matrix");
  const [selectedStrategy, setSelectedStrategy] = useState<LocalizationStrategy>("foreignization");
  const [matrixState, setMatrixState] = useState<PolyglotMatrixState | null>(null);
  const [loading, setLoading] = useState(false);
  const [injectedSuccess, setInjectedSuccess] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMatrix();
    }
  }, [isOpen]);

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/v1/projects/${projectId}/polyglot-matrix`);
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setMatrixState(data.state);
        }
      }
    } catch (e) {
      console.warn("Using fallback local polyglot data", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentTranslation = matrixState?.translatedSamples?.[selectedLang];

  const handleInjectGlossary = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/projects/${projectId}/polyglot-matrix/glossary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLanguage: selectedLang })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.glossarySnippet && onInsertProse) {
          onInsertProse(data.glossarySnippet);
          setInjectedSuccess(true);
          setTimeout(() => setInjectedSuccess(false), 3000);
        }
      }
    } catch (e) {
      console.error("Failed to inject glossary", e);
    }
  };

  const handleCopyTranslation = () => {
    if (currentTranslation?.sampleText) {
      navigator.clipboard.writeText(currentTranslation.sampleText);
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
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg text-slate-100">
                  পলিগ্লট কালচারাল লোকালাইজেশন ম্যাট্রিক্স
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  InkOS #42
                </span>
              </div>
              <p className="text-xs text-slate-400">
                বাঙালি সংস্কৃতি, খাদ্যাভ্যাস, বাগধারা ও সামাজিক অনুষঙ্গকে বিশ্বের ৭টি প্রধান ভাষায় স্বাঙ্গীকরণ ও ভাবানুবাদ
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

        {/* 7 Global Language Selector Tabs */}
        <div className="flex items-center px-6 py-2.5 border-b border-slate-800 bg-slate-950/40 gap-2 overflow-x-auto">
          {LANGUAGE_CONFIGS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex-shrink-0 ${
                selectedLang === lang.code
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm"
                  : "bg-slate-800/40 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <span className="text-base leading-none">{lang.flag}</span>
              <span>{lang.native}</span>
            </button>
          ))}
        </div>

        {/* Subtabs Bar */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800 bg-slate-950/20 space-x-2">
          <button
            onClick={() => setActiveTab("localization_matrix")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "localization_matrix"
                ? "border-teal-400 text-teal-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>দ্বিভাষিক অনুবাদ ম্যাট্রিক্স</span>
          </button>

          <button
            onClick={() => setActiveTab("culture_bound_items")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "culture_bound_items"
                ? "border-teal-400 text-teal-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>কালচার-বাউন্ড অনুষঙ্গ ও ফুড ডিকশনারি</span>
          </button>

          <button
            onClick={() => setActiveTab("bilingual_appendix")}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "bilingual_appendix"
                ? "border-teal-400 text-teal-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>আন্তর্জাতিক পাঠক টিকা ও গ্লসারি</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400" />
              <p className="text-sm text-slate-400">৭ ভাষায় কালচারাল ম্যাট্রিক্স সংকলন চলছে...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: BILINGUAL COMPARISON MATRIX */}
              {activeTab === "localization_matrix" && (
                <div className="space-y-5">
                  {/* Strategy Selection Pills */}
                  <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      অনুবাদ ও লোকালাইজেশন দর্শন (Strategy)
                    </span>
                    <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                      {[
                        { id: "foreignization", label: "স্বকীয়তা রক্ষা (Foreignization)" },
                        { id: "domestication", label: "স্বাঙ্গীকরণ (Domestication)" },
                        { id: "dynamic_equivalence", label: "ভাবানুবাদ (Dynamic)" },
                        { id: "hybrid_glossary", label: "হাইব্রিড গ্লসারি (Hybrid)" }
                      ].map((strat) => (
                        <button
                          key={strat.id}
                          onClick={() => setSelectedStrategy(strat.id as LocalizationStrategy)}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition ${
                            selectedStrategy === strat.id
                              ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {strat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Side-by-Side Dual Pane */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Original Bengali Prose */}
                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
                          <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                            <span>🇧🇩 মূল বাংলা পান্ডুলিপির অংশ</span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                            কন্টেন্ট ডেনসিটি: ৮৪%
                          </span>
                        </div>
                        <p className="font-serif text-sm leading-relaxed text-slate-200 pt-3">
                          {matrixState?.sampleManuscriptExcerptBn || "সোডিয়াম বাতির হলুদ আলো তখন সদরঘাটের ভাঙা সিঁড়িতে গড়িয়ে পড়া পানির ফোঁটার ওপর পিছলে পড়ছে..."}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
                        <Utensils className="w-3.5 h-3.5 text-teal-400" />
                        <span>শনাক্তকৃত অনুষঙ্গ: খিচুড়ি-ইলিশ, সদরঘাটের আড্ডা, আদার ব্যাপারী</span>
                      </div>
                    </div>

                    {/* Right: Target Language Translation */}
                    <div className="p-4 rounded-xl bg-slate-800/40 border border-teal-500/30 flex flex-col justify-between space-y-3 shadow-lg shadow-teal-950/20">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
                          <span className="text-xs font-bold text-teal-300 flex items-center space-x-1.5">
                            <span className="text-base">{currentTranslation?.flagEmoji || "🇬🇧"}</span>
                            <span>{currentTranslation?.nativeName || "English"} অনূদিত সংস্করণ</span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase font-mono">
                            {selectedStrategy}
                          </span>
                        </div>
                        <p className="font-serif text-sm leading-relaxed text-slate-100 pt-3">
                          {currentTranslation?.sampleText || "Sodium light slipped across glistening droplets cascading down the cracked stone steps of Sadarghat..."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <span className="text-[11px] text-teal-400">
                          লৈখিক শৈলী: আন্তর্জাতিক সাহিত্য প্রকাশনা মান
                        </span>
                        <button
                          onClick={handleCopyTranslation}
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
                              <span>কপি করুন</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cultural Resonance Guide Note */}
                  <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-500/20 text-xs text-slate-300 space-y-2">
                    <div className="flex items-center space-x-2 text-teal-300 font-semibold">
                      <Sparkles className="w-4 h-4" />
                      <span>{currentTranslation?.languageName} সাহিত্যিক পাঠকদের জন্য অনুবাদকের বিশেষ টিকা</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      বাঙালির বর্ষার খিচুড়ি ও ইলিশ কেবল একটি খাবার নয়, বরং এটি পারিবারিক নিরাপত্তা ও বৃষ্টির দিনে গৃহকোণে উষ্ণতার গভীর প্রতীক। নির্বাচিত কৌশল অনুযায়ী আন্তর্জাতিক পাঠকের কাছে এই আবেগটিকে যথোপযুক্ত সমার্থক অনুষঙ্গে রূপান্তর করা হয়েছে।
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: CULTURE-BOUND ITEMS & FOOD DICTIONARY */}
              {activeTab === "culture_bound_items" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      চিহ্নিত কালচার-বাউন্ড আইটেম ({matrixState?.cultureBoundItems.length || 0})
                    </span>
                    <span className="text-xs text-teal-400">
                      টার্গেট ভাষা: {currentTranslation?.nativeName}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matrixState?.cultureBoundItems.map((cbi) => {
                      const loc = cbi.localizations[selectedLang] || cbi.localizations.en;
                      return (
                        <div
                          key={cbi.id}
                          className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-teal-300 font-serif">
                              "{cbi.sourceBengali}"
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                              {cbi.categoryLabelBn}
                            </span>
                          </div>

                          <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                            <span className="text-slate-400 font-semibold block text-[11px] mb-0.5">আক্ষরিক অর্থ (Literal):</span>
                            "{cbi.literalTranslationEn}"
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <div>
                              <span className="text-slate-400 text-[11px] font-medium">স্বাঙ্গীকরণ (Domestication):</span>
                              <p className="text-amber-300 font-serif mt-0.5">{loc.domestication}</p>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[11px] font-medium">স্বকীয়তা রক্ষা (Foreignization):</span>
                              <p className="text-emerald-300 font-serif mt-0.5">{loc.foreignization}</p>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[11px] font-medium">অনুবাদকের সাংস্কৃতিক নোট:</span>
                              <p className="text-slate-400 text-[11px] mt-0.5">{loc.culturalNote}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: BILINGUAL READER APPENDIX & GLOSSARY */}
              {activeTab === "bilingual_appendix" && (
                <div className="space-y-5 max-w-3xl mx-auto">
                  <div className="text-center space-y-1">
                    <span className="text-xs uppercase tracking-wider text-teal-400 font-semibold">
                      আন্তর্জাতিক সংস্করণের জন্য প্রস্তুত পরিশিষ্ট (Glossary & Appendix)
                    </span>
                    <p className="text-xs text-slate-400">
                      আমাজন কিন্ডল বা পেপারব্যাকে আন্তর্জাতিক পাঠকদের সুবিধার জন্য বইয়ের শেষে যোগ করার মতো ফরম্যাটেড গ্লসারি
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs leading-relaxed text-slate-300 max-h-80 overflow-y-auto">
                    <div className="text-amber-400 font-bold">
                      ### Appendix: Cultural Notes & Glossary for International Readers ({selectedLang.toUpperCase()})
                    </div>
                    {matrixState?.cultureBoundItems.map((item) => {
                      const loc = item.localizations[selectedLang] || item.localizations.en;
                      return (
                        <div key={item.id} className="space-y-1 border-b border-slate-800/80 pb-3">
                          <div className="text-teal-300 font-bold">
                            * {item.sourceBengali} ({item.literalTranslationEn})
                          </div>
                          <div className="text-slate-400 text-[11px] pl-3">
                            • Cultural Meaning: {item.culturalContextBn}
                          </div>
                          <div className="text-slate-300 text-[11px] pl-3">
                            • Contextual Equivalent: {loc.foreignization}
                          </div>
                          <div className="text-slate-500 text-[11px] pl-3">
                            • Translator Note: {loc.culturalNote}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 1-Click Action Button */}
                  <div className="flex items-center justify-center space-x-3 pt-2">
                    <button
                      onClick={handleInjectGlossary}
                      className="py-2.5 px-6 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition flex items-center space-x-2 shadow-lg shadow-teal-500/20"
                    >
                      {injectedSuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>গ্লসারি সফলভাবে পান্ডুলিপির শেষে যুক্ত হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>১-ক্লিকে আন্তর্জাতিক গ্লসারি পান্ডুলিপিতে ইনজেক্ট করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Globe className="w-4 h-4 text-teal-400" />
            <span>সঠিক রাইটিং স্টুডিও • ৭ ভাষার ক্রস-কালচারাল লোকালাইজেশন ফ্রেমওয়ার্ক</span>
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
