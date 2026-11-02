import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Crosshair,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Plus,
  Clock,
  Layers,
  ArrowRight,
  Flame,
  Check,
  Tag,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type GunState = "open" | "progressing" | "deferred" | "resolved";
export type GunCategory = "physical_prop" | "secret_clue" | "vow_prophecy" | "emotional_debt";

export interface ChekhovGun {
  id: string;
  name: string;
  category: GunCategory;
  state: GunState;
  setupChapter: number;
  setupSnippet: string;
  currentMentions: Array<{ chapter: number; note: string }>;
  expectedPayoffChapter: number;
  payoffNotes: string;
  resolvedChapter?: number;
  urgency: "low" | "medium" | "high" | "critical";
  isDangling: boolean;
}

export interface ForeshadowingLedger {
  projectId: string;
  payoffHealthScore: number;
  guns: ChekhovGun[];
  totalOpen: number;
  totalProgressing: number;
  totalDeferred: number;
  totalResolved: number;
  danglingCount: number;
  updatedAt: string;
}

export interface ChekhovGunModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
}

export const ChekhovGunModal: React.FC<ChekhovGunModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
}) => {
  const [ledger, setLedger] = useState<ForeshadowingLedger | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | GunState>("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(false);
  const [transitioningId, setTransitioningId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New gun form state
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<GunCategory>("physical_prop");
  const [newSetupChapter, setNewSetupChapter] = useState<number>(1);
  const [newSetupSnippet, setNewSetupSnippet] = useState("");
  const [newPayoffChapter, setNewPayoffChapter] = useState<number>(11);
  const [newPayoffNotes, setNewPayoffNotes] = useState("");
  const [newUrgency, setNewUrgency] = useState<"low" | "medium" | "high" | "critical">("high");

  useEffect(() => {
    if (isOpen) {
      fetchLedger();
    }
  }, [isOpen, projectId]);

  const fetchLedger = async () => {
    setLoading(true);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/foreshadowing`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        setLedger(json.data);
      }
    } catch (err: any) {
      console.error("[foreshadowing] Failed to fetch ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScanManuscript = async () => {
    setScanning(true);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/foreshadowing/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        setLedger(json.data);
        setSuccessMsg("Scanned all manuscript chapters: updated payoff health & dangling status!");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      console.error("[foreshadowing] Scan failed:", err);
    } finally {
      setScanning(false);
    }
  };

  const handleTransitionState = async (gunId: string, nextState: GunState) => {
    setTransitioningId(gunId);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/foreshadowing/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gunId,
          nextState,
          chapter: nextState === "resolved" ? 11 : 4,
          note: `Author transitioned to ${nextState} state.`,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        setLedger(json.data);
        setSuccessMsg(`Updated gun lifecycle state to "${nextState.toUpperCase()}".`);
        setTimeout(() => setSuccessMsg(null), 2500);
      }
    } catch (err: any) {
      console.error("[foreshadowing] Transition failed:", err);
    } finally {
      setTransitioningId(null);
    }
  };

  const handleCreateGun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSetupSnippet.trim()) return;

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/foreshadowing/upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          category: newCategory,
          state: "open",
          setupChapter: Number(newSetupChapter),
          setupSnippet: newSetupSnippet.trim(),
          expectedPayoffChapter: Number(newPayoffChapter),
          payoffNotes: newPayoffNotes.trim() || "Fired in Act III resolution.",
          urgency: newUrgency,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        setLedger(json.data);
        setShowAddForm(false);
        setNewName("");
        setNewSetupSnippet("");
        setNewPayoffNotes("");
        setSuccessMsg(`Registered Chekhov's gun: "${newName}"`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      console.error("[foreshadowing] Create failed:", err);
    }
  };

  const filteredGuns = (ledger?.guns || []).filter((g) => {
    if (activeFilter === "all") return true;
    return g.state === activeFilter;
  });

  const health = ledger?.payoffHealthScore ?? 85;
  const healthColor =
    health >= 80
      ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
      : health >= 60
      ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
      : "text-rose-400 border-rose-500/40 bg-rose-500/10";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-[96vw] h-[88vh] p-0 flex flex-col bg-background/95 backdrop-blur-xl border-border/80 shadow-2xl overflow-hidden rounded-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Crosshair className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold tracking-tight">
                  Chekhov’s Gun & Plot Foreshadowing Lifecycle Tracker
                </DialogTitle>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  4-Stage State Machine
                </span>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Track every introduced weapon, clue, vow, and secret across chapters to guarantee satisfying narrative payoffs without dangling threads.
              </DialogDescription>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="flex items-center gap-3">
            <div className={cn("px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5", healthColor)}>
              <ShieldCheck className="h-4 w-4" />
              <span>Payoff Health: {health}%</span>
            </div>

            {ledger?.danglingCount ? (
              <div className="px-2.5 py-1 rounded-lg border border-rose-500/40 bg-rose-500/15 text-rose-300 text-xs font-semibold flex items-center gap-1 animate-pulse">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{ledger.danglingCount} Dangling Gun!</span>
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-lg border border-border text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                <span>0 Dangling Threads</span>
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handleScanManuscript}
              disabled={scanning}
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", scanning && "animate-spin")} />
              <span>Auto-Scan</span>
            </Button>
          </div>
        </div>

        {/* Navigation Filter Tabs */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-border bg-muted/10 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveFilter("all")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                activeFilter === "all"
                  ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>All Guns ({ledger?.guns.length ?? 0})</span>
            </button>

            <button
              onClick={() => setActiveFilter("open")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                activeFilter === "open"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              <span>Open / Setup ({ledger?.totalOpen ?? 0})</span>
            </button>

            <button
              onClick={() => setActiveFilter("progressing")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                activeFilter === "progressing"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Progressing ({ledger?.totalProgressing ?? 0})</span>
            </button>

            <button
              onClick={() => setActiveFilter("deferred")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                activeFilter === "deferred"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-purple-400" />
              <span>Deferred / Dormant ({ledger?.totalDeferred ?? 0})</span>
            </button>

            <button
              onClick={() => setActiveFilter("resolved")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                activeFilter === "resolved"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Resolved / Fired ({ledger?.totalResolved ?? 0})</span>
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setShowAddForm((p) => !p)}
            className="h-7 px-3 text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white gap-1 cursor-pointer shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{showAddForm ? "Cancel Form" : "Register Gun"}</span>
          </Button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg(null)} className="text-muted-foreground hover:text-foreground text-xs">
                ✕
              </button>
            </div>
          )}

          {/* Add Gun Drawer Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreateGun}
              className="p-4 rounded-xl border border-orange-500/40 bg-orange-500/5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">Register New Chekhov's Gun / Setup</h4>
                <span className="text-[10px] text-muted-foreground">Will be tracked in the 4-stage lifecycle ledger</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Gun / Prop Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Antique Silver Compass"
                    required
                    className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as GunCategory)}
                    className="w-full h-8 px-2 rounded-lg border border-border bg-background text-xs"
                  >
                    <option value="physical_prop">Physical Prop / Weapon</option>
                    <option value="secret_clue">Secret / Cryptic Clue</option>
                    <option value="vow_prophecy">Vow / Prophecy</option>
                    <option value="emotional_debt">Emotional Debt / Secret Bond</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">Urgency</label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className="w-full h-8 px-2 rounded-lg border border-border bg-background text-xs"
                  >
                    <option value="critical">Critical (Must Fire in Climax)</option>
                    <option value="high">High (Major Subplot)</option>
                    <option value="medium">Medium (Character Anchor)</option>
                    <option value="low">Low (Atmospheric Detail)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="font-semibold text-foreground block mb-1">Setup Snippet / Context</label>
                  <input
                    type="text"
                    value={newSetupSnippet}
                    onChange={(e) => setNewSetupSnippet(e.target.value)}
                    placeholder="Exact text or description where the item is introduced in Chapter 1-3..."
                    required
                    className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-foreground block mb-1">Setup Ch</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={newSetupChapter}
                      onChange={(e) => setNewSetupChapter(Number(e.target.value))}
                      className="w-full h-8 px-2 rounded-lg border border-border bg-background text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-foreground block mb-1">Payoff Ch</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={newPayoffChapter}
                      onChange={(e) => setNewPayoffChapter(Number(e.target.value))}
                      className="w-full h-8 px-2 rounded-lg border border-border bg-background text-xs"
                    />
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="font-semibold text-foreground block mb-1">Intended Narrative Payoff</label>
                  <input
                    type="text"
                    value={newPayoffNotes}
                    onChange={(e) => setNewPayoffNotes(e.target.value)}
                    placeholder="How this item will be fired, unlocked, or emotionally redeemed..."
                    className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="h-7 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-7 px-3 text-xs bg-orange-600 hover:bg-orange-500 text-white font-semibold cursor-pointer"
                >
                  Save Gun
                </Button>
              </div>
            </form>
          )}

          {/* Cards List */}
          <div className="space-y-3">
            {filteredGuns.map((gun) => {
              const stateBadgeColor =
                gun.state === "resolved"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : gun.state === "progressing"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : gun.state === "deferred"
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                  : "bg-blue-500/20 text-blue-300 border-blue-500/30";

              return (
                <div
                  key={gun.id}
                  className={cn(
                    "p-4 rounded-xl border bg-muted/15 space-y-3 transition-colors",
                    gun.isDangling
                      ? "border-rose-500/50 bg-rose-500/5"
                      : gun.state === "resolved"
                      ? "border-emerald-500/30 hover:border-emerald-500/50"
                      : "border-border/80 hover:border-orange-500/30"
                  )}
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border", stateBadgeColor)}>
                          {gun.state}
                        </span>
                        <h4 className="text-xs font-bold text-foreground">{gun.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                          {gun.category.replace("_", " ")}
                        </span>
                        {gun.isDangling && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                            ⚠️ Dangling: No recent mentions!
                          </span>
                        )}
                      </div>
                      <p className="font-serif text-xs italic text-muted-foreground leading-relaxed">
                        "{gun.setupSnippet}"
                      </p>
                    </div>

                    {/* State Switcher Pills */}
                    <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border shrink-0">
                      {(["open", "progressing", "deferred", "resolved"] as GunState[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleTransitionState(gun.id, st)}
                          disabled={transitioningId === gun.id}
                          className={cn(
                            "px-2 py-1 text-[10px] font-semibold rounded capitalize transition-colors cursor-pointer",
                            gun.state === st
                              ? "bg-foreground text-background"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chapter Mentions Timeline */}
                  <div className="space-y-1.5 pt-1 border-t border-border/40">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground/80 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Mentions Across Narrative:
                      </span>
                      <span>Target Payoff: Chapter {gun.expectedPayoffChapter}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {gun.currentMentions.map((m, mIdx) => (
                        <div
                          key={mIdx}
                          className="px-2 py-1 rounded bg-muted/50 border border-border text-[11px] text-foreground/90 flex items-center gap-1"
                          title={m.note}
                        >
                          <span className="font-bold text-orange-400">Ch {m.chapter}:</span>
                          <span className="truncate max-w-[200px]">{m.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payoff Note */}
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="text-[11px] text-muted-foreground">
                        <strong className="text-foreground/90 font-medium">Planned Payoff: </strong>
                        {gun.payoffNotes}
                      </span>
                    </div>

                    {gun.state === "resolved" && (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                        <Check className="h-3 w-3" />
                        Fired in Chapter {gun.resolvedChapter ?? gun.expectedPayoffChapter}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Chekhov's Rule: Every rifle on the wall in Act I must fire by Act III.</span>
            <span>•</span>
            <span>Total Tracked: {ledger?.guns.length ?? 0}</span>
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

export default ChekhovGunModal;
