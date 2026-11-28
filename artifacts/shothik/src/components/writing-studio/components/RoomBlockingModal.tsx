import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import {
  Grid,
  Eye,
  EyeOff,
  Maximize2,
  Sparkles,
  AlertTriangle,
  RotateCw,
  Users,
  Compass,
  Check,
  ShieldAlert,
  ArrowRight
} from "lucide-react";

export interface Point2D {
  x: number;
  y: number;
}

export interface Obstacle {
  id: string;
  name: string;
  type: "wall" | "door" | "window" | "furniture_opaque" | "screen_translucent";
  p1: Point2D;
  p2: Point2D;
  heightMeters: number;
  blocksLineOfSight: boolean;
  acousticAttenuationDb: number;
}

export interface CharacterToken {
  id: string;
  name: string;
  position: Point2D;
  facingAngleDeg: number;
  fovConeDeg: number;
  elevation: "standing" | "seated" | "crouched";
  color: string;
}

export interface LineOfSightCalculation {
  sourceCharId: string;
  sourceCharName: string;
  targetCharId: string;
  targetCharName: string;
  distanceMeters: number;
  inFieldOfView: boolean;
  hasClearLineOfSight: boolean;
  blockingObstacleId?: string;
  blockingObstacleName?: string;
  acousticAudibilityScore: number;
}

export interface RoomLayout {
  projectId: string;
  roomName: string;
  widthMeters: number;
  lengthMeters: number;
  obstacles: Obstacle[];
  characters: CharacterToken[];
  updatedAt: string;
}

interface RoomBlockingModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  currentManuscriptText?: string;
}

export const RoomBlockingModal: React.FC<RoomBlockingModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  currentManuscriptText = "",
}) => {
  const [layout, setLayout] = useState<RoomLayout | null>(null);
  const [sightlines, setSightlines] = useState<LineOfSightCalculation[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("char_himu");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [inconsistencies, setInconsistencies] = useState<any[]>([]);
  const [stagingScore, setStagingScore] = useState<number>(90);

  // Load layout and sightlines
  const loadRoomBlocking = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/room-blocking`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setLayout(json.data.layout);
          setSightlines(json.data.sightlines || []);
        }
      }
    } catch (err) {
      console.warn("[RoomBlocking] Load failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRoomBlocking();
    }
  }, [isOpen, projectId]);

  // Handle Character Movement on Floorplan Canvas
  const handleMoveCharacter = async (charId: string, newPos: Point2D) => {
    if (!layout) return;
    const updatedChars = layout.characters.map((c) =>
      c.id === charId ? { ...c, position: newPos } : c
    );

    setLayout({ ...layout, characters: updatedChars });

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/room-blocking/update-layout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characters: updatedChars }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.sightlines) {
          setSightlines(json.data.sightlines);
        }
      }
    } catch (err) {
      console.error("[RoomBlocking] Move failed", err);
    }
  };

  // Rotate Character Facing Direction
  const handleRotateCharacter = async (charId: string) => {
    if (!layout) return;
    const target = layout.characters.find((c) => c.id === charId);
    if (!target) return;

    const newAngle = (target.facingAngleDeg + 45) % 360;
    const updatedChars = layout.characters.map((c) =>
      c.id === charId ? { ...c, facingAngleDeg: newAngle } : c
    );

    setLayout({ ...layout, characters: updatedChars });

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/room-blocking/update-layout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characters: updatedChars }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.sightlines) {
          setSightlines(json.data.sightlines);
        }
      }
    } catch (err) {
      console.error("[RoomBlocking] Rotate failed", err);
    }
  };

  // Audit Manuscript Scene for Staging Bugs
  const handleAuditProse = async () => {
    setIsAuditing(true);
    const prose =
      currentManuscriptText ||
      "হিমু ঘরে ঢুকেই সোজা বাদলের চোখে পড়ল হিমু। বাদল ফিসফিস করে কথা বলতে লাগল।";

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/room-blocking/audit-scene`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneProse: prose }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setInconsistencies(json.data.inconsistencies || []);
          setStagingScore(json.data.stagingHealthScore || 85);
        }
      }
    } catch (err) {
      console.error("[RoomBlocking] Audit failed", err);
    } finally {
      setIsAuditing(false);
    }
  };

  // Convert meters to SVG coordinates
  // Canvas: 480px width, 384px height (scale = 48px / meter for 10m x 8m room)
  const scale = 46;
  const offsetX = 20;
  const offsetY = 20;

  const toSvgX = (m: number) => offsetX + m * scale;
  const toSvgY = (m: number) => offsetY + m * scale;

  const selectedChar = layout?.characters.find((c) => c.id === selectedCharacterId);
  const activeSightlines = sightlines.filter((s) => s.sourceCharId === selectedCharacterId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[88vh] flex flex-col p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/80 shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xs">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>3D Spatial Room Blocking & Line-of-Sight Canvas</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-normal">
                  Raycast Line-of-Sight
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Interactive floor plan tracking character positions, room obstacles, and sightlines to prevent physical staging bugs.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAuditProse}
              disabled={isAuditing}
              className="h-8 text-xs font-semibold gap-1.5 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAuditing ? "Auditing Room..." : "Audit Staging Consistency"}</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Room Info Bar & Staging Score */}
        <div className="px-6 py-2.5 bg-muted/30 border-b border-border/40 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">{layout?.roomName || "Drawing Room"}</span>
            <span className="text-[11px] text-muted-foreground font-mono">
              ({layout?.widthMeters}m × {layout?.lengthMeters}m)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground">Staging Integrity:</span>
            <span
              className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full border ${
                stagingScore >= 80
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-400 border-amber-500/30"
              }`}
            >
              {stagingScore}% Consistency
            </span>
          </div>
        </div>

        {/* Main Grid Floorplan & Sightlines Section */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-5 custom-scrollbar">
          {/* Left Column: 2D Interactive Floorplan Canvas (8 Cols) */}
          <div className="md:col-span-8 flex flex-col items-center justify-center p-3 rounded-2xl border border-border/80 bg-neutral-950/80 shadow-inner">
            <svg
              width="480"
              height="390"
              className="w-full h-auto max-h-[380px] select-none rounded-xl bg-neutral-900/60 border border-neutral-800"
            >
              {/* Background Grid Pattern */}
              <defs>
                <pattern id="grid" width="23" height="23" patternUnits="userSpaceOnUse">
                  <path d="M 23 0 L 0 0 0 23" fill="none" stroke="#262626" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Room Perimeter Walls */}
              {layout && (
                <rect
                  x={toSvgX(0)}
                  y={toSvgY(0)}
                  width={layout.widthMeters * scale}
                  height={layout.lengthMeters * scale}
                  fill="none"
                  stroke="#525252"
                  strokeWidth="3"
                  strokeDasharray="4 2"
                />
              )}

              {/* Obstacles (Walls, Bookshelves, Doors) */}
              {layout?.obstacles.map((obs) => {
                const isDoor = obs.type === "door";
                const isFurniture = obs.type === "furniture_opaque";

                return (
                  <g key={obs.id}>
                    <line
                      x1={toSvgX(obs.p1.x)}
                      y1={toSvgY(obs.p1.y)}
                      x2={toSvgX(obs.p2.x)}
                      y2={toSvgY(obs.p2.y)}
                      stroke={isDoor ? "#38bdf8" : isFurniture ? "#d97706" : "#e5e5e5"}
                      strokeWidth={isFurniture ? "8" : "5"}
                      strokeLinecap="round"
                    />
                    <text
                      x={(toSvgX(obs.p1.x) + toSvgX(obs.p2.x)) / 2 + 6}
                      y={(toSvgY(obs.p1.y) + toSvgY(obs.p2.y)) / 2 - 6}
                      fill="#a3a3a3"
                      fontSize="9"
                      fontFamily="sans-serif"
                    >
                      {obs.name.split(" ")[0]}
                    </text>
                  </g>
                );
              })}

              {/* Line of Sight Raycasts from Selected Character */}
              {selectedChar &&
                activeSightlines.map((sight) => {
                  const target = layout?.characters.find((c) => c.id === sight.targetCharId);
                  if (!target) return null;

                  const isClear = sight.hasClearLineOfSight;

                  return (
                    <g key={sight.targetCharId}>
                      <line
                        x1={toSvgX(selectedChar.position.x)}
                        y1={toSvgY(selectedChar.position.y)}
                        x2={toSvgX(target.position.x)}
                        y2={toSvgY(target.position.y)}
                        stroke={isClear ? "#10b981" : "#ef4444"}
                        strokeWidth={isClear ? "2" : "1.5"}
                        strokeDasharray={isClear ? "none" : "4 3"}
                        opacity="0.8"
                      />
                      {/* Midpoint Distance Tag */}
                      <rect
                        x={(toSvgX(selectedChar.position.x) + toSvgX(target.position.x)) / 2 - 14}
                        y={(toSvgY(selectedChar.position.y) + toSvgY(target.position.y)) / 2 - 8}
                        width="28"
                        height="14"
                        rx="3"
                        fill="#000000"
                        opacity="0.75"
                      />
                      <text
                        x={(toSvgX(selectedChar.position.x) + toSvgX(target.position.x)) / 2}
                        y={(toSvgY(selectedChar.position.y) + toSvgY(target.position.y)) / 2 + 2}
                        fill={isClear ? "#34d399" : "#f87171"}
                        fontSize="8"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {sight.distanceMeters}m
                      </text>
                    </g>
                  );
                })}

              {/* Character Tokens */}
              {layout?.characters.map((char) => {
                const isSelected = selectedCharacterId === char.id;
                const rad = (char.facingAngleDeg * Math.PI) / 180;
                const arrowLength = 18;
                const arrowX = toSvgX(char.position.x) + Math.sin(rad) * arrowLength;
                const arrowY = toSvgY(char.position.y) - Math.cos(rad) * arrowLength;

                return (
                  <g
                    key={char.id}
                    onClick={() => setSelectedCharacterId(char.id)}
                    className="cursor-pointer"
                  >
                    {/* Vision Cone (FOV 120°) */}
                    {isSelected && (
                      <path
                        d={`M ${toSvgX(char.position.x)} ${toSvgY(char.position.y)} L ${
                          toSvgX(char.position.x) + Math.sin(rad - 0.7) * 70
                        } ${toSvgY(char.position.y) - Math.cos(rad - 0.7) * 70} A 70 70 0 0 1 ${
                          toSvgX(char.position.x) + Math.sin(rad + 0.7) * 70
                        } ${toSvgY(char.position.y) - Math.cos(rad + 0.7) * 70} Z`}
                        fill={char.color}
                        opacity="0.15"
                      />
                    )}

                    {/* Character Circle */}
                    <circle
                      cx={toSvgX(char.position.x)}
                      cy={toSvgY(char.position.y)}
                      r={isSelected ? "14" : "11"}
                      fill={char.color}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? "2.5" : "1.5"}
                      className="transition-all"
                    />

                    {/* Directional Pointer Arrow */}
                    <line
                      x1={toSvgX(char.position.x)}
                      y1={toSvgY(char.position.y)}
                      x2={arrowX}
                      y2={arrowY}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Character Name Tag */}
                    <text
                      x={toSvgX(char.position.x)}
                      y={toSvgY(char.position.y) + 24}
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      {char.name.split(" ")[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Quick Movement Controls for Selected Character */}
            {selectedChar && (
              <div className="w-full mt-3 flex items-center justify-between text-xs text-muted-foreground px-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">Selected: {selectedChar.name}</span>
                  <span className="font-mono text-[10px]">
                    ({selectedChar.position.x}m, {selectedChar.position.y}m) • {selectedChar.facingAngleDeg}° Facing
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRotateCharacter(selectedChar.id)}
                    className="h-6 px-2 text-[10px] font-semibold gap-1 border-border"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Rotate 45°</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleMoveCharacter(selectedChar.id, {
                        x: Math.max(1, selectedChar.position.x - 1),
                        y: selectedChar.position.y,
                      })
                    }
                    className="h-6 px-1.5 text-[10px] border-border"
                  >
                    ←
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleMoveCharacter(selectedChar.id, {
                        x: Math.min(layout?.widthMeters || 10, selectedChar.position.x + 1),
                        y: selectedChar.position.y,
                      })
                    }
                    className="h-6 px-1.5 text-[10px] border-border"
                  >
                    →
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sightlines & Staging Inconsistencies (4 Cols) */}
          <div className="md:col-span-4 space-y-4">
            {/* Sightlines Table */}
            <div className="p-3.5 rounded-xl border border-border/80 bg-card space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Raycast Visibility for {selectedChar?.name.split(" ")[0]}</span>
              </span>

              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                {activeSightlines.map((sight) => (
                  <div
                    key={sight.targetCharId}
                    className="p-2 rounded-lg border border-border/60 bg-muted/20 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-foreground">{sight.targetCharName.split(" ")[0]}</span>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {sight.distanceMeters}m • {sight.inFieldOfView ? "In FOV" : "Blind Spot"}
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      {sight.hasClearLineOfSight ? (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Visible
                        </span>
                      ) : (
                        <span
                          className="text-[10px] text-rose-400 font-bold flex items-center gap-1"
                          title={sight.blockingObstacleName}
                        >
                          <EyeOff className="w-3 h-3" /> Obstructed
                        </span>
                      )}
                      <span className="text-[9px] text-muted-foreground font-mono">
                        Audibility: {Math.round(sight.acousticAudibilityScore * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inconsistencies / Staging Bugs Drawer */}
            <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Staging Bugs Detected ({inconsistencies.length})</span>
                </span>
              </div>

              {inconsistencies.length === 0 ? (
                <div className="p-4 text-center">
                  <Check className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Physical staging is consistent! No occluded lines-of-sight in this scene.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {inconsistencies.map((inc, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-rose-500/40 bg-background/80 text-[11px] space-y-1"
                    >
                      <div className="font-bold text-rose-300">{inc.claim}</div>
                      <p className="text-muted-foreground leading-normal">{inc.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>2D/3D Raycast Blocking & FOV Matrix Active</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px]">3 Characters • 3 Obstacles</span>
            <Button size="sm" variant="outline" onClick={onClose} className="h-7 text-xs px-3">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomBlockingModal;
