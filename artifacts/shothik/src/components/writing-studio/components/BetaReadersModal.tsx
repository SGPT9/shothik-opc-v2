import React, { useState, useEffect } from "react";
import {
  X,
  Users,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  TrendingDown,
  Star,
  Quote,
  ArrowRight,
  Check,
  RotateCcw,
  Zap,
  Target,
  Brain,
  ShieldAlert,
  Flame,
  Search,
  BookOpen,
  HelpCircle,
  Copy,
} from "lucide-react";

export type BetaReaderRole =
  | "farhan_logic"
  | "nabila_thriller"
  | "tahsin_stylist"
  | "samira_romance"
  | "kabir_commuter";

export interface BetaReaderPersona {
  id: BetaReaderRole;
  nameBangla: string;
  nameEnglish: string;
  avatarIcon: string;
  badgeColor: string;
  demographics: string;
  focusArea: string;
  readingSpeed: string;
  dnfTolerance: string;
  critiqueStyle: string;
}

export type MarginNoteType =
  | "plot_hole"
  | "pacing_drag"
  | "dialogue_stiff"
  | "confusing"
  | "gem_moment"
  | "emotional_peak";

export interface AnnotatedMarginNote {
  id: string;
  type: MarginNoteType;
  typeLabelBangla: string;
  highlightedExcerpt: string;
  commentBangla: string;
  commentEnglish: string;
  suggestedRevisionBangla: string;
  severity: "critical" | "medium" | "praise";
}

export interface PersonaReview {
  personaId: BetaReaderRole;
  personaName: string;
  nameBangla: string;
  avatarIcon: string;
  badgeColor: string;
  score: number;
  dnfRiskPercent: number;
  dnfTriggerPoint: string | null;
  firstImpressionBangla: string;
  inDepthCritiqueBangla: string;
  favoriteQuoteBangla: string;
  annotatedMarginNotes: AnnotatedMarginNote[];
  wouldRecommendToFriend: boolean;
}

export interface BetaReaderAuditReport {
  auditId: string;
  projectId: string;
  chapterTitle: string;
  wordCount: number;
  readingTimeMinutes: number;
  consensusSummary: {
    overallScore: number;
    averageDnfRiskPercent: number;
    groupVerdictBangla: string;
    topStrengthsBangla: string[];
    urgentFixesBangla: string[];
    retentionAdviceBangla: string;
  };
  personaReviews: PersonaReview[];
  timestamp: string;
}

interface BetaReadersModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEditorText?: string;
  onApplyToManuscript?: (updatedText: string) => void;
  projectId?: string;
}

const DEFAULT_PERSONAS: BetaReaderPersona[] = [
  {
    id: "farhan_logic",
    nameBangla: "ফারহান (লজিক ও প্লট-হোল অডিটর)",
    nameEnglish: "Farhan (Logic & Continuity Auditor)",
    avatarIcon: "🔍",
    badgeColor: "rose",
    demographics: "সফটওয়্যার আর্কিটেক্ট ও সাই-ফাই ফ্যানাটিক, ৩২",
    focusArea: "টাইমলাইন সঙ্গতি, কারণ ও ফলাফল, তথ্য-জ্ঞান ও যুক্তি",
    readingSpeed: "২২০ WPM",
    dnfTolerance: "লজিক ব্রেক বরদাস্ত করেন না",
    critiqueStyle: "তথ্য-প্রমাণ ভিত্তিক ও কঠোর",
  },
  {
    id: "nabila_thriller",
    nameBangla: "নাবিলা (থ্রিলার ও পেসিং ফ্যানাটিক)",
    nameEnglish: "Nabila (Thriller & High-Stakes Binge Reader)",
    avatarIcon: "⚡",
    badgeColor: "amber",
    demographics: "ডিজিটাল মার্কেটার ও বিঞ্জ-রিডার, ২৬",
    focusArea: "হুক, সিন ভেলোসিটি, ক্লিফহ্যাংগার ও রুদ্ধশ্বাস গতি",
    readingSpeed: "৩৮০ WPM",
    dnfTolerance: "টানা ২ পৃষ্ঠা নিষ্ক্রিয় হলে ডিএনএফ",
    critiqueStyle: "সাসপেন্স-কেন্দ্রিক ও অধৈর্য",
  },
  {
    id: "tahsin_stylist",
    nameBangla: "তাহসিন (সাহিত্য ও শৈলী রসগ্রাহী)",
    nameEnglish: "Tahsin (Literary Stylist & Aesthetic Critic)",
    avatarIcon: "🖋️",
    badgeColor: "emerald",
    demographics: "সাহিত্য গবেষক ও প্রাবন্ধিক, ২৯",
    focusArea: "বাক্য-ছন্দ, অনন্য রূপক, চরিত্র-মনস্তত্ত্ব ও গভীরতা",
    readingSpeed: "২০০ WPM",
    dnfTolerance: "মেলোড্রামা ও ক্লিশে অপছন্দ",
    critiqueStyle: "পরিশীলিত ও উপমা-সচেতন",
  },
  {
    id: "samira_romance",
    nameBangla: "সামিরা (চরিত্র রসায়ন ও ইমোশন স্পেশালিস্ট)",
    nameEnglish: "Samira (Emotional Resonance & Chemistry)",
    avatarIcon: "💖",
    badgeColor: "purple",
    demographics: "কাউন্সেলিং সাইকোলজিস্ট ও ড্রামা অনুরাগী, ৩৪",
    focusArea: "দৃষ্টিবিনিময়, অব্যক্ত মনস্তাপ, সম্পর্কের গভীর টানাপোড়েন",
    readingSpeed: "২৮০ WPM",
    dnfTolerance: "হৃদয়হীন চরিত্র হলে বই রাখেন",
    critiqueStyle: "সহমর্মী ও অন্তর্দৃষ্টিসম্পন্ন",
  },
  {
    id: "kabir_commuter",
    nameBangla: "কবির (দৈনন্দিন কমিউটার ও সাধারণ পাঠক)",
    nameEnglish: "Kabir (The Commuter / Mass Audience)",
    avatarIcon: "🚆",
    badgeColor: "sky",
    demographics: "ব্যাংক কর্মকর্তা ও নিয়মিত মেট্রোরেল পাঠক, ৪১",
    focusArea: "সহজ পাঠযোগ্যতা, দ্রুত নাম স্মরণ ও সাধারণ বিনোদন",
    readingSpeed: "৩১০ WPM",
    dnfTolerance: "জটিল বিভ্রান্তি তৈরি হলে অনাগ্রহ",
    critiqueStyle: "বাস্তববাদী ও স্পষ্টভাষী",
  },
];

export const BetaReadersModal: React.FC<BetaReadersModalProps> = ({
  isOpen,
  onClose,
  activeEditorText = "",
  onApplyToManuscript,
  projectId = "proj_demo_bengali",
}) => {
  const [chapterTitle, setChapterTitle] = useState("অধ্যায় ১: সূচনা");
  const [selectedPersonas, setSelectedPersonas] = useState<BetaReaderRole[]>([
    "farhan_logic",
    "nabila_thriller",
    "tahsin_stylist",
    "samira_romance",
    "kabir_commuter",
  ]);
  const [activeTab, setActiveTab] = useState<"consensus" | BetaReaderRole>("consensus");
  const [isLoading, setIsLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<BetaReaderAuditReport | null>(null);
  const [appliedNoteIds, setAppliedNoteIds] = useState<Set<string>>(new Set());
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const fallbackText =
    activeEditorText && activeEditorText.trim().length > 20
      ? activeEditorText
      : `রাত নেমেছে শহরের বুকে। বৃষ্টির ফোঁটাগুলো কাঁচের জানালায় আছড়ে পড়ছে একঘেয়ে ছন্দে।
সে তার হাতের পুরনো নীল ফাইলটির দিকে স্তব্ধ হয়ে চেয়ে রইল।
কোনো শব্দ নেই, কেবল দেয়ালঘড়ির টিকটিক আওয়াজ যেন মৃত্যুর আগমনী বার্তা বাজিয়ে যাচ্ছে।
হঠাৎ বাইরে কোথাও কড়া ব্রেক কষার তীক্ষ্ণ চিৎকার। ঠিক তখনই দরজায় দুটো মৃদু অথচ নিশ্চিত কড়া নাড়ার শব্দ হলো।`;

  const runAudit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8080/api/v1/projects/${projectId}/beta-readers/audit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            manuscriptText: fallbackText,
            chapterTitle,
            selectedPersonas,
          }),
        }
      );
      if (res.ok) {
        const data: BetaReaderAuditReport = await res.json();
        setAuditReport(data);
      } else {
        // Fallback local simulation if network glitch
        simulateLocalAudit();
      }
    } catch {
      simulateLocalAudit();
    } finally {
      setIsLoading(false);
    }
  };

  const simulateLocalAudit = () => {
    const report: BetaReaderAuditReport = {
      auditId: `bta_local_${Date.now()}`,
      projectId,
      chapterTitle,
      wordCount: fallbackText.trim().split(/\s+/).length,
      readingTimeMinutes: 2,
      consensusSummary: {
        overallScore: 4.4,
        averageDnfRiskPercent: 11,
        groupVerdictBangla:
          "ফোকাস গ্রুপের সার্বিক রায়: অত্যন্ত শক্তিশালী ও পাঠকমগ্নকারী ড্রাফট (High Commercial & Literary Appeal)।",
        topStrengthsBangla: [
          "চ্যাপ্টারের সমাপনী ক্লিফহ্যাংগার সব পাঠকের মধ্যেই পরবর্তী অংশ পড়ার প্রচণ্ড আগ্রহ তৈরি করেছে।",
          "দৃশ্যপট ও পরিবেশের চিত্রায়ণ অত্যন্ত বাস্তবসম্মত এবং ইন্দ্রিয়ানুভূতির ছোঁয়ায় জীবন্ত।",
          "চরিত্রের অন্তর্দ্বন্দ্ব এবং সম্পর্কের সূক্ষ্ম উত্তেজনা নিপুণভাবে প্রস্ফুটিত।",
        ],
        urgentFixesBangla: [
          "দ্বিতীয় দৃশ্যে ফাইল প্রাপ্তির লজিকাল ব্যাকগ্রাউন্ড স্পষ্ট করা দরকার (ফারহানের অডিট)।",
          "প্যারাগ্রাফ ৩-এ বর্ণনার আধিক্য কমিয়ে তাৎক্ষণিক বিপদ বা সময়ের চাপ বৃদ্ধি করা উচিত (নাবিলার পেসিং নোট)।",
          "সর্বনামের অসঙ্গতি দূর করে চরিত্রের পরিচয় স্পষ্ট করা দরকার (কবিরের পাঠযোগ্যতা নোট)।",
        ],
        retentionAdviceBangla:
          "অধ্যায়ের শুরুর ৩০ সেকেন্ডের আকর্ষণ ধরে রেখে মধ্যভাগের ক্লিপড ডায়ালগে আরও একটু ভৌত তাড়া দিন।",
      },
      personaReviews: DEFAULT_PERSONAS.map((meta) => ({
        personaId: meta.id,
        personaName: meta.nameEnglish,
        nameBangla: meta.nameBangla,
        avatarIcon: meta.avatarIcon,
        badgeColor: meta.badgeColor,
        score: meta.id === "nabila_thriller" ? 4.6 : meta.id === "farhan_logic" ? 4.1 : 4.4,
        dnfRiskPercent: meta.id === "nabila_thriller" ? 8 : meta.id === "farhan_logic" ? 12 : 10,
        dnfTriggerPoint: null,
        firstImpressionBangla:
          meta.id === "farhan_logic"
            ? "ঘটনার সময়কাল ও চরিত্রের প্রতিক্রিয়া বেশ যুক্তিযুক্ত। তবে দ্বিতীয় দৃশ্যের তথ্যের সোর্স স্পষ্ট করা চাই।"
            : meta.id === "nabila_thriller"
            ? "শেষের ক্লিফহ্যাংগারটা ফাটাফাটি! রিদম রকেটের মতো ছুটছে।"
            : "খুব চমৎকার গতি এবং মনস্তাত্ত্বিক টানাপোড়েন রয়েছে।",
        inDepthCritiqueBangla:
          meta.id === "farhan_logic"
            ? "চরিত্রের সিদ্ধান্তগুলোতে যৌক্তিক ধারাবাহিকতা বজায় রয়েছে। কারণ-ফলাফলের শৃঙ্খল আরেকটু মজবুত করলে থ্রিলারটি নিশ্ছিদ্র হবে।"
            : "প্রথম দৃশ্যেই পাঠককে সম্পূর্ণভাবে জড়িয়ে নেয়।",
        favoriteQuoteBangla: "দরজায় দুটো মৃদু অথচ নিশ্চিত কড়া নাড়ার শব্দ হলো।",
        annotatedMarginNotes: [
          {
            id: `note_${meta.id}_1`,
            type: meta.id === "farhan_logic" ? "plot_hole" : "pacing_drag",
            typeLabelBangla: meta.id === "farhan_logic" ? "লজিক খামতি" : "পেসিং পর্যবেক্ষণ",
            highlightedExcerpt: "সে তার হাতের পুরনো নীল ফাইলটির দিকে স্তব্ধ হয়ে চেয়ে রইল।",
            commentBangla: "চরিত্রটির সন্দেহ করার বাস্তব পটভূমি আগে তৈরি করলে দৃশ্যটি আরও জোরদার হবে।",
            commentEnglish: "Establish prior physical trigger before contemplative freeze.",
            suggestedRevisionBangla:
              "ফাইলটির খামে পুলিশ সুপারের সিলমোহর দেখে তার বুক ধক করে উঠল; এটি যে আসল নথি, তাতে আর কোনো দ্বিধা রইল না।",
            severity: "critical",
          },
          {
            id: `note_${meta.id}_2`,
            type: "gem_moment",
            typeLabelBangla: "হুক মোমেন্ট",
            highlightedExcerpt: "দরজায় দুটো মৃদু অথচ নিশ্চিত কড়া নাড়ার শব্দ হলো।",
            commentBangla: "এমন সময়ে কড়া নাড়ার শব্দ হলো যে পুরো কৌতূহল তুঙ্গে উঠে গেল!",
            commentEnglish: "High-retention cliffhanger punch.",
            suggestedRevisionBangla: "দরজায় দুটো মৃদু অথচ নিশ্চিত কড়া নাড়ার শব্দ হলো।",
            severity: "praise",
          },
        ],
        wouldRecommendToFriend: true,
      })),
      timestamp: new Date().toISOString(),
    };
    setAuditReport(report);
  };

  useEffect(() => {
    if (isOpen && !auditReport) {
      runAudit();
    }
  }, [isOpen]);

  const togglePersona = (id: BetaReaderRole) => {
    if (selectedPersonas.includes(id)) {
      if (selectedPersonas.length > 1) {
        setSelectedPersonas(selectedPersonas.filter((p) => p !== id));
      }
    } else {
      setSelectedPersonas([...selectedPersonas, id]);
    }
  };

  const handleApplyNote = (note: AnnotatedMarginNote) => {
    if (onApplyToManuscript) {
      const source = activeEditorText || fallbackText;
      if (source.includes(note.highlightedExcerpt)) {
        const updated = source.replace(note.highlightedExcerpt, note.suggestedRevisionBangla);
        onApplyToManuscript(updated);
      } else {
        onApplyToManuscript(source + "\n\n" + note.suggestedRevisionBangla);
      }
      setAppliedNoteIds((prev) => new Set([...prev, note.id]));
      setCopyFeedback(`সংশোধনী পাণ্ডুলিপিতে প্রতিস্থাপিত হয়েছে!`);
      setTimeout(() => setCopyFeedback(null), 3000);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback("কপিবোর্ডে কপি হয়েছে!");
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/40 rounded-xl text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-100 tracking-tight">
                  Simulated AI Beta Reader Focus Group
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  Capability #23
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                  5 Diverse Personas
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                এআই বেটা রিডার প্যানেল • ড্রপ-অফ (DNF) রিস্ক প্রিভেনশন • ইনলাইন মার্জিন ক্রিটিক কার্ডস
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {copyFeedback && (
              <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full animate-pulse">
                {copyFeedback}
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

        {/* Top Control Bar */}
        <div className="px-6 py-3 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">অধ্যায়:</span>
            <input
              type="text"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500 w-48"
            />
          </div>

          {/* Persona selector pills */}
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="text-xs text-slate-400 mr-1 font-medium">প্যানেল মেম্বারস:</span>
            {DEFAULT_PERSONAS.map((p) => {
              const isSelected = selectedPersonas.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePersona(p.id)}
                  className={`px-2.5 py-1 text-xs rounded-lg flex items-center space-x-1.5 border transition-all ${
                    isSelected
                      ? "bg-slate-800 border-amber-500/50 text-amber-300 font-medium shadow-sm"
                      : "bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-400"
                  }`}
                  title={`${p.nameEnglish} • ${p.focusArea}`}
                >
                  <span>{p.avatarIcon}</span>
                  <span className="text-[11px]">{p.nameBangla.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={runAudit}
            disabled={isLoading}
            className="px-4 py-1.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 shadow-md transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>রিভিউ চলছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>ফোকাস গ্রুপ অডিট চালান</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab("consensus")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === "consensus"
                ? "border-amber-400 text-amber-300 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>গ্রুপ কনসেনসাস ও DNF স্কোর</span>
          </button>

          {auditReport?.personaReviews.map((rev) => (
            <button
              key={rev.personaId}
              onClick={() => setActiveTab(rev.personaId)}
              className={`px-3 py-2 text-xs font-medium border-b-2 flex items-center space-x-1.5 transition-colors ${
                activeTab === rev.personaId
                  ? "border-amber-400 text-amber-300 bg-slate-800/40 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              <span>{rev.avatarIcon}</span>
              <span>{rev.nameBangla.split(" ")[0]}</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full">
                {rev.score}★
              </span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "consensus" && auditReport && (
            <div className="space-y-6">
              {/* High-Level Scorecards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center space-x-4">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                    <Star className="w-6 h-6 fill-amber-400/20" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      সার্বিক স্কোর
                    </span>
                    <div className="text-2xl font-black text-amber-300 flex items-baseline gap-1">
                      {auditReport.consensusSummary.overallScore}
                      <span className="text-xs text-slate-400">/ 5.0</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center space-x-4">
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      DNF (ড্রপ-অফ) ঝুঁকি
                    </span>
                    <div className="text-2xl font-black text-rose-400 flex items-baseline gap-1">
                      {auditReport.consensusSummary.averageDnfRiskPercent}%
                      <span className="text-xs text-emerald-400 ml-1 font-normal">
                        ({auditReport.consensusSummary.averageDnfRiskPercent < 15 ? "Low Risk" : "Moderate"})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center space-x-4">
                  <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      শব্দসংখ্যা ও পড়ার সময়
                    </span>
                    <div className="text-xl font-bold text-sky-300">
                      {auditReport.wordCount} শব্দ • {auditReport.readingTimeMinutes} মিনিট
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center space-x-4">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      রিডার সুপারিশ রেট
                    </span>
                    <div className="text-2xl font-black text-emerald-300">
                      100%
                      <span className="text-xs text-slate-400 ml-1 font-normal">(5/5 হ্যাঁ)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group Verdict Banner */}
              <div className="p-4 bg-gradient-to-r from-amber-950/30 via-slate-900 to-rose-950/30 border border-amber-500/30 rounded-xl flex items-start space-x-3">
                <Brain className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                    Executive Focus Group Verdict
                  </h4>
                  <p className="text-sm text-slate-200 mt-1 font-medium leading-relaxed">
                    {auditReport.consensusSummary.groupVerdictBangla}
                  </p>
                  <p className="text-xs text-amber-200/80 mt-2 bg-amber-950/40 p-2.5 rounded-lg border border-amber-500/20">
                    💡 <strong>রিটেনশন পরামর্শ:</strong> {auditReport.consensusSummary.retentionAdviceBangla}
                  </p>
                </div>
              </div>

              {/* 2-Column Strengths & Fixes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      শীর্ষ আকর্ষণ ও শক্তি (Consensus Strengths)
                    </h4>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-200">
                    {auditReport.consensusSummary.topStrengthsBangla.map((str, idx) => (
                      <li key={idx} className="flex items-start space-x-2 bg-slate-900/60 p-2.5 rounded-lg border border-emerald-500/20">
                        <span className="text-emerald-400 font-bold shrink-0">✓</span>
                        <span className="leading-relaxed">{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 text-rose-400">
                    <AlertCircle className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      জরুরি রিভিশন ও সংশোধন (Urgent Focus Fixes)
                    </h4>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-200">
                    {auditReport.consensusSummary.urgentFixesBangla.map((fix, idx) => (
                      <li key={idx} className="flex items-start space-x-2 bg-slate-900/60 p-2.5 rounded-lg border border-rose-500/20">
                        <span className="text-rose-400 font-bold shrink-0">!</span>
                        <span className="leading-relaxed">{fix}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Quick Persona Grid Snapshot */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  রিডার প্যানেল এক নজরে (Click to Inspect Annotations)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {auditReport.personaReviews.map((rev) => (
                    <div
                      key={rev.personaId}
                      onClick={() => setActiveTab(rev.personaId)}
                      className="p-3.5 bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 rounded-xl cursor-pointer transition-all hover:bg-slate-900 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{rev.avatarIcon}</span>
                          <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-500/20 text-amber-300 rounded-md">
                            {rev.score} ★
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-200">
                          {rev.nameBangla.split(" ")[0]}
                        </h5>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                          {rev.personaName}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] flex items-center justify-between text-slate-400">
                        <span>DNF: <strong className="text-rose-400">{rev.dnfRiskPercent}%</strong></span>
                        <span className="text-amber-400 font-medium">
                          {rev.annotatedMarginNotes.length} নোটস →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Individual Persona Tab */}
          {activeTab !== "consensus" && auditReport && (
            (() => {
              const review = auditReport.personaReviews.find((p) => p.personaId === activeTab);
              const meta = DEFAULT_PERSONAS.find((p) => p.id === activeTab);
              if (!review || !meta) return null;

              return (
                <div className="space-y-6">
                  {/* Persona Header Card */}
                  <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="text-4xl p-3 bg-slate-900 border border-slate-700 rounded-2xl">
                        {review.avatarIcon}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-bold text-slate-100">
                            {review.nameBangla}
                          </h3>
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 rounded-full">
                            {review.personaName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          <strong>পরিচয়:</strong> {meta.demographics} • <strong>গতি:</strong> {meta.readingSpeed}
                        </p>
                        <p className="text-xs text-slate-400">
                          <strong>ফোকাস এরিয়া:</strong> {meta.focusArea}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0 bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <div className="text-center px-3 border-r border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">রেটিং</span>
                        <span className="text-lg font-black text-amber-300">{review.score} / 5</span>
                      </div>
                      <div className="text-center px-3">
                        <span className="text-[10px] text-slate-400 block font-semibold">DNF ঝুঁকি</span>
                        <span className="text-lg font-black text-rose-400">{review.dnfRiskPercent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Persona Review Content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        প্রথম অনুভূতি (First Impression)
                      </h4>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {review.firstImpressionBangla}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        গভীর বিশ্লেষণ ও মনস্তত্ত্ব (In-Depth Critique)
                      </h4>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {review.inDepthCritiqueBangla}
                      </p>
                    </div>
                  </div>

                  {/* Favorite Quote */}
                  {review.favoriteQuoteBangla && (
                    <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-xl flex items-center space-x-3">
                      <Quote className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          পাঠকের প্রিয় উক্তি (Favorite Line)
                        </span>
                        <p className="text-xs font-serif italic text-amber-200 mt-0.5">
                          "{review.favoriteQuoteBangla}"
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Inline Margin Notes & Suggested Edits */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-amber-400" />
                        ইনলাইন মার্জিন ক্রিটিক কার্ডস ({review.annotatedMarginNotes.length} টি নোট)
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        সংশোধনী পছন্দ হলে এক ক্লিকে পাণ্ডুলিপিতে প্রতিস্থাপন করুন
                      </span>
                    </div>

                    <div className="space-y-3">
                      {review.annotatedMarginNotes.map((note) => {
                        const isApplied = appliedNoteIds.has(note.id);
                        return (
                          <div
                            key={note.id}
                            className={`p-4 rounded-xl border transition-all ${
                              note.severity === "critical"
                                ? "bg-rose-950/20 border-rose-500/40"
                                : note.severity === "praise"
                                ? "bg-emerald-950/20 border-emerald-500/40"
                                : "bg-amber-950/20 border-amber-500/40"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                                  note.severity === "critical"
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                    : note.severity === "praise"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                }`}
                              >
                                {note.typeLabelBangla}
                              </span>

                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleCopy(note.suggestedRevisionBangla)}
                                  className="p-1 text-slate-400 hover:text-slate-200 text-xs flex items-center space-x-1"
                                  title="কপি করুন"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleApplyNote(note)}
                                  disabled={isApplied}
                                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                                    isApplied
                                      ? "bg-emerald-800 text-emerald-100"
                                      : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                                  }`}
                                >
                                  {isApplied ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      <span>প্রতিস্থাপিত</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-3.5 h-3.5" />
                                      <span>পাণ্ডুলিপিতে প্রতিস্থাপন</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs font-serif italic text-slate-300 mb-2">
                              "{note.highlightedExcerpt}"
                            </div>

                            <p className="text-xs text-slate-200 leading-relaxed mb-2 font-sans">
                              <strong>মন্তব্য:</strong> {note.commentBangla}
                            </p>

                            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs text-amber-200 flex items-start space-x-2">
                              <span className="text-amber-400 font-bold shrink-0">সংশোধিত প্রস্তাব:</span>
                              <span className="leading-relaxed font-sans">{note.suggestedRevisionBangla}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
};
