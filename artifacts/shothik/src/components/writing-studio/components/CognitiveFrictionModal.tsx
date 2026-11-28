import React, { useState, useEffect } from "react";
import {
  Brain,
  Zap,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X,
  Sparkles,
  Eye,
  Activity,
  Layers,
  ChevronRight,
  TrendingDown
} from "lucide-react";

export type FrictionLevel = "effortless" | "moderate" | "heavy" | "tangled_crimson";

export interface AnalyzedSentenceFriction {
  index: number;
  text: string;
  wordCount: number;
  clauseCount: number;
  frictionScore: number;
  frictionLevel: FrictionLevel;
  primaryCause: string;
  primaryCauseBn: string;
  estimatedFixationMs: number;
  regressionProbabilityPercent: number;
  streamlinedRevision: string;
}

export interface CognitiveFrictionData {
  projectId: string;
  overallFrictionScore: number;
  flowGrade: "A+" | "A" | "B" | "C" | "D" | "F";
  verdictSummary: string;
  verdictSummaryBn: string;
  totalSentences: number;
  totalWords: number;
  distribution: {
    effortlessPercent: number;
    moderatePercent: number;
    heavyPercent: number;
    tangledPercent: number;
  };
  highestFrictionSentences: AnalyzedSentenceFriction[];
  allSentences: AnalyzedSentenceFriction[];
}

interface CognitiveFrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  manuscriptText: string;
  projectId?: string;
  onApplyRevision: (revisedText: string) => void;
}

export const CognitiveFrictionModal: React.FC<CognitiveFrictionModalProps> = ({
  isOpen,
  onClose,
  manuscriptText,
  projectId = "proj_demo_bengali",
  onApplyRevision
}) => {
  const [data, setData] = useState<CognitiveFrictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterLevel, setFilterLevel] = useState<"all" | "tangled" | "effortless">("all");
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const fetchHeatmap = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/cognitive-friction/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: manuscriptText || "" })
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to analyze cognitive friction:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHeatmap();
    }
  }, [isOpen]);

  const handleApplySingleRevision = (original: string, replacement: string) => {
    if (!original || !replacement) return;
    const updated = manuscriptText.replace(original, replacement);
    onApplyRevision(updated);
    setAppliedNotice("Sentence de-tangled in manuscript!");
    setTimeout(() => setAppliedNotice(null), 3000);
  };

  const getFrictionColorClass = (level: FrictionLevel) => {
    switch (level) {
      case "effortless":
        return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
      case "moderate":
        return "text-amber-400 border-amber-500/30 bg-amber-500/10";
      case "heavy":
        return "text-orange-400 border-orange-500/30 bg-orange-500/10";
      case "tangled_crimson":
        return "text-rose-400 border-rose-500/40 bg-rose-500/15";
    }
  };

  const getFrictionBorderClass = (level: FrictionLevel) => {
    switch (level) {
      case "effortless":
        return "border-l-4 border-l-emerald-500";
      case "moderate":
        return "border-l-4 border-l-amber-500";
      case "heavy":
        return "border-l-4 border-l-orange-500";
      case "tangled_crimson":
        return "border-l-4 border-l-rose-500";
    }
  };

  if (!isOpen) return null;

  const filteredSentences = (data?.allSentences || []).filter((s) => {
    if (filterLevel === "tangled") return s.frictionLevel === "tangled_crimson" || s.frictionLevel === "heavy";
    if (filterLevel === "effortless") return s.frictionLevel === "effortless";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-zinc-100">
                  Cognitive Flow &amp; Reading Friction Heatmap
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                  Capability #29
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                জ্ঞানীয় পাঠপ্রবাহ ও বাক্যজট হিটম্যাপ: Real-time Syntactic Friction &amp; Clause-Stacking Auditor
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchHeatmap}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 flex items-center space-x-1.5 border border-zinc-700 transition"
              title="Re-analyze manuscript friction"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-rose-400" : ""}`} />
              <span>Re-Analyze</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {appliedNotice && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{appliedNotice}</span>
            </div>
          )}

          {data ? (
            <>
              {/* Top Scorecard Hero */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-rose-950/30 to-zinc-900 border border-rose-500/20 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-rose-400/80 font-semibold">
                      Flow State Grade
                    </span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-4xl font-extrabold text-rose-300">{data.flowGrade}</span>
                      <span className="text-sm text-zinc-400">
                        ({data.overallFrictionScore}/100 friction)
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-zinc-400 flex items-center justify-between border-t border-zinc-800/80 pt-2">
                    <span>Analyzed Prose</span>
                    <span className="font-bold text-zinc-200">
                      {data.totalSentences} sentences • {data.totalWords} words
                    </span>
                  </div>
                </div>

                <div className="md:col-span-3 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-rose-400" />
                      <h4 className="text-xs font-bold text-zinc-200">
                        Cognitive Load Distribution
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      {data.verdictSummary}
                    </p>
                    <p className="text-xs text-zinc-400 font-bengali italic mt-0.5">
                      {data.verdictSummaryBn}
                    </p>
                  </div>

                  {/* Multi-segment distribution progress bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="w-full bg-zinc-800 rounded-full h-3 flex overflow-hidden">
                      <div
                        className="bg-emerald-500 transition-all duration-500"
                        style={{ width: `${data.distribution.effortlessPercent}%` }}
                        title={`Effortless: ${data.distribution.effortlessPercent}%`}
                      />
                      <div
                        className="bg-amber-400 transition-all duration-500"
                        style={{ width: `${data.distribution.moderatePercent}%` }}
                        title={`Moderate: ${data.distribution.moderatePercent}%`}
                      />
                      <div
                        className="bg-orange-500 transition-all duration-500"
                        style={{ width: `${data.distribution.heavyPercent}%` }}
                        title={`Heavy: ${data.distribution.heavyPercent}%`}
                      />
                      <div
                        className="bg-rose-500 transition-all duration-500"
                        style={{ width: `${data.distribution.tangledPercent}%` }}
                        title={`Crimson Tangled: ${data.distribution.tangledPercent}%`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Effortless ({data.distribution.effortlessPercent}%)</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>Moderate ({data.distribution.moderatePercent}%)</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        <span>Heavy ({data.distribution.heavyPercent}%)</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>Tangled Crimson ({data.distribution.tangledPercent}%)</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilterLevel("all")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      filterLevel === "all"
                        ? "bg-zinc-800 text-zinc-100"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    All Sentences ({data.allSentences.length})
                  </button>
                  <button
                    onClick={() => setFilterLevel("tangled")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                      filterLevel === "tangled"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Dense &amp; Tangled Only</span>
                  </button>
                  <button
                    onClick={() => setFilterLevel("effortless")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                      filterLevel === "effortless"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Effortless Flow</span>
                  </button>
                </div>

                <div className="text-xs text-zinc-500 flex items-center space-x-1">
                  <Eye className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Saccadic Eye-Tracking Fixation Simulation</span>
                </div>
              </div>

              {/* Sentences Heatmap List */}
              <div className="space-y-3">
                {filteredSentences.map((s) => (
                  <div
                    key={s.index}
                    className={`p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-xl space-y-2.5 transition hover:border-zinc-700 ${getFrictionBorderClass(
                      s.frictionLevel
                    )}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-zinc-500">#{s.index}</span>
                        <span
                          className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border ${getFrictionColorClass(
                            s.frictionLevel
                          )}`}
                        >
                          {s.frictionLevel.replace("_", " ")}
                        </span>
                        <span className="text-xs text-zinc-400">
                          {s.wordCount} words &bull; {s.clauseCount} clauses
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-xs">
                        <div className="text-right">
                          <span className="text-zinc-400 font-mono text-[11px]">
                            ~{s.estimatedFixationMs}ms
                          </span>
                          <span className="block text-[10px] text-zinc-500">Fixation</span>
                        </div>
                        <div className="text-right">
                          <span className="text-rose-400 font-mono text-[11px]">
                            {s.regressionProbabilityPercent}%
                          </span>
                          <span className="block text-[10px] text-zinc-500">Regression Risk</span>
                        </div>
                        {s.frictionScore >= 50 && (
                          <button
                            onClick={() => handleApplySingleRevision(s.text, s.streamlinedRevision)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs flex items-center space-x-1 transition"
                            title="De-tangle sentence in active manuscript"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>De-Tangle</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Sentence Text */}
                    <div className="text-xs font-bengali text-zinc-200 leading-relaxed bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
                      {s.text}
                    </div>

                    {/* Diagnostic Cause & Streamlined Revision */}
                    <div className="text-xs text-zinc-400 space-y-1">
                      <div className="flex items-start space-x-1.5">
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p>{s.primaryCause}</p>
                          <p className="text-zinc-500 font-bengali text-[11px]">{s.primaryCauseBn}</p>
                        </div>
                      </div>

                      {s.frictionScore >= 50 && s.streamlinedRevision && (
                        <div className="mt-2 p-2 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-start space-x-2">
                          <TrendingDown className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-semibold block text-[11px] uppercase tracking-wider text-emerald-400">
                              Streamlined De-Tangled Alternative:
                            </span>
                            <span className="font-bengali text-xs">
                              {s.streamlinedRevision}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-zinc-500 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-rose-400" />
              <p className="text-xs">Computing Syntactic Friction &amp; Clause Stacking Heatmap...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="text-xs text-zinc-500 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-rose-500" />
            <span>Working Memory Cognitive Load Engine &bull; Zero Syntax Bloat</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CognitiveFrictionModal;
