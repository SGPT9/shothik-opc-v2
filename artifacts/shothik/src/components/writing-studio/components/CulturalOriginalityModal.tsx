import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Award,
  Feather,
  CheckCircle2,
  FileText,
  PlusCircle,
  RefreshCw,
  Search
} from "lucide-react";

interface FolkIdiomMatch {
  id: string;
  phrase: string;
  category: "khonar_bachan" | "rural_proverb" | "baul_bhatiali_song" | "purbabanga_ballad" | "modern_copyright";
  categoryLabelBn: string;
  sourceOrigin: string;
  isPublicDomainHeritage: boolean;
  ipInfringementRisk: "none" | "low" | "high";
  contextualMeaning: string;
  authenticityContributionScore: number;
}

interface OriginalityAuditResult {
  overallOriginalityScore: number;
  folkloreHeritageIndex: number;
  copyrightRiskLevel: "negligible" | "low" | "moderate" | "critical";
  totalHeritageIdiomsFound: number;
  totalCopyrightCollisionsFound: number;
  matches: FolkIdiomMatch[];
  heritageBreakdown: {
    khonarBachanCount: number;
    ruralProverbsCount: number;
    folkBalladsCount: number;
    regionalColloquialCount: number;
  };
  recommendedEnrichments: {
    phrase: string;
    origin: string;
    suggestedContext: string;
  }[];
  generatedAuthenticProseSnippet: string;
}

interface CulturalOriginalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  manuscriptText?: string;
  onInsertProse?: (prose: string) => void;
}

export const CulturalOriginalityModal: React.FC<CulturalOriginalityModalProps> = ({
  isOpen,
  onClose,
  projectId = "proj_demo_bengali",
  manuscriptText = "",
  onInsertProse
}) => {
  const [activeTab, setActiveTab] = useState<"radar" | "corpus" | "enrichments">("radar");
  const [audit, setAudit] = useState<OriginalityAuditResult | null>(null);
  const [corpus, setCorpus] = useState<FolkIdiomMatch[]>([]);
  const [scanText, setScanText] = useState(manuscriptText);
  const [loading, setLoading] = useState(false);

  const fetchState = () => {
    setLoading(true);
    fetch(`/api/v1/projects/${projectId}/cultural-originality`)
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.success) {
          setAudit(data.audit || null);
          setCorpus(data.corpusHeritageItems || []);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error("Failed to load cultural originality state:", err);
      });
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchState();
    setScanText(manuscriptText);
  }, [isOpen, projectId, manuscriptText]);

  const handleScanManuscript = () => {
    setLoading(true);
    fetch(`/api/v1/projects/${projectId}/cultural-originality/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ manuscriptText: scanText })
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.success) {
          setAudit(data.audit || null);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error("Scan failed:", err);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl h-[88vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-100">
                  Cultural Folk Idiom & Regional Originality Scorer
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Capability #37
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                লোকায়ত প্রবাদ, খনার বচন ও আঞ্চলিক মৌলিকত্ব মূল্যায়নকারী (Zero IP Risk Folklore Scanner)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Summary Ribbon */}
        {audit && (
          <div className="flex items-center justify-between px-6 py-2.5 bg-teal-950/20 border-b border-teal-900/30 text-xs text-teal-300">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5 font-medium text-teal-200">
                <Award className="w-3.5 h-3.5 text-teal-400" />
                সামগ্রিক মৌলিকত্ব স্কোর: {audit.overallOriginalityScore} / ১০০
              </span>
              <span className="flex items-center gap-1.5 text-amber-300">
                <Feather className="w-3.5 h-3.5 text-amber-400" />
                লোকঐতিহ্য নিবিড়তা সূচক: {audit.folkloreHeritageIndex} / ১০০
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                কপিরাইট লঙ্ঘন ঝুঁকি: {audit.copyrightRiskLevel.toUpperCase()}
              </span>
            </div>
            <button
              onClick={fetchState}
              className="flex items-center gap-1 text-xs text-teal-400/80 hover:text-teal-300"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              পুনরায় নিরীক্ষা
            </button>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-neutral-800 bg-neutral-900">
          <button
            onClick={() => setActiveTab("radar")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "radar"
                ? "border-teal-500 text-teal-400 bg-teal-500/5"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Originality & Folklore Radar
          </button>
          <button
            onClick={() => setActiveTab("corpus")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "corpus"
                ? "border-teal-500 text-teal-400 bg-teal-500/5"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Recognized Heritage Corpus ({corpus.length})
          </button>
          <button
            onClick={() => setActiveTab("enrichments")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "enrichments"
                ? "border-teal-500 text-teal-400 bg-teal-500/5"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Feather className="w-4 h-4" />
            Recommended Folk Enrichments ({audit?.recommendedEnrichments.length || 0})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: RADAR & AUDIT */}
          {activeTab === "radar" && audit && (
            <div className="space-y-6">
              {/* Score Meter Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-neutral-950/60 border border-teal-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-400">সামগ্রিক মৌলিকত্ব স্কোর</span>
                    <h3 className="text-3xl font-black text-teal-400 mt-1">
                      {audit.overallOriginalityScore}%
                    </h3>
                    <p className="text-[11px] text-teal-300/80 mt-1">কপিরাইট ও সাহিত্যিক মৌলিকত্ব সুরক্ষিত</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                    <Award className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-neutral-950/60 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-400">লোকঐতিহ্য সমৃদ্ধি সূচক</span>
                    <h3 className="text-3xl font-black text-amber-400 mt-1">
                      {audit.folkloreHeritageIndex}%
                    </h3>
                    <p className="text-[11px] text-amber-300/80 mt-1">
                      {audit.totalHeritageIdiomsFound} টি দেশজ প্রবাদ ও লোকগাথা স্বীকৃত
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Feather className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-neutral-950/60 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-400">গ্রন্থস্বত্ব (IP) ঝুঁকি নিরীক্ষা</span>
                    <h3 className="text-2xl font-bold text-emerald-400 mt-1 uppercase">
                      {audit.copyrightRiskLevel}
                    </h3>
                    <p className="text-[11px] text-emerald-300/80 mt-1">
                      ঐতিহাসিক প্রবাদ পাবলিক ডোমেইন হিসেবে প্রমাণিত
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Scan Manuscript Section */}
              <div className="p-5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                    <Search className="w-4 h-4 text-teal-400" />
                    পাণ্ডুলিপির পাঠ্য বিশ্লেষণ ও দেশজ লোকজ্ঞান স্ক্যানার
                  </h4>
                  <button
                    onClick={handleScanManuscript}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-950 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {loading ? "বিশ্লেষণ হচ্ছে..." : "লোকজ্ঞান অডিট চালান (Audit Folklore)"}
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={scanText}
                  onChange={(e) => setScanText(e.target.value)}
                  placeholder="পাণ্ডুলিপির দৃশ্য বা অধ্যায় এখানে পেস্ট করে লোকজ্ঞান স্ক্যান করুন..."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-xs text-neutral-200 focus:outline-none focus:border-teal-500 leading-relaxed font-serif"
                />
              </div>

              {/* Identified Folk Idioms */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  সনাক্তকৃত লোকায়ত প্রবাদ ও পদাবলী ({audit.matches.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {audit.matches.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2 py-0.5 rounded bg-teal-950/60 border border-teal-800 text-teal-300 font-medium">
                            {item.categoryLabelBn}
                          </span>
                          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Public Domain (No IP Risk)
                          </span>
                        </div>

                        <p className="font-bold text-neutral-100 text-sm font-serif">"{item.phrase}"</p>
                        <p className="text-neutral-400 text-[11px] leading-relaxed">{item.contextualMeaning}</p>
                      </div>

                      <div className="pt-2 border-t border-neutral-800/60 text-[11px] text-neutral-500 flex items-center justify-between">
                        <span>উৎস: {item.sourceOrigin}</span>
                        <span className="text-amber-400 font-semibold">
                          +{item.authenticityContributionScore} Authenticity
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Sensory Folk Scene */}
              {audit.generatedAuthenticProseSnippet && (
                <div className="space-y-2 p-5 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <span className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    উন্মোচিত দেশজ লোকগাথা দৃশ্য (Generated Folk-Enriched Narrative Scene):
                  </span>
                  <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 font-serif leading-relaxed italic">
                    "{audit.generatedAuthenticProseSnippet}"
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => onInsertProse?.(audit.generatedAuthenticProseSnippet)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      দৃশ্যটি পাণ্ডুলিপিতে যোগ করুন (Inject Scene)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HERITAGE CORPUS */}
          {activeTab === "corpus" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-200">
                  স্বীকৃত লোকঐতিহ্য ও পাবলিক ডোমেইন ডাটাবেজ (Recognized Heritage Corpus)
                </h3>
                <span className="text-xs text-neutral-400">
                  এআই চুরিবৃত্তি শনাক্তকারী দ্বারা কখনোই 'কপিরাইট লঙ্ঘন' হিসেবে গণ্য হবে না
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {corpus.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-xl bg-neutral-950/50 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        {item.categoryLabelBn}
                      </span>
                      <span className="text-xs font-mono text-amber-400">
                        +{item.authenticityContributionScore} Pts
                      </span>
                    </div>

                    <h4 className="text-sm font-bold font-serif text-neutral-100">"{item.phrase}"</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">{item.contextualMeaning}</p>

                    <div className="pt-2 border-t border-neutral-800/60 text-[11px] text-neutral-500">
                      <span>ঐতিহাসিক ভিত্তি: {item.sourceOrigin}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RECOMMENDED ENRICHMENTS */}
          {activeTab === "enrichments" && audit && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-200">
                  পাণ্ডুলিপির জন্য প্রস্তাবিত লোকপ্রবাদ ও দেশজ প্রজ্ঞা (Recommended Folk Enrichments)
                </h3>
                <span className="text-xs text-neutral-400">
                  গল্পের গভীরতা ও মাটির ঘ্রাণ বৃদ্ধির জন্য সরাসরি সংলাপে ব্যবহারযোগ্য
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {audit.recommendedEnrichments.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-teal-300 font-serif">"{rec.phrase}"</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                        {rec.origin}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed">{rec.suggestedContext}</p>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => onInsertProse?.(`\n\n"${rec.phrase}"\n`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/30 text-teal-300 text-xs font-semibold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        এই প্রবাদটি পাণ্ডুলিপিতে যোগ করুন (Inject Proverb)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
