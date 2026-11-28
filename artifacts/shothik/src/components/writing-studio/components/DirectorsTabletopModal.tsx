import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Clapperboard,
  ShieldAlert,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  Search,
  Package,
  Layers,
  Send,
  FileText,
  Volume2,
  CheckCircle2,
  Flame,
  ArrowRight,
  Eye,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TabletopCharacter {
  id: string;
  name: string;
  role: string;
  agenda: string;
  mood: string;
  trustScore: number;
  inventory: string[];
}

export interface TabletopClue {
  id: string;
  name: string;
  status: "hidden" | "discovered" | "analyzed" | "compromised";
  location: string;
  significance: string;
  discoveredAtTurn?: number;
}

export interface TabletopTurn {
  turnNumber: number;
  actor: string;
  inputAction: string;
  sceneNarration: string;
  dialogueLines: Array<{
    speaker: string;
    text: string;
    emotion: string;
    gesture?: string;
  }>;
  worldEvents: string[];
  suggestedActions: string[];
  stateDeltas: {
    cluesUpdated?: string[];
    inventoryChanges?: string[];
    tensionDelta?: number;
  };
  timestamp: string;
}

export interface TabletopSession {
  sessionId: string;
  projectId: string;
  title: string;
  premise: string;
  mode: "open" | "guided";
  worldContract: {
    setting: string;
    timePeriod: string;
    physicalLaws: string;
    dangerLevel: "low" | "medium" | "high" | "critical";
    tensionMeter: number;
    alertSirensInTurns?: number;
  };
  visualContract: {
    lighting: string;
    weather: string;
    soundscape: string;
    sensoryDetails: string[];
  };
  characters: TabletopCharacter[];
  clues: TabletopClue[];
  partyInventory: string[];
  turnHistory: TabletopTurn[];
  status: "in_progress" | "climax_reached" | "concluded";
  createdAt: string;
  updatedAt: string;
}

export interface DirectorsTabletopModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  onInsertProseToEditor?: (prose: string) => void;
}

export const DirectorsTabletopModal: React.FC<DirectorsTabletopModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  onInsertProseToEditor,
}) => {
  const [session, setSession] = useState<TabletopSession | null>(null);
  const [activeTab, setActiveTab] = useState<"tabletop" | "script" | "setup">("tabletop");
  const [customAction, setCustomAction] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [stepping, setStepping] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [compiledProse, setCompiledProse] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSession();
    }
  }, [isOpen, projectId]);

  const fetchSession = async () => {
    setLoading(true);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/tabletop`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSession(json.data);
      }
    } catch (err: any) {
      console.error("[tabletop] Failed to load session:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStepAction = async (actionText: string) => {
    if (!actionText.trim() || stepping) return;
    setStepping(true);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/tabletop/step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionText.trim(),
          actor: "Director",
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data?.session) {
        setSession(json.data.session);
        setCustomAction("");
        setSuccessMsg(`Turn ${json.data.latestTurn?.turnNumber} executed.`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      console.error("[tabletop] Step failed:", err);
      setSuccessMsg("Error resolving turn.");
    } finally {
      setStepping(false);
    }
  };

  const handleRollbackTurn = async () => {
    if (!session || session.turnHistory.length <= 1 || stepping) return;
    setStepping(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/tabletop/revise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSession(json.data);
        setSuccessMsg("Turn rolled back.");
        setTimeout(() => setSuccessMsg(null), 2500);
      }
    } catch (err: any) {
      console.error("[tabletop] Rollback failed:", err);
    } finally {
      setStepping(false);
    }
  };

  const handleExportProse = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/tabletop/export-prose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCompiledProse(json.data.prose);
        setActiveTab("script");
      }
    } catch (err: any) {
      console.error("[tabletop] Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const handleInsertIntoEditor = () => {
    if (onInsertProseToEditor && compiledProse) {
      onInsertProseToEditor(compiledProse);
      setSuccessMsg("Inserted tabletop scene into manuscript editor!");
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const latestTurn = session?.turnHistory[session.turnHistory.length - 1];
  const tension = session?.worldContract.tensionMeter ?? 45;
  const alertTurns = session?.worldContract.alertSirensInTurns ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl w-[96vw] h-[90vh] p-0 flex flex-col bg-background/95 backdrop-blur-xl border-border/80 shadow-2xl overflow-hidden rounded-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <Clapperboard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold tracking-tight">
                  Director's Tabletop Scene Simulator
                </DialogTitle>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  InkOS Play
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                  Turn #{session?.turnHistory.length ?? 0}
                </span>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Autonomous NPC dialogue improvisation, natural language world contracts, clue boards, and inventory rules.
              </DialogDescription>
            </div>
          </div>

          {/* Status Metrics */}
          <div className="flex items-center gap-3">
            {/* Tension Meter */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-border bg-muted/30 text-xs">
              <Flame className={cn("h-4 w-4", tension > 75 ? "text-red-500 animate-pulse" : "text-amber-400")} />
              <span className="font-semibold text-muted-foreground">Tension:</span>
              <span
                className={cn(
                  "font-bold font-mono",
                  tension > 75 ? "text-red-400" : tension > 50 ? "text-amber-400" : "text-blue-400"
                )}
              >
                {tension}%
              </span>
            </div>

            {/* Alert Sirens ETA */}
            <div
              className={cn(
                "px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5",
                alertTurns <= 1
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
              )}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Patrol ETA: {alertTurns} turns</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={fetchSession}
              disabled={loading}
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              <RotateCcw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              <span>Reset</span>
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-border bg-muted/10 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("tabletop")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                activeTab === "tabletop"
                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Clapperboard className="h-3.5 w-3.5" />
              <span>Tabletop Board</span>
            </button>

            <button
              onClick={handleExportProse}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                activeTab === "script"
                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Script / Chapter Prose</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {session && session.turnHistory.length > 1 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRollbackTurn}
                disabled={stepping}
                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Rewind Turn</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleExportProse}
              disabled={exporting}
              className="h-7 px-3 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white gap-1.5 cursor-pointer shadow-sm"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Compile Manuscript Scene</span>
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden p-4">
          {successMsg && (
            <div className="mb-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg(null)} className="text-muted-foreground hover:text-foreground text-xs">
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: Live Tabletop Board */}
          {activeTab === "tabletop" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100%-10px)]">
              {/* LEFT RAIL: World Contract & Inventory (3 cols) */}
              <div className="lg:col-span-3 flex flex-col gap-3 overflow-y-auto pr-1">
                {/* World Contract Card */}
                <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Layers className="h-3.5 w-3.5 text-red-400" />
                    <span>World Contract & Rules</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-muted-foreground leading-relaxed">
                    <div>
                      <span className="font-semibold text-foreground/80">Period: </span>
                      {session?.worldContract.timePeriod}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground/80">Setting: </span>
                      {session?.worldContract.setting}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground/80">Physical Laws: </span>
                      {session?.worldContract.physicalLaws}
                    </div>
                  </div>
                </div>

                {/* Visual Contract Card */}
                <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Volume2 className="h-3.5 w-3.5 text-amber-400" />
                    <span>Sensory Atmosphere</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-muted-foreground leading-relaxed">
                    <div>
                      <span className="font-semibold text-foreground/80">Weather: </span>
                      {session?.visualContract.weather}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground/80">Lighting: </span>
                      {session?.visualContract.lighting}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground/80">Audio: </span>
                      {session?.visualContract.soundscape}
                    </div>
                  </div>
                </div>

                {/* Party Inventory */}
                <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Package className="h-3.5 w-3.5 text-blue-400" />
                    <span>Party Inventory ({session?.partyInventory.length ?? 0})</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    {session?.partyInventory.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-1.5 rounded bg-muted/40 border border-border/50 text-[11px] text-muted-foreground flex items-center gap-1.5"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CENTER RAIL: Live Narrative & Dialogue Feed (6 cols) */}
              <div className="lg:col-span-6 flex flex-col rounded-xl border border-border bg-muted/10 overflow-hidden">
                {/* Scrollable Turn Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {session?.turnHistory.map((turn, tIdx) => (
                    <div key={tIdx} className="space-y-3 pb-3 border-b border-border/40 last:border-b-0">
                      {/* Turn Header */}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="font-semibold px-2 py-0.5 rounded bg-muted border border-border">
                          Turn #{turn.turnNumber} • {turn.actor}
                        </span>
                        <span>{new Date(turn.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>

                      {/* Director's Directive */}
                      {turn.inputAction && (
                        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 font-medium">
                          <span className="opacity-70 font-semibold mr-1.5">🎬 Direction:</span>
                          {turn.inputAction}
                        </div>
                      )}

                      {/* Scene Narration */}
                      <div className="font-serif text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap pl-2 border-l-2 border-red-500/40">
                        {turn.sceneNarration}
                      </div>

                      {/* Autonomous Dialogue Lines */}
                      {turn.dialogueLines.map((line, dIdx) => (
                        <div
                          key={dIdx}
                          className="p-3 rounded-xl bg-muted/30 border border-border/60 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground text-[11px]">{line.speaker}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 uppercase font-medium tracking-wide">
                              {line.emotion}
                            </span>
                          </div>
                          <p className="font-serif text-muted-foreground italic leading-relaxed">
                            "{line.text}"
                          </p>
                          {line.gesture && (
                            <p className="text-[10px] text-muted-foreground/75 not-italic">
                              *({line.speaker} {line.gesture})*
                            </p>
                          )}
                        </div>
                      ))}

                      {/* World Events Alert */}
                      {turn.worldEvents.length > 0 && (
                        <div className="space-y-1">
                          {turn.worldEvents.map((evt, eIdx) => (
                            <div
                              key={eIdx}
                              className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold flex items-center gap-1.5"
                            >
                              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                              <span>{evt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Director Command & Action Console */}
                <div className="p-3 border-t border-border bg-muted/25 space-y-2.5 shrink-0">
                  {/* Contextual Suggested Actions */}
                  {latestTurn?.suggestedActions && latestTurn.suggestedActions.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Directorial Choices
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        {latestTurn.suggestedActions.map((choice, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => handleStepAction(choice)}
                            disabled={stepping}
                            className="p-2 rounded-lg text-left text-[11px] font-medium bg-muted/40 hover:bg-red-500/15 hover:border-red-500/30 border border-border text-foreground/90 transition-colors cursor-pointer flex items-center justify-between gap-2"
                          >
                            <span className="truncate">{choice}</span>
                            <ArrowRight className="h-3 w-3 shrink-0 opacity-60" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Free-text Improvisation Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={customAction}
                      onChange={(e) => setCustomAction(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleStepAction(customAction)}
                      placeholder="Improvise next action or issue character direction..."
                      className="flex-1 h-8 px-3 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleStepAction(customAction)}
                      disabled={stepping || !customAction.trim()}
                      className="h-8 px-3 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white gap-1 cursor-pointer"
                    >
                      <Send className="h-3 w-3" />
                      <span>{stepping ? "Resolving..." : "Direct"}</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* RIGHT RAIL: Clues & Character Cast (3 cols) */}
              <div className="lg:col-span-3 flex flex-col gap-3 overflow-y-auto pl-1">
                {/* Clue & Evidence Board */}
                <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Search className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Clue & Evidence Board</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {session?.clues.filter((c) => c.status === "discovered").length}/{session?.clues.length} Discovered
                    </span>
                  </div>

                  <div className="space-y-2">
                    {session?.clues.map((clue) => (
                      <div
                        key={clue.id}
                        className={cn(
                          "p-2.5 rounded-lg border text-xs space-y-1 transition-colors",
                          clue.status === "discovered"
                            ? "bg-cyan-500/5 border-cyan-500/30"
                            : "bg-muted/30 border-border/50 opacity-60"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground text-[11px]">{clue.name}</span>
                          <span
                            className={cn(
                              "text-[9px] uppercase font-bold px-1.5 py-0.2 rounded",
                              clue.status === "discovered"
                                ? "bg-cyan-500/20 text-cyan-300"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {clue.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          {clue.significance}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Character Cast Dossiers */}
                <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Users className="h-3.5 w-3.5 text-purple-400" />
                    <span>Active Cast Personas</span>
                  </div>

                  <div className="space-y-2.5">
                    {session?.characters.map((char) => (
                      <div
                        key={char.id}
                        className="p-2.5 rounded-lg border border-border/70 bg-muted/30 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-[11px]">{char.name}</span>
                          <span className="text-[10px] text-muted-foreground">Trust: {char.trustScore}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full"
                            style={{ width: `${char.trustScore}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          <span className="font-semibold text-foreground/80">Agenda: </span>
                          {char.agenda}
                        </p>
                        <p className="text-[10px] text-muted-foreground/80 italic">
                          Mood: {char.mood}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Script / Chapter Prose */}
          {activeTab === "script" && (
            <div className="flex flex-col h-full space-y-3">
              <div className="p-4 rounded-xl border border-border bg-muted/15 flex-1 overflow-y-auto font-serif text-sm leading-relaxed text-foreground whitespace-pre-wrap select-text">
                {compiledProse || "Click 'Compile Manuscript Scene' to compile tabletop turns into full prose."}
              </div>

              <div className="flex items-center justify-between shrink-0 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Compiled Scene: {compiledProse ? compiledProse.split(/\s+/).length : 0} words
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("tabletop")}
                    className="text-xs cursor-pointer"
                  >
                    Back to Tabletop
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleInsertIntoEditor}
                    disabled={!compiledProse}
                    className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Insert into Manuscript Editor</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Session ID: {session?.sessionId ?? "—"}</span>
            <span>•</span>
            <span>Total Turns: {session?.turnHistory.length ?? 0}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DirectorsTabletopModal;
