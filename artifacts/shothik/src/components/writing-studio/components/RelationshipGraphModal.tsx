import React, { useState, useEffect } from "react";
import {
  Network,
  Users,
  Shield,
  Heart,
  Flame,
  Key,
  ChevronRight,
  RefreshCw,
  X,
  History,
  Info,
  Sparkles,
  Zap,
  ArrowRightLeft
} from "lucide-react";

interface CharacterNode {
  id: string;
  name: string;
  role: "protagonist" | "deuteragonist" | "antagonist" | "mentor" | "catalyst";
  faction: string;
  color: string;
  centralityScore: number;
  influenceRadius: number;
  secretLore?: string;
}

interface RelationshipEdge {
  id: string;
  sourceCharId: string;
  targetCharId: string;
  trustScore: number;
  rivalryScore: number;
  affinityScore: number;
  leverageScore: number;
  status: "stable" | "evolving" | "ruptured" | "reconciled";
  narrativeContext: string;
  lastChangedInChapter: number;
}

interface RelationshipTimelineSnapshot {
  chapterNumber: number;
  chapterTitle: string;
  majorShiftEvent: string;
  edgeDeltas: Array<{
    sourceCharId: string;
    targetCharId: string;
    deltaTrust: number;
    deltaRivalry: number;
  }>;
}

interface RelationshipGraphData {
  projectId: string;
  nodes: CharacterNode[];
  edges: RelationshipEdge[];
  snapshots: RelationshipTimelineSnapshot[];
  statistics: {
    totalCharacters: number;
    activeTensions: number;
    highestRivalryPair: string;
    highestTrustPair: string;
  };
}

interface RelationshipGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  projectTitle?: string;
  currentManuscriptText?: string;
}

export const RelationshipGraphModal: React.FC<RelationshipGraphModalProps> = ({
  isOpen,
  onClose,
  projectId = "proj_demo_bengali",
  projectTitle = "The Silent Witness",
  currentManuscriptText = ""
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<RelationshipGraphData | null>(null);
  const [selectedCharId, setSelectedCharId] = useState<string>("char_himu");
  const [activeChapter, setActiveChapter] = useState<number>(3); // current chapter

  useEffect(() => {
    if (!isOpen) return;
    loadGraphData();
  }, [isOpen, projectId]);

  const loadGraphData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://127.0.0.1:8080/api/v1/projects/${projectId}/relationship-graph`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      }
    } catch (e) {
      console.warn("Failed to load relationship graph data", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedNode = data?.nodes.find((n) => n.id === selectedCharId) || data?.nodes[0];
  const activeSnapshot = data?.snapshots.find((s) => s.chapterNumber === activeChapter);

  // Filter edges connected to selected character or show all
  const connectedEdges = data?.edges.filter(
    (e) => e.sourceCharId === selectedCharId || e.targetCharId === selectedCharId
  ) || [];

  // Canvas geometry for SVG nodes (circular layout)
  const svgWidth = 520;
  const svgHeight = 440;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;
  const orbitRadius = 155;

  const nodePositions: Record<string, { x: number; y: number }> = {};
  if (data?.nodes) {
    // Put Himu at center, others around
    data.nodes.forEach((node, idx) => {
      if (node.id === "char_himu") {
        nodePositions[node.id] = { x: centerX, y: centerY };
      } else {
        const others = data.nodes.filter((n) => n.id !== "char_himu");
        const otherIdx = others.findIndex((n) => n.id === node.id);
        const angle = (otherIdx / others.length) * 2 * Math.PI - Math.PI / 2;
        nodePositions[node.id] = {
          x: centerX + orbitRadius * Math.cos(angle),
          y: centerY + orbitRadius * Math.sin(angle)
        };
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans text-slate-100">
      <div className="relative flex flex-col w-full max-w-5xl h-[88vh] bg-slate-950 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Dynamic Character Relationship & Social Topology Graph
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                  {data?.nodes.length || 5} Characters • {data?.edges.length || 6} Social Vectors
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                  {data?.statistics.activeTensions || 4} High Tensions
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactive network graph tracking real-time trust, rivalry, romantic interest, and betrayal vectors across narrative chapters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadGraphData}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Refresh Graph"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Timeline Chapter Scrub Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-900/60 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-300">Timeline Snapshots:</span>
            <div className="flex gap-1.5 ml-2">
              {[1, 2, 3].map((chap) => (
                <button
                  key={chap}
                  onClick={() => setActiveChapter(chap)}
                  className={`px-3 py-1 rounded-md font-medium transition ${
                    activeChapter === chap
                      ? "bg-indigo-500/30 text-indigo-200 border border-indigo-500/50 shadow"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  Chapter {chap}
                </button>
              ))}
            </div>
          </div>

          {activeSnapshot && (
            <div className="text-xs text-slate-300 truncate max-w-md hidden sm:block">
              <strong className="text-amber-400">Ch. {activeSnapshot.chapterNumber} Event:</strong>{" "}
              {activeSnapshot.majorShiftEvent}
            </div>
          )}
        </div>

        {/* Content Body: Left SVG Network, Right Character Inspector */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Canvas Panel */}
          <div className="flex-1 bg-black/60 relative p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800">
            {loading ? (
              <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
                <p className="text-xs font-mono">Computing topological centrality & social vectors...</p>
              </div>
            ) : (
              <>
                <svg width={svgWidth} height={svgHeight} className="overflow-visible select-none">
                  {/* Subtle Grid / Orbital Circles */}
                  <circle cx={centerX} cy={centerY} r={orbitRadius} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                  <circle cx={centerX} cy={centerY} r={orbitRadius * 0.6} fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.2" />

                  {/* Edges / Relationship Vectors */}
                  {data?.edges.map((edge) => {
                    const p1 = nodePositions[edge.sourceCharId];
                    const p2 = nodePositions[edge.targetCharId];
                    if (!p1 || !p2) return null;

                    const isHighlight =
                      edge.sourceCharId === selectedCharId || edge.targetCharId === selectedCharId;

                    let strokeColor = "#94a3b8"; // default
                    if (edge.trustScore > 60) strokeColor = "#10b981"; // green trust
                    else if (edge.rivalryScore > 65) strokeColor = "#ef4444"; // red rivalry
                    else if (edge.leverageScore > 70) strokeColor = "#a855f7"; // purple leverage

                    const midX = (p1.x + p2.x) / 2;
                    const midY = (p1.y + p2.y) / 2;

                    return (
                      <g key={edge.id} className="transition-opacity">
                        <line
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          stroke={strokeColor}
                          strokeWidth={isHighlight ? 3.5 : 1.5}
                          strokeDasharray={edge.status === "ruptured" ? "4 4" : undefined}
                          opacity={isHighlight ? 0.9 : 0.35}
                        />
                        {/* Edge Label Pill */}
                        {isHighlight && (
                          <g transform={`translate(${midX}, ${midY})`}>
                            <rect
                              x="-22"
                              y="-9"
                              width="44"
                              height="18"
                              rx="4"
                              fill="#020617"
                              stroke={strokeColor}
                              strokeWidth="1"
                            />
                            <text
                              x="0"
                              y="3"
                              textAnchor="middle"
                              fill="#f8fafc"
                              fontSize="9"
                              fontFamily="monospace"
                              fontWeight="bold"
                            >
                              {edge.trustScore > 0 ? `+${edge.trustScore}` : `${edge.trustScore}`}%
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Character Nodes */}
                  {data?.nodes.map((node) => {
                    const pos = nodePositions[node.id];
                    if (!pos) return null;
                    const isSelected = node.id === selectedCharId;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onClick={() => setSelectedCharId(node.id)}
                        className="cursor-pointer group"
                      >
                        {/* Glow halo */}
                        <circle
                          r={node.influenceRadius + (isSelected ? 8 : 4)}
                          fill={node.color}
                          opacity={isSelected ? 0.35 : 0.15}
                          className="transition-all group-hover:opacity-40"
                        />
                        {/* Main Node Body */}
                        <circle
                          r={node.influenceRadius}
                          fill="#0f172a"
                          stroke={node.color}
                          strokeWidth={isSelected ? 3.5 : 2}
                          className="transition-transform group-hover:scale-105"
                        />
                        {/* Initial Letter */}
                        <text
                          textAnchor="middle"
                          dy=".3em"
                          fill={node.color}
                          fontSize="13"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {node.name.charAt(0)}
                        </text>
                        {/* Node Label Below */}
                        <text
                          y={node.influenceRadius + 15}
                          textAnchor="middle"
                          fill={isSelected ? "#ffffff" : "#94a3b8"}
                          fontSize="11"
                          fontWeight={isSelected ? "bold" : "normal"}
                          fontFamily="sans-serif"
                          className="pointer-events-none"
                        >
                          {node.name.split(" ")[0]}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Legend Overlay */}
                <div className="absolute bottom-3 left-4 flex gap-3 text-[10px] text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>High Trust (+60%)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>High Rivalry (&gt;65%)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span>Blackmail/Leverage</span>
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Right Character Details Drawer */}
          <div className="w-full md:w-96 bg-slate-950 p-5 overflow-y-auto space-y-4 border-t md:border-t-0 border-slate-800">
            {selectedNode && (
              <>
                {/* Character Profile Card */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2 py-0.5 text-[10px] font-bold uppercase rounded"
                      style={{ backgroundColor: `${selectedNode.color}25`, color: selectedNode.color }}
                    >
                      {selectedNode.role}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Centrality: <strong className="text-slate-200">{selectedNode.centralityScore}/100</strong>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{selectedNode.name}</h3>
                  <p className="text-xs text-slate-400">{selectedNode.faction}</p>

                  {/* Secret Lore Card */}
                  {selectedNode.secretLore && (
                    <div className="mt-3 p-2.5 bg-slate-950 rounded-lg border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[11px] text-indigo-400">
                        <Key className="w-3.5 h-3.5" />
                        <span>Hidden Narrative Agenda:</span>
                      </div>
                      <p className="font-serif italic text-slate-300">"{selectedNode.secretLore}"</p>
                    </div>
                  )}
                </div>

                {/* Connected Relationships List */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Active Social Vectors ({connectedEdges.length})</span>
                    <span className="text-slate-400 font-normal">Click edge to scrub</span>
                  </div>

                  <div className="space-y-2">
                    {connectedEdges.map((edge) => {
                      const otherId = edge.sourceCharId === selectedCharId ? edge.targetCharId : edge.sourceCharId;
                      const otherNode = data?.nodes.find((n) => n.id === otherId);

                      return (
                        <div
                          key={edge.id}
                          className="p-3 bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-700 transition space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200 flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block"
                                style={{ backgroundColor: otherNode?.color || "#fff" }}
                              />
                              <span>{otherNode?.name}</span>
                            </span>

                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                                edge.status === "ruptured"
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  : edge.status === "evolving"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {edge.status}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                            {edge.narrativeContext}
                          </p>

                          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60 font-mono text-[10px]">
                            <div>
                              <span className="text-slate-400 block">Trust:</span>
                              <span className={edge.trustScore >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                                {edge.trustScore > 0 ? `+${edge.trustScore}` : `${edge.trustScore}`}%
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Rivalry:</span>
                              <span className="text-rose-400 font-bold">{edge.rivalryScore}%</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Leverage:</span>
                              <span className="text-purple-400 font-bold">{edge.leverageScore}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 font-sans">
          <div className="flex items-center gap-4">
            <span>Highest Rivalry: <strong className="text-rose-400">{data?.statistics.highestRivalryPair}</strong></span>
            <span>Highest Trust: <strong className="text-emerald-400">{data?.statistics.highestTrustPair}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
