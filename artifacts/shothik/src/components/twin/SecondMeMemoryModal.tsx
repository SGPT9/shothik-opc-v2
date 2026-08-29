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
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

interface SecondMeMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  twinName?: string;
}

interface MemoryItem {
  id: string;
  category: "brand_voice" | "business_rules" | "faq" | "founder_preference";
  title: string;
  detail: string;
  lastUpdated: string;
}

const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: "mem-1",
    category: "brand_voice",
    title: "Bangla-English Hybrid Style",
    detail: "Use natural conversational Bangla phrasing for customer greetings, mixed with English technical terms for product specifications.",
    lastUpdated: "Today",
  },
  {
    id: "mem-2",
    category: "business_rules",
    title: "Cash on Delivery Inside Dhaka",
    detail: "Inside Dhaka COD delivery charge is ৳70 (Steadfast/Pathao), Outside Dhaka ৳130. Advance courier fee required for high-value orders above ৳3,000.",
    lastUpdated: "Yesterday",
  },
  {
    id: "mem-3",
    category: "founder_preference",
    title: "Autonomous Customer Support Approval",
    detail: "Twin can autonomously issue replacement vouchers up to ৳200 without founder manual confirmation.",
    lastUpdated: "3 days ago",
  },
  {
    id: "mem-4",
    category: "faq",
    title: "Standard Return Policy",
    detail: "7-day return policy for unopened items. Damaged-on-arrival reported within 24 hours gets instant exchange.",
    lastUpdated: "1 week ago",
  },
];

export function SecondMeMemoryModal({
  isOpen,
  onClose,
  twinName = "Polsia",
}: SecondMeMemoryModalProps) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "brand_voice" | "business_rules" | "faq" | "founder_preference">("all");
  const [newTitle, setNewTitle] = useState("");
  const [newDetail, setNewDetail] = useState("");
  const [newCategory, setNewCategory] = useState<MemoryItem["category"]>("business_rules");
  const [autoLearnEnabled, setAutoLearnEnabled] = useState(true);

  // Load from localStorage or default
  useEffect(() => {
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
  }, [isOpen]);

  const saveMemories = (updated: MemoryItem[]) => {
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

    const newItem: MemoryItem = {
      id: `mem-${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      detail: newDetail.trim(),
      lastUpdated: "Just now",
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

  const filteredMemories = memories.filter(
    (m) => activeTab === "all" || m.category === activeTab
  );

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
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">
                  Online & Learning
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Manage what your digital twin knows about your voice, pricing, and operating rules.
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
                <span className="text-xs font-bold text-foreground block">Continuous Reflection & Auto-Learning</span>
                <span className="text-[11px] text-muted-foreground">Automatically infer business rules and tone from founder chat sessions</span>
              </div>
            </div>
            <Switch
              checked={autoLearnEnabled}
              onCheckedChange={(val) => {
                setAutoLearnEnabled(val);
                toast.success(val ? "Auto-learning enabled" : "Auto-learning paused");
              }}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            {[
              { id: "all", label: "All Memories" },
              { id: "brand_voice", label: "🎨 Brand Voice" },
              { id: "business_rules", label: "💼 Business Rules" },
              { id: "founder_preference", label: "⚡ Founder Autonomy" },
              { id: "faq", label: "❓ Support FAQs" },
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
                <p className="text-[11px] text-muted-foreground">Add a custom business rule or chat with your Twin to teach it.</p>
              </div>
            ) : (
              filteredMemories.map((mem) => (
                <div
                  key={mem.id}
                  className="p-3.5 rounded-xl border border-border/60 bg-card hover:border-border transition flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground truncate">{mem.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                        {mem.lastUpdated}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed break-words">{mem.detail}</p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteMemory(mem.id)}
                    className="size-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-500 transition cursor-pointer shrink-0"
                    aria-label="Delete trait"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Add New Memory Form */}
          <div className="p-4 rounded-xl border border-dashed border-border/80 bg-muted/10 space-y-3">
            <span className="text-xs font-bold text-foreground block">Teach Twin New Knowledge</span>
            
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
                <option value="founder_preference">⚡ Founder Autonomy</option>
                <option value="faq">❓ Support FAQ</option>
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
