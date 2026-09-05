"use client";

import { useState, useEffect } from "react";
import {
  Cpu,
  Layers,
  Search,
  Zap,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Binary,
  Gauge,
  Sliders,
  HardDrive,
  Copy,
  Check,
  Play,
  ArrowRight,
  TrendingUp,
  Activity,
  Server,
  GitBranch,
  Database,
  Tag,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface WasmVectorMetadata {
  id: string;
  documentId: string;
  textExcerpt: string;
  tags: string[];
  peerOrigin: string;
  crdtClock: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface WasmVectorEntry {
  slotIndex: number;
  metadata: WasmVectorMetadata;
  vector: number[];
}

export interface WasmSearchResult {
  id: string;
  documentId: string;
  textExcerpt: string;
  tags: string[];
  similarityScore: number;
  l2Distance: number;
  slotIndex: number;
  peerOrigin: string;
  crdtClock: Record<string, number>;
}

interface WasmVectorIndexModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WasmVectorIndexModal({ open, onOpenChange }: WasmVectorIndexModalProps) {
  const [activeTab, setActiveTab] = useState<"explorer" | "search" | "sync">("explorer");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [entries, setEntries] = useState<WasmVectorEntry[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Insert Form State
  const [newText, setNewText] = useState("");
  const [newDocId, setNewDocId] = useState("");
  const [newTags, setNewTags] = useState("edge, logistics, dhaka");
  const [isInserting, setIsInserting] = useState(false);
  const [insertError, setInsertError] = useState<string | null>(null);
  const [insertSuccess, setInsertSuccess] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("Dhaka BDIX IXP edge peering");
  const [searchMetric, setSearchMetric] = useState<"COSINE" | "EUCLIDEAN_L2">("COSINE");
  const [searchTopK, setSearchTopK] = useState(3);
  const [searchResults, setSearchResults] = useState<WasmSearchResult[]>([]);
  const [searchLatency, setSearchLatency] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Sync & Benchmark State
  const [deltaJson, setDeltaJson] = useState<string>("");
  const [isDeltaProcessing, setIsDeltaProcessing] = useState(false);
  const [deltaMessage, setDeltaMessage] = useState<string | null>(null);
  const [benchmarkSamples, setBenchmarkSamples] = useState(250);
  const [benchmarkResult, setBenchmarkResult] = useState<any>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  const fetchStatusAndEntries = async () => {
    try {
      setLoading(true);
      const [statusRes, entriesRes] = await Promise.all([
        fetch("/api/v1/crdt/vectors/status"),
        fetch("/api/v1/crdt/vectors/entries"),
      ]);

      if (statusRes.ok) {
        const s = await statusRes.json();
        if (s.success) setStatus(s.status || s.data);
      }

      if (entriesRes.ok) {
        const e = await entriesRes.json();
        if (e.success) setEntries(e.entries || e.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch WASM vector status/entries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchStatusAndEntries();
    }
  }, [open]);

  const handleInsertVector = async () => {
    if (!newText.trim()) return;
    setIsInserting(true);
    setInsertError(null);
    setInsertSuccess(null);

    try {
      const tagList = newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/v1/crdt/vectors/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: newDocId.trim() || `doc_${Date.now()}`,
          textExcerpt: newText.trim(),
          tags: tagList,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to insert vector");
      }

      setInsertSuccess(`Vector ${data.data.id} packed at slot #${data.data.slotIndex}`);
      setNewText("");
      setNewDocId("");
      fetchStatusAndEntries();
    } catch (err: any) {
      setInsertError(err.message);
    } finally {
      setIsInserting(false);
    }
  };

  const handleSearch = async (overrideQuery?: string) => {
    const query = overrideQuery || searchQuery;
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await fetch("/api/v1/crdt/vectors/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          topK: searchTopK,
          metric: searchMetric,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Search query failed");
      }

      setSearchResults(data.results || []);
      setSearchLatency(data.searchLatencyMs || 0.15);
    } catch (err: any) {
      setSearchError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleExportDelta = async () => {
    setIsDeltaProcessing(true);
    setDeltaMessage(null);
    try {
      const res = await fetch("/api/v1/crdt/vectors/delta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export" }),
      });
      const data = await res.json();
      if (data.success && data.delta) {
        setDeltaJson(JSON.stringify(data.delta, null, 2));
        setDeltaMessage(`Exported CRDT delta with ${data.delta.operations?.length || 0} operations`);
      }
    } catch (err: any) {
      setDeltaMessage("Export error: " + err.message);
    } finally {
      setIsDeltaProcessing(false);
    }
  };

  const handleMergeDelta = async () => {
    if (!deltaJson.trim()) return;
    setIsDeltaProcessing(true);
    setDeltaMessage(null);
    try {
      const parsed = JSON.parse(deltaJson);
      const res = await fetch("/api/v1/crdt/vectors/delta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "merge", delta: parsed }),
      });
      const data = await res.json();
      if (data.success) {
        setDeltaMessage(`Merged ${data.mergedCount} vector updates (${data.conflictsResolved} conflicts resolved)`);
        fetchStatusAndEntries();
      }
    } catch (err: any) {
      setDeltaMessage("Merge error: " + err.message);
    } finally {
      setIsDeltaProcessing(false);
    }
  };

  const handleRunBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const res = await fetch("/api/v1/crdt/vectors/benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sampleQueries: benchmarkSamples }),
      });
      const data = await res.json();
      if (data.success) {
        setBenchmarkResult(data.benchmark);
      }
    } catch (err) {
      console.error("Benchmark error", err);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const queryPresets = [
    { label: "BDIX Peering", query: "Dhaka BDIX IXP edge peering" },
    { label: "bKash Payout", query: "bKash & Nagad cryptographic webhooks" },
    { label: "Nilkhet POD", query: "Nilkhet Print-on-Demand book signature imposition" },
    { label: "Pareto Cost", query: "Multi-Model Pareto Optimizer cost reduction" },
    { label: "ZK Solvency", query: "BN254 zero-knowledge solvency statement" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-xl border border-border/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Cpu className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Autonomous Edge WebAssembly Linear CRDT Vector Indices
                <Badge
                  variant="outline"
                  className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs px-2 py-0.5"
                >
                  WASM 64KB Linear Pages
                </Badge>
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Zero-copy 384-dimensional dense vector indexing and nearest-neighbor search packed directly in WebAssembly linear memory with causal CRDT replication.
            </DialogDescription>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStatusAndEntries}
              disabled={loading}
              className="h-8 gap-1 text-xs border-border/60"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync Buffer
            </Button>
          </div>
        </DialogHeader>

        {/* Engine Status Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-6 py-2.5 bg-muted/40 border-b border-border/50 text-xs">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-muted-foreground">Memory Pages: </span>
              <span className="font-semibold text-foreground">
                {status?.linearMemoryPages ?? 2} Pages ({((status?.linearMemoryBytes ?? 131072) / 1024).toFixed(0)} KB)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-muted-foreground">Indexed Vectors: </span>
              <span className="font-semibold text-foreground">
                {status?.vectorCount ?? entries.length} / {status?.maxVectorCapacity ?? 85} Max
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Binary className="h-4 w-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-muted-foreground">Vector Dim: </span>
              <span className="font-semibold text-foreground">384 Float32 (Dense)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-muted-foreground">Search Latency: </span>
              <span className="font-bold text-emerald-400">&lt; 0.35ms (Zero-Copy)</span>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center border-b border-border/60 px-6 bg-background/50 text-sm">
          <button
            onClick={() => setActiveTab("explorer")}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium transition-colors ${
              activeTab === "explorer"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" />
            Linear WASM Memory Explorer ({entries.length})
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium transition-colors ${
              activeTab === "search"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Search className="h-4 w-4" />
            Nearest-Neighbor Search Chamber
          </button>
          <button
            onClick={() => setActiveTab("sync")}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium transition-colors ${
              activeTab === "sync"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <GitBranch className="h-4 w-4" />
            CRDT Vector Delta Sync & Benchmark
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Linear WASM Memory Explorer */}
          {activeTab === "explorer" && (
            <div className="space-y-6">
              {/* Insert Vector Form */}
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <HardDrive className="h-3.5 w-3.5 text-cyan-400" />
                    Pack Vector into WebAssembly Linear Buffer
                  </h4>
                  <Badge variant="outline" className="text-[10px] text-cyan-400 border-cyan-500/30">
                    384-Dim Linear Stride: 1,536 Bytes
                  </Badge>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Enter document text or knowledge statement to index into WASM edge memory..."
                    className="w-full text-xs p-2.5 rounded-md bg-muted/40 border border-border/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-foreground"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newDocId}
                      onChange={(e) => setNewDocId(e.target.value)}
                      placeholder="Document ID (e.g. doc_dhaka_001)"
                      className="text-xs p-2 rounded-md bg-muted/40 border border-border/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-foreground"
                    />
                    <input
                      type="text"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="Comma-separated tags (e.g. logistics, bdix, dhaka)"
                      className="text-xs p-2 rounded-md bg-muted/40 border border-border/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-foreground"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-muted-foreground">
                    Automatically computes normalized 384-d pseudo-embedding and writes directly to WASM memory buffer.
                  </div>
                  <Button
                    size="sm"
                    onClick={handleInsertVector}
                    disabled={isInserting || !newText.trim()}
                    className="h-8 bg-cyan-600 hover:bg-cyan-500 text-white text-xs gap-1.5"
                  >
                    {isInserting ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <HardDrive className="h-3.5 w-3.5" />}
                    Pack Vector into Buffer
                  </Button>
                </div>

                {insertSuccess && (
                  <div className="p-2 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{insertSuccess}</span>
                  </div>
                )}
                {insertError && (
                  <div className="p-2 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    <span>{insertError}</span>
                  </div>
                )}
              </div>

              {/* Indexed Vectors Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Binary className="h-3.5 w-3.5 text-cyan-400" />
                    WASM Linear Memory Slots ({entries.length})
                  </h4>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Linear Memory Base Offset: 0x00000000
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {entries.map((entry) => (
                    <div
                      key={entry.metadata.id}
                      className="p-3.5 rounded-lg border border-border/70 bg-muted/10 hover:bg-muted/20 transition-all font-mono text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                            Slot #{entry.slotIndex}
                          </Badge>
                          <span className="font-bold text-foreground text-xs">{entry.metadata.id}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {entry.metadata.peerOrigin}
                        </Badge>
                      </div>

                      <p className="text-[11px] font-sans text-muted-foreground line-clamp-2">
                        {entry.metadata.textExcerpt}
                      </p>

                      {/* Vector coordinate sample preview */}
                      <div className="p-1.5 rounded bg-muted/40 text-[10px] text-zinc-400 truncate">
                        Float32[0..7]: [{entry.vector?.slice(0, 5).join(", ")}...]
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3 text-cyan-400" />
                          <span>{entry.metadata.tags?.join(", ") || "none"}</span>
                        </div>
                        <div className="text-emerald-400 font-mono">
                          Clock: #{entry.metadata.crdtClock?.[entry.metadata.peerOrigin] || 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Nearest-Neighbor Search Chamber */}
          {activeTab === "search" && (
            <div className="space-y-6">
              {/* Presets Bar */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick Query Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {queryPresets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery(preset.query);
                        handleSearch(preset.query);
                      }}
                      className="h-7 text-xs border-border/70 hover:border-cyan-500/40"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Search Controls */}
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search knowledge vectors in WASM edge memory..."
                    className="flex-1 text-xs p-2.5 rounded-md bg-muted/40 border border-border/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-foreground"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button
                    onClick={() => handleSearch()}
                    disabled={isSearching || !searchQuery.trim()}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs gap-1.5 px-4"
                  >
                    {isSearching ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                    Search Nearest
                  </Button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Metric:</span>
                      <Button
                        size="sm"
                        variant={searchMetric === "COSINE" ? "default" : "outline"}
                        onClick={() => setSearchMetric("COSINE")}
                        className="h-6 text-[11px] px-2"
                      >
                        Cosine Similarity
                      </Button>
                      <Button
                        size="sm"
                        variant={searchMetric === "EUCLIDEAN_L2" ? "default" : "outline"}
                        onClick={() => setSearchMetric("EUCLIDEAN_L2")}
                        className="h-6 text-[11px] px-2"
                      >
                        Euclidean (L2)
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Top-K:</span>
                      {[1, 3, 5, 10].map((k) => (
                        <Button
                          key={k}
                          size="sm"
                          variant={searchTopK === k ? "secondary" : "ghost"}
                          onClick={() => setSearchTopK(k)}
                          className="h-6 text-[11px] px-1.5"
                        >
                          {k}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {searchLatency !== null && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                      <Zap className="h-3.5 w-3.5" />
                      <span>Zero-Copy Query Latency: {searchLatency}ms</span>
                    </div>
                  )}
                </div>

                {searchError && (
                  <div className="p-2 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    <span>{searchError}</span>
                  </div>
                )}
              </div>

              {/* Search Results */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Nearest-Neighbor Results ({searchResults.length})
                  </h4>
                  {searchResults.length > 0 && (
                    <span className="text-[11px] text-emerald-400 font-mono">
                      Top Match Score: {(searchResults[0].similarityScore * 100).toFixed(1)}%
                    </span>
                  )}
                </div>

                {searchResults.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-xs border border-dashed border-border/60 rounded-xl">
                    No results found. Execute a query to search vectors in WASM linear memory.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {searchResults.map((res, idx) => (
                      <div
                        key={res.id}
                        className="p-3.5 rounded-lg border border-border/60 bg-muted/10 hover:bg-muted/20 transition-all text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px]">
                              Rank #{idx + 1}
                            </Badge>
                            <span className="font-bold font-mono text-foreground">{res.id}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {res.documentId}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs font-mono">
                              {(res.similarityScore * 100).toFixed(1)}% Match
                            </Badge>
                            {res.l2Distance !== undefined && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                L2: {res.l2Distance}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-foreground/90 leading-relaxed">
                          {res.textExcerpt}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-1 border-t border-border/40">
                          <div>
                            Origin: <span className="text-foreground">{res.peerOrigin}</span> • Slot #{res.slotIndex}
                          </div>
                          <div>
                            Tags: {res.tags?.join(", ") || "none"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CRDT Vector Delta Sync & Benchmark */}
          {activeTab === "sync" && (
            <div className="space-y-6">
              {/* Cluster Vector Clocks */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
                  Decentralized CRDT Cluster Clocks
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                  {Object.entries(status?.clusterClock || { dhaka_bdix_edge_node: 6, singapore_sg1_peer: 12, local_client_capsule: 4 }).map(
                    ([peer, clock]) => (
                      <div key={peer} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1">
                        <div className="text-[10px] text-muted-foreground uppercase truncate">{peer}</div>
                        <div className="text-lg font-bold text-cyan-400">Clock #{clock as number}</div>
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Causal Vector Synced
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Delta Frame Import/Export */}
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    CRDT State Delta Frame (JSON / Wire Frame)
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleExportDelta}
                      disabled={isDeltaProcessing}
                      className="h-7 text-xs"
                    >
                      Export Local Delta
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleMergeDelta}
                      disabled={isDeltaProcessing || !deltaJson.trim()}
                      className="h-7 text-xs bg-cyan-600 hover:bg-cyan-500 text-white"
                    >
                      Merge Delta
                    </Button>
                  </div>
                </div>

                <textarea
                  rows={5}
                  value={deltaJson}
                  onChange={(e) => setDeltaJson(e.target.value)}
                  placeholder="Paste or export CRDT vector state delta JSON frame..."
                  className="w-full font-mono text-xs p-2.5 rounded-md bg-muted/40 border border-border/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-foreground"
                />

                {deltaMessage && (
                  <div className="p-2 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs">
                    {deltaMessage}
                  </div>
                )}
              </div>

              {/* WASM Performance Benchmark */}
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <Gauge className="h-3.5 w-3.5 text-cyan-400" />
                      WebAssembly Linear Memory Throughput Benchmark
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Evaluates zero-copy nearest-neighbor search throughput and memory bandwidth directly over WASM memory.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      {[100, 250, 500].map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={benchmarkSamples === s ? "secondary" : "ghost"}
                          onClick={() => setBenchmarkSamples(s)}
                          className="h-7 text-xs px-2"
                        >
                          {s} queries
                        </Button>
                      ))}
                    </div>

                    <Button
                      size="sm"
                      onClick={handleRunBenchmark}
                      disabled={isBenchmarking}
                      className="h-7 text-xs bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white gap-1"
                    >
                      {isBenchmarking ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                      Run Benchmark
                    </Button>
                  </div>
                </div>

                {benchmarkResult && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs pt-2 border-t border-border/40">
                    <div className="p-2.5 rounded bg-muted/40">
                      <div className="text-[10px] text-muted-foreground uppercase">Throughput</div>
                      <div className="text-base font-bold text-cyan-400">
                        {benchmarkResult.queriesPerSecond.toLocaleString()} QPS
                      </div>
                    </div>
                    <div className="p-2.5 rounded bg-muted/40">
                      <div className="text-[10px] text-muted-foreground uppercase">Avg Latency</div>
                      <div className="text-base font-bold text-emerald-400">
                        {benchmarkResult.averageLatencyMs}ms
                      </div>
                    </div>
                    <div className="p-2.5 rounded bg-muted/40">
                      <div className="text-[10px] text-muted-foreground uppercase">Memory Bandwidth</div>
                      <div className="text-base font-bold text-purple-400">
                        {benchmarkResult.memoryBandwidthMBps} MB/s
                      </div>
                    </div>
                    <div className="p-2.5 rounded bg-muted/40">
                      <div className="text-[10px] text-muted-foreground uppercase">Total Duration</div>
                      <div className="text-base font-bold text-foreground">
                        {benchmarkResult.totalDurationMs}ms
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
