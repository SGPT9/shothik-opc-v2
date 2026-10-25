import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Sparkles,
  ShieldCheck,
  Zap,
  BookOpen,
  MessageSquare,
  Sliders,
  CheckCircle2,
  Trash2,
  Plus,
  RefreshCw,
  Activity,
  Check,
  Edit2,
  Compass,
  FileCode,
  Search,
  ExternalLink,
  Lock,
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { ExtractedMemory, MemoryCategory, MemorySource } from "@/lib/memory/MemoryExtractionService";

export type DirectionKind = "user_preference" | "design_constraint" | "operational_rule" | "cultural_boundary";

export interface DirectionEntry {
  id: string;
  userId: string;
  companySlug: string;
  kind: DirectionKind;
  content: string;
  supersedesId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskMemo {
  id: string;
  taskId: string;
  companySlug: string;
  userId: string;
  title: string;
  scopePath: string;
  summary: string;
  executionSteps: string[];
  outputArtifacts: Array<{ type: string; path: string }>;
  qualityScore: number;
  invalidationReason?: string;
  isInvalidated: boolean;
  createdAt: string;
}

interface SecondMeMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  twinName?: string;
  companySlug?: string;
}

type MemoryTab = "all" | "directions" | "memos" | "auto" | MemoryCategory;

const DEFAULT_MEMORIES: ExtractedMemory[] = [
  {
    id: "mem-1",
    category: "brand_voice",
    title: "Bangla-English Hybrid Style",
    detail: "Use natural conversational Bangla phrasing for customer greetings, mixed with English technical terms for product specifications.",
    confidence: 0.95,
    source: "manual",
    tags: ["voice", "language", "bilingual"],
    createdAt: new Date().toISOString(),
    lastUpdated: "Today",
    autoLearned: false,
  },
  {
    id: "mem-2",
    category: "business_rules",
    title: "Cash on Delivery Inside Dhaka",
    detail: "Inside Dhaka COD delivery charge is ৳70 (Steadfast/Pathao), Outside Dhaka ৳130. Advance courier fee required for high-value orders above ৳3,000.",
    confidence: 0.96,
    source: "manual",
    tags: ["courier", "pricing", "delivery"],
    createdAt: new Date().toISOString(),
    lastUpdated: "Yesterday",
    autoLearned: false,
  },
  {
    id: "mem-3",
    category: "founder_preference",
    title: "Autonomous Customer Support Approval",
    detail: "Twin can autonomously issue replacement vouchers up to ৳200 without founder manual confirmation.",
    confidence: 0.94,
    source: "manual",
    tags: ["autonomy", "support", "voucher"],
    createdAt: new Date().toISOString(),
    lastUpdated: "3 days ago",
    autoLearned: false,
  },
  {
    id: "mem-4",
    category: "faq",
    title: "Standard Return Policy",
    detail: "7-day return policy for unopened items. Damaged-on-arrival reported within 24 hours gets instant exchange.",
    confidence: 0.92,
    source: "manual",
    tags: ["returns", "policy", "faq"],
    createdAt: new Date().toISOString(),
    lastUpdated: "1 week ago",
    autoLearned: false,
  },
];

export function SecondMeMemoryModal({
  isOpen,
  onClose,
  twinName = "Shothik",
  companySlug = "default",
}: SecondMeMemoryModalProps) {
  const [memories, setMemories] = useState<ExtractedMemory[]>([]);
  const [directions, setDirections] = useState<DirectionEntry[]>([]);
  const [memos, setMemos] = useState<TaskMemo[]>([]);
  const [activeTab, setActiveTab] = useState<MemoryTab>("directions");

  // Cognitive trait inputs
  const [newTitle, setNewTitle] = useState("");
  const [newDetail, setNewDetail] = useState("");
  const [newCategory, setNewCategory] = useState<MemoryCategory>("business_rules");
  const [autoLearnEnabled, setAutoLearnEnabled] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDetail, setEditDetail] = useState("");

  // Direction Layer state
  const [newDirKind, setNewDirKind] = useState<DirectionKind>("operational_rule");
  const [newDirContent, setNewDirContent] = useState("");
  const [newDirSupersedes, setNewDirSupersedes] = useState("");
  const [isSubmittingDir, setIsSubmittingDir] = useState(false);

  // BM25 Task Memo search
  const [bm25Query, setBm25Query] = useState("");
  const [isSearchingMemos, setIsSearchingMemos] = useState(false);

  // Load from localStorage or default
  const reloadFromStorage = () => {
    try {
      const stored = localStorage.getItem("shothik_twin_memories");
      if (stored) {
        setMemories(JSON.parse(stored));
      } else {
        setMemories(DEFAULT_MEMORIES);
      }
    } catch {
      setMemories(DEFAULT_MEMORIES);
    }
  };

  // Fetch backend Direction Layer and Task Memos
  const fetchMemoryV2Data = async () => {
    try {
      const [dirRes, memoRes] = await Promise.all([
        fetch(`/api/v1/twin/memory/directions?company=${companySlug}`),
        fetch(`/api/v1/twin/memory/memos?company=${companySlug}`),
      ]);

      if (dirRes.ok) {
        const dJson = await dirRes.json();
        if (dJson.success && Array.isArray(dJson.directions)) {
          setDirections(dJson.directions);
        }
      }

      if (memoRes.ok) {
        const mJson = await memoRes.json();
        if (mJson.success && Array.isArray(mJson.memos)) {
          setMemos(mJson.memos);
        }
      }
    } catch {
      // Graceful fallback to offline defaults
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    reloadFromStorage();
    fetchMemoryV2Data();

    const handleRealTimeExtraction = (e: any) => {
      reloadFromStorage();
      if (e.detail?.memories?.length) {
        toast.info(`🧠 Real-time: Learned ${e.detail.memories.length} new decision(s)!`);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("shothik_memory_extracted", handleRealTimeExtraction);
      return () => {
        window.removeEventListener("shothik_memory_extracted", handleRealTimeExtraction);
      };
    }
  }, [isOpen, companySlug]);

  const saveMemories = (updated: ExtractedMemory[]) => {
    setMemories(updated);
    try {
      localStorage.setItem("shothik_twin_memories", JSON.stringify(updated));
    } catch {}
  };

  const handleAddMemory = () => {
    if (!newTitle.trim() || !newDetail.trim()) {
      toast.error("Please enter both title and detail for the memory trait.");
      return;
    }

    const newItem: ExtractedMemory = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: newCategory,
      title: newTitle.trim(),
      detail: newDetail.trim(),
      confidence: 1.0,
      source: "manual",
      tags: ["manual", newCategory],
      createdAt: new Date().toISOString(),
      lastUpdated: "Just now",
      autoLearned: false,
    };

    const updated = [newItem, ...memories];
    saveMemories(updated);
    setNewTitle("");
    setNewDetail("");
    toast.success("Added cognitive memory trait to Twin!");
  };

  const handleDeleteMemory = (id: string) => {
    const updated = memories.filter((m) => m.id !== id);
    saveMemories(updated);
    toast.info("Removed memory trait.");
  };

  const handleSaveEdit = (id: string) => {
    const updated = memories.map((m) =>
      m.id === id ? { ...m, detail: editDetail, lastUpdated: "Just now" } : m
    );
    saveMemories(updated);
    setEditingId(null);
    setEditDetail("");
    toast.success("Updated memory trait.");
  };

  // Direction Layer submit handler (<= 400 chars enforcement)
  const handleAddDirection = async () => {
    const content = newDirContent.trim();
    if (!content) {
      toast.error("Please enter direction content.");
      return;
    }
    if (content.length > 400) {
      toast.error(`Rule exceeds hard budget limit (max 400 characters, currently ${content.length}).`);
      return;
    }

    setIsSubmittingDir(true);
    try {
      const res = await fetch("/api/v1/twin/memory/directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "usr_founder_live",
          companySlug,
          kind: newDirKind,
          content,
          supersedesId: newDirSupersedes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const json = await res.json();
      if (json.success && json.direction) {
        setDirections((prev) => [json.direction, ...prev]);
        setNewDirContent("");
        setNewDirSupersedes("");
        toast.success(`🎯 Direction Layer rule recorded (${content.length}/400 chars)!`);
      }
    } catch (err: any) {
      toast.error(`Failed to record direction: ${err.message}`);
    } finally {
      setIsSubmittingDir(false);
    }
  };

  // BM25 Search Memos
  const handleSearchMemos = async (q: string) => {
    setBm25Query(q);
    setIsSearchingMemos(true);
    try {
      const queryParam = q ? `&q=${encodeURIComponent(q)}` : "";
      const res = await fetch(`/api/v1/twin/memory/memos?company=${companySlug}${queryParam}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setMemos(json.results || json.memos || []);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsSearchingMemos(false);
    }
  };

  const filteredMemories = memories.filter((m) => {
    if (activeTab === "all") return true;
    if (activeTab === "auto") return m.autoLearned;
    return m.category === activeTab;
  });

  const getSourceBadge = (source?: MemorySource, autoLearned?: boolean) => {
    if (source === "swarm") {
      return (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 font-mono flex items-center gap-1">
          <Zap className="size-2.5" /> Swarm
        </span>
      );
    }
    if (source === "task") {
      return (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-mono flex items-center gap-1">
          <CheckCircle2 className="size-2.5" /> Task
        </span>
      );
    }
    if (source === "chat" || autoLearned) {
      return (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 font-mono flex items-center gap-1">
          <Sparkles className="size-2.5" /> Auto-Stream
        </span>
      );
    }
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
        Manual
      </span>
    );
  };

  const getDirectionKindBadge = (kind: DirectionKind) => {
    switch (kind) {
      case "operational_rule":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30 text-[10px] font-mono">OP_RULE</Badge>;
      case "cultural_boundary":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] font-mono">CULTURAL</Badge>;
      case "design_constraint":
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/30 text-[10px] font-mono">DESIGN</Badge>;
      case "user_preference":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] font-mono">PREFERENCE</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-card border-border/80 p-0 overflow-hidden rounded-2xl shadow-xl">
        {/* Header */}
        <div className="p-5 border-b border-border/60 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand">
              <Brain className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <span>{twinName} Cognitive Memory & Persona</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] flex items-center gap-1">
                  <Activity className="size-2.5 animate-pulse text-emerald-500" />
                  Direction Layer & BM25 Active
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Hard-budgeted Direction rules (AI-Company OS), episodic task receipts, and continuous cognitive extraction.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto custom-scrollbar">
          {/* Autonomy Setting Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
            <div className="flex items-center gap-2.5">
              <Sparkles className="size-4 text-amber-500 shrink-0" />
              <div>
                <span className="text-xs font-bold text-foreground block">Continuous Stream & Real-time Auto-Learning</span>
                <span className="text-[11px] text-muted-foreground">Extract decisions and policies autonomously as workflows complete</span>
              </div>
            </div>
            <Switch
              checked={autoLearnEnabled}
              onCheckedChange={(val) => {
                setAutoLearnEnabled(val);
                toast.success(val ? "Auto-learning stream enabled" : "Auto-learning paused");
              }}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            {[
              { id: "directions", label: `🎯 Direction Layer (${directions.length})` },
              { id: "memos", label: `📜 Episodic Memos (${memos.length})` },
              { id: "all", label: `All Traits (${memories.length})` },
              { id: "auto", label: "✨ Auto-Stream" },
              { id: "brand_voice", label: "🎨 Brand Voice" },
              { id: "business_rules", label: "💼 Business Rules" },
              { id: "founder_preference", label: "⚡ Founder Directives" },
              { id: "faq", label: "❓ Support & Architecture" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition",
                  activeTab === tab.id
                    ? "bg-brand text-brand-foreground shadow-xs font-bold"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              TAB 1: DIRECTION LAYER (Hard-budgeted Rules, <= 400 chars)
             ───────────────────────────────────────────────────────────── */}
          {activeTab === "directions" && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 block">
                    Direction Layer (AI-Company OS Protocol)
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Hard-budgeted at 400 characters per rule. Enforces auditable superseding without silent overrides.
                  </span>
                </div>
                <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 font-mono text-[10px]">
                  {directions.length} Active Rules
                </Badge>
              </div>

              {/* Add Direction Form */}
              <div className="p-3.5 rounded-xl border border-dashed border-indigo-500/40 bg-indigo-500/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Record New Direction Rule</span>
                  <span className={cn(
                    "text-[11px] font-mono font-bold",
                    newDirContent.length > 400 ? "text-rose-500" : "text-zinc-400"
                  )}>
                    {newDirContent.length}/400 chars
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={newDirKind}
                    onChange={(e) => setNewDirKind(e.target.value as DirectionKind)}
                    className="text-xs h-8 px-2.5 rounded-lg border border-border/80 bg-background text-foreground outline-none font-semibold cursor-pointer"
                  >
                    <option value="operational_rule">⚙️ Operational Rule (COD, Schedulers)</option>
                    <option value="cultural_boundary">🇧🇩 Cultural Boundary (Banglish, COD/bKash)</option>
                    <option value="design_constraint">🎨 Design Constraint (Mobile-first, &lt;88MB)</option>
                    <option value="user_preference">👤 Founder Preference</option>
                  </select>

                  <Input
                    placeholder="Supersedes Rule ID (optional, e.g. dir-1)"
                    value={newDirSupersedes}
                    onChange={(e) => setNewDirSupersedes(e.target.value)}
                    className="text-xs h-8 rounded-lg"
                  />
                </div>

                <textarea
                  placeholder="Enter exact constraint (e.g. 'Never trigger Meta Ad spend before bKash and Steadfast webhook listeners pass integration tests.'). Max 400 chars."
                  value={newDirContent}
                  onChange={(e) => setNewDirContent(e.target.value)}
                  maxLength={400}
                  className="w-full h-16 p-2 text-xs rounded-lg border border-border/80 bg-background resize-none outline-none focus:border-brand custom-scrollbar text-foreground placeholder:text-muted-foreground"
                />

                <Button
                  onClick={handleAddDirection}
                  disabled={isSubmittingDir || !newDirContent.trim() || newDirContent.length > 400}
                  className="h-8 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs cursor-pointer"
                >
                  <Plus className="size-3.5 mr-1.5" />
                  Enact Direction Rule
                </Button>
              </div>

              {/* Directions List */}
              <div className="space-y-2">
                {directions.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-muted/20 border border-border/40 space-y-1">
                    <Compass className="size-6 text-muted-foreground/40 mx-auto" />
                    <p className="text-xs font-semibold text-foreground">No Direction Rules enacted yet</p>
                    <p className="text-[11px] text-muted-foreground">Add operational guidelines above to govern all twin decisions.</p>
                  </div>
                ) : (
                  directions.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 rounded-xl border border-border/60 bg-card hover:border-indigo-500/40 transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          {getDirectionKindBadge(d.kind)}
                          <span className="text-[11px] font-mono text-zinc-400">{d.id}</span>
                          {d.supersedesId && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
                              Supersedes: {d.supersedesId}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {d.content.length}/400c • {new Date(d.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-foreground font-medium leading-relaxed">{d.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2: EPISODIC TASK MEMOS (Zero-LLM BM25 Retrieval)
             ───────────────────────────────────────────────────────────── */}
          {activeTab === "memos" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-zinc-400" />
                  <Input
                    placeholder="Search task memos with zero-token BM25 (e.g. steadfast, bkash, ads)..."
                    value={bm25Query}
                    onChange={(e) => handleSearchMemos(e.target.value)}
                    className="pl-8 text-xs h-9 rounded-lg"
                  />
                </div>
                {bm25Query && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSearchMemos("")}
                    className="h-9 px-2 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {memos.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-muted/20 border border-border/40 space-y-1">
                    <FileCode className="size-6 text-muted-foreground/40 mx-auto" />
                    <p className="text-xs font-semibold text-foreground">No episodic memos found</p>
                    <p className="text-[11px] text-muted-foreground">Executed tasks on the Task Wall automatically commit execution receipts here.</p>
                  </div>
                ) : (
                  memos.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl border border-border/60 bg-card hover:border-emerald-500/40 transition space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{m.title}</span>
                          <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500 font-mono">
                            {m.scopePath}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-mono">
                            ✓ {Math.round(m.qualityScore * 100)}% Quality
                          </Badge>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">{m.summary}</p>

                      {/* Execution Steps */}
                      {m.executionSteps && m.executionSteps.length > 0 && (
                        <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 font-mono text-[11px] text-zinc-300 space-y-1">
                          {m.executionSteps.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="text-emerald-400">›</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Artifacts */}
                      {m.outputArtifacts && m.outputArtifacts.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[10px] uppercase font-mono text-zinc-500">Receipts:</span>
                          {m.outputArtifacts.map((art, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/40"
                            >
                              [{art.type}] {art.path}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 3+: COGNITIVE MEMORY TRAITS (Existing Functionality)
             ───────────────────────────────────────────────────────────── */}
          {activeTab !== "directions" && activeTab !== "memos" && (
            <div className="space-y-4">
              <div className="space-y-2.5">
                {filteredMemories.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-muted/20 border border-border/40 space-y-2">
                    <Brain className="size-8 text-muted-foreground/40 mx-auto" />
                    <p className="text-xs font-semibold text-foreground">No learned traits in this category yet</p>
                    <p className="text-[11px] text-muted-foreground">Complete tasks or chat with your Twin to stream decisions automatically.</p>
                  </div>
                ) : (
                  filteredMemories.map((mem) => (
                    <div
                      key={mem.id}
                      className="p-3.5 rounded-xl border border-border/60 bg-card hover:border-border transition flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-foreground">{mem.title}</span>
                          {getSourceBadge(mem.source, mem.autoLearned)}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                            {mem.lastUpdated}
                          </span>
                        </div>

                        {editingId === mem.id ? (
                          <div className="space-y-2 pt-1">
                            <textarea
                              value={editDetail}
                              onChange={(e) => setEditDetail(e.target.value)}
                              className="w-full p-2 text-xs rounded-lg border border-brand bg-background text-foreground resize-none outline-none"
                              rows={3}
                            />
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(mem.id)}
                                className="h-6 px-2.5 text-[11px] bg-brand text-brand-foreground"
                              >
                                <Check className="size-3 mr-1" /> Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingId(null)}
                                className="h-6 px-2 text-[11px]"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground leading-relaxed break-words">{mem.detail}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingId(mem.id);
                            setEditDetail(mem.detail);
                          }}
                          className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                          aria-label="Edit trait"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMemory(mem.id)}
                          className="size-7 text-muted-foreground hover:text-rose-500 cursor-pointer"
                          aria-label="Delete trait"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add New Memory Form */}
              <div className="p-4 rounded-xl border border-dashed border-border/80 bg-muted/10 space-y-3">
                <span className="text-xs font-bold text-foreground block">Teach Twin New Knowledge Directly</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    placeholder="Rule or Tone Title (e.g. Special Discount Policy)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="text-xs h-8 rounded-lg"
                  />
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="text-xs h-8 px-2.5 rounded-lg border border-border/80 bg-background text-foreground outline-none font-semibold cursor-pointer"
                  >
                    <option value="business_rules">💼 Business Rule</option>
                    <option value="brand_voice">🎨 Brand Voice / Tone</option>
                    <option value="founder_preference">⚡ Founder Directive</option>
                    <option value="faq">❓ Support & Architecture</option>
                  </select>
                </div>

                <textarea
                  placeholder="Provide exact details for how the Twin should behave or reply..."
                  value={newDetail}
                  onChange={(e) => setNewDetail(e.target.value)}
                  className="w-full h-16 p-2 text-xs rounded-lg border border-border/80 bg-background resize-none outline-none focus:border-brand custom-scrollbar text-foreground placeholder:text-muted-foreground"
                />

                <Button
                  onClick={handleAddMemory}
                  className="h-8 px-4 text-xs font-bold bg-brand hover:bg-brand/90 text-brand-foreground rounded-lg shadow-xs cursor-pointer"
                >
                  <Plus className="size-3.5 mr-1.5" />
                  Save to Twin Brain
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
