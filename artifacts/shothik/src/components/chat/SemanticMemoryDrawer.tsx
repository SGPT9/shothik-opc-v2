import React, { useState, useEffect } from "react";
import { Brain, Trash2, Plus, Search, X, Loader2, Sparkles, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalA11y } from "@/hooks/ui/useModalA11y";
import { cn } from "@/lib/utils";

export interface MemoryItem {
  id: string;
  category: "preference" | "fact" | "style" | "project_context" | "correction";
  content: string;
  createdAt: number;
}

export interface SemanticMemoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  preference: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  fact: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  style: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  project_context: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  correction: "border-rose-500/30 bg-rose-500/10 text-rose-400",
};

/**
 * Semantic Memory Management Drawer adapted from LibreChat's Memories panel.
 * Allows users to view, search, add, and prune facts/preferences the AI has memorized.
 */
export function SemanticMemoryDrawer({
  isOpen,
  onClose,
  userId = "default",
  className,
}: SemanticMemoryDrawerProps) {
  useModalA11y({ isOpen, onClose });

  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<MemoryItem["category"]>("preference");
  const [isAdding, setIsAdding] = useState(false);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/memory/${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.memories)) {
          setMemories(data.memories);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMemories();
    }
  }, [isOpen, userId]);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch("/api/memory/memorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          content: newContent.trim(),
          category: newCategory,
        }),
      });
      if (res.ok) {
        setNewContent("");
        await fetchMemories();
      }
    } catch {
      // ignore
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (memoryId: string) => {
    try {
      const res = await fetch(`/api/memory/${encodeURIComponent(userId)}/${encodeURIComponent(memoryId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMemories((prev) => prev.filter((m) => m.id !== memoryId));
      }
    } catch {
      // ignore
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to delete all stored memories?")) return;
    try {
      const res = await fetch(`/api/memory/${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMemories([]);
      }
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  const filteredMemories = memories.filter((m) => {
    const matchesSearch = !searchQuery || m.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="semantic-memory-title"
      className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className={cn(
          "w-full max-w-md h-full bg-card border-l border-border/80 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <h2 id="semantic-memory-title" className="text-sm font-semibold text-foreground">
                Semantic Memory
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Personalized preferences and recalled facts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 border-b border-border/60 space-y-2 bg-muted/20">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border/80 bg-background/60 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-brand focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] custom-scrollbar">
            {["all", "preference", "fact", "style", "project_context", "correction"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-md px-2 py-0.5 capitalize transition whitespace-nowrap",
                  selectedCategory === cat
                    ? "bg-brand text-brand-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Add Memory Form */}
        <form onSubmit={handleAddMemory} className="p-3 border-b border-border/60 space-y-2 bg-muted/10">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a new preference or fact..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="flex-1 rounded-lg border border-border/80 bg-background/80 px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-brand focus:outline-none"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="rounded-lg border border-border/80 bg-background/80 px-2 py-1 text-xs text-foreground focus:border-brand focus:outline-none capitalize"
            >
              <option value="preference">Preference</option>
              <option value="fact">Fact</option>
              <option value="style">Style</option>
              <option value="project_context">Context</option>
              <option value="correction">Correction</option>
            </select>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isAdding || !newContent.trim()}
              size="sm"
              className="h-7 text-xs gap-1 bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              <span>Add Memory</span>
            </Button>
          </div>
        </form>

        {/* Memories List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">Loading memories...</span>
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground/60 gap-2 text-center px-4">
              <Brain className="h-8 w-8 stroke-[1.5] opacity-40" />
              <p className="text-xs font-medium text-muted-foreground">No memories found</p>
              <p className="text-[11px]">
                The AI automatically learns preferences during conversations, or you can add one above.
              </p>
            </div>
          ) : (
            filteredMemories.map((mem) => (
              <div
                key={mem.id}
                className="group relative rounded-xl border border-border/70 bg-card p-3 text-xs space-y-1.5 shadow-2xs hover:border-border transition"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "rounded-md border px-1.5 py-0.5 text-[10px] font-medium capitalize",
                      CATEGORY_COLORS[mem.category] || "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {mem.category.replace("_", " ")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground/50 font-mono">
                      {new Date(mem.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(mem.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive transition"
                      aria-label="Delete memory"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-foreground/90 leading-relaxed font-normal">{mem.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {memories.length > 0 && (
          <div className="p-3 border-t border-border/60 flex items-center justify-between text-xs bg-muted/10">
            <span className="text-muted-foreground text-[11px]">{memories.length} memories stored</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-destructive/80 hover:text-destructive text-[11px] font-medium transition"
            >
              Clear All Memories
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
