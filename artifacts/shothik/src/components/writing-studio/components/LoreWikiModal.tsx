import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Sparkles,
  Search,
  Filter,
  Layers,
  Film,
  Compass,
  ShieldAlert,
  Tag,
  PlusCircle,
  CheckCircle2,
  X,
  RefreshCw,
  ExternalLink,
  Copy,
  FolderGit2
} from "lucide-react";

export type LoreCategory =
  | "Character"
  | "Faction"
  | "Location"
  | "Artifact"
  | "Historical Event"
  | "Magic / Technology Law";

export interface LoreEntity {
  id: string;
  name: string;
  nameBn: string;
  category: LoreCategory;
  categoryBn: string;
  aliases: string[];
  summary: string;
  summaryBn: string;
  firstMentionChapter: string;
  threatLevelOrSignificance: "Minor" | "Major" | "Cataclysmic / Core";
  crossReferences: string[];
  ipPitchSynopsis: string;
  attributes: Record<string, string>;
}

export interface TransmediaPitchDeck {
  logline: string;
  loglineBn: string;
  worldTone: string;
  targetDemographic: string;
  franchisePotentialScore: number;
  franchiseComparisons: string[];
  recommendedAdaptationMedium: "TV Mini-series" | "Feature Film" | "RPG Video Game" | "Webtoon / Graphic Novel";
}

export interface LoreWikiState {
  projectId: string;
  wikiTitle: string;
  wikiTitleBn: string;
  lastScannedAt: string;
  totalEntitiesCount: number;
  entities: LoreEntity[];
  transmediaPitchDeck: TransmediaPitchDeck;
}

interface LoreWikiModalProps {
  isOpen: boolean;
  onClose: () => void;
  manuscriptText: string;
  projectId?: string;
  onInsertLore: (loreSnippet: string) => void;
}

export const LoreWikiModal: React.FC<LoreWikiModalProps> = ({
  isOpen,
  onClose,
  manuscriptText,
  projectId = "proj_demo_bengali",
  onInsertLore
}) => {
  const [wikiData, setWikiData] = useState<LoreWikiState | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"bible" | "transmedia" | "matrix" | "add">("bible");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [insertedNotice, setInsertedNotice] = useState<string | null>(null);

  // Form state for adding custom entity
  const [newName, setNewName] = useState("");
  const [newNameBn, setNewNameBn] = useState("");
  const [newCategory, setNewCategory] = useState<LoreCategory>("Character");
  const [newSummary, setNewSummary] = useState("");
  const [newThreat, setNewThreat] = useState<"Minor" | "Major" | "Cataclysmic / Core">("Major");

  useEffect(() => {
    if (isOpen) {
      loadState();
    }
  }, [isOpen, projectId]);

  const loadState = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/lore-wiki/state`);
      if (res.ok) {
        const json = await res.json();
        setWikiData(json);
      }
    } catch (e) {
      console.error("Failed to load lore wiki state:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleScanManuscript = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/lore-wiki/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manuscript: manuscriptText })
      });
      if (res.ok) {
        const json = await res.json();
        setWikiData(json);
      }
    } catch (e) {
      console.error("Failed to scan manuscript lore:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSummary.trim()) return;

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/lore-wiki/entities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          nameBn: newNameBn.trim() || newName.trim(),
          category: newCategory,
          summary: newSummary.trim(),
          threatLevelOrSignificance: newThreat
        })
      });
      if (res.ok) {
        await loadState();
        setNewName("");
        setNewNameBn("");
        setNewSummary("");
        setActiveTab("bible");
      }
    } catch (e) {
      console.error("Failed to add custom entity:", e);
    }
  };

  const filteredEntities = useMemo(() => {
    if (!wikiData) return [];
    return wikiData.entities.filter((item) => {
      const matchesCategory =
        selectedCategory === "ALL" || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.nameBn.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.aliases.some((a) => a.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [wikiData, selectedCategory, searchQuery]);

  const handleInsertEntityMarkdown = (entity: LoreEntity) => {
    const snippet = `\n\n> **[[${entity.name} | ${entity.nameBn}]]** (${entity.category})\n> *${entity.summary}*\n> *Significance: ${entity.threatLevelOrSignificance}*\n\n`;
    onInsertLore(snippet);
    setInsertedNotice(`Inserted [[${entity.name}]] into manuscript!`);
    setTimeout(() => setInsertedNotice(null), 3000);
  };

  const handleCopyLink = (name: string, id: string) => {
    navigator.clipboard.writeText(`[[${name}]]`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl border border-indigo-500/30 bg-slate-900/95 text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Autonomous World Lore Wiki & Encyclopedia Engine
                </h2>
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                  Cap #31
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {wikiData?.wikiTitleBn || "মহাবিশ্ব এনসাইক্লোপিডিয়া ও লোর বাইবেল"} • {wikiData?.totalEntitiesCount || 0} Registered Lore Entities
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleScanManuscript}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-600/20 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-600/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Scan Manuscript
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900 px-6 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("bible")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "bible"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              World Bible ({wikiData?.entities?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("transmedia")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "transmedia"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Film className="h-3.5 w-3.5" />
              IP & Transmedia Pitch Deck
            </button>
            <button
              onClick={() => setActiveTab("matrix")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "matrix"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <FolderGit2 className="h-3.5 w-3.5" />
              Cross-Reference Matrix
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === "add"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Add Lore Node
            </button>
          </div>

          {insertedNotice && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md animate-pulse">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {insertedNotice}
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: WORLD BIBLE */}
          {activeTab === "bible" && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search characters, factions, locations, artifacts, laws..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/70 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {["ALL", "Character", "Faction", "Location", "Artifact", "Historical Event", "Magic"].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all whitespace-nowrap ${
                          selectedCategory === cat
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                            : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Entities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEntities.map((entity) => {
                  const isCataclysmic = entity.threatLevelOrSignificance === "Cataclysmic / Core";
                  return (
                    <div
                      key={entity.id}
                      className="group flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-950/50 p-4 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all shadow-md"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors">
                                {entity.name}
                              </h3>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                  isCataclysmic
                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                                    : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                }`}
                              >
                                {entity.category}
                              </span>
                            </div>
                            <p className="text-xs text-indigo-400/80 font-medium">{entity.nameBn}</p>
                          </div>
                          <span className="text-[11px] text-slate-500 whitespace-nowrap">
                            {entity.firstMentionChapter}
                          </span>
                        </div>

                        {entity.aliases.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-500">Aliases:</span>
                            {entity.aliases.map((alias, i) => (
                              <span
                                key={i}
                                className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-300"
                              >
                                {alias}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-xs text-slate-300 leading-relaxed">{entity.summary}</p>
                        <p className="text-xs text-slate-400 italic font-bangla">{entity.summaryBn}</p>

                        {/* Custom Attributes */}
                        {Object.keys(entity.attributes).length > 0 && (
                          <div className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800 text-[11px] space-y-1">
                            {Object.entries(entity.attributes).map(([k, v]) => (
                              <div key={k} className="flex justify-between gap-2">
                                <span className="text-slate-400">{k}:</span>
                                <span className="text-slate-200 font-medium text-right">{v}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Cross References */}
                        {entity.crossReferences.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[10px] text-slate-500">Linked Nodes:</span>
                            {entity.crossReferences.map((refId) => {
                              const refEntity = wikiData?.entities.find((e) => e.id === refId);
                              return (
                                <span
                                  key={refId}
                                  className="rounded-full bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 text-[10px] text-indigo-300 font-mono"
                                >
                                  [[{refEntity?.name || refId}]]
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Card Action Bar */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
                        <button
                          onClick={() => handleCopyLink(entity.name, entity.id)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-300 transition-colors"
                        >
                          {copiedId === entity.id ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied [[wiki link]]</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy Tag</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleInsertEntityMarkdown(entity)}
                          className="flex items-center gap-1 rounded bg-indigo-600/30 border border-indigo-500/40 px-2.5 py-1 text-[11px] font-medium text-indigo-200 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          Insert Lore into Manuscript
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TRANSMEDIA PITCH DECK */}
          {activeTab === "transmedia" && wikiData?.transmediaPitchDeck && (
            <div className="space-y-6">
              {/* Franchise Score Header */}
              <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-indigo-950/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <Film className="h-5 w-5 text-indigo-400" />
                    <h3 className="text-base font-bold text-white tracking-wide">
                      IP & Transmedia Adaptation Viability
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Automated Hollywood / Global Streaming valuation based on narrative richness, world-building lore density, faction conflict potential, and cross-medium translatability.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-slate-400 font-medium">Recommended Format:</span>
                    <span className="rounded-lg bg-indigo-600/30 border border-indigo-500/40 px-2.5 py-0.5 text-xs font-bold text-indigo-200">
                      {wikiData.transmediaPitchDeck.recommendedAdaptationMedium}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-950/80 border border-indigo-500/30 p-4 min-w-[140px] text-center shadow-inner">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                    Franchise Score
                  </span>
                  <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-emerald-300 to-teal-200 py-1">
                    {wikiData.transmediaPitchDeck.franchisePotentialScore}
                    <span className="text-lg text-slate-400 font-normal">/100</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">Tier 1 Global IP</span>
                </div>
              </div>

              {/* Pitch Deck Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                    Logline (Executive Pitch)
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    "{wikiData.transmediaPitchDeck.logline}"
                  </p>
                  <p className="text-xs text-slate-400 font-bangla italic">
                    "{wikiData.transmediaPitchDeck.loglineBn}"
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                    World Tone & Aesthetic Palette
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {wikiData.transmediaPitchDeck.worldTone}
                  </p>
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Target Demographic:</span>
                    <p className="text-xs text-slate-300 font-medium">
                      {wikiData.transmediaPitchDeck.targetDemographic}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comparative Titles */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Franchise Comps (Box Office & Streaming Precedents)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {wikiData.transmediaPitchDeck.franchiseComparisons.map((comp, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-slate-900 border border-slate-800 p-3 text-center text-xs font-semibold text-slate-200"
                    >
                      {comp}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CROSS-REFERENCE MATRIX */}
          {activeTab === "matrix" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Bidirectional dependency graph showing how world lore nodes interact across chapters.
              </p>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-[11px] font-semibold uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Lore Entity</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Significance</th>
                      <th className="px-4 py-3">Direct Interconnections</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {wikiData?.entities.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">
                          <div>{item.name}</div>
                          <div className="text-[10px] text-indigo-400/80 font-bangla">{item.nameBn}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                              item.threatLevelOrSignificance === "Cataclysmic / Core"
                                ? "text-rose-400 bg-rose-500/10"
                                : "text-indigo-400 bg-indigo-500/10"
                            }`}
                          >
                            {item.threatLevelOrSignificance}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {item.crossReferences.map((refId) => {
                              const refEntity = wikiData.entities.find((e) => e.id === refId);
                              return (
                                <span
                                  key={refId}
                                  className="rounded bg-indigo-950/80 border border-indigo-800/40 px-1.5 py-0.5 text-[10px] text-indigo-300"
                                >
                                  {refEntity?.name || refId}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ADD LORE NODE FORM */}
          {activeTab === "add" && (
            <form onSubmit={handleCreateEntity} className="space-y-4 max-w-xl mx-auto py-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-4 shadow-lg">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <PlusCircle className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Register New World Lore Node</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Entity Name (English)</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. The Indigo Guild"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Entity Name (Bengali)</label>
                    <input
                      type="text"
                      value={newNameBn}
                      onChange={(e) => setNewNameBn(e.target.value)}
                      placeholder="e.g. নীল গিল্ড"
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as LoreCategory)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Character">Character</option>
                      <option value="Faction">Faction</option>
                      <option value="Location">Location</option>
                      <option value="Artifact">Artifact</option>
                      <option value="Historical Event">Historical Event</option>
                      <option value="Magic / Technology Law">Magic / Technology Law</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Narrative Significance</label>
                    <select
                      value={newThreat}
                      onChange={(e) => setNewThreat(e.target.value as any)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Minor">Minor</option>
                      <option value="Major">Major</option>
                      <option value="Cataclysmic / Core">Cataclysmic / Core</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Lore Description & Backstory</label>
                  <textarea
                    rows={3}
                    required
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    placeholder="Enter detailed lore summary, historical roots, and significance to the plot..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white py-2 text-xs font-semibold shadow-md transition-all"
                >
                  Save Node to Project Encyclopedia
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
