import React, { useState, useEffect } from "react";
import {
  GitPullRequest,
  GitBranch,
  GitFork,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  PlusCircle,
  X,
  RefreshCw,
  Compass,
  FileText,
  Sliders,
  ChevronRight
} from "lucide-react";

export interface DivergenceConsequence {
  category: "Character Fate" | "Plot Mystery" | "Thematic Resonance" | "Pacing Velocity";
  categoryBn: string;
  canonState: string;
  divergentState: string;
  impactSeverity: "Subtle Shift" | "Major Arc Reversal" | "Catastrophic Timeline Shatter";
}

export interface PlotBranchFork {
  id: string;
  branchName: string;
  branchNameBn: string;
  pivotChapter: number;
  pivotSceneTitle: string;
  whatIfPremise: string;
  whatIfPremiseBn: string;
  isCanon: boolean;
  parentBranchId: string | null;
  createdAt: string;
  consequences: DivergenceConsequence[];
  divergentProseSnippet: string;
  divergentProseSnippetBn: string;
}

export interface PlotDivergenceState {
  projectId: string;
  title: string;
  titleBn: string;
  activeBranchId: string;
  totalBranches: number;
  branches: PlotBranchFork[];
}

interface PlotDivergenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  manuscriptText: string;
  projectId?: string;
  onApplyDivergence: (prose: string, branchName: string) => void;
}

export const PlotDivergenceModal: React.FC<PlotDivergenceModalProps> = ({
  isOpen,
  onClose,
  manuscriptText,
  projectId = "proj_demo_bengali",
  onApplyDivergence
}) => {
  const [divergenceData, setDivergenceData] = useState<PlotDivergenceState | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("branch_canon_alpha");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"tree" | "replay" | "fork">("tree");
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  // New Fork Form State
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchNameBn, setNewBranchNameBn] = useState("");
  const [newPivotChapter, setNewPivotChapter] = useState(1);
  const [newPremise, setNewPremise] = useState("");
  const [newPremiseBn, setNewPremiseBn] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadState();
    }
  }, [isOpen, projectId]);

  const loadState = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/plot-divergence/state`);
      if (res.ok) {
        const json = await res.json();
        setDivergenceData(json);
        if (json.activeBranchId) {
          setSelectedBranchId(json.activeBranchId);
        }
      }
    } catch (e) {
      console.error("Failed to load divergence state:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim() || !newPremise.trim()) return;

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/plot-divergence/fork`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchName: newBranchName.trim(),
          branchNameBn: newBranchNameBn.trim() || newBranchName.trim(),
          pivotChapter: Number(newPivotChapter),
          whatIfPremise: newPremise.trim(),
          whatIfPremiseBn: newPremiseBn.trim() || newPremise.trim(),
          parentBranchId: selectedBranchId
        })
      });
      if (res.ok) {
        await loadState();
        setNewBranchName("");
        setNewBranchNameBn("");
        setNewPremise("");
        setActiveTab("tree");
      }
    } catch (e) {
      console.error("Failed to spawn divergence fork:", e);
    }
  };

  const handleReplayBranch = async (branch: PlotBranchFork) => {
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/plot-divergence/replay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId: branch.id })
      });
      if (res.ok) {
        const snippet = `\n\n> **[Plot Divergence: ${branch.branchName}]**\n> *What-If: ${branch.whatIfPremise}*\n\n${branch.divergentProseSnippetBn}\n\n`;
        onApplyDivergence(snippet, branch.branchName);
        setAppliedNotice(`Switched timeline to "${branch.branchName}" & injected prose!`);
        setTimeout(() => setAppliedNotice(null), 3000);
        await loadState();
      }
    } catch (e) {
      console.error("Failed to replay branch:", e);
    }
  };

  const currentBranch = divergenceData?.branches.find((b) => b.id === selectedBranchId) || divergenceData?.branches[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl border border-cyan-500/30 bg-slate-900/95 text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <GitPullRequest className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Semantic Time-Travel & Plot Divergence Replay
                </h2>
                <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
                  Cap #33
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {divergenceData?.titleBn || "আখ্যান বিভাজন ও সেমান্টিক টাইম-ট্রাভেল রিপ্লে"} • {divergenceData?.totalBranches || 0} Parallel Story Forks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadState}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-600/20 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-600/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Tree
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
              onClick={() => setActiveTab("tree")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "tree"
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <GitFork className="h-3.5 w-3.5" />
              Timeline Branch Matrix ({divergenceData?.branches?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("replay")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "replay"
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              Causal Ripple Diff & Replay
            </button>
            <button
              onClick={() => setActiveTab("fork")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "fork"
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Spawn What-If Fork
            </button>
          </div>

          {appliedNotice && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md animate-pulse">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {appliedNotice}
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: BRANCH TREE & TIMELINE MATRIX */}
          {activeTab === "tree" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Branch Selector Sidebar */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Narrative Branch
                </h3>
                <div className="space-y-2">
                  {divergenceData?.branches.map((branch) => {
                    const isSelected = branch.id === selectedBranchId;
                    const isActive = branch.id === divergenceData.activeBranchId;
                    return (
                      <div
                        key={branch.id}
                        onClick={() => setSelectedBranchId(branch.id)}
                        className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                          isSelected
                            ? "border-cyan-500 bg-cyan-950/40 shadow-md shadow-cyan-500/10"
                            : "border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              branch.isCanon
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            }`}
                          >
                            {branch.isCanon ? "CANON PRIME" : "DIVERGENT FORK"}
                          </span>
                          {isActive && (
                            <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                              Active Timeline
                            </span>
                          )}
                        </div>

                        <h4 className="font-semibold text-xs text-white line-clamp-1">{branch.branchName}</h4>
                        <p className="text-[11px] text-cyan-400/80 font-bangla line-clamp-1">{branch.branchNameBn}</p>
                        <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                          <span>Pivot at Ch {branch.pivotChapter}</span>
                          <span>•</span>
                          <span>{branch.consequences.length} Causal Impacts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Branch Detailed Inspector */}
              <div className="md:col-span-2 space-y-4">
                {currentBranch && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-4 shadow-lg">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">{currentBranch.branchName}</h3>
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                            Ch {currentBranch.pivotChapter}
                          </span>
                        </div>
                        <p className="text-xs text-cyan-400 font-bangla">{currentBranch.branchNameBn}</p>
                      </div>

                      <button
                        onClick={() => handleReplayBranch(currentBranch)}
                        className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 text-xs font-semibold shadow-md transition-all whitespace-nowrap"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Replay & Inject Timeline
                      </button>
                    </div>

                    {/* What-If Premise */}
                    <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                        What-If Divergence Premise
                      </span>
                      <p className="text-xs text-slate-200">{currentBranch.whatIfPremise}</p>
                      <p className="text-xs text-slate-400 italic font-bangla">{currentBranch.whatIfPremiseBn}</p>
                    </div>

                    {/* Causal Ripple Consequences */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Semantic Causal Ripple Consequences
                      </span>
                      <div className="space-y-2">
                        {currentBranch.consequences.map((c, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white">{c.category}</span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                  c.impactSeverity === "Catastrophic Timeline Shatter"
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                }`}
                              >
                                {c.impactSeverity}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                              <div className="rounded bg-slate-950 p-2 border border-slate-800/80">
                                <span className="text-slate-500 font-medium block">Canon State:</span>
                                <span className="text-slate-300">{c.canonState}</span>
                              </div>
                              <div className="rounded bg-cyan-950/40 p-2 border border-cyan-800/40">
                                <span className="text-cyan-400 font-medium block">Divergent State:</span>
                                <span className="text-cyan-200">{c.divergentState}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Divergent Prose Snippet Preview */}
                    <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Divergent Prose Preview
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-bangla font-medium">
                        "{currentBranch.divergentProseSnippetBn}"
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed italic border-t border-slate-800 pt-1">
                        "{currentBranch.divergentProseSnippet}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: REPLAY & TIMELINE COMPARISON */}
          {activeTab === "replay" && currentBranch && (
            <div className="space-y-4">
              <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 via-slate-900 to-cyan-950/30 p-5 space-y-2">
                <h3 className="font-bold text-white text-sm">
                  Replay Time-Machine: {currentBranch.branchName}
                </h3>
                <p className="text-xs text-slate-300">
                  Rewind the manuscript state to Chapter {currentBranch.pivotChapter} and branch the narrative stream along this alternate cause-and-effect trajectory without contaminating your master canon.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleReplayBranch(currentBranch)}
                    className="flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 text-xs font-semibold shadow-lg transition-all"
                  >
                    <Play className="h-4 w-4" />
                    Activate This Timeline & Inject Divergent Beat
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                  <span className="text-xs font-bold uppercase text-emerald-400">
                    Master Canon Timeline (Anchor)
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The baseline sequence of events as defined in the master manuscript. All facts, clues, and character survival states adhere to verified history.
                  </p>
                </div>
                <div className="rounded-xl border border-cyan-800/60 bg-cyan-950/30 p-4 space-y-2">
                  <span className="text-xs font-bold uppercase text-cyan-400">
                    Divergent Fork Ripple (Experimental)
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {currentBranch.whatIfPremise}
                  </p>
                  <p className="text-xs text-cyan-300 italic font-bangla">
                    {currentBranch.whatIfPremiseBn}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SPAWN WHAT-IF FORK */}
          {activeTab === "fork" && (
            <form onSubmit={handleCreateFork} className="space-y-4 max-w-xl mx-auto py-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-4 shadow-lg">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <PlusCircle className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Create New Timeline Divergence Fork</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Branch Name (English)</label>
                    <input
                      type="text"
                      required
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      placeholder="e.g. Divergence C: The Secret Alliance"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Branch Name (Bengali)</label>
                    <input
                      type="text"
                      value={newBranchNameBn}
                      onChange={(e) => setNewBranchNameBn(e.target.value)}
                      placeholder="e.g. বিকল্প ধারা গ: গোপন মিত্রতা"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Pivot Chapter Number</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newPivotChapter}
                    onChange={(e) => setNewPivotChapter(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">What-If Premise (English)</label>
                  <textarea
                    rows={2}
                    required
                    value={newPremise}
                    onChange={(e) => setNewPremise(e.target.value)}
                    placeholder="What single pivotal action or decision diverges from the canon plot?"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">What-If Premise (Bengali)</label>
                  <textarea
                    rows={2}
                    value={newPremiseBn}
                    onChange={(e) => setNewPremiseBn(e.target.value)}
                    placeholder="কোন সিদ্ধান্তের কারণে মূল আখ্যানের পথ পরিবর্তিত হলো?"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white py-2 text-xs font-semibold shadow-md transition-all"
                >
                  Spawn Timeline Fork
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
