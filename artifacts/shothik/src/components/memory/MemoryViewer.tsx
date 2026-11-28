"use client";

import React, { useState, useEffect } from "react";
import { Database, Search, Plus, Sparkles, Brain, Tag, X, RefreshCw } from "lucide-react";
import { LiquidGlassCard } from "@/components/chat/LiquidGlassCard";
import { searchMemories, type MemoryChunk } from "@/services/agent-team.service";
import api from "@/lib/api";

export interface MemoryViewerProps {
  className?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export function MemoryViewer({ className = "", onClose, isModal = false }: MemoryViewerProps) {
  const [memories, setMemories] = useState<MemoryChunk[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newContent, setNewContent] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("fact");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadMemories = async (query: string = "") => {
    setLoading(true);
    try {
      const data = await searchMemories(query);
      setMemories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to search memories");
      setMemories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMemories(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) {
      setError("Memory content cannot be empty");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post("/api/memory/memorize", {
        userId: "default",
        content: newContent.trim(),
        category: newCategory,
      });
      setNewContent("");
      setShowAddForm(false);
      await loadMemories(searchQuery);
    } catch (err: any) {
      setError(err?.message || "Failed to store memory fact");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LiquidGlassCard
      intensity="vibrant"
      palette="cyan"
      className={`p-5 flex flex-col h-full select-text text-zinc-100 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Second-Me Semantic Memory
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {(memories || []).length} Stored
              </span>
            </h3>
            <p className="text-xs text-zinc-400">Episodic facts & preferences for context synthesis</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => loadMemories(searchQuery)}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
            title="Refresh memory store"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
              title="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Semantic vector search across memories..."
          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition"
        />
      </div>

      {/* Add New Memory Toggle / Form */}
      <div className="mb-3">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/40 border border-cyan-500/40 text-xs font-semibold text-cyan-200 transition shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Store New Episodic Memory</span>
          </button>
        ) : (
          <form onSubmit={handleAddMemory} className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">Store Memory Fact</span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Fact / Context Snippet</label>
              <textarea
                rows={2}
                placeholder="e.g. Founder prefers Courier bookings automatically assigned to Steadfast before 4 PM."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <label className="text-[11px] text-zinc-400">Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="px-2 py-1 rounded bg-black/60 border border-white/15 text-white text-[11px] focus:outline-none"
                >
                  <option value="fact">Fact</option>
                  <option value="preference">Preference</option>
                  <option value="style">Style</option>
                  <option value="project_context">Project Context</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Storing..." : "Memorize"}
                </button>
              </div>
            </div>

            {error && <p className="text-[11px] text-rose-400">{error}</p>}
          </form>
        )}
      </div>

      {/* Memory Chunks List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-zinc-400 text-xs gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
            <span>Searching semantic memory vectors...</span>
          </div>
        ) : !memories || memories.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-xs">
            No memories found matching &quot;{searchQuery}&quot;.
          </div>
        ) : (
          (memories || []).map((mem) => (
            <div
              key={mem.id}
              className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="px-1.5 py-0.5 rounded font-mono uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {mem.category || "fact"}
                </span>
                {typeof mem.score === "number" && (
                  <span className="text-zinc-500 font-mono">
                    match: {(mem.score * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed">{mem.content}</p>
            </div>
          ))
        )}
      </div>
    </LiquidGlassCard>
  );
}

export default MemoryViewer;
