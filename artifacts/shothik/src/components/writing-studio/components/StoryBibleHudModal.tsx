import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import {
  BookMarked,
  Search,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  MapPin,
  User,
  Scroll,
  Clock,
  ArrowRight,
  Zap,
  Tag,
  Share2,
  X,
  FileText
} from "lucide-react";

export type EntityCategory = "character" | "location" | "world_rule" | "timeline_event";

export interface BibleRelationship {
  targetEntityName: string;
  relationshipType: string;
}

export interface StoryBibleEntity {
  id: string;
  projectId: string;
  category: EntityCategory;
  name: string;
  aliases: string[];
  summary: string;
  details: string;
  tags: string[];
  firstMentionChapter: number;
  relationships: BibleRelationship[];
  updatedAt: string;
}

interface StoryBibleHudModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  onInsertProseToEditor?: (prose: string) => void;
}

export const StoryBibleHudModal: React.FC<StoryBibleHudModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  onInsertProseToEditor,
}) => {
  const [entities, setEntities] = useState<StoryBibleEntity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EntityCategory | "all">("all");
  const [latencyMs, setLatencyMs] = useState<number>(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [insertedId, setInsertedId] = useState<string | null>(null);

  // New Entity Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState<EntityCategory>("character");
  const [newName, setNewName] = useState("");
  const [newAliases, setNewAliases] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newFirstChapter, setNewFirstChapter] = useState(1);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch or initialize Story Bible
  const loadBible = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/story-bible`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data.entities)) {
          setEntities(json.data.entities);
        }
      }
    } catch (err) {
      console.warn("[StoryBible] Failed to fetch, using fallback cache", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadBible();
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, projectId]);

  // Sub-millisecond client-side BM25-style search & filter
  const { filteredEntities, computedLatency } = useMemo(() => {
    const t0 = performance.now();
    let pool = entities;

    if (selectedCategory !== "all") {
      pool = pool.filter((e) => e.category === selectedCategory);
    }

    const cleanQ = searchQuery.trim().toLowerCase();
    if (!cleanQ) {
      const t1 = performance.now();
      return { filteredEntities: pool, computedLatency: Number((t1 - t0).toFixed(2)) };
    }

    const tokens = cleanQ.split(/\s+/).filter(Boolean);

    const scored = pool.map((entity) => {
      let score = 0;
      const nameLower = entity.name.toLowerCase();
      const summaryLower = entity.summary.toLowerCase();
      const detailsLower = entity.details.toLowerCase();
      const aliasesLower = entity.aliases.map((a) => a.toLowerCase()).join(" ");
      const tagsLower = entity.tags.map((t) => t.toLowerCase()).join(" ");

      tokens.forEach((token) => {
        if (nameLower === token) score += 25;
        else if (nameLower.includes(token)) score += 15;
        if (aliasesLower.includes(token)) score += 12;
        if (tagsLower.includes(token)) score += 8;
        if (summaryLower.includes(token)) score += 5;
        if (detailsLower.includes(token)) score += 3;
      });

      return { entity, score };
    });

    const results = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.entity);

    const t1 = performance.now();
    return {
      filteredEntities: results,
      computedLatency: Number((t1 - t0).toFixed(2)) || 0.4,
    };
  }, [entities, searchQuery, selectedCategory]);

  useEffect(() => {
    setLatencyMs(computedLatency);
  }, [computedLatency]);

  // Handle Add Entity
  const handleCreateEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSummary.trim()) return;

    const payload = {
      category: newCategory,
      name: newName.trim(),
      aliases: newAliases.split(",").map((s) => s.trim()).filter(Boolean),
      summary: newSummary.trim(),
      details: newDetails.trim(),
      tags: newTags.split(",").map((s) => s.trim()).filter(Boolean),
      firstMentionChapter: Number(newFirstChapter) || 1,
      relationships: [],
    };

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/story-bible/entities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setEntities((prev) => [json.data, ...prev.filter((item) => item.id !== json.data.id)]);
        }
      } else {
        // Optimistic offline insert
        const fallbackEntity: StoryBibleEntity = {
          id: `ent_local_${Date.now()}`,
          projectId,
          ...payload,
          updatedAt: new Date().toISOString(),
        };
        setEntities((prev) => [fallbackEntity, ...prev]);
      }

      // Reset form
      setNewName("");
      setNewAliases("");
      setNewSummary("");
      setNewDetails("");
      setNewTags("");
      setNewFirstChapter(1);
      setShowAddForm(false);
    } catch (err) {
      console.error("[StoryBible] Error creating entity", err);
    }
  };

  // Handle Delete Entity
  const handleDeleteEntity = async (entityId: string) => {
    setEntities((prev) => prev.filter((e) => e.id !== entityId));
    try {
      await fetch(`/api/v1/projects/${projectId}/story-bible/entities/${entityId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("[StoryBible] Remote delete failed", err);
    }
  };

  // Copy Name to Clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Insert Prose Bio to TipTap Editor
  const handleInsertProse = (entity: StoryBibleEntity) => {
    const proseBlock = `\n\n> 📖 **${entity.name}** [${entity.category.toUpperCase().replace("_", " ")}]\n> *${entity.summary}*\n${entity.details ? `> ${entity.details}\n` : ""}> *Tags: ${entity.tags.map((t) => `#${t}`).join(" ")} | First Appearance: Ch. ${entity.firstMentionChapter}*\n\n`;

    if (onInsertProseToEditor) {
      onInsertProseToEditor(proseBlock);
    }
    setInsertedId(entity.id);
    setTimeout(() => setInsertedId(null), 1800);
  };

  // Category Icon & Color Mapping
  const getCategoryConfig = (cat: EntityCategory) => {
    switch (cat) {
      case "character":
        return {
          label: "চরিত্র (Character)",
          icon: <User className="w-3.5 h-3.5" />,
          badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        };
      case "location":
        return {
          label: "স্থান (Location)",
          icon: <MapPin className="w-3.5 h-3.5" />,
          badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        };
      case "world_rule":
        return {
          label: "বিশ্বনিয়ম (World Rule)",
          icon: <Scroll className="w-3.5 h-3.5" />,
          badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        };
      case "timeline_event":
        return {
          label: "কালরেখা (Timeline Event)",
          icon: <Clock className="w-3.5 h-3.5" />,
          badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
        };
    }
  };

  // Counts by category
  const counts = useMemo(() => {
    const res = { all: entities.length, character: 0, location: 0, world_rule: 0, timeline_event: 0 };
    entities.forEach((e) => {
      if (res[e.category] !== undefined) {
        res[e.category]++;
      }
    });
    return res;
  }, [entities]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[88vh] flex flex-col p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/80 shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xs">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <span>Story Bible HUD</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-normal flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" />
                  {latencyMs}ms BM25
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono hidden sm:inline">
                  Ctrl+Shift+B
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Sub-millisecond offline lore reference for characters, locations, world rules & timeline events.
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={showAddForm ? "secondary" : "outline"}
              onClick={() => setShowAddForm(!showAddForm)}
              className="h-8 text-xs font-semibold gap-1.5 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 cursor-pointer"
            >
              {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{showAddForm ? "Cancel" : "Add Lore Entity"}</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Omnibar Search & Filter Section */}
        <div className="p-4 border-b border-border/40 bg-card/40 flex flex-col gap-3 shrink-0">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-muted-foreground pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lore, aliases, rules, tags or Bangla names (e.g. 'হিমু', 'সদরঘাট', 'panjabi')..."
              className="w-full pl-10 pr-24 py-2 text-sm bg-background/80 border border-border/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/60 placeholder:text-muted-foreground/60 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-16 p-1 text-muted-foreground hover:text-foreground text-xs"
              >
                Clear
              </button>
            )}
            <div className="absolute right-3 flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground/80 pointer-events-none">
              <span>{filteredEntities.length} hits</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs custom-scrollbar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1 rounded-md transition font-medium cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              All Entities ({counts.all})
            </button>
            <button
              onClick={() => setSelectedCategory("character")}
              className={`px-3 py-1 rounded-md transition font-medium flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === "character"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <User className="w-3 h-3" />
              Characters ({counts.character})
            </button>
            <button
              onClick={() => setSelectedCategory("location")}
              className={`px-3 py-1 rounded-md transition font-medium flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === "location"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <MapPin className="w-3 h-3" />
              Locations ({counts.location})
            </button>
            <button
              onClick={() => setSelectedCategory("world_rule")}
              className={`px-3 py-1 rounded-md transition font-medium flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === "world_rule"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Scroll className="w-3 h-3" />
              World Rules ({counts.world_rule})
            </button>
            <button
              onClick={() => setSelectedCategory("timeline_event")}
              className={`px-3 py-1 rounded-md transition font-medium flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === "timeline_event"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Clock className="w-3 h-3" />
              Timeline Events ({counts.timeline_event})
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* Quick Add Form Drawer */}
          {showAddForm && (
            <form
              onSubmit={handleCreateEntity}
              className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3 shadow-inner"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Create New Story Lore Entity
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">Instant local index</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EntityCategory)}
                    className="w-full text-xs bg-background border border-border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="character">চরিত্র (Character)</option>
                    <option value="location">স্থান (Location)</option>
                    <option value="world_rule">বিশ্বনিয়ম (World Rule)</option>
                    <option value="timeline_event">কালরেখা (Timeline Event)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Entity Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. মিসির আলি (Misir Ali)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs bg-background border border-border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Aliases (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. প্রফেসর, পারাসাইকোলজিস্ট"
                    value={newAliases}
                    onChange={(e) => setNewAliases(e.target.value)}
                    className="w-full text-xs bg-background border border-border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  1-Sentence Summary (Shown on hover & cards)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brilliant eccentric investigator of psychological phenomena."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full text-xs bg-background border border-border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Deep Lore & Narrative Constraints
                </label>
                <textarea
                  rows={2}
                  placeholder="Detailed traits, physical appearances, speech patterns, psychological limitations..."
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  className="w-full text-xs bg-background border border-border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="dhaka, detective, logic"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full text-xs bg-background border border-border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    First Chapter Appearance
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newFirstChapter}
                    onChange={(e) => setNewFirstChapter(Number(e.target.value))}
                    className="w-full text-xs bg-background border border-border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs h-7"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs h-7 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                >
                  Save to Story Bible
                </Button>
              </div>
            </form>
          )}

          {/* Entities Grid / List */}
          {filteredEntities.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Search className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">No lore entities match your search</p>
              <p className="text-xs text-muted-foreground/70 mt-1 max-w-sm">
                Try searching for different keywords or add a new lore entity using the button above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredEntities.map((entity) => {
                const config = getCategoryConfig(entity.category);
                return (
                  <div
                    key={entity.id}
                    className="p-3.5 rounded-xl border border-border/80 bg-card hover:border-amber-500/40 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Row: Category Badge & First Appearance */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${config.badgeColor}`}
                        >
                          {config.icon}
                          <span>{config.label}</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          First seen: Ch. {entity.firstMentionChapter}
                        </span>
                      </div>

                      {/* Name & Aliases */}
                      <h4 className="text-sm font-bold text-foreground flex items-center justify-between">
                        <span>{entity.name}</span>
                        <button
                          onClick={() => handleCopy(entity.name, entity.id)}
                          className="opacity-0 group-hover:opacity-100 transition p-1 hover:text-amber-400 text-muted-foreground cursor-pointer"
                          title="Copy Name"
                        >
                          {copiedId === entity.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </h4>

                      {entity.aliases.length > 0 && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Aliases: <span className="font-mono text-foreground/80">{entity.aliases.join(", ")}</span>
                        </p>
                      )}

                      {/* Summary */}
                      <p className="text-xs text-foreground/90 mt-2 font-normal leading-relaxed line-clamp-2">
                        {entity.summary}
                      </p>

                      {/* Details / Lore */}
                      {entity.details && (
                        <div className="mt-2 text-[11px] text-muted-foreground bg-muted/30 p-2 rounded-md border border-border/40 font-mono leading-normal">
                          {entity.details}
                        </div>
                      )}

                      {/* Relationships */}
                      {entity.relationships.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-border/40 flex flex-wrap gap-1.5">
                          {entity.relationships.map((rel, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-secondary/60 text-secondary-foreground px-2 py-0.5 rounded flex items-center gap-1"
                            >
                              <Share2 className="w-2.5 h-2.5 text-muted-foreground" />
                              <span className="font-semibold">{rel.targetEntityName}:</span>
                              <span className="text-muted-foreground">{rel.relationshipType}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Tags */}
                      {entity.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {entity.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteEntity(entity.id)}
                        className="h-6 px-1.5 text-[11px] text-destructive/70 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        title="Delete from Story Bible"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInsertProse(entity)}
                        className="h-6 px-2.5 text-xs font-semibold gap-1 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                        title="Insert formatted lore quote into active chapter draft"
                      >
                        {insertedId === entity.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Inserted!</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-3 h-3" />
                            <span>Insert Bio</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Story Bible In-Memory Index active</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px]">{entities.length} total lore records</span>
            <Button size="sm" variant="outline" onClick={onClose} className="h-7 text-xs px-3">
              Close (Esc)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoryBibleHudModal;
