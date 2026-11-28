import React, { useState, useEffect } from "react";
import {
  Activity,
  Heart,
  TrendingUp,
  AlertCircle,
  Zap,
  Sparkles,
  RefreshCw,
  X,
  Play,
  Layers,
  ChevronRight,
  ShieldAlert,
  Sliders,
  CheckCircle2
} from "lucide-react";

interface TensionBeatPoint {
  beatIndex: number;
  chapterNumber: number;
  label: string;
  tensionLevel: number;
  heartRateBpm: number;
  conflictVelocity: number;
  emotionalState: "dread" | "hope" | "shock" | "curiosity" | "catharsis" | "paranoia";
  snippet: string;
}

interface TensionFlatlineWarning {
  chapterNumber: number;
  startWord: number;
  endWord: number;
  lengthWords: number;
  reason: string;
  suggestedComplication: string;
}

interface TensionEkgData {
  projectId: string;
  currentHeartRateBpm: number;
  overallPacingHealthScore: number;
  selectedArcModel: "three_act" | "fichtean" | "kishotenketsu";
  idealArcCurve: number[];
  actualTensionCurve: number[];
  beatPoints: TensionBeatPoint[];
  flatlineWarnings: TensionFlatlineWarning[];
  recommendations: string[];
}

interface TensionEkgModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  projectTitle?: string;
  currentManuscriptText?: string;
}

export const TensionEkgModal: React.FC<TensionEkgModalProps> = ({
  isOpen,
  onClose,
  projectId = "proj_demo_bengali",
  projectTitle = "The Silent Witness",
  currentManuscriptText = ""
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<TensionEkgData | null>(null);
  const [selectedArc, setSelectedArc] = useState<"three_act" | "fichtean" | "kishotenketsu">("three_act");
  const [selectedBeatIndex, setSelectedBeatIndex] = useState<number>(3); // default to climax beat
  const [injectedFixes, setInjectedFixes] = useState<number[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    loadEkgData();
  }, [isOpen, projectId]);

  const loadEkgData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://127.0.0.1:8080/api/v1/projects/${projectId}/tension-ekg`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          setSelectedArc(json.data.selectedArcModel || "three_act");
        }
      }
    } catch (e) {
      console.warn("Failed to load tension EKG data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleArcChange = async (arc: "three_act" | "fichtean" | "kishotenketsu") => {
    setSelectedArc(arc);
    try {
      const res = await fetch(`http://127.0.0.1:8080/api/v1/projects/${projectId}/tension-ekg/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manuscriptText: currentManuscriptText,
          arcModel: arc
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      }
    } catch (e) {
      console.error("Arc update failed", e);
    }
  };

  const handleInjectFix = (chapterNum: number) => {
    setInjectedFixes((prev) => [...prev, chapterNum]);
  };

  if (!isOpen) return null;

  const currentBeat = data?.beatPoints.find((b) => b.beatIndex === selectedBeatIndex) || data?.beatPoints[0];

  // SVG dimensions for the EKG canvas
  const svgWidth = 720;
  const svgHeight = 220;
  const paddingX = 50;
  const paddingY = 30;

  // Generate SVG path points
  const points = data?.actualTensionCurve || [45, 73, 45, 100, 58];
  const idealPoints = data?.idealArcCurve || [35, 55, 68, 95, 48];

  const getSvgCoordinates = (pts: number[]) => {
    return pts.map((val, idx) => {
      const x = paddingX + (idx / (pts.length - 1)) * (svgWidth - 2 * paddingX);
      const y = svgHeight - paddingY - (val / 100) * (svgHeight - 2 * paddingY);
      return { x, y, val };
    });
  };

  const actualCoords = getSvgCoordinates(points);
  const idealCoords = getSvgCoordinates(idealPoints);

  const actualPathString = actualCoords.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  const idealPathString = idealCoords.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans text-slate-100">
      <div className="relative flex flex-col w-full max-w-5xl h-[88vh] bg-slate-950 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Narrative Tension Heartbeat & Pacing Velocity EKG
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500 animate-ping" />
                  <span>{data?.currentHeartRateBpm || 124} BPM</span>
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                  {data?.overallPacingHealthScore || 89}/100 Pacing Health
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time emotional tension and conflict velocity curve graphing narrative momentum across all chapters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadEkgData}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Recalculate EKG"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Arc Model Toolbar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-900/50 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Narrative Arc Model:</span>
            <div className="flex gap-1.5">
              {(["three_act", "fichtean", "kishotenketsu"] as const).map((arc) => (
                <button
                  key={arc}
                  onClick={() => handleArcChange(arc)}
                  className={`px-3 py-1 rounded-md font-medium transition ${
                    selectedArc === arc
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {arc === "three_act"
                    ? "Classical 3-Act"
                    : arc === "fichtean"
                    ? "Fichtean Crisis Waves"
                    : "Kishōtenketsu Twist"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block shadow-[0_0_8px_#10b981]" />
              <span>Manuscript Tension</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-cyan-400 inline-block" />
              <span>Ideal Arc Baseline</span>
            </div>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-950">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-sm font-mono">Sampling emotional valence & conflict velocity spikes...</p>
            </div>
          ) : (
            <>
              {/* EKG Oscilloscope Waveform Canvas */}
              <div className="relative bg-black rounded-xl p-4 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] overflow-hidden">
                {/* Oscilloscope Grid Background */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)`,
                    backgroundSize: "30px 30px"
                  }}
                />

                <div className="relative flex items-center justify-between mb-2 px-2 text-xs font-mono text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    LIVE NARRATIVE EKG • MONITORING CHAPTERS 1-3
                  </span>
                  <span>100% MAXIMUM TENSION PEAK</span>
                </div>

                <div className="w-full overflow-x-auto flex justify-center">
                  <svg width={svgWidth} height={svgHeight} className="overflow-visible">
                    {/* Horizontal Reference Lines */}
                    <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
                    <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
                    <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />

                    {/* Ideal Arc Curve (Cyan Dashed) */}
                    <path
                      d={idealPathString}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      strokeDasharray="5 5"
                      opacity="0.6"
                    />

                    {/* Actual Tension Waveform (Glow Green) */}
                    <path
                      d={actualPathString}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      className="filter drop-shadow-[0_0_6px_#10b981]"
                    />

                    {/* Interactive Beat Points */}
                    {actualCoords.map((pt, idx) => {
                      const beat = data?.beatPoints[idx];
                      const isSelected = beat?.beatIndex === selectedBeatIndex;
                      return (
                        <g key={idx} onClick={() => beat && setSelectedBeatIndex(beat.beatIndex)} className="cursor-pointer group">
                          {/* Pulsing ring for selected beat */}
                          {isSelected && (
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="12"
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="1.5"
                              className="animate-ping"
                            />
                          )}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isSelected ? "7" : "5"}
                            fill={isSelected ? "#10b981" : "#022c22"}
                            stroke="#10b981"
                            strokeWidth="2.5"
                            className="transition-transform group-hover:scale-125"
                          />
                          <text
                            x={pt.x}
                            y={pt.y - 12}
                            textAnchor="middle"
                            fill={isSelected ? "#34d399" : "#94a3b8"}
                            fontSize="11"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {pt.val}%
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Beat Detail Inspector Drawer */}
              {currentBeat && (
                <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                        BEAT {currentBeat.beatIndex} • CH. {currentBeat.chapterNumber}
                      </span>
                      <h4 className="text-sm font-bold text-white">{currentBeat.label}</h4>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 rounded border border-rose-500/30 font-bold uppercase">
                        {currentBeat.emotionalState}
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {currentBeat.heartRateBpm} BPM
                      </span>
                      <span className="font-mono text-amber-400 font-bold">
                        Velocity: {currentBeat.conflictVelocity}/10
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-serif italic bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    "{currentBeat.snippet}"
                  </p>
                </div>
              )}

              {/* Flatline Warnings */}
              {data?.flatlineWarnings && data.flatlineWarnings.length > 0 && (
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Narrative Flatline Detected (Low Stakes Escalation)</span>
                  </div>

                  {data.flatlineWarnings.map((w, idx) => {
                    const isFixed = injectedFixes.includes(w.chapterNumber);
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <p className="text-slate-300">{w.reason}</p>
                          <p className="text-slate-400">
                            💡 <strong className="text-amber-300">Suggested Complication:</strong> {w.suggestedComplication}
                          </p>
                        </div>
                        <button
                          onClick={() => handleInjectFix(w.chapterNumber)}
                          disabled={isFixed}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 flex items-center gap-1.5 ${
                            isFixed
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40"
                          }`}
                        >
                          {isFixed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                          <span>{isFixed ? "Complication Injected" : "Inject Complication Beat"}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Editorial Pacing Recommendations */}
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Editorial Velocity Guidance:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {data?.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            <span>Peak Tension: <strong className="text-emerald-400">100%</strong></span>
            <span>Climax BPM: <strong className="text-rose-400">150 BPM</strong></span>
            <span>Resolution: <strong className="text-cyan-400">58% Catharsis</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-sans font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
