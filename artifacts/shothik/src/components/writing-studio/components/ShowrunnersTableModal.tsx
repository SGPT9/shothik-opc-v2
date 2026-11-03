import React, { useState, useEffect } from "react";
import {
  X,
  Users2,
  Sparkles,
  MessageSquare,
  Flame,
  ArrowRight,
  Check,
  RotateCcw,
  Zap,
  Target,
  Brain,
  Globe,
  Compass,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

export type ShowrunnerRole = "architect" | "psychologist" | "geometer" | "contrarian";

export interface ShowrunnerPersona {
  role: ShowrunnerRole;
  nameBangla: string;
  nameEnglish: string;
  avatarIcon: string;
  badgeColor: string;
  tagline: string;
  corePhilosophy: string;
  specialty: string;
}

export interface DebateTurn {
  id: string;
  turnIndex: number;
  role: ShowrunnerRole;
  speakerName: string;
  avatarIcon: string;
  badgeColor: string;
  inResponseToRole?: ShowrunnerRole;
  speechBangla: string;
  speechEnglishSummary: string;
  keySuggestion: string;
  confidenceScore: number;
}

export interface ShowrunnerDebateSession {
  sessionId: string;
  projectId: string;
  topic: string;
  manuscriptContextSnippet?: string;
  turns: DebateTurn[];
  consensusPitch: {
    headline: string;
    synopsisBangla: string;
    whyItWorks: string;
    suggestedSceneBeats: string[];
  };
  wildcardPitch: {
    personaName: string;
    wildcardSynopsis: string;
    dramaticRisk: string;
  };
  timestamp: string;
}

interface ShowrunnersTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEditorText?: string;
  onApplyToManuscript?: (beatsText: string) => void;
  projectId?: string;
}

const DILEMMA_PRESETS = [
  {
    title: "Escaping Interrogation",
    dilemma: "হিমুকে কীভাবে ওসি সাহেবের গভীর জেরা ও লালবাগ থানা থেকে অলৌকিকতা বা অবাস্তবতা ছাড়াই নাটకీయভাবে মুক্ত করা যায়?",
  },
  {
    title: "Midnight Monsoon Betrayal",
    dilemma: "শ্রাবণের রাতে পুরান ঢাকার এক নির্জন ছাদ থেকে নামার সময় বাদল কীভাবে টের পায় যে তার সবচেয়ে কাছের মানুষটি বিশ্বাসঘাতক?",
  },
  {
    title: "Unsolved Antique Box",
    dilemma: "পাণ্ডুলিপিতে পাওয়া পিতলের তালাবদ্ধ পুরনো ডায়েরিটি খোলার পর কোন অপ্রত্যাশিত তথ্য চরিত্রদের অস্তিত্বকে নাড়িয়ে দেবে?",
  },
  {
    title: "Climax Faction Standoff",
    dilemma: "শেষ অঙ্কে পুলিশ, চোরাকারবারি এবং হিমুর অনুসারীদের মুখোমুখি সংঘর্ষে কে আত্মত্যাগ করবে?",
  },
];

export const ShowrunnersTableModal: React.FC<ShowrunnersTableModalProps> = ({
  isOpen,
  onClose,
  activeEditorText = "",
  onApplyToManuscript,
  projectId = "default",
}) => {
  const [dilemmaInput, setDilemmaInput] = useState(
    "হিমুকে কীভাবে ওসি সাহেবের গভীর জেরা থেকে তার স্বভাবসুলভ নিরাসক্ত চাতুর্য দিয়ে মুক্ত করা যায়?"
  );
  const [loading, setLoading] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<ShowrunnerRole | null>(null);
  const [debateData, setDebateData] = useState<ShowrunnerDebateSession | null>(null);
  const [applied, setApplied] = useState(false);

  // Trigger debate simulation
  const handleConveneCrucible = async (customDilemma?: string) => {
    const textToQuery = (customDilemma || dilemmaInput).trim();
    if (!textToQuery) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/showrunners/debate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          premiseOrDilemma: textToQuery,
          manuscriptContext: activeEditorText.slice(0, 500),
        }),
      });
      const json = await res.json();
      if (json.data) {
        setDebateData(json.data);
      }
    } catch (err) {
      console.error("Failed to run showrunners debate", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !debateData) {
      handleConveneCrucible();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyBeats = () => {
    if (!debateData?.consensusPitch || !onApplyToManuscript) return;
    const beatsFormatted = `\n\n--- 🎬 [Showrunners' Table Consensus: ${debateData.consensusPitch.headline}] ---\n` +
      debateData.consensusPitch.suggestedSceneBeats.map((b) => `• ${b}`).join("\n") +
      `\n\n${debateData.consensusPitch.synopsisBangla}\n`;

    onApplyToManuscript(beatsFormatted);
    setApplied(true);
    setTimeout(() => setApplied(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-5xl h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 border border-violet-500/30 rounded-xl text-violet-400">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-slate-100 tracking-tight">
                  Virtual "Showrunner's Table" Multi-Agent Brainstorm Crucible
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-violet-500/10 text-violet-300 border border-violet-500/30 rounded-full">
                  Capability #21
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full">
                  4 AI Co-Writers
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                আরিফ (স্থপতি) • ড. সামিয়া (মনস্তাত্ত্বিক) • কামাল (ভূগোলবিদ) • রাশেদ (বিদ্রোহী উস্কানিদাতা)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Dilemma Strip */}
        <div className="flex items-center px-6 py-2.5 bg-slate-950/70 border-b border-slate-800/60 overflow-x-auto text-xs space-x-2">
          <span className="text-[11px] font-medium text-slate-400 shrink-0 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Dilemma Presets:
          </span>
          {DILEMMA_PRESETS.map((p) => (
            <button
              key={p.title}
              onClick={() => {
                setDilemmaInput(p.dilemma);
                handleConveneCrucible(p.dilemma);
              }}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-violet-300 border border-slate-800 hover:border-violet-500/40 rounded-md transition-all shrink-0 text-[11px]"
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Main Workspace Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top: 2D Writers' Room Circular Table Visualization */}
          <div className="relative p-5 bg-gradient-to-b from-slate-950/80 to-slate-900/60 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
            {/* SVG Circular Table Diagram */}
            <div className="relative w-64 h-64 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Table Surface */}
                <circle cx="100" cy="100" r="55" className="fill-slate-950 stroke-slate-800" strokeWidth="2" />
                <circle cx="100" cy="100" r="45" className="fill-slate-900/50 stroke-violet-500/30" strokeDasharray="3 3" />

                {/* Connection lines to center */}
                <line x1="100" y1="25" x2="100" y2="85" className="stroke-indigo-500/40" strokeWidth="1.5" />
                <line x1="175" y1="100" x2="115" y2="100" className="stroke-purple-500/40" strokeWidth="1.5" />
                <line x1="100" y1="175" x2="100" y2="115" className="stroke-emerald-500/40" strokeWidth="1.5" />
                <line x1="25" y1="100" x2="85" y2="100" className="stroke-rose-500/40" strokeWidth="1.5" />

                {/* Central Core Pulsing Emblem */}
                <circle cx="100" cy="100" r="16" className="fill-violet-600/20 stroke-violet-400" strokeWidth="2" />
                <text x="100" y="104" textAnchor="middle" className="text-[10px] fill-violet-300 font-bold select-none">
                  CRUCIBLE
                </text>
              </svg>

              {/* Persona Nodes Overlaid */}
              {/* 1. Top: Architect */}
              <div
                onClick={() => setActiveSpeaker("architect")}
                className={`absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group transition-transform ${
                  activeSpeaker === "architect" ? "scale-110" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-950 border-2 border-indigo-400 flex items-center justify-center text-lg shadow-lg shadow-indigo-500/20 group-hover:border-indigo-300">
                  🏗️
                </div>
                <span className="text-[10px] font-semibold text-indigo-300 mt-1">Architect</span>
              </div>

              {/* 2. Right: Psychologist */}
              <div
                onClick={() => setActiveSpeaker("psychologist")}
                className={`absolute right-1 top-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group transition-transform ${
                  activeSpeaker === "psychologist" ? "scale-110" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-purple-950 border-2 border-purple-400 flex items-center justify-center text-lg shadow-lg shadow-purple-500/20 group-hover:border-purple-300">
                  🧠
                </div>
                <span className="text-[10px] font-semibold text-purple-300 mt-1">Psychologist</span>
              </div>

              {/* 3. Bottom: Geometer */}
              <div
                onClick={() => setActiveSpeaker("geometer")}
                className={`absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group transition-transform ${
                  activeSpeaker === "geometer" ? "scale-110" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center text-lg shadow-lg shadow-emerald-500/20 group-hover:border-emerald-300">
                  🌍
                </div>
                <span className="text-[10px] font-semibold text-emerald-300 mt-1">Geometer</span>
              </div>

              {/* 4. Left: Contrarian */}
              <div
                onClick={() => setActiveSpeaker("contrarian")}
                className={`absolute left-1 top-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group transition-transform ${
                  activeSpeaker === "contrarian" ? "scale-110" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-rose-950 border-2 border-rose-400 flex items-center justify-center text-lg shadow-lg shadow-rose-500/20 group-hover:border-rose-300">
                  ⚡
                </div>
                <span className="text-[10px] font-semibold text-rose-300 mt-1">Contrarian</span>
              </div>
            </div>

            {/* Dilemma Input Console */}
            <div className="flex-1 w-full space-y-3">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Target className="w-4 h-4 text-violet-400" />
                Active Narrative Obstacle / Writer's Block Prompt
              </label>
              <textarea
                value={dilemmaInput}
                onChange={(e) => setDilemmaInput(e.target.value)}
                placeholder="Pitch a story dilemma to the Showrunners (e.g. How to resolve the hostage crisis without guns?)..."
                className="w-full h-24 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs leading-relaxed focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 resize-none font-sans"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  4 AI specialists will evaluate, debate, and synthesize actionable scene beats.
                </span>
                <button
                  onClick={() => handleConveneCrucible()}
                  disabled={loading}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-violet-500/20 transition-all cursor-pointer"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span>{loading ? "Crucible in Debate..." : "Convene Showrunners"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Turn-by-Turn Debate Dialogue Stream */}
          {debateData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-violet-400" />
                  Live Writer's Room Debate ({debateData.turns.length} Speeches)
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Session ID: {debateData.sessionId.slice(0, 18)}
                </span>
              </div>

              <div className="space-y-3">
                {debateData.turns.map((turn) => {
                  const isHighlighted = activeSpeaker === turn.role;
                  return (
                    <div
                      key={turn.id}
                      className={`p-4 rounded-xl border transition-all ${
                        turn.role === "architect"
                          ? "bg-indigo-950/20 border-indigo-500/30"
                          : turn.role === "psychologist"
                          ? "bg-purple-950/20 border-purple-500/30"
                          : turn.role === "geometer"
                          ? "bg-emerald-950/20 border-emerald-500/30"
                          : "bg-rose-950/20 border-rose-500/30"
                      } ${isHighlighted ? "ring-2 ring-violet-400" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-xl">{turn.avatarIcon}</span>
                          <div>
                            <span className="text-xs font-semibold text-slate-200">{turn.speakerName}</span>
                            {turn.inResponseToRole && (
                              <span className="text-[10px] text-slate-400 ml-2">
                                (In response to @{turn.inResponseToRole})
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {turn.confidenceScore}% Conviction
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{turn.speechBangla}</p>

                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          Key Tactical Beat: <span className="text-amber-200">{turn.keySuggestion}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 italic">
                          {turn.speechEnglishSummary}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Consensus Action Deck & Wildcard */}
          {debateData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Consensus Deck (2 Cols) */}
              <div className="md:col-span-2 p-5 bg-gradient-to-br from-violet-950/30 via-slate-950/50 to-indigo-950/30 border border-violet-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                      Showrunners' Table Consensus Pitch
                    </h4>
                  </div>
                  <button
                    onClick={handleApplyBeats}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-medium transition-all shadow-sm shadow-violet-500/20"
                  >
                    {applied ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    <span>{applied ? "Applied to Editor!" : "Inject Beats into Manuscript"}</span>
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-100">{debateData.consensusPitch.headline}</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {debateData.consensusPitch.synopsisBangla}
                </p>

                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <p className="text-[11px] font-semibold text-slate-400">Actionable Scene Beat Sequence:</p>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {debateData.consensusPitch.suggestedSceneBeats.map((beat, bIdx) => (
                      <li key={bIdx} className="flex items-start space-x-2">
                        <span className="text-violet-400 font-bold">›</span>
                        <span>{beat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Wildcard Contrarian Deck (1 Col) */}
              <div className="p-5 bg-rose-950/20 border border-rose-500/30 rounded-2xl flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center space-x-2 text-rose-400 mb-1.5">
                    <Zap className="w-4 h-4" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider">
                      Contrarian Wildcard
                    </h4>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 mb-1">
                    {debateData.wildcardPitch.personaName}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-lg border border-rose-500/20">
                    "{debateData.wildcardPitch.wildcardSynopsis}"
                  </p>
                </div>

                <div className="pt-2 border-t border-rose-500/20 text-[11px] text-rose-300/80 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Dramatic Risk:</strong> {debateData.wildcardPitch.dramaticRisk}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
