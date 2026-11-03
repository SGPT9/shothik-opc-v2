import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Sparkles,
  Flame,
  ArrowRight,
  Check,
  RotateCcw,
  Zap,
  Target,
  Brain,
  MessageSquare,
  Play,
  Copy,
  ChevronRight,
  Send,
  Users2,
  Activity,
  Heart,
  Shield,
  HelpCircle,
} from "lucide-react";

export type DuetPartnerId = "himu" | "badal" | "rupa" | "oc_rafiq" | "misir_ali";

export interface DuetPartnerProfile {
  id: DuetPartnerId;
  nameBangla: string;
  nameEnglish: string;
  avatarIcon: string;
  badgeColor: string;
  taglineBangla: string;
  counterStyleBangla: string;
  temperament: "elusive" | "nervous" | "longing" | "suspicious" | "logical";
  sampleServeResponses: string[];
}

export interface RallyShot {
  id: string;
  speaker: "author" | "character";
  speakerName: string;
  text: string;
  timestamp: string;
}

export interface DuetVolleyResult {
  partnerId: DuetPartnerId;
  partnerNameBangla: string;
  characterResponseBangla: string;
  emotionalShift: string;
  rallyCount: number;
  subtextInsightBangla: string;
  pacingRhythm: "snappy" | "contemplative" | "explosive" | "poetic";
  rallySummary: RallyShot[];
}

interface CharacterDuetModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEditorText?: string;
  onApplyToManuscript?: (insertedRally: string) => void;
  projectId?: string;
}

const DEFAULT_PARTNERS: DuetPartnerProfile[] = [
  {
    id: "himu",
    nameBangla: "হিমু",
    nameEnglish: "Himu (The Elusive Anti-Hero)",
    avatarIcon: "🚶‍♂️",
    badgeColor: "amber",
    taglineBangla: "জোছনা আর হলুদ পাঞ্জাবির খামখেয়ালি পরিব্রাজক",
    counterStyleBangla: "ধাঁধাঁযুক্ত ও পার্থিব যুক্তিহীন অপ্রত্যাশিত প্রত্যুত্তর",
    temperament: "elusive",
    sampleServeResponses: [
      "তোমার যুক্তির পকেটটা ফুটো, ওখান দিয়ে সব কৌতূহল গলে পড়ে যাচ্ছে।",
      "রাত বারোটার পর রাস্তা কাউকে প্রশ্ন করে না, শুধু হাঁটিয়ে নিয়ে যায়।",
      "চা তো খাব, তবে চিনি ছাড়া। মিষ্টি জিনিসে মানুষের মোহ বাড়ে।"
    ]
  },
  {
    id: "badal",
    nameBangla: "বাদল",
    nameEnglish: "Badal (The Loyal & Anxious Cousin)",
    avatarIcon: "👓",
    badgeColor: "sky",
    taglineBangla: "হিমুদার অলৌকিক কথায় হতবিহ্বল কিন্তু একান্ত অনুগত",
    counterStyleBangla: "উৎকণ্ঠা, অতি-প্রশ্ন এবং চশমা ঠিক করার নার্ভাস ভঙ্গি",
    temperament: "nervous",
    sampleServeResponses: [
      "হিমুদা, ছোটমামা কিন্তু বন্দুক বের করে রেখেছেন, তুমি বাড়ি এসো না!",
      "আমার খুব ভয় করছে হিমুদা, সত্যি কি আজ অমাবস্যায় কিছু ঘটবে?",
      "আমি কি যাব সাথে? একা একা এই অন্ধকারে কেমন যেন লাগছে।"
    ]
  },
  {
    id: "rupa",
    nameBangla: "রূপা",
    nameEnglish: "Rupa (The Unrequited Longing)",
    avatarIcon: "🥀",
    badgeColor: "rose",
    taglineBangla: "অপেক্ষার নীল খামে বন্দি নীলপদ্ম",
    counterStyleBangla: "অভিমান, গভীর নিঃশব্দ দৃষ্টি এবং তীক্ষ্ণ বেদনা",
    temperament: "longing",
    sampleServeResponses: [
      "তুমি কি সত্যিই মানুষ, হিমু? নাকি শুধুই এক টুকরো বিভ্রান্তিকর ছায়া?",
      "প্রতিবার বৃষ্টির সময় ভাবি তোমার ফোন আসবে, কিন্তু আসে কেবল বাতাস।",
      "কাল রাতে তোমার জন্য নীল শাড়ি পরে বারান্দায় বসেছিলাম, আসোনি কেন?"
    ]
  },
  {
    id: "oc_rafiq",
    nameBangla: "ওসি রফিক",
    nameEnglish: "OC Rafiq (The Cynical Policeman)",
    avatarIcon: "👮‍♂️",
    badgeColor: "red",
    taglineBangla: "লাল ডায়েরি আর হাতকড়ার বাস্তবতায় বিশ্বাসী পুলিশ অফিসার",
    counterStyleBangla: "সন্দেহ, কর্কশ জেরা এবং টেবিলে ফাইল আছাড়ের হুমকি",
    temperament: "suspicious",
    sampleServeResponses: [
      "তোমার এসব দার্শনিক ভুজুংভাজুং বাদ দাও! তিনটার সময় ওই গলিতে কী করছিলে?",
      "বেশি পাকনামি করলে রিমান্ডে দিয়ে সব হলুদ রং এক মিনিটে সাদা করে দেব।",
      "লাশের পকেটে তোমার হাতের লেখা চিরকুট পাওয়া গেল কেন? জবাব দাও!"
    ]
  },
  {
    id: "misir_ali",
    nameBangla: "মিসির আলি",
    nameEnglish: "Misir Ali (The Rational Psychologist)",
    avatarIcon: "📖",
    badgeColor: "emerald",
    taglineBangla: "মানব মনের অন্ধকার কুঠুরির যৌক্তিক ব্যাখ্যাকারী",
    counterStyleBangla: "শান্ত যুক্তি, বৈজ্ঞানিক হাইপোথিসিস ও সিগারেট বিরতি",
    temperament: "logical",
    sampleServeResponses: [
      "মানুষ যাকে অলৌকিক ভাবে, তা আসলে তার অবচেতন ভয়ের প্রতিফলন মাত্র।",
      "ঘটনার সময় আপনার হৃৎস্পন্দন বেড়ে যাওয়ার কারণটা শারীরিক, ভৌতিক নয়।",
      "চায়ে আরেক চামচ চিনি দিন। মস্তিষ্কের গ্লুকোজ কমে গেলে সিদ্ধান্ত ভুল হয়।"
    ]
  }
];

export const CharacterDuetModal: React.FC<CharacterDuetModalProps> = ({
  isOpen,
  onClose,
  activeEditorText = "",
  onApplyToManuscript,
  projectId = "proj_demo_bengali",
}) => {
  const [selectedPartnerId, setSelectedPartnerId] = useState<DuetPartnerId>("himu");
  const [currentServeText, setCurrentServeText] = useState("");
  const [rallyHistory, setRallyHistory] = useState<RallyShot[]>([]);
  const [latestVolleyResult, setLatestVolleyResult] = useState<DuetVolleyResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activePartner = DEFAULT_PARTNERS.find((p) => p.id === selectedPartnerId) || DEFAULT_PARTNERS[0];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [rallyHistory]);

  const handleServe = async (customServe?: string) => {
    const textToServe = (customServe || currentServeText).trim();
    if (!textToServe) return;

    setIsLoading(true);
    try {
      const historyPayload = rallyHistory.map((s) => ({
        speaker: s.speaker,
        text: s.text,
      }));

      const res = await fetch(
        `http://127.0.0.1:8080/api/v1/projects/${projectId}/character-duet/volley`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partnerId: selectedPartnerId,
            latestAuthorSentence: textToServe,
            history: historyPayload,
            sceneTone: "witty",
          }),
        }
      );

      if (res.ok) {
        const data: DuetVolleyResult = await res.json();
        setLatestVolleyResult(data);
        setRallyHistory(data.rallySummary);
        setCurrentServeText("");
      } else {
        simulateLocalVolley(textToServe);
      }
    } catch {
      simulateLocalVolley(textToServe);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateLocalVolley = (textToServe: string) => {
    const counterText =
      selectedPartnerId === "himu"
        ? `হিমু একগাল হেসে পাঞ্জাবির পকেটে হাত ঢোকাল, "সব 'কেন'-র উত্তর যদি রাস্তায় পাওয়া যেত, তবে মানুষ ঘরে তালা দিত না।"`
        : selectedPartnerId === "badal"
        ? `বাদল চশমা ঠিক করে কাপা গলায় বলল, "হিমুদা, তুমি যেভাবে বলছ আমার হাত-পা বরফ হয়ে যাচ্ছে!"`
        : selectedPartnerId === "rupa"
        ? `রূপা চোখের পাতা সামান্য তুলে স্থির গলায় বলল, "তোমার এই কথার ভেতর দিয়ে আমি স্পষ্ট দেখতে পাচ্ছি তুমি আবার পালাবার পথ খুঁজছ।"`
        : selectedPartnerId === "oc_rafiq"
        ? `ওসি রফিক লাঠিটা টেবিলে ঠুকলেন, "অনেক নাটক হয়েছে! এবার সোজা কথায় বলো, ওই ফাইলটা কার কাছে?"`
        : `মিসির আলি চশমা মুছে শান্ত গলায় বললেন, "আপনার এই বাক্যের ব্যাকরণে একটা অদ্ভুত অসঙ্গতি আছে।"`;

    const newAuthorShot: RallyShot = {
      id: `shot_${rallyHistory.length + 1}`,
      speaker: "author",
      speakerName: "লেখক (You)",
      text: textToServe,
      timestamp: new Date().toISOString(),
    };

    const newCharShot: RallyShot = {
      id: `shot_${rallyHistory.length + 2}`,
      speaker: "character",
      speakerName: activePartner.nameBangla,
      text: counterText,
      timestamp: new Date().toISOString(),
    };

    const updated = [...rallyHistory, newAuthorShot, newCharShot];
    setRallyHistory(updated);
    setLatestVolleyResult({
      partnerId: selectedPartnerId,
      partnerNameBangla: activePartner.nameBangla,
      characterResponseBangla: counterText,
      emotionalShift: "উদ্বেগহীন কৌতুক → গভীর অন্তর্দৃষ্টি",
      rallyCount: updated.length,
      subtextInsightBangla: "চরিত্রটি লেখককে বাস্তববাদী হিসাবের বাইরে এনে রহস্যের ঘোরের মধ্যে টানছে।",
      pacingRhythm: "snappy",
      rallySummary: updated,
    });
    setCurrentServeText("");
  };

  const handleMergeToManuscript = () => {
    if (rallyHistory.length === 0) return;
    const formattedRally = rallyHistory
      .map((shot) => (shot.speaker === "author" ? shot.text : shot.text))
      .join("\n\n");

    if (onApplyToManuscript) {
      onApplyToManuscript(formattedRally);
      setToastMessage("র‍্যালি পাণ্ডুলিপিতে সফলভাবে মার্জ হয়েছে!");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleReset = () => {
    setRallyHistory([]);
    setLatestVolleyResult(null);
    setCurrentServeText("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 rounded-xl text-cyan-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-100 tracking-tight">
                  Live Character Duet Mode ("Sentence Tennis")
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                  Capability #24
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Rally Flow Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                লাইভ বাক্য-পিচিং কো-অথরিং • লেখকের এক বাক্য, চরিত্রের তাৎক্ষণিক প্রত্যুত্তর • র‍্যালি ফ্লো মিটার
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

        {/* Partner Selection Strip */}
        <div className="px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium shrink-0">ডুয়েট পার্টনার:</span>
            <div className="flex items-center space-x-2">
              {DEFAULT_PARTNERS.map((partner) => {
                const isSelected = selectedPartnerId === partner.id;
                return (
                  <button
                    key={partner.id}
                    onClick={() => {
                      setSelectedPartnerId(partner.id);
                      handleReset();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs flex items-center space-x-2 border transition-all ${
                      isSelected
                        ? "bg-slate-800 border-cyan-500/60 text-cyan-300 font-semibold shadow-md"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    <span className="text-base">{partner.avatarIcon}</span>
                    <span>{partner.nameBangla}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {rallyHistory.length > 0 && (
              <div className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 rounded-full flex items-center space-x-1.5 text-xs font-bold text-amber-300">
                <Flame className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                <span>র‍্যালি: {rallyHistory.length} শট</span>
              </div>
            )}
            <button
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1"
              title="নতুন ম্যাচ শুরু করুন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">রিসেট</span>
            </button>
          </div>
        </div>

        {/* Status / Subtext Dynamic Bar */}
        {latestVolleyResult && (
          <div className="px-6 py-2 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">মনস্তাত্ত্বিক অবস্থান:</span>
              <span className="px-2 py-0.5 bg-cyan-950/60 border border-cyan-500/30 rounded text-cyan-300 font-medium">
                {latestVolleyResult.emotionalShift}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300 italic line-clamp-1">
                "{latestVolleyResult.subtextInsightBangla}"
              </span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-400">
              <Activity className="w-3 h-3" />
              <span>রিদম: {latestVolleyResult.pacingRhythm}</span>
            </div>
          </div>
        )}

        {/* Tennis Court Dialogue Stream */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/40">
          {rallyHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 max-w-md mx-auto">
              <div className="text-5xl p-4 bg-slate-900 border border-slate-800 rounded-3xl shadow-inner">
                {activePartner.avatarIcon}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-200">
                  {activePartner.nameBangla}-এর সাথে সেন্টেন্স টেনিস শুরু করুন
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {activePartner.taglineBangla}। আপনি এক বাক্য লিখুন, চরিত্রটি তার স্বভাবসুলভ গলায় সাথে সাথে পরবর্তী বাক্য দিয়ে প্রতিউত্তর দেবে।
                </p>
              </div>

              {/* Sample Serve Buttons */}
              <div className="w-full space-y-2 pt-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block text-left">
                  তাত্ক্ষণিক উদ্বোধনী সার্ভ (Quick Serves):
                </span>
                {activePartner.sampleServeResponses.map((serve, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleServe(serve)}
                    className="w-full text-left p-2.5 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-xs text-slate-300 transition-all flex items-center justify-between group"
                  >
                    <span className="line-clamp-1 italic font-serif">"{serve}"</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            rallyHistory.map((shot, idx) => {
              const isAuthor = shot.speaker === "author";
              return (
                <div
                  key={shot.id}
                  className={`flex items-start space-x-3 ${
                    isAuthor ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isAuthor && (
                    <div className="text-2xl p-2 bg-slate-900 border border-slate-800 rounded-xl shrink-0 mt-1">
                      {activePartner.avatarIcon}
                    </div>
                  )}

                  <div
                    className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed font-sans shadow-md ${
                      isAuthor
                        ? "bg-cyan-950/40 border border-cyan-500/40 text-cyan-100 rounded-tr-none"
                        : "bg-slate-900/90 border border-slate-700/70 text-slate-200 rounded-tl-none font-serif text-[13px]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1 font-semibold text-slate-400">
                      <span>{shot.speakerName}</span>
                      <span className="opacity-60 text-[9px]">শট #{idx + 1}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{shot.text}</p>
                  </div>

                  {isAuthor && (
                    <div className="p-2 bg-cyan-950/60 border border-cyan-500/30 rounded-xl shrink-0 text-cyan-400 mt-1">
                      ✍️
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Serve Input & Bottom Bar */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={currentServeText}
              onChange={(e) => setCurrentServeText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleServe();
                }
              }}
              placeholder={`পরবর্তী বাক্য লিখুন (${activePartner.nameBangla}-এর দিকে বল ছুড়ে দিন)...`}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              onClick={() => handleServe()}
              disabled={isLoading || !currentServeText.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-md transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>কাউন্টার আসছে...</span>
                </>
              ) : (
                <>
                  <span>সার্ভ করুন</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Quick Serve Presets & Merge Action */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <span className="text-[11px] text-slate-500">প্রম্পট আইডিয়া:</span>
              <button
                onClick={() => handleServe("হঠাৎ বাইরে তীব্র ব্রেক কষার শব্দ হলো।")}
                className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] text-slate-400"
              >
                + অতর্কিত শব্দ
              </button>
              <button
                onClick={() => handleServe("তুমি কি আমাকে আর কোনোদিন বিশ্বাস করবে না?")}
                className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] text-slate-400"
              >
                + বিশ্বাসের প্রশ্ন
              </button>
              <button
                onClick={() => handleServe("আমরা দুজনেই জানি এখান থেকে আর ফেরার পথ নেই।")}
                className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] text-slate-400"
              >
                + অন্তিম সত্য
              </button>
            </div>

            {rallyHistory.length > 0 && (
              <button
                onClick={handleMergeToManuscript}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>পুরো র‍্যালি পাণ্ডুলিপিতে মার্জ করুন</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
