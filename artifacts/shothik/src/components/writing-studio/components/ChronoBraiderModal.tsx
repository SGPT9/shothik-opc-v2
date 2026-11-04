import React, { useState, useEffect, useMemo } from "react";
import {
  Clock,
  GitCommit,
  GitBranch,
  AlertTriangle,
  History,
  Sparkles,
  ArrowRight,
  PlusCircle,
  X,
  RefreshCw,
  CheckCircle2,
  Calendar,
  MapPin,
  User,
  Radio,
  FileText
} from "lucide-react";

export type TemporalMovement = "Present Ground" | "Analepsis (Flashback)" | "Prolepsis (Flashforward)" | "Frame Narrative";

export interface ChronoNode {
  id: string;
  chapterNumber: number;
  chapterTitle: string;
  chapterTitleBn: string;
  narrativeRevealIndex: number;
  inUniverseYear: number;
  inUniverseDateStr: string;
  temporalMovement: TemporalMovement;
  perspectiveCharacter: string;
  characterAgeInScene: number;
  location: string;
  eraSensoryAnchor: string;
  eraSensoryAnchorBn: string;
  synopsis: string;
  synopsisBn: string;
}

export interface ChronoParadoxAnomaly {
  id: string;
  severity: "Low" | "Medium" | "High (Causal Paradox)";
  title: string;
  titleBn: string;
  description: string;
  affectedChapterIndices: number[];
  recommendation: string;
}

export interface ChronoBraiderState {
  projectId: string;
  title: string;
  titleBn: string;
  totalChaptersMapped: number;
  chronologicalSpanYears: number;
  narrativeComplexityScore: number;
  nodes: ChronoNode[];
  anomalies: ChronoParadoxAnomaly[];
  transitionProseTemplates: {
    title: string;
    bengaliSnippet: string;
    englishSnippet: string;
  }[];
}

interface ChronoBraiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  manuscriptText: string;
  projectId?: string;
  onInsertProse: (snippet: string) => void;
}

export const ChronoBraiderModal: React.FC<ChronoBraiderModalProps> = ({
  isOpen,
  onClose,
  manuscriptText,
  projectId = "proj_demo_bengali",
  onInsertProse
}) => {
  const [chronoData, setChronoData] = useState<ChronoBraiderState | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"braid" | "anomalies" | "transitions" | "add">("braid");
  const [insertedNotice, setInsertedNotice] = useState<string | null>(null);

  // New Node Form State
  const [newChapterNum, setNewChapterNum] = useState<number>(6);
  const [newTitle, setNewTitle] = useState("");
  const [newTitleBn, setNewTitleBn] = useState("");
  const [newYear, setNewYear] = useState<number>(2026);
  const [newDateStr, setNewDateStr] = useState("November 1971");
  const [newMovement, setNewMovement] = useState<TemporalMovement>("Analepsis (Flashback)");
  const [newCharacter, setNewCharacter] = useState("Arafat Chowdhury");
  const [newAge, setNewAge] = useState<number>(38);
  const [newLocation, setNewLocation] = useState("Old Dhaka Vaults");
  const [newSensory, setNewSensory] = useState("Kerosene smell, monsoon raindrops on tin");
  const [newSynopsis, setNewSynopsis] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadState();
    }
  }, [isOpen, projectId]);

  const loadState = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/chrono-braider/state`);
      if (res.ok) {
        const json = await res.json();
        setChronoData(json);
      }
    } catch (e) {
      console.error("Failed to load chrono braider state:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAuditManuscript = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/chrono-braider/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manuscript: manuscriptText })
      });
      if (res.ok) {
        const json = await res.json();
        setChronoData(json);
      }
    } catch (e) {
      console.error("Failed to audit manuscript timeline:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSynopsis.trim()) return;

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/chrono-braider/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterNumber: Number(newChapterNum),
          chapterTitle: newTitle.trim(),
          chapterTitleBn: newTitleBn.trim() || newTitle.trim(),
          inUniverseYear: Number(newYear),
          inUniverseDateStr: newDateStr.trim(),
          temporalMovement: newMovement,
          perspectiveCharacter: newCharacter.trim(),
          characterAgeInScene: Number(newAge),
          location: newLocation.trim(),
          eraSensoryAnchor: newSensory.trim(),
          synopsis: newSynopsis.trim()
        })
      });
      if (res.ok) {
        await loadState();
        setNewTitle("");
        setNewTitleBn("");
        setNewSynopsis("");
        setActiveTab("braid");
      }
    } catch (e) {
      console.error("Failed to create chrono node:", e);
    }
  };

  const sortedChronologicalNodes = useMemo(() => {
    if (!chronoData) return [];
    return [...chronoData.nodes].sort((a, b) => a.inUniverseYear - b.inUniverseYear);
  }, [chronoData]);

  const handleApplyTransition = (snippet: string, title: string) => {
    onInsertProse(`\n\n> *[Temporal Shift: ${title}]*\n${snippet}\n\n`);
    setInsertedNotice(`Inserted transition "${title}"!`);
    setTimeout(() => setInsertedNotice(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl border border-amber-500/30 bg-slate-900/95 text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Multi-Tier Chrono-Braider (Non-Linear Flashbacks)
                </h2>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
                  Cap #32
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {chronoData?.titleBn || "মাল্টি-টিয়ার ক্রোনো-ব্রেইডার (নন-লিনিয়ার টাইমলাইন)"} • {chronoData?.chronologicalSpanYears || 0} Year Diegetic Span • {chronoData?.totalChaptersMapped || 0} Chapters Mapped
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAuditManuscript}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-600/20 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-600/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Audit Flashbacks
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900 px-6 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("braid")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "braid"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <GitBranch className="h-3.5 w-3.5" />
              Dual Timeline Braid ({chronoData?.nodes?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("anomalies")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "anomalies"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Paradox Audit ({chronoData?.anomalies?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("transitions")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "transitions"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Transition Prose Weavers
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "add"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Map Chapter Beat
            </button>
          </div>

          {insertedNotice && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md animate-pulse">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {insertedNotice}
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: DUAL TIMELINE BRAID */}
          {activeTab === "braid" && (
            <div className="space-y-6">
              {/* Dual Braid Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Narrative Reveal Order (Syuzhet) */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-amber-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        1. Narrative Reveal Order (Syuzhet)
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-500">Order reader experiences chapters</span>
                  </div>

                  <div className="space-y-3">
                    {chronoData?.nodes.map((node, idx) => {
                      const isFlashback = node.temporalMovement === "Analepsis (Flashback)";
                      const isFlashforward = node.temporalMovement === "Prolepsis (Flashforward)";
                      return (
                        <div
                          key={node.id}
                          className="rounded-lg border border-slate-800/80 bg-slate-900/90 p-3 space-y-2 hover:border-amber-500/40 transition-all shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-amber-300">
                                  {node.chapterNumber}
                                </span>
                                <span className="font-semibold text-xs text-white">
                                  {node.chapterTitle}
                                </span>
                              </div>
                              <p className="text-[11px] text-amber-400/80 font-bangla pl-7">
                                {node.chapterTitleBn}
                              </p>
                            </div>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap ${
                                isFlashback
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                  : isFlashforward
                                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {node.temporalMovement}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-amber-400/70" />
                              <span className="text-slate-200 font-medium">{node.inUniverseDateStr}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-amber-400/70" />
                              <span className="text-slate-200 font-medium">
                                {node.perspectiveCharacter} ({node.characterAgeInScene}y)
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 leading-snug">{node.synopsis}</p>

                          <div className="rounded bg-slate-950/60 p-2 text-[10px] text-slate-400 space-y-0.5 border border-slate-800/50">
                            <span className="text-amber-400/90 font-medium">Era Sensory Anchor:</span>
                            <p className="text-slate-300">{node.eraSensoryAnchor}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: In-Universe Diegetic Chronology (Fabula) */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-emerald-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        2. World Historical Chronology (Fabula)
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-500">True historical time sequence</span>
                  </div>

                  <div className="space-y-3">
                    {sortedChronologicalNodes.map((node) => (
                      <div
                        key={node.id}
                        className="rounded-lg border border-slate-800/80 bg-slate-900/90 p-3 space-y-2 hover:border-emerald-500/40 transition-all shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-xs font-bold font-mono">
                              {node.inUniverseYear}
                            </span>
                            <span className="text-xs font-semibold text-white">{node.chapterTitle}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Revealed in Ch {node.chapterNumber}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="text-slate-300">{node.location}</span>
                          <span className="text-amber-400/80">{node.perspectiveCharacter} (Age {node.characterAgeInScene})</span>
                        </div>

                        <p className="text-xs text-slate-300 leading-snug">{node.synopsis}</p>
                        <p className="text-xs text-slate-400 italic font-bangla">{node.synopsisBn}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARADOX AUDIT */}
          {activeTab === "anomalies" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Causal Anomaly & Paradox Warnings</h3>
                  <p className="text-xs text-slate-400">
                    Temporal collision detection cross-checking character birth years, historical technology, and physical events.
                  </p>
                </div>
                <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-3 py-1 text-xs font-bold text-rose-400">
                  {chronoData?.anomalies.length || 0} Anomalies Detected
                </span>
              </div>

              <div className="space-y-3">
                {chronoData?.anomalies.map((anom) => (
                  <div
                    key={anom.id}
                    className="rounded-xl border border-rose-500/30 bg-slate-950/70 p-4 space-y-3 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-rose-400" />
                          <h4 className="font-bold text-white text-sm">{anom.title}</h4>
                        </div>
                        <p className="text-xs text-rose-400/80 font-bangla font-medium">{anom.titleBn}</p>
                      </div>
                      <span className="rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold">
                        {anom.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">{anom.description}</p>

                    <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 space-y-1 text-xs">
                      <span className="font-semibold text-emerald-400">Recommended Resolution:</span>
                      <p className="text-slate-300">{anom.recommendation}</p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                      <span>Affected Chapter Revelations:</span>
                      {anom.affectedChapterIndices.map((ch) => (
                        <span key={ch} className="rounded bg-slate-800 px-2 py-0.5 text-slate-200 font-mono">
                          Chapter {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TRANSITION PROSE WEAVERS */}
          {activeTab === "transitions" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Atmospheric sensory bridge snippets to fluidly slide reader consciousness between eras without jarring pacing whiplash.
              </p>

              <div className="grid grid-cols-1 gap-4">
                {chronoData?.transitionProseTemplates.map((t, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3 hover:border-amber-500/40 transition-all shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400 text-xs tracking-wide">
                        {t.title}
                      </span>
                      <button
                        onClick={() => handleApplyTransition(t.bengaliSnippet, t.title)}
                        className="flex items-center gap-1.5 rounded-lg bg-amber-600/30 border border-amber-500/40 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        Insert Bengali Transition
                      </button>
                    </div>

                    <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800 space-y-2">
                      <p className="text-xs text-slate-200 leading-relaxed font-bangla font-medium">
                        "{t.bengaliSnippet}"
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed italic border-t border-slate-800/60 pt-2">
                        "{t.englishSnippet}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ADD CHAPTER CHRONO NODE */}
          {activeTab === "add" && (
            <form onSubmit={handleAddNode} className="space-y-4 max-w-xl mx-auto py-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-4 shadow-lg">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <PlusCircle className="h-4 w-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Map New Timeline Beat</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Chapter Number</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={newChapterNum}
                      onChange={(e) => setNewChapterNum(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Temporal Movement</label>
                    <select
                      value={newMovement}
                      onChange={(e) => setNewMovement(e.target.value as TemporalMovement)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Present Ground">Present Ground</option>
                      <option value="Analepsis (Flashback)">Analepsis (Flashback)</option>
                      <option value="Prolepsis (Flashforward)">Prolepsis (Flashforward)</option>
                      <option value="Frame Narrative">Frame Narrative</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Chapter Title (English)</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Shadows over Buriganga"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Chapter Title (Bengali)</label>
                    <input
                      type="text"
                      value={newTitleBn}
                      onChange={(e) => setNewTitleBn(e.target.value)}
                      placeholder="e.g. বুড়িগঙ্গার ছায়া"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">In-Universe Year</label>
                    <input
                      type="number"
                      required
                      value={newYear}
                      onChange={(e) => setNewYear(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Exact Date String</label>
                    <input
                      type="text"
                      value={newDateStr}
                      onChange={(e) => setNewDateStr(e.target.value)}
                      placeholder="e.g. March 25, 1971"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Perspective Character</label>
                    <input
                      type="text"
                      value={newCharacter}
                      onChange={(e) => setNewCharacter(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Character Age In Scene</label>
                    <input
                      type="number"
                      value={newAge}
                      onChange={(e) => setNewAge(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Era Sensory Anchors</label>
                  <input
                    type="text"
                    value={newSensory}
                    onChange={(e) => setNewSensory(e.target.value)}
                    placeholder="e.g. Transistor radios, kerosene lantern flicker, monsoon scent"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Dramatic Scene Synopsis</label>
                  <textarea
                    rows={2}
                    required
                    value={newSynopsis}
                    onChange={(e) => setNewSynopsis(e.target.value)}
                    placeholder="What crucial revelation or event occurs in this time period?"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-amber-600 hover:bg-amber-500 text-white py-2 text-xs font-semibold shadow-md transition-all"
                >
                  Save Timeline Beat into Braid
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
