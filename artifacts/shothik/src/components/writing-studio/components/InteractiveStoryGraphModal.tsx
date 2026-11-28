import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Network,
  Play,
  RotateCcw,
  Download,
  FileCode,
  Share2,
  Sliders,
  CheckCircle2,
  Sparkles,
  GitFork,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogueLine {
  speaker: string;
  text: string;
  emotion?: string;
}

interface Choice {
  id: string;
  text: string;
  targetNodeId: string;
  condition?: { var: string; op: string; value: any };
  effects?: Array<{ var: string; op: string; value: any }>;
}

interface StoryNode {
  id: string;
  title: string;
  type: "start" | "normal" | "branch" | "merge" | "ending" | "explore";
  sceneDesc: string;
  dialogue: DialogueLine[];
  choices: Choice[];
  position?: { x: number; y: number };
}

interface StoryGraph {
  projectId: string;
  title: string;
  variables: Array<{ name: string; type: string; default: any; desc: string }>;
  endings: Array<{ id: string; nodeId: string; title: string; type: string; description: string }>;
  nodes: StoryNode[];
}

export interface InteractiveStoryGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
}

export const InteractiveStoryGraphModal: React.FC<InteractiveStoryGraphModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
}) => {
  const [graph, setGraph] = useState<StoryGraph | null>(null);
  const [activeTab, setActiveTab] = useState<"graph" | "player">("graph");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("node-start");
  const [playerCurrentNodeId, setPlayerCurrentNodeId] = useState<string>("node-start");
  const [playerVars, setPlayerVars] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/projects/${encodeURIComponent(projectId)}/story-graph`);
      const json = await res.json();
      if (json.success && json.data) {
        setGraph(json.data);
        const startId = json.data.nodes?.find((n: StoryNode) => n.type === "start")?.id || json.data.nodes?.[0]?.id || "node-start";
        setSelectedNodeId(startId);
        setPlayerCurrentNodeId(startId);
        const initialVars: Record<string, any> = {};
        json.data.variables?.forEach((v: any) => {
          initialVars[v.name] = v.default;
        });
        setPlayerVars(initialVars);
      }
    } catch {
      // offline fallback handled by API server
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchGraph();
    }
  }, [isOpen, projectId]);

  const handleMakeChoice = (choice: Choice) => {
    // Apply variable effects
    if (choice.effects && Array.isArray(choice.effects)) {
      setPlayerVars((prev) => {
        const next = { ...prev };
        choice.effects!.forEach((e) => {
          if (e.op === "add") next[e.var] = (next[e.var] || 0) + Number(e.value);
          else if (e.op === "sub") next[e.var] = (next[e.var] || 0) - Number(e.value);
          else next[e.var] = e.value;
        });
        return next;
      });
    }
    setPlayerCurrentNodeId(choice.targetNodeId);
  };

  const handleRestartPlayer = () => {
    const startId = graph?.nodes?.find((n) => n.type === "start")?.id || graph?.nodes?.[0]?.id || "node-start";
    setPlayerCurrentNodeId(startId);
    const initialVars: Record<string, any> = {};
    graph?.variables?.forEach((v) => {
      initialVars[v.name] = v.default;
    });
    setPlayerVars(initialVars);
  };

  const handleExportInk = () => {
    window.open(`http://localhost:8080/api/v1/projects/${encodeURIComponent(projectId)}/story-graph/export/ink`, "_blank");
  };

  const handleExportHtml = () => {
    window.open(`http://localhost:8080/api/v1/projects/${encodeURIComponent(projectId)}/story-graph/export/html`, "_blank");
  };

  if (!isOpen) return null;

  const selectedNode = graph?.nodes?.find((n) => n.id === selectedNodeId) || graph?.nodes?.[0];
  const playerNode = graph?.nodes?.find((n) => n.id === playerCurrentNodeId) || graph?.nodes?.[0];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-slate-950 border-slate-800 text-slate-100">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-lg font-bold tracking-tight text-white">
                  Interactive Story Graph & Gamebook Studio
                </DialogTitle>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/40">
                  Feature #2 • DAG Branching Engine
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700/40">
                  Inkle .ink + HTML Game
                </span>
              </div>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Design multi-ending branching visual novels, roleplay choice trees, and interactive gamebooks with condition/effect logic.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-900 border border-slate-800 p-0.5 rounded-xl flex items-center">
              <button
                onClick={() => setActiveTab("graph")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors",
                  activeTab === "graph" ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:text-white"
                )}
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>DAG Map</span>
              </button>
              <button
                onClick={() => setActiveTab("player")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors",
                  activeTab === "player" ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40" : "text-slate-400 hover:text-white"
                )}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Playtest Game</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Visual DAG Map View */}
        {activeTab === "graph" && (
          <div className="flex-1 flex overflow-hidden bg-slate-900/30">
            {/* Left Node List & Flow Overview */}
            <div className="w-72 border-r border-slate-800 p-3 space-y-2 overflow-y-auto bg-slate-950/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                Story Nodes ({graph?.nodes?.length || 0})
              </span>
              <div className="space-y-1.5">
                {graph?.nodes?.map((node) => {
                  const isSelected = node.id === selectedNodeId;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={cn(
                        "w-full text-left p-2.5 rounded-xl border text-xs transition-all flex flex-col gap-1",
                        isSelected
                          ? "bg-cyan-950/40 border-cyan-500/60 text-cyan-200 ring-1 ring-cyan-500/30"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold truncate">{node.title || node.id}</span>
                        <span className={cn(
                          "text-[9px] font-mono uppercase px-1.5 py-0.2 rounded",
                          node.type === "start" && "bg-blue-900 text-blue-300",
                          node.type === "branch" && "bg-purple-900 text-purple-300",
                          node.type === "ending" && "bg-emerald-900 text-emerald-300"
                        )}>
                          {node.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 truncate">
                        {node.choices?.length || 0} choice branches
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* State Variables Deck */}
              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1 mb-1.5">
                  Tracked World Variables
                </span>
                <div className="space-y-1">
                  {graph?.variables?.map((v) => (
                    <div key={v.name} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] flex items-center justify-between">
                      <code className="text-cyan-400">{v.name}</code>
                      <span className="text-slate-400 font-mono">def: {String(v.default)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Node Inspector */}
            {selectedNode && (
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{selectedNode.title}</span>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                        {selectedNode.id}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Type: <span className="uppercase font-semibold text-slate-300">{selectedNode.type}</span>
                    </p>
                  </div>
                </div>

                {/* Scene Description */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Scene Narrative Description:
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {selectedNode.sceneDesc}
                  </p>
                </div>

                {/* Character Dialogue Lines */}
                {selectedNode.dialogue?.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block">
                      Character Dialogue Lines (Voice AI Directable):
                    </span>
                    <div className="space-y-2">
                      {selectedNode.dialogue.map((d, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-purple-300">{d.speaker}</span>
                            {d.emotion && (
                              <span className="text-[10px] font-mono text-slate-400 italic">[{d.emotion}]</span>
                            )}
                          </div>
                          <p className="text-slate-200">&ldquo;{d.text}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Choice Branches */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                    Outgoing Choice Branches ({selectedNode.choices?.length || 0}):
                  </span>
                  {selectedNode.choices?.length === 0 ? (
                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-xs text-emerald-300 font-semibold">
                      [TERMINAL ENDING NODE] Narrative branch completes here.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedNode.choices?.map((c, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white flex items-center gap-1.5">
                              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                              {c.text}
                            </span>
                            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/40">
                              ➔ {c.targetNodeId}
                            </span>
                          </div>
                          {c.effects && c.effects.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap pt-1">
                              {c.effects.map((e, eIdx) => (
                                <span key={eIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                                  ~ {e.var} {e.op === "add" ? "+=" : e.op === "sub" ? "-=" : "="} {String(e.value)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Interactive Playtest Game Simulator */}
        {activeTab === "player" && playerNode && (
          <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-900/40">
            {/* Live Gamebook HUD */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Play className="w-3.5 h-3.5" />
                  Live Playtest Simulator
                </span>
                <div className="flex items-center gap-3">
                  {Object.entries(playerVars).map(([key, val]) => (
                    <span key={key} className="text-xs font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      <strong className="text-cyan-400">{key}:</strong> {String(val)}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={handleRestartPlayer}
                className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 hover:bg-slate-800 px-2.5 py-1 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
            </div>

            {/* Scene Presentation Card */}
            <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800/80 space-y-4 shadow-xl max-w-3xl mx-auto">
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
                {playerNode.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {playerNode.sceneDesc}
              </p>

              {/* Spoken Dialogue */}
              {playerNode.dialogue?.map((d, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border-l-4 border-purple-500 space-y-1">
                  <span className="text-xs font-bold text-purple-400">{d.speaker}</span>
                  <p className="text-xs text-slate-200">&ldquo;{d.text}&rdquo;</p>
                </div>
              ))}

              {/* Interactive Player Choices */}
              <div className="space-y-2.5 pt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Choose Your Next Action:
                </span>
                {playerNode.type === "ending" || !playerNode.choices || playerNode.choices.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-600/40 text-center space-y-2">
                    <span className="text-sm font-bold text-emerald-300 block">
                      🎉 Narrative Ending Reached
                    </span>
                    <p className="text-xs text-slate-400">
                      You have reached a canonical terminal finale in this interactive branch.
                    </p>
                    <Button
                      size="sm"
                      onClick={handleRestartPlayer}
                      className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                    >
                      Play Again
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {playerNode.choices.map((c, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleMakeChoice(c)}
                        className="w-full text-left p-3.5 rounded-xl bg-gradient-to-r from-purple-950/40 to-slate-900 hover:from-purple-900/50 hover:to-slate-850 border border-purple-800/30 hover:border-purple-500/60 text-xs font-medium text-slate-100 flex items-center justify-between group transition-all"
                      >
                        <span>{c.text}</span>
                        <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer with Exports */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportInk}
              className="h-8 px-3 text-xs font-semibold text-purple-300 border-purple-800/60 hover:bg-purple-950/40 gap-1.5 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Export Inkle (.ink)</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportHtml}
              className="h-8 px-3 text-xs font-semibold text-emerald-300 border-emerald-800/60 hover:bg-emerald-950/40 gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export HTML Game Bundle</span>
            </Button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="h-8 px-4 text-xs font-semibold text-slate-300 border-slate-700 hover:bg-slate-800 cursor-pointer"
          >
            Close
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
};
export default InteractiveStoryGraphModal;
