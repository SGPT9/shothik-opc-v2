import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  GitFork,
  Sparkles,
  GitMerge,
  Crown,
  Layers,
  ArrowRight,
  RefreshCw,
  Plus,
  AlertTriangle,
  Zap,
  BookOpen,
  Check,
  UserCheck,
  HeartHandshake
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type TimelineMode = "canon" | "au" | "ooc" | "relationship";

export interface RippleEffect {
  axis: "character_arc" | "clues_mystery" | "world_state" | "thematic_tone";
  description: string;
  severity: "subtle" | "moderate" | "seismic";
}

export interface TimelineBranch {
  id: string;
  name: string;
  mode: TimelineMode;
  divergenceChapter: number;
  divergencePremise: string;
  summary: string;
  rippleEffects: RippleEffect[];
  sampleSceneProse: string;
  isCanon: boolean;
  parentBranchId?: string;
  createdAt: string;
}

export interface MultiverseLedger {
  projectId: string;
  activeTimelineId: string;
  timelines: TimelineBranch[];
  updatedAt: string;
}

interface MultiverseSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  projectTitle?: string;
  onInsertScene?: (prose: string) => void;
}

const MODE_CONFIG: Record<
  TimelineMode,
  { label: string; color: string; badgeBg: string; border: string; icon: React.ReactNode }
> = {
  canon: {
    label: "Canon Continuity",
    color: "text-emerald-400",
    badgeBg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: <Crown className="h-3.5 w-3.5 text-emerald-400" />
  },
  au: {
    label: "Alternate Universe (AU)",
    color: "text-cyan-400",
    badgeBg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    icon: <GitFork className="h-3.5 w-3.5 text-cyan-400" />
  },
  ooc: {
    label: "Out of Character (OOC)",
    color: "text-amber-400",
    badgeBg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: <UserCheck className="h-3.5 w-3.5 text-amber-400" />
  },
  relationship: {
    label: "Dynamic Relationships",
    color: "text-pink-400",
    badgeBg: "bg-pink-500/10",
    border: "border-pink-500/30",
    icon: <HeartHandshake className="h-3.5 w-3.5 text-pink-400" />
  }
};

export const MultiverseSandboxModal: React.FC<MultiverseSandboxModalProps> = ({
  isOpen,
  onClose,
  projectId = "default",
  projectTitle = "Active Manuscript",
  onInsertScene
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [ledger, setLedger] = useState<MultiverseLedger | null>(null);
  const [selectedTimelineId, setSelectedTimelineId] = useState<string>("");
  const [simulating, setSimulating] = useState<boolean>(false);
  const [customBeatPrompt, setCustomBeatPrompt] = useState<string>("");
  const [insertedSuccess, setInsertedSuccess] = useState<boolean>(false);

  // New branch form
  const [isForkingOpen, setIsForkingOpen] = useState<boolean>(false);
  const [forkName, setForkName] = useState<string>("");
  const [forkMode, setForkMode] = useState<TimelineMode>("au");
  const [forkChapter, setForkChapter] = useState<number>(2);
  const [forkPremise, setForkPremise] = useState<string>("");
  const [creatingFork, setCreatingFork] = useState<boolean>(false);

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/multiverse`);
      const data = await res.json();
      if (data.success && data.data) {
        setLedger(data.data);
        if (!selectedTimelineId && data.data.timelines.length > 0) {
          setSelectedTimelineId(data.data.activeTimelineId || data.data.timelines[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load multiverse ledger", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, selectedTimelineId]);

  useEffect(() => {
    if (isOpen) {
      fetchLedger();
    }
  }, [isOpen, fetchLedger]);

  const selectedTimeline = ledger?.timelines.find(t => t.id === selectedTimelineId) || ledger?.timelines[0];

  const handleSimulateScene = async () => {
    if (!selectedTimeline) return;
    setSimulating(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/multiverse/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timelineId: selectedTimeline.id,
          sceneBeatPrompt: customBeatPrompt || undefined
        })
      });
      const data = await res.json();
      if (data.success && data.data && ledger) {
        setLedger({
          ...ledger,
          timelines: ledger.timelines.map(t =>
            t.id === selectedTimeline.id ? { ...t, sampleSceneProse: data.data.simulatedScene } : t
          )
        });
      }
    } catch (err) {
      console.error("Simulation failed", err);
    } finally {
      setSimulating(false);
    }
  };

  const handlePromoteToCanon = async () => {
    if (!selectedTimeline || selectedTimeline.isCanon) return;
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/multiverse/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timelineId: selectedTimeline.id })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setLedger(data.data);
      }
    } catch (err) {
      console.error("Promotion failed", err);
    }
  };

  const handleCreateFork = async () => {
    if (!forkName.trim() || !forkPremise.trim()) return;
    setCreatingFork(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/multiverse/branch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: forkName.trim(),
          mode: forkMode,
          divergenceChapter: forkChapter,
          divergencePremise: forkPremise.trim(),
          parentBranchId: selectedTimeline?.id
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setLedger(data.data.ledger);
        setSelectedTimelineId(data.data.createdBranch.id);
        setIsForkingOpen(false);
        setForkName("");
        setForkPremise("");
      }
    } catch (err) {
      console.error("Fork creation failed", err);
    } finally {
      setCreatingFork(false);
    }
  };

  const handleInsertToManuscript = () => {
    if (!selectedTimeline?.sampleSceneProse) return;
    if (onInsertScene) {
      onInsertScene(selectedTimeline.sampleSceneProse);
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
              <GitFork className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  "What-If?" Multi-Verse & Canon Sandbox
                </h2>
                <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
                  InkOS #8
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Explore Canon, Alternate Universe (AU), OOC Inversions, and Dynamic Relationship forks without polluting your core timeline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsForkingOpen(!isForkingOpen)}
              className="h-8 gap-1.5 text-xs font-medium border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-200"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isForkingOpen ? "Cancel Fork" : "Fork New Timeline"}</span>
            </Button>

            <button
              onClick={onClose}
              className="ml-2 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Fork Creator Drawer (Conditional) */}
        {isForkingOpen && (
          <div className="bg-zinc-900/90 border-b border-zinc-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <GitFork className="h-4 w-4 text-cyan-400" />
                Spawn New Multi-Verse Branch
              </h4>
              <span className="text-xs text-zinc-400">
                Parent: {selectedTimeline?.name || "Canon"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Branch Name</label>
                <input
                  type="text"
                  placeholder="e.g. AU: The Corrupt Commissioner"
                  value={forkName}
                  onChange={e => setForkName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Timeline Mode</label>
                <select
                  value={forkMode}
                  onChange={e => setForkMode(e.target.value as TimelineMode)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="au">Alternate Universe (AU)</option>
                  <option value="ooc">Out of Character (OOC)</option>
                  <option value="relationship">Dynamic Relationships</option>
                  <option value="canon">Canon Fork</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Divergence Point</label>
                <select
                  value={forkChapter}
                  onChange={e => setForkChapter(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value={1}>Chapter 1 (Premise Divergence)</option>
                  <option value={2}>Chapter 2 (Mid-Inciting Incident)</option>
                  <option value={3}>Chapter 3 (Plot Point 1)</option>
                  <option value={4}>Chapter 4 (Midpoint Reversal)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400">"What-If?" Divergence Premise</label>
              <textarea
                rows={2}
                placeholder="What if the protagonist refused to hand over the flash drive and vanished into old Dhaka instead?..."
                value={forkPremise}
                onChange={e => setForkPremise(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsForkingOpen(false)}
                className="h-8 text-xs text-zinc-400"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreateFork}
                disabled={creatingFork || !forkName.trim() || !forkPremise.trim()}
                className="h-8 gap-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                <GitMerge className="h-3.5 w-3.5" />
                <span>{creatingFork ? "Forking..." : "Spawn Timeline Branch"}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <RefreshCw className="h-8 w-8 animate-spin text-cyan-400 mb-3" />
              <p className="text-sm">Mapping multi-verse branches and timeline states...</p>
            </div>
          ) : !ledger ? (
            <div className="text-center py-20 text-zinc-400">
              <p>Failed to load multiverse ledger.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Timeline List (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Active Timeline Matrix ({ledger.timelines.length})
                  </h4>
                </div>

                <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                  {ledger.timelines.map(t => {
                    const cfg = MODE_CONFIG[t.mode] || MODE_CONFIG.au;
                    const isSelected = t.id === selectedTimeline?.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTimelineId(t.id)}
                        className={`cursor-pointer rounded-xl border p-3.5 transition-all text-left ${
                          isSelected
                            ? "border-cyan-500/70 bg-cyan-950/20 shadow-md ring-1 ring-cyan-500/30"
                            : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/80"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border flex items-center gap-1 ${cfg.badgeBg} ${cfg.color} ${cfg.border}`}>
                              {cfg.icon}
                              <span>{cfg.label}</span>
                            </span>
                            {t.isCanon && (
                              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                                Canon Line
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500">
                            Ch {t.divergenceChapter}
                          </span>
                        </div>

                        <h5 className="font-bold text-sm text-zinc-100">{t.name}</h5>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                          {t.divergencePremise}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Timeline Inspector & Scene Simulator (7 cols) */}
              {selectedTimeline && (
                <div className="lg:col-span-7 space-y-5">
                  {/* Timeline Header Card */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs uppercase font-semibold text-cyan-400 tracking-wider">
                            Timeline Details
                          </span>
                          {selectedTimeline.isCanon ? (
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400 font-semibold border border-emerald-500/20">
                              Official Canon
                            </span>
                          ) : (
                            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                              Forked Universe
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-tight">
                          {selectedTimeline.name}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Diverges at Chapter {selectedTimeline.divergenceChapter}: "{selectedTimeline.divergencePremise}"
                        </p>
                      </div>

                      {!selectedTimeline.isCanon && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePromoteToCanon}
                          className="h-8 gap-1.5 text-xs font-semibold border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 shrink-0"
                          title="Promote this alternate timeline to become the main official Canon continuity"
                        >
                          <Crown className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Promote to Canon</span>
                        </Button>
                      )}
                    </div>

                    {/* Ripple Effects Matrix */}
                    <div className="space-y-2 pt-3 border-t border-zinc-800">
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
                        Causal Ripple Effects
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedTimeline.rippleEffects.map((r, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-2.5 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-zinc-300 uppercase text-[10px] tracking-wider">
                                {r.axis.replace("_", " ")}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                                  r.severity === "seismic"
                                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                }`}
                              >
                                {r.severity}
                              </span>
                            </div>
                            <p className="text-zinc-400 text-[11px] leading-relaxed">
                              {r.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Alternate Scene Simulator Card */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-cyan-400" />
                          Simulated Alternate Scene Draft
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Live prose generated under this timeline's unique psychological and plot constraints
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSimulateScene}
                        disabled={simulating}
                        className="h-8 gap-1.5 text-xs border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                      >
                        <Sparkles className={`h-3.5 w-3.5 ${simulating ? "animate-spin" : ""}`} />
                        <span>{simulating ? "Simulating..." : "Re-Simulate Scene"}</span>
                      </Button>
                    </div>

                    <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-4 text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap font-serif min-h-[120px] max-h-[220px] overflow-y-auto">
                      {selectedTimeline.sampleSceneProse || "Click Re-Simulate Scene to generate draft prose under this timeline."}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-zinc-500">
                        Zero canon state pollution until you choose to merge or insert.
                      </span>

                      <Button
                        size="sm"
                        onClick={handleInsertToManuscript}
                        disabled={!selectedTimeline.sampleSceneProse}
                        className="h-8 gap-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white"
                      >
                        {insertedSuccess ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Inserted into Manuscript!</span>
                          </>
                        ) : (
                          <>
                            <ArrowRight className="h-3.5 w-3.5" />
                            <span>Insert Scene into Active Manuscript</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
