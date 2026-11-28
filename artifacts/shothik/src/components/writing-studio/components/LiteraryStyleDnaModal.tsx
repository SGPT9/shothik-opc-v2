import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Lock,
  Unlock,
  Sparkles,
  Fingerprint,
  Sliders,
  Check,
  Copy,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Volume2,
  Eye,
  Wind,
  Flame,
  Feather,
  Plus,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SentenceRhythmDistribution {
  staccatoShortPercent: number;
  moderateCadencePercent: number;
  extendedFlowPercent: number;
  ornateCompoundPercent: number;
}

interface StylometricMetrics {
  totalWords: number;
  totalSentences: number;
  meanSentenceLength: number;
  sentenceLengthVariance: number;
  sentenceLengthStdDev: number;
  rhythmDistribution: SentenceRhythmDistribution;
  dialogueRatio: number;
  narrativeRatio: number;
  sensoryAdjectiveDensityPer1k: number;
  sensoryBreakdown: {
    visual: number;
    auditory: number;
    olfactory: number;
    tactile: number;
    gustatory: number;
  };
  typeTokenRatio: number;
  yulesKCharacteristic: number;
  hapaxLegomenaCount: number;
  bengaliSadhuRatio: number;
  passiveVoiceQuotient: number;
}

interface ArchetypeMatch {
  name: string;
  tagline: string;
  similarityScore: number;
  keyTraits: string[];
}

interface ProjectStyleDna {
  projectId: string;
  analyzedAt: string;
  voiceLocked: boolean;
  archetype: ArchetypeMatch;
  benchmarkArchetypes: ArchetypeMatch[];
  metrics: StylometricMetrics;
  voiceLockSystemPrompt: string;
  customRules: string[];
}

interface ContinuationResult {
  prompt: string;
  archetype: string;
  voiceLocked: boolean;
  vanilla: {
    label: string;
    text: string;
    critique: string;
  };
  locked: {
    label: string;
    text: string;
    critique: string;
  };
}

interface LiteraryStyleDnaModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  currentManuscriptText?: string;
  onApplyContinuation?: (prose: string) => void;
}

export const LiteraryStyleDnaModal: React.FC<LiteraryStyleDnaModalProps> = ({
  isOpen,
  onClose,
  projectId = "default",
  currentManuscriptText = "",
  onApplyContinuation
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [dna, setDna] = useState<ProjectStyleDna | null>(null);
  const [activeTab, setActiveTab] = useState<"fingerprint" | "rules" | "sandbox">("fingerprint");
  const [copied, setCopied] = useState<boolean>(false);
  const [newRuleInput, setNewRuleInput] = useState<string>("");
  const [testPrompt, setTestPrompt] = useState<string>("হিমু মাঝরাতে বৃষ্টিতে ভিজতে নামল।");
  const [continuation, setContinuation] = useState<ContinuationResult | null>(null);
  const [generatingTest, setGeneratingTest] = useState<boolean>(false);
  const [insertedSuccess, setInsertedSuccess] = useState<boolean>(false);

  const fetchDna = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/style-dna`);
      const data = await res.json();
      if (data.success && data.data) {
        setDna(data.data);
      }
    } catch (err) {
      console.error("Failed to load Style DNA", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen) {
      fetchDna();
    }
  }, [isOpen, fetchDna]);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/style-dna/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentManuscriptText || undefined
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDna(data.data);
      }
    } catch (err) {
      console.error("Failed to re-analyze manuscript", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleToggleLock = async () => {
    if (!dna) return;
    const targetState = !dna.voiceLocked;
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/style-dna/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locked: targetState,
          customRules: dna.customRules
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDna(data.data);
      }
    } catch (err) {
      console.error("Failed to toggle voice lock", err);
    }
  };

  const handleAddCustomRule = async () => {
    if (!dna || !newRuleInput.trim()) return;
    const updatedRules = [...dna.customRules, newRuleInput.trim()];
    setNewRuleInput("");
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/style-dna/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locked: dna.voiceLocked,
          customRules: updatedRules
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDna(data.data);
      }
    } catch (err) {
      console.error("Failed to add custom rule", err);
    }
  };

  const handleRemoveCustomRule = async (index: number) => {
    if (!dna) return;
    const updatedRules = dna.customRules.filter((_, i) => i !== index);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/style-dna/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locked: dna.voiceLocked,
          customRules: updatedRules
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDna(data.data);
      }
    } catch (err) {
      console.error("Failed to remove custom rule", err);
    }
  };

  const handleCopyPrompt = () => {
    if (!dna?.voiceLockSystemPrompt) return;
    navigator.clipboard.writeText(dna.voiceLockSystemPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateContinuation = async () => {
    if (!testPrompt.trim()) return;
    setGeneratingTest(true);
    setInsertedSuccess(false);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/style-dna/generate-continuation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: testPrompt,
          contextPassage: currentManuscriptText?.slice(0, 1000)
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setContinuation(data.data);
      }
    } catch (err) {
      console.error("Failed to generate continuation comparison", err);
    } finally {
      setGeneratingTest(false);
    }
  };

  const handleInsertProse = (prose: string) => {
    if (onApplyContinuation) {
      onApplyContinuation(prose);
      setInsertedSuccess(true);
      setTimeout(() => setInsertedSuccess(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl text-zinc-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-inner">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Literary Style DNA & Author Voice Fingerprint
                </h2>
                <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-400 border border-purple-500/20">
                  InkOS #7
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Statistical authorial cadence, vocabulary richness, and deterministic Voice Lock
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleLock}
              className={`h-8 gap-1.5 text-xs font-medium transition-all ${
                dna?.voiceLocked
                  ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80"
                  : "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {dna?.voiceLocked ? (
                <>
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Voice Locked (Active)</span>
                </>
              ) : (
                <>
                  <Unlock className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Voice Unlocked</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="h-8 gap-1.5 text-xs font-medium border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${analyzing ? "animate-spin" : ""}`} />
              <span>{analyzing ? "Analyzing..." : "Re-Analyze Manuscript"}</span>
            </Button>

            <button
              onClick={onClose}
              className="ml-2 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 px-6 border-b border-zinc-800/80 bg-zinc-950/40 text-xs">
          <button
            onClick={() => setActiveTab("fingerprint")}
            className={`py-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "fingerprint"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Stylometric Radar & Archetypes</span>
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`py-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "rules"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Voice Lock Directives ({dna?.customRules.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`py-3 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "sandbox"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Side-by-Side Style Sandbox</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <RefreshCw className="h-8 w-8 animate-spin text-purple-400 mb-3" />
              <p className="text-sm">Calculating stylometrics and authorial DNA...</p>
            </div>
          ) : !dna ? (
            <div className="text-center py-20 text-zinc-400">
              <p>No style DNA calculated yet. Click Re-Analyze Manuscript.</p>
            </div>
          ) : (
            <>
              {activeTab === "fingerprint" && (
                <div className="space-y-6">
                  {/* Dominant Archetype Banner */}
                  <div className="relative overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-zinc-900 to-zinc-900 p-5 shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs uppercase tracking-wider font-semibold text-purple-400">
                            Dominant Literary Voice
                          </span>
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                            {dna.archetype.similarityScore}% Match
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight">
                          {dna.archetype.name}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {dna.archetype.tagline}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right hidden sm:block">
                          <div className="text-xs text-zinc-400">Manuscript Scale</div>
                          <div className="text-sm font-semibold text-zinc-200">
                            {dna.metrics.totalWords.toLocaleString()} words · {dna.metrics.totalSentences} sentences
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-purple-500/10">
                      {dna.archetype.keyTraits.map((trait, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                          <Check className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>{trait}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics Deck */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Metric 1: Sentence Cadence */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-300">Sentence Cadence</span>
                        <span className="text-xs font-mono text-purple-400 font-bold">
                          {dna.metrics.meanSentenceLength} w/s
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Staccato (&lt;8w)</span>
                          <span className="font-mono">{dna.metrics.rhythmDistribution.staccatoShortPercent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500"
                            style={{ width: `${dna.metrics.rhythmDistribution.staccatoShortPercent}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Moderate (8-18w)</span>
                          <span className="font-mono">{dna.metrics.rhythmDistribution.moderateCadencePercent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500"
                            style={{ width: `${dna.metrics.rhythmDistribution.moderateCadencePercent}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Extended flow (&gt;18w)</span>
                          <span className="font-mono">
                            {dna.metrics.rhythmDistribution.extendedFlowPercent + dna.metrics.rhythmDistribution.ornateCompoundPercent}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-pink-500"
                            style={{
                              width: `${dna.metrics.rhythmDistribution.extendedFlowPercent + dna.metrics.rhythmDistribution.ornateCompoundPercent}%`
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-500">
                        StdDev variance: ±{dna.metrics.sentenceLengthStdDev} words
                      </p>
                    </div>

                    {/* Metric 2: Dialogue vs Narrative */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-300">Dialogue vs Exposition</span>
                        <span className="text-xs font-mono text-cyan-400 font-bold">
                          {dna.metrics.dialogueRatio}% / {dna.metrics.narrativeRatio}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-cyan-500"
                          style={{ width: `${dna.metrics.dialogueRatio}%` }}
                          title={`Dialogue: ${dna.metrics.dialogueRatio}%`}
                        />
                        <div
                          className="h-full bg-zinc-700"
                          style={{ width: `${dna.metrics.narrativeRatio}%` }}
                          title={`Narrative: ${dna.metrics.narrativeRatio}%`}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-zinc-400">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-cyan-500" />
                          Dialogue ({dna.metrics.dialogueRatio}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-zinc-600" />
                          Exposition ({dna.metrics.narrativeRatio}%)
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500">
                        {dna.metrics.dialogueRatio > 35
                          ? "Brisk conversational pace with character subtext."
                          : "Contemplative, world-grounded narrative prose."}
                      </p>
                    </div>

                    {/* Metric 3: Sensory Immersion */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-300">Sensory Density</span>
                        <span className="text-xs font-mono text-amber-400 font-bold">
                          {dna.metrics.sensoryAdjectiveDensityPer1k} / 1k
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1 text-center">
                        <div className="rounded bg-zinc-800/80 p-1">
                          <Eye className="h-3 w-3 mx-auto text-amber-400 mb-0.5" />
                          <div className="text-[10px] font-mono text-zinc-300">{dna.metrics.sensoryBreakdown.visual}</div>
                        </div>
                        <div className="rounded bg-zinc-800/80 p-1">
                          <Volume2 className="h-3 w-3 mx-auto text-cyan-400 mb-0.5" />
                          <div className="text-[10px] font-mono text-zinc-300">{dna.metrics.sensoryBreakdown.auditory}</div>
                        </div>
                        <div className="rounded bg-zinc-800/80 p-1">
                          <Wind className="h-3 w-3 mx-auto text-emerald-400 mb-0.5" />
                          <div className="text-[10px] font-mono text-zinc-300">{dna.metrics.sensoryBreakdown.olfactory}</div>
                        </div>
                        <div className="rounded bg-zinc-800/80 p-1">
                          <Flame className="h-3 w-3 mx-auto text-red-400 mb-0.5" />
                          <div className="text-[10px] font-mono text-zinc-300">{dna.metrics.sensoryBreakdown.tactile}</div>
                        </div>
                        <div className="rounded bg-zinc-800/80 p-1">
                          <Feather className="h-3 w-3 mx-auto text-purple-400 mb-0.5" />
                          <div className="text-[10px] font-mono text-zinc-300">{dna.metrics.sensoryBreakdown.gustatory}</div>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-500">
                        Top sensory axis: Visual & Auditory immersion.
                      </p>
                    </div>

                    {/* Metric 4: Lexical & Register */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-300">Lexical Richness</span>
                        <span className="text-xs font-mono text-emerald-400 font-bold">
                          TTR {(dna.metrics.typeTokenRatio * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="space-y-1 text-[11px] text-zinc-400">
                        <div className="flex justify-between">
                          <span>Unique word tokens:</span>
                          <span className="font-mono text-zinc-200">
                            {Math.round(dna.metrics.totalWords * dna.metrics.typeTokenRatio)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hapax Legomena (1-off words):</span>
                          <span className="font-mono text-zinc-200">{dna.metrics.hapaxLegomenaCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bengali Register:</span>
                          <span className="font-mono text-emerald-400">
                            {dna.metrics.bengaliSadhuRatio > 30 ? "Classical Sadhu" : "Clean Modern Cholit"}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-500">
                        Passive voice rate: {dna.metrics.passiveVoiceQuotient}%
                      </p>
                    </div>
                  </div>

                  {/* Benchmark Archetype Matrix */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Benchmark Stylistic Archetypes
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dna.benchmarkArchetypes.map((arch, idx) => (
                        <div
                          key={idx}
                          className={`rounded-xl border p-3.5 transition-all ${
                            arch.name === dna.archetype.name
                              ? "border-purple-500/50 bg-purple-950/20"
                              : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-zinc-200">{arch.name}</span>
                            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-mono font-medium text-zinc-300">
                              {arch.similarityScore}%
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mb-2">{arch.tagline}</p>
                          <div className="space-y-1">
                            {arch.keyTraits.slice(0, 2).map((t, i) => (
                              <div key={i} className="text-[10px] text-zinc-500 flex items-center gap-1">
                                <span className="h-1 w-1 rounded-full bg-purple-400" />
                                <span>{t}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "rules" && (
                <div className="space-y-6">
                  {/* System Prompt View */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-200">
                          Compiled Voice Lock System Directive
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Injected automatically into LLM prompt headers to prevent generic AI style drift
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyPrompt}
                        className="h-8 gap-1.5 text-xs border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Prompt</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <pre className="rounded-lg bg-zinc-950 p-4 font-mono text-xs text-purple-300/90 whitespace-pre-wrap leading-relaxed border border-zinc-800/80 max-h-56 overflow-y-auto">
                      {dna.voiceLockSystemPrompt}
                    </pre>
                  </div>

                  {/* Custom Inviolable Rules */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-200">
                          Custom Author Directives
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Specific stylistic preferences or absolute prohibitions for your manuscript
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {dna.customRules.map((rule, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-zinc-200"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-purple-400 font-semibold">{idx + 1}.</span>
                            <span>{rule}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveCustomRule(idx)}
                            className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add rule (e.g. 'Never allow romantic dialogue to feel sentimental')..."
                        value={newRuleInput}
                        onChange={e => setNewRuleInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAddCustomRule()}
                        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                      />
                      <Button
                        size="sm"
                        onClick={handleAddCustomRule}
                        disabled={!newRuleInput.trim()}
                        className="h-8 gap-1 text-xs bg-purple-600 hover:bg-purple-500 text-white"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "sandbox" && (
                <div className="space-y-6">
                  {/* Test continuation input */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                    <label className="text-xs font-semibold text-zinc-300 block">
                      Test Prompt Beat or Opening Sentence
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={testPrompt}
                        onChange={e => setTestPrompt(e.target.value)}
                        placeholder="Enter an opening beat to test..."
                        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                      />
                      <Button
                        onClick={handleGenerateContinuation}
                        disabled={generatingTest || !testPrompt.trim()}
                        className="h-9 gap-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white shrink-0"
                      >
                        <Sparkles className={`h-3.5 w-3.5 ${generatingTest ? "animate-spin" : ""}`} />
                        <span>{generatingTest ? "Synthesizing..." : "Run Side-by-Side Test"}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Side-by-side comparison */}
                  {continuation && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Vanilla AI Card */}
                      <div className="rounded-xl border border-red-500/20 bg-zinc-900/40 p-4 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                              Vanilla AI (Unlocked)
                            </span>
                            <span className="rounded bg-red-950/60 border border-red-500/30 px-1.5 py-0.5 text-[10px] text-red-300">
                              Generic Drift
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed italic bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                            "{continuation.vanilla.text}"
                          </p>
                        </div>
                        <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-500">
                          <strong className="text-zinc-400">Diagnosis:</strong> {continuation.vanilla.critique}
                        </div>
                      </div>

                      {/* Voice-Locked Shothik AI Card */}
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Lock className="h-3 w-3" />
                              Voice-Locked Shothik AI
                            </span>
                            <span className="rounded bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.5 text-[10px] text-emerald-300 font-semibold">
                              Authentic DNA
                            </span>
                          </div>
                          <p className="text-xs text-zinc-100 leading-relaxed bg-zinc-950/80 p-3 rounded-lg border border-emerald-500/20">
                            "{continuation.locked.text}"
                          </p>
                        </div>
                        <div className="space-y-3">
                          <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-emerald-400/90">
                            <strong className="text-emerald-300">Adherence:</strong> {continuation.locked.critique}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleInsertProse(continuation.locked.text)}
                            className="w-full h-8 gap-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            {insertedSuccess ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-white" />
                                <span>Inserted into Active Manuscript!</span>
                              </>
                            ) : (
                              <>
                                <ArrowRight className="h-3.5 w-3.5" />
                                <span>Insert This Scene into Manuscript</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
