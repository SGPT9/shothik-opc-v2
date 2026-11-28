import React, { useState, useEffect } from "react";
import {
  X,
  Radio,
  Newspaper,
  Mail,
  Volume2,
  Lock,
  Unlock,
  Sparkles,
  Calendar,
  FileText,
  PlusCircle,
  Play,
  Square,
  CheckCircle2
} from "lucide-react";

interface RadioBroadcast {
  id: string;
  station: string;
  frequencyMhz: number;
  broadcastDate: string;
  headline: string;
  audioDurationSec: number;
  staticNoiseRatio: number;
  speaker: string;
  transcriptBn: string;
  transcriptEn: string;
}

interface NewspaperClipping {
  id: string;
  newspaperName: string;
  newspaperNameBn: string;
  date: string;
  issueNo: string;
  priceText: string;
  headline: string;
  headlineBn: string;
  byline: string;
  columnTextBn: string;
  leadParagraph: string;
  clippingStyle: "yellowed_vintage" | "modern_tabloid" | "underground_leaflet";
}

interface SeasonalEpilogueLetter {
  id: string;
  title: string;
  titleBn: string;
  seasonOrFestival: "monsoon" | "pohela_boishakh" | "winter_mist" | "eid_reunion";
  seasonLabelBn: string;
  sender: string;
  recipient: string;
  unlockCondition: string;
  isUnlocked: boolean;
  letterProseBn: string;
}

interface LivingEpilogueModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  onInsertProse?: (prose: string) => void;
}

export const LivingEpilogueModal: React.FC<LivingEpilogueModalProps> = ({
  isOpen,
  onClose,
  projectId = "proj_demo_bengali",
  onInsertProse
}) => {
  const [activeTab, setActiveTab] = useState<"radio" | "newspaper" | "seasonal">("radio");
  const [radioBroadcasts, setRadioBroadcasts] = useState<RadioBroadcast[]>([]);
  const [newspaperClippings, setNewspaperClippings] = useState<NewspaperClipping[]>([]);
  const [seasonalLetters, setSeasonalLetters] = useState<SeasonalEpilogueLetter[]>([]);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    fetch(`/api/v1/projects/${projectId}/living-epilogue`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRadioBroadcasts(data.radioBroadcasts || []);
          setNewspaperClippings(data.newspaperClippings || []);
          setSeasonalLetters(data.seasonalLetters || []);
        }
      })
      .catch((err) => console.error("Failed to load living epilogues:", err));
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl h-[88vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-100">
                  Interactive "Living Epilogue" Reader App
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Capability #36
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                পোস্ট-রিলিজ অডিও বেতার বুলেটিন, ভিন্টেজ পত্রিকার কাটিং ও মৌসুমি পরিশিষ্ট (Transmedia Lore Companion)
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

        {/* Global Season / Transmedia Ribbon */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-rose-950/20 border-b border-rose-900/30 text-xs text-rose-300">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium text-rose-200">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              বর্তমান মৌসুম: বর্ষাকালীন জীবন্ত পরিশিষ্ট সক্রিয় (Monsoon Active)
            </span>
            <span className="flex items-center gap-1 text-neutral-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              আনলকড ট্রান্সমিডিয়া কনটেন্ট: ৩ / ৫
            </span>
          </div>
          <span className="text-xs text-rose-400/80 font-mono">
            Transmedia Bridge: Audio · Newspaper · Post-Release Lore
          </span>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-neutral-800 bg-neutral-900">
          <button
            onClick={() => setActiveTab("radio")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "radio"
                ? "border-rose-500 text-rose-400 bg-rose-500/5"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Radio className="w-4 h-4" />
            Vintage Radio Bulletins ({radioBroadcasts.length})
          </button>
          <button
            onClick={() => setActiveTab("newspaper")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "newspaper"
                ? "border-rose-500 text-rose-400 bg-rose-500/5"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Newspaper className="w-4 h-4" />
            Archival Newspaper Clippings ({newspaperClippings.length})
          </button>
          <button
            onClick={() => setActiveTab("seasonal")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "seasonal"
                ? "border-rose-500 text-rose-400 bg-rose-500/5"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Mail className="w-4 h-4" />
            Seasonal Living Letters ({seasonalLetters.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: RADIO BROADCASTS */}
          {activeTab === "radio" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-200">
                  বাংলাদেশ বেতার ও পুলিশ স্ক্যানার বুলেটিন (Audio Radio Broadcasts)
                </h3>
                <span className="text-xs text-neutral-400">
                  অডিও ড্রামা ও ট্রান্সমিডিয়া রেডিও ব্রডকাস্ট সিমুলেটর
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {radioBroadcasts.map((radio) => {
                  const isPlaying = activePlayingId === radio.id;

                  return (
                    <div
                      key={radio.id}
                      className="p-5 rounded-xl bg-neutral-950/60 border border-neutral-800 hover:border-neutral-700 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setActivePlayingId(isPlaying ? null : radio.id)}
                            className="w-9 h-9 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center text-white transition-all shadow-md shadow-rose-950"
                          >
                            {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                          </button>
                          <div>
                            <span className="font-bold text-sm text-neutral-100">{radio.station}</span>
                            <div className="text-xs text-rose-400/90 font-mono">
                              ফ্রিকোয়েন্সি: {radio.frequencyMhz} MHz • {radio.broadcastDate}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                            {radio.audioDurationSec}s Audio
                          </span>
                          <div className="text-[11px] text-neutral-500 mt-1">
                            Static Noise: {Math.round(radio.staticNoiseRatio * 100)}%
                          </div>
                        </div>
                      </div>

                      {/* Headline */}
                      <p className="text-xs font-semibold text-neutral-200 border-l-2 border-rose-500 pl-3">
                        {radio.headline}
                      </p>

                      {/* Oscilloscope Simulation if Playing */}
                      {isPlaying && (
                        <div className="p-3 rounded-lg bg-neutral-900 border border-rose-500/30 flex items-center gap-1 h-12 overflow-hidden">
                          {Array.from({ length: 32 }).map((_, idx) => (
                            <div
                              key={idx}
                              className="flex-1 bg-rose-500 rounded-full animate-pulse"
                              style={{
                                height: `${Math.max(15, (Math.sin(idx * 0.5) * 0.5 + 0.5) * 100)}%`,
                                animationDuration: `${0.3 + (idx % 4) * 0.2}s`
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Transcript */}
                      <div className="p-3.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 leading-relaxed font-serif">
                        <span className="text-neutral-500 font-sans block mb-1">
                          বক্তা: {radio.speaker}
                        </span>
                        "{radio.transcriptBn}"
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => onInsertProse?.(radio.transcriptBn)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          পাণ্ডুলিপিতে রেডিও স্ক্রিপ্ট যোগ করুন (Inject Radio Script)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: NEWSPAPER CLIPPINGS */}
          {activeTab === "newspaper" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-200">
                  ঐতিহাসিক সংবাদপত্রের কাটিং (Archival Newspaper Clippings)
                </h3>
                <span className="text-xs text-neutral-400">
                  হলুদাভ ভিন্টেজ প্রিন্ট ও তদন্তমূলক রিপোর্ট
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newspaperClippings.map((clip) => (
                  <div
                    key={clip.id}
                    className="p-5 rounded-xl bg-amber-950/10 border border-amber-900/40 text-neutral-200 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      {/* Masthead */}
                      <div className="border-b-2 border-neutral-700 pb-2 text-center">
                        <h4 className="text-base font-serif font-black tracking-wider text-amber-200/90 uppercase">
                          {clip.newspaperNameBn} ({clip.newspaperName})
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono pt-1">
                          <span>{clip.date}</span>
                          <span>{clip.issueNo}</span>
                          <span>{clip.priceText}</span>
                        </div>
                      </div>

                      {/* Main Headline */}
                      <h5 className="text-sm font-bold font-serif text-neutral-100 leading-snug pt-1">
                        {clip.headlineBn}
                      </h5>

                      <div className="text-[11px] font-sans text-neutral-400 italic">
                        {clip.byline}
                      </div>

                      {/* Column text with newspaper styling */}
                      <div className="p-3 rounded bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-300 leading-relaxed font-serif text-justify space-y-2">
                        <p className="font-semibold text-neutral-200">{clip.leadParagraph}</p>
                        <p>{clip.columnTextBn}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-800 flex justify-end">
                      <button
                        onClick={() =>
                          onInsertProse?.(
                            `\n\n[সংবাদপত্রের কাটিং: ${clip.newspaperNameBn}]\n${clip.headlineBn}\n${clip.columnTextBn}\n`
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        পত্রিকার কাটিং পাণ্ডুলিপিতে যোগ করুন (Inject Clipping)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SEASONAL LIVING LETTERS */}
          {activeTab === "seasonal" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-200">
                  মৌসুমি ও উৎসবভিত্তিক জীবন্ত পরিশিষ্ট (Seasonal Living Letters)
                </h3>
                <span className="text-xs text-neutral-400">
                  বাস্তব জগতের ঋতু ও পাঠক সমাপ্তি শর্তে আনলক হয়
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {seasonalLetters.map((letter) => (
                  <div
                    key={letter.id}
                    className={`p-5 rounded-xl border transition-all space-y-3 ${
                      letter.isUnlocked
                        ? "bg-neutral-950/60 border-neutral-800 hover:border-neutral-700"
                        : "bg-neutral-950/30 border-neutral-800/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {letter.isUnlocked ? (
                          <Unlock className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-neutral-500" />
                        )}
                        <span className="font-bold text-sm text-neutral-100">{letter.titleBn}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                          {letter.seasonLabelBn}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-400">
                        প্রেরক: <span className="text-rose-400 font-semibold">{letter.sender}</span> →{" "}
                        প্রাপক: <span className="text-neutral-200">{letter.recipient}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-neutral-500 font-mono">
                      আনলক শর্ত: {letter.unlockCondition}
                    </div>

                    {letter.isUnlocked ? (
                      <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 font-serif leading-relaxed whitespace-pre-line italic">
                        {letter.letterProseBn}
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-neutral-950 border border-dashed border-neutral-800 text-xs text-neutral-500 text-center">
                        🔒 এই পরিশিষ্টটি এখনও লক করা রয়েছে। {letter.unlockCondition} সম্পন্ন হলে পাঠযোগ্য হবে।
                      </div>
                    )}

                    {letter.isUnlocked && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => onInsertProse?.(`\n\n[জীবন্ত পরিশিষ্ট]\n${letter.letterProseBn}\n`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          পরিশিষ্ট চিঠিটি পাণ্ডুলিপিতে যোগ করুন (Inject Letter)
                        </button>
                      </div>
                    )}
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
