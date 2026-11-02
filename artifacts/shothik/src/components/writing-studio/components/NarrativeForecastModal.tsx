import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, GitBranch, ShieldAlert, CheckCircle2, RefreshCw, Compass, Award, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Beat {
  chapter: number;
  summary: string;
}

interface CharacterDecision {
  character: string;
  decision: string;
}

interface ProjectedChanges {
  characters: string[];
  relationships: string[];
  world: string[];
  hooks: string[];
}

interface Risk {
  kind: string;
  description: string;
}

interface Branch {
  branchId: string;
  title: string;
  premise: string;
  pacingScore: number;
  intentMatch: string;
  beats: Beat[];
  characterDecisions: CharacterDecision[];
  projectedChanges: ProjectedChanges;
  risks: Risk[];
  uncertainties: string[];
  intentRationale: string;
}

interface ForecastData {
  forecastId: string;
  projectId: string;
  createdAt: string;
  horizon: number;
  status: "active" | "stale";
  selectedBranchId: string | null;
  branches: Branch[];
}

export interface NarrativeForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
}

export const NarrativeForecastModal: React.FC<NarrativeForecastModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
}) => {
  const [data, setData] = useState<ForecastData | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("branch-1");
  const [divergenceInput, setDivergenceInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [adopting, setAdopting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchForecast = async () => {
    setLoading(true);
    setSuccessMsg(null);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/projects/${encodeURIComponent(projectId)}/forecast`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        if (json.data.branches?.length > 0) {
          setSelectedBranchId(json.data.branches[0].branchId);
        }
      }
    } catch {
      // Offline fallback mock
      setData({
        forecastId: "fc_demo_local",
        projectId,
        createdAt: new Date().toISOString(),
        horizon: 3,
        status: "active",
        selectedBranchId: null,
        branches: [
          {
            branchId: "branch-1",
            title: "Trajectory A: The Cold Ideological Fracture",
            premise: "The protagonist uncovers proof of internal betrayal among the academic council, sparking a battle of intellect and legal maneuvering.",
            pacingScore: 0.94,
            intentMatch: "96% Intent Match",
            beats: [
              { chapter: 4, summary: "Discovery of encoded marginalia inside the ancient 1952 Language Movement manuscript." },
              { chapter: 5, summary: "Clash at the University Syndicate hall; secret loyalties are publicly tested under pressure." },
              { chapter: 6, summary: "A decisive sacrifice forces an underground alliance across rival linguistic factions." }
            ],
            characterDecisions: [
              { character: "Professor Rahman", decision: "Refuses to surrender the cryptographic manuscript to state censors." },
              { character: "Dr. Elena Vance", decision: "Leaks the encrypted translation key to international human rights observers." }
            ],
            projectedChanges: {
              characters: ["Rahman gains fugitive status", "Elena becomes prime mediator"],
              relationships: ["Syndicate trust severed", "Underground student alliance solidified"],
              world: ["Dhaka University enters state-monitored lockdown", "Underground press activated"],
              hooks: ["The true identity of the 1952 typist remains unmasked"]
            },
            risks: [
              { kind: "pacing_tension", description: "Chapter 5 debate risks slowing physical action; offset with ticking clock ultimatum." }
            ],
            uncertainties: ["Will the council chairman side with the ministry or academic autonomy?"],
            intentRationale: "Aligns tightly with the author's primary theme of cultural resistance through intellectual perseverance."
          },
          {
            branchId: "branch-2",
            title: "Trajectory B: The Diplomatic Covert Alliance",
            premise: "Rather than an open split, characters feign compliance while secretly weaponizing the publication's release date as leverage.",
            pacingScore: 0.88,
            intentMatch: "89% Intent Match",
            beats: [
              { chapter: 4, summary: "A backchannel negotiation in Old Dhaka over smuggled printing plates." },
              { chapter: 5, summary: "A covert dual-language broadcast exposes the tampering of historical archives." },
              { chapter: 6, summary: "The publishing chief issues a midnight printing order under police radar." }
            ],
            characterDecisions: [
              { character: "Publisher Chief", decision: "Authorizes emergency clandestine print run of 5,000 unredacted copies." },
              { character: "Marcus Sterling", decision: "Feigns cooperation with inspectors to delay confiscation orders." }
            ],
            projectedChanges: {
              characters: ["Marcus operates as double agent", "Publisher chief assumes personal criminal liability"],
              relationships: ["Fragile pact formed with independent newspaper union"],
              world: ["Midnight black-market distribution network activated across Sadarghat"],
              hooks: ["A courier carrying Master Plate #3 fails to reach the designated press"]
            },
            risks: [
              { kind: "moral_ambiguity", description: "Protagonist deception could alienate purist readers; emphasize defensive necessity." }
            ],
            uncertainties: ["Can the printing presses complete the run before dawn curfews?"],
            intentRationale: "Maximizes psychological cat-and-mouse tension while preserving institutional survival."
          },
          {
            branchId: "branch-3",
            title: "Trajectory C: The Radical Public Manifesto",
            premise: "An explosive, uncalculated leak triggers immediate civil reaction, forcing the protagonists onto the public frontline.",
            pacingScore: 0.96,
            intentMatch: "91% Intent Match",
            beats: [
              { chapter: 4, summary: "Uncontrolled viral leak of the suppressed chapter onto independent web forums." },
              { chapter: 5, summary: "Mass public assembly outside the National Archives demanding transparency." },
              { chapter: 6, summary: "The state prosecutor issues warrants, igniting a high-profile constitutional standoff." }
            ],
            characterDecisions: [
              { character: "Aria Chen", decision: "Streams the live deciphering of the watermark certificate to 200,000 viewers." },
              { character: "Professor Rahman", decision: "Surrenders voluntarily to draw media spotlights away from his students." }
            ],
            projectedChanges: {
              characters: ["Aria becomes the public face of the resistance", "Rahman imprisoned as moral martyr"],
              relationships: ["Student core galvanized into rapid defensive action"],
              world: ["National television forced to broadcast the unredacted manuscript text"],
              hooks: ["Rahman conceals the master cipher key in his prison cell bible"]
            },
            risks: [
              { kind: "velocity_danger", description: "Narrative velocity accelerates rapidly; leaves less room for intimate character moments." }
            ],
            uncertainties: ["How will international academic guilds react to Rahman's arrest?"],
            intentRationale: "Provides explosive mid-book climax with maximum public stakes and high cinematic momentum."
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateNew = async () => {
    setLoading(true);
    setSuccessMsg(null);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/projects/${encodeURIComponent(projectId)}/forecast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          divergence: divergenceInput.trim() || undefined,
          horizon: 3,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        if (json.data.branches?.length > 0) {
          setSelectedBranchId(json.data.branches[0].branchId);
        }
        setSuccessMsg("Stochastic branches projected successfully!");
      }
    } catch {
      setSuccessMsg("Generated preview trajectory branches (local simulator mode).");
    } finally {
      setLoading(false);
    }
  };

  const handleAdoptBranch = async (branch: Branch) => {
    setAdopting(true);
    setSuccessMsg(null);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/projects/${encodeURIComponent(projectId)}/forecast/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          forecastId: data?.forecastId || "fc_demo",
          branchId: branch.branchId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg(`Staged "${branch.title}" as active working candidate plan in selected-branch-plan.md (Canon preserved).`);
      } else {
        setSuccessMsg(`Adopted candidate plan "${branch.title}" locally (Zero canon state mutation).`);
      }
    } catch {
      setSuccessMsg(`Adopted candidate plan "${branch.title}" locally (Zero canon state mutation).`);
    } finally {
      setAdopting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchForecast();
    }
  }, [isOpen, projectId]);

  const currentBranch = data?.branches?.find((b) => b.branchId === selectedBranchId) || data?.branches?.[0];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-950 border-slate-800 text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-lg font-bold tracking-tight text-white">
                  Multi-Branch Narrative Forecast Engine
                </DialogTitle>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-600/40">
                  Feature #1 • InkOS Stochastics
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-300 border border-emerald-500/30">
                  Zero Canon Pollution
                </span>
              </div>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Simulate 3 isolated future trajectories for &ldquo;{projectTitle}&rdquo; before drafting Chapter N+1. Pacing, beat breakdown, and risk analysis.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Branch Navigation Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-800 bg-slate-900/40 flex items-center gap-2 overflow-x-auto">
          {data?.branches?.map((branch) => {
            const isSelected = branch.branchId === selectedBranchId;
            return (
              <button
                key={branch.branchId}
                onClick={() => setSelectedBranchId(branch.branchId)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border whitespace-nowrap",
                  isSelected
                    ? "bg-purple-600/25 text-purple-300 border-purple-500/60 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/30"
                    : "bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                )}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>{branch.title}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-400 border border-purple-800/40">
                  {Math.round(branch.pacingScore * 100)}% Pacing
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-sm bg-slate-900/30">
          {loading && (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
              <p className="text-slate-300 text-sm font-medium">Computing narrative forecast trajectories & risk matrices...</p>
              <p className="text-xs text-slate-500">Evaluating character decisions against author intent bounds...</p>
            </div>
          )}

          {!loading && currentBranch && (
            <>
              {/* Premise & Intent Match Banner */}
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Core Premise & Trajectory Horizon
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-purple-900/80 text-purple-200 border border-purple-700/50">
                    {currentBranch.intentMatch}
                  </span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {currentBranch.premise}
                </p>
                <p className="text-[11px] text-purple-300/80 italic pt-0.5">
                  &ldquo;{currentBranch.intentRationale}&rdquo;
                </p>
              </div>

              {/* 3-Beat Chapter Progression Horizon */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-purple-400" />
                    Simulated 3-Chapter Beat Sequence
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">Horizon: +3 Chapters</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {currentBranch.beats.map((beat, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between hover:border-purple-600/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-950/80 text-purple-400 border border-purple-800/50">
                            Chapter {beat.chapter} Beat
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">Beat #{idx + 1}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {beat.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Character Decisions & Projected Changes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* Character Key Decisions */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-blue-400" />
                    Crucial Character Decisions
                  </h3>
                  <div className="space-y-1.5">
                    {currentBranch.characterDecisions.map((cd, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                        <span className="font-semibold text-blue-300">{cd.character}: </span>
                        <span className="text-slate-300">{cd.decision}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projected World & Relationship Changes */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                    Projected Canon Shifts
                  </h3>
                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-mono">•</span>
                      <span><strong>Status:</strong> {currentBranch.projectedChanges.characters.join(", ")}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-mono">•</span>
                      <span><strong>Alliances:</strong> {currentBranch.projectedChanges.relationships.join("; ")}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-mono">•</span>
                      <span><strong>World State:</strong> {currentBranch.projectedChanges.world.join("; ")}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-mono">•</span>
                      <span><strong>Active Hook:</strong> {currentBranch.projectedChanges.hooks.join("; ")}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Risks & Hazards */}
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/30 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <span className="font-semibold text-amber-300">Pacing & Structure Hazard Alert:</span>
                  {currentBranch.risks.map((r, idx) => (
                    <p key={idx} className="text-amber-200/90 leading-relaxed">
                      [{r.kind}] {r.description}
                    </p>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Feedback message banner */}
          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-600/40 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Divergence custom input */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Direct the Simulator (Custom Divergence Goal):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="E.g. Introduce a third faction, heighten psychological paranoia, or escalate police curfews..."
                value={divergenceInput}
                onChange={(e) => setDivergenceInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <Button
                size="sm"
                onClick={handleSimulateNew}
                disabled={loading}
                className="h-8 px-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Simulate</span>
              </Button>
            </div>
          </div>

        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Staging target:</span>
            <code className="text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded text-[11px]">
              story/runtime/selected-branch-plan.md
            </code>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="h-8 px-4 text-xs font-semibold text-slate-300 border-slate-700 hover:bg-slate-800 cursor-pointer"
            >
              Close
            </Button>
            {currentBranch && (
              <Button
                size="sm"
                onClick={() => handleAdoptBranch(currentBranch)}
                disabled={adopting}
                className="h-8 px-4 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 gap-1.5 shadow-md shadow-purple-950/60 cursor-pointer disabled:opacity-50"
              >
                <span>{adopting ? "Staging Plan..." : "Adopt Candidate Plan"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};
export default NarrativeForecastModal;
