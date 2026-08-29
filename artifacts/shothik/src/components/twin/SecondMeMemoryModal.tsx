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
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { ExtractedMemory, MemoryCategory, MemorySource } from "@/lib/memory/MemoryExtractionService";

interface SecondMeMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  twinName?: string;
}

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
}: SecondMeMemoryModalProps) {
  const [memories, setMemories] = useState<ExtractedMemory[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "auto" | MemoryCategory>("all");
  const [newTitle, setNewTitle] = useState("");
  const [newDetail, setNewDetail] = useState("");
  const [newCategory, setNewCategory] = useState<MemoryCategory>("business_rules");
  const [autoLearnEnabled, setAutoLearnEnabled] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDetail, setEditDetail] = useState("");

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

  useEffect(() => {
    reloadFromStorage();

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
  }, [isOpen]);

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-card border-border/80 p-0 overflow-hidden rounded-2xl shadow-xl">
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
                  Real-time Stream Active
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Decisions, business rules, and tone automatically extracted across chats, tasks, and swarm runs.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
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
              { id: "all", label: "All Memories" },
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

          {/* Memories List */}
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
      </DialogContent>
    </Dialog>
  );
}

