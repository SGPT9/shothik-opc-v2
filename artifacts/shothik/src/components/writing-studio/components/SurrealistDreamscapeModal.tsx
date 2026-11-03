import React, { useState, useEffect } from "react";
import {
  Sparkles,
  EyeOff,
  CloudMoon,
  AlertOctagon,
  RefreshCw,
  X,
  CheckCircle2,
  BookOpen,
  SplitSquareVertical,
  Compass,
  Flame,
  Feather
} from "lucide-react";

export interface DreamDistortionTrope {
  id: string;
  name: string;
  nameBn: string;
  severity: "subtle" | "hallucinatory" | "shattering";
  detectedQuote: string;
  groundTruthExplanation: string;
  groundTruthExplanationBn: string;
}

export interface DualRealityDiscrepancy {
  narratedPerception: string;
  groundTruthFact: string;
  distortionType: "Temporal Elasticity" | "Synesthesia" | "Phantom Character" | "Paranoid Confabulation" | "Object Metamorphosis";
  confidenceScore: number;
}

export interface DreamscapeData {
  projectId: string;
  unreliabilityScore: number;
  narrativeState: "GROUNDED" | "FEVER_DREAM" | "MAGICAL_REALISM" | "PSYCHOTIC_DELIRIUM";
  dreamLogicStyle: "murakami_magic" | "elias_fever_realism" | "kafka_nightmare" | "humayun_mystic";
  styleLabel: string;
  groundTruthSummary: string;
  groundTruthSummaryBn: string;
  tropesDetected: DreamDistortionTrope[];
  discrepancies: DualRealityDiscrepancy[];
  suggestedDreamProse: {
    title: string;
    prose: string;
    styleBadge: string;
  }[];
}

interface SurrealistDreamscapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  manuscriptText: string;
  projectId?: string;
  onApplyProse: (prose: string) => void;
}

export const SurrealistDreamscapeModal: React.FC<SurrealistDreamscapeModalProps> = ({
  isOpen,
  onClose,
  manuscriptText,
  projectId = "proj_demo_bengali",
  onApplyProse
}) => {
  const [data, setData] = useState<DreamscapeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"tropes" | "matrix" | "prose">("tropes");
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const fetchDreamscape = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/surrealist-dreamscape/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: manuscriptText || "" })
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to analyze surrealist dreamscape:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDreamscape();
    }
  }, [isOpen]);

  const handleApplySingleProse = (proseText: string) => {
    onApplyProse(proseText);
    setAppliedNotice("Dream beat inserted into manuscript!");
    setTimeout(() => setAppliedNotice(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-zinc-950 border border-indigo-500/30 rounded-2xl shadow-2xl text-zinc-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-500/20 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <CloudMoon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-zinc-100">
                  Surrealist Dreamscape &amp; Unreliable Narrator Mode
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium">
                  Capability #30 &bull; Module 3 Finale
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                পরাবাস্তব স্বপ্নলোক ও অবিশ্বস্ত কথক: Fever Dreams &amp; Hidden &quot;True State&quot; Ledger
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchDreamscape}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 flex items-center space-x-1.5 border border-zinc-700 transition"
              title="Re-run dream analysis"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
              <span>Weave Dream Logic</span>
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
              {/* Dual-Reality Hero Banner */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-zinc-900 border border-indigo-500/30 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Unreliability Index</span>
                    </div>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-4xl font-extrabold text-indigo-300">
                        {data.unreliabilityScore}%
                      </span>
                    </div>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {data.narrativeState.replace("_", " ")}
                    </span>
                  </div>
                  <div className="mt-3 text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-2 font-bengali">
                    {data.styleLabel}
                  </div>
                </div>

                <div className="md:col-span-3 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
                      <AlertOctagon className="w-4 h-4" />
                      <span>The Hidden &quot;Ground Truth&quot; Ledger (প্রকৃত বাস্তব সত্য)</span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                      {data.groundTruthSummary}
                    </p>
                    <p className="text-xs text-zinc-400 font-bengali italic mt-1">
                      {data.groundTruthSummaryBn}
                    </p>
                  </div>
                  <div className="text-[11px] text-zinc-500 border-t border-zinc-800/60 pt-2 flex items-center justify-between">
                    <span>Anchor: Physical Old Dhaka Room in Monsoon</span>
                    <span className="text-indigo-400">Verifiable World State: Consistent</span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-zinc-800 space-x-4">
                <button
                  onClick={() => setActiveTab("tropes")}
                  className={`pb-2.5 text-xs font-medium transition flex items-center space-x-1.5 ${
                    activeTab === "tropes"
                      ? "border-b-2 border-indigo-400 text-indigo-300"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Cognitive Distortions ({data.tropesDetected.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("matrix")}
                  className={`pb-2.5 text-xs font-medium transition flex items-center space-x-1.5 ${
                    activeTab === "matrix"
                      ? "border-b-2 border-indigo-400 text-indigo-300"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <SplitSquareVertical className="w-4 h-4" />
                  <span>Dual-Reality Matrix ({data.discrepancies.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("prose")}
                  className={`pb-2.5 text-xs font-medium transition flex items-center space-x-1.5 ${
                    activeTab === "prose"
                      ? "border-b-2 border-indigo-400 text-indigo-300"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Feather className="w-4 h-4" />
                  <span>Dream Logic Weaving (3 Styles)</span>
                </button>
              </div>

              {/* Tab 1: Tropes Detected */}
              {activeTab === "tropes" && (
                <div className="space-y-3">
                  {data.tropesDetected.map((trope) => (
                    <div
                      key={trope.id}
                      className="p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-2 hover:border-indigo-500/30 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs text-zinc-100">{trope.name}</span>
                          <span className="text-xs text-zinc-400 font-bengali">({trope.nameBn})</span>
                        </div>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            trope.severity === "shattering"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : trope.severity === "hallucinatory"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          }`}
                        >
                          {trope.severity}
                        </span>
                      </div>

                      <div className="text-xs font-bengali bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 text-zinc-300">
                        &quot;{trope.detectedQuote}&quot;
                      </div>

                      <div className="text-xs text-zinc-400 pt-1">
                        <span className="text-amber-400 font-medium">Ground Truth Fact: </span>
                        <span>{trope.groundTruthExplanation}</span>
                        <p className="text-zinc-500 font-bengali text-[11px] mt-0.5">
                          {trope.groundTruthExplanationBn}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Discrepancy Matrix */}
              {activeTab === "matrix" && (
                <div className="space-y-4">
                  {data.discrepancies.map((disc, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                          {disc.distortionType}
                        </span>
                        <span className="text-zinc-500 font-mono text-[11px]">
                          AI Confidence: {disc.confidenceScore}%
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-zinc-950 rounded-lg border border-purple-500/30 space-y-1">
                          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                            Narrated Perception (কথকের দৃষ্টিভঙ্গি)
                          </span>
                          <p className="text-zinc-200 font-bengali leading-relaxed">
                            {disc.narratedPerception}
                          </p>
                        </div>

                        <div className="p-3 bg-zinc-950 rounded-lg border border-amber-500/30 space-y-1">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                            Ground Truth Reality (প্রকৃত বস্তুগত সত্য)
                          </span>
                          <p className="text-zinc-300 font-bengali leading-relaxed">
                            {disc.groundTruthFact}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Stylistic Prose Interpretations */}
              {activeTab === "prose" && (
                <div className="space-y-4">
                  {data.suggestedDreamProse.map((item, i) => (
                    <div
                      key={i}
                      className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-3 hover:border-indigo-500/30 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-zinc-100">{item.title}</h4>
                          <span className="text-[11px] text-indigo-400 font-bengali">
                            {item.styleBadge}
                          </span>
                        </div>
                        <button
                          onClick={() => handleApplySingleProse(item.prose)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1 shadow-md shadow-indigo-600/20"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Inject Dream Beat</span>
                        </button>
                      </div>

                      <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs font-bengali text-zinc-300 leading-relaxed">
                        {item.prose}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center text-zinc-500 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
              <p className="text-xs">Entering the Surrealist Dreamscape &amp; True State Ledger...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="text-xs text-zinc-500 flex items-center space-x-1.5">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dual Reality Cognitive Engine &bull; Module 3 (Features 21–30 Complete)</span>
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

export default SurrealistDreamscapeModal;
