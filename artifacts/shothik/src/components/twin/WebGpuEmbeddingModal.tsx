"use client";

import { useState, useEffect } from "react";
import {
  Cpu,
  Zap,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Gauge,
  Sliders,
  HardDrive,
  Copy,
  Check,
  Play,
  Flame,
  ArrowRight,
  TrendingUp,
  Activity,
  Server,
  Fingerprint,
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

export interface SemanticCacheEntry {
  id: string;
  queryHash: string;
  queryText: string;
  cachedResponse: string;
  cosineScore?: number;
  hitCount: number;
  tokensSaved: number;
  domain: string;
  createdAt: string;
  lastAccessedAt: string;
}

export interface WebGpuDeviceProfile {
  adapterName: string;
  vendor: string;
  architecture: string;
  mode: string;
  supportedFeatures: string[];
  maxComputeWorkgroupSizeX: number;
  maxBufferSizeMB: number;
  allocatedVramMB: number;
  freeVramMB: number;
  activeModel: string;
  modelDimension: number;
}

export interface RerankCandidate {
  id: string;
  title: string;
  content: string;
  rerankedScore?: number;
}

interface WebGpuEmbeddingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WebGpuEmbeddingModal({ open, onOpenChange }: WebGpuEmbeddingModalProps) {
  const [activeTab, setActiveTab] = useState<"cache" | "benchmark" | "reranker">("cache");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [cacheEntries, setCacheEntries] = useState<SemanticCacheEntry[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Cache Lookup state
  const [lookupQuery, setLookupQuery] = useState("What is the read latency of Dhaka BDIX edge replication?");
  const [lookupThreshold, setLookupThreshold] = useState(0.85);
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Benchmark state
  const [benchmarkVectors, setBenchmarkVectors] = useState(1000);
  const [benchmarkResult, setBenchmarkResult] = useState<any>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // Reranker state
  const [rerankQuery, setRerankQuery] = useState("BDIX network peering latency");
  const [candidates, setCandidates] = useState<RerankCandidate[]>([
    {
      id: "doc_1",
      title: "Dhaka Metro Courier Logistics & Dispatch",
      content: "Amortized dispatch unit economics across Mirpur, Gulshan, and Dhanmondi hubs.",
    },
    {
      id: "doc_2",
      title: "BDIX Peering & Regional Edge Architecture",
      content: "Direct peering at Dhaka BDIX exchanges achieves sub-10ms packet transmission and SQLite WAL replication.",
    },
    {
      id: "doc_3",
      title: "bKash & Nagad MFS Merchant Settlement Gateway",
      content: "Dual-factor idempotency keys and cryptographic webhook signatures for merchant payouts.",
    },
  ]);
  const [rerankResult, setRerankResult] = useState<RerankCandidate[] | null>(null);
  const [isReranking, setIsReranking] = useState(false);

  const fetchStatusAndCache = async () => {
    try {
      setLoading(true);
      const [statusRes, cacheRes] = await Promise.all([
        fetch("/api/v1/compute/webgpu/status"),
        fetch("/api/v1/compute/webgpu/cache/entries"),
      ]);

      if (statusRes.ok) {
        const sData = await statusRes.json();
        if (sData.success) setStatus(sData);
      }

      if (cacheRes.ok) {
        const cData = await cacheRes.json();
        if (cData.success) setCacheEntries(cData.entries);
      }
    } catch (e) {
      console.error("Failed to load WebGPU status:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchStatusAndCache();
    }
  }, [open]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!lookupQuery.trim()) return;

    setIsLookingUp(true);
    try {
      const res = await fetch("/api/v1/compute/webgpu/cache/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: lookupQuery,
          threshold: lookupThreshold,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLookupResult(data);
        await fetchStatusAndCache();
      }
    } catch (e) {
      console.error("Lookup failed:", e);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleRunBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const res = await fetch("/api/v1/compute/webgpu/benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numVectors: benchmarkVectors }),
      });
      const data = await res.json();
      if (data.success) {
        setBenchmarkResult(data);
      }
    } catch (e) {
      console.error("Benchmark failed:", e);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const handleRerank = async () => {
    if (!rerankQuery.trim()) return;
    setIsReranking(true);
    try {
      const res = await fetch("/api/v1/compute/webgpu/rerank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: rerankQuery,
          candidates,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRerankResult(data.reranked);
      }
    } catch (e) {
      console.error("Rerank failed:", e);
    } finally {
      setIsReranking(false);
    }
  };

  const handleClearCache = async () => {
    try {
      const res = await fetch("/api/v1/compute/webgpu/cache/clear", { method: "POST" });
      if (res.ok) {
        await fetchStatusAndCache();
        setLookupResult(null);
      }
    } catch (e) {
      console.error("Failed to clear cache:", e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[92vh] flex flex-col p-0 gap-0 bg-slate-950/95 border-slate-800 backdrop-blur-2xl text-slate-100 shadow-2xl overflow-hidden rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-cyan-950/40 to-slate-900/90">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-600/20 border border-cyan-500/30 shadow-inner">
                <Cpu className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                  Autonomous WebGPU Embedding & Reranking Engine
                  <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-widest bg-cyan-500/10 text-cyan-300 border-cyan-500/30">
                    BGE-m3 FP16
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5">
                  On-device client-side embedding acceleration, sub-millisecond semantic cache, and cross-encoder reranking.
                </DialogDescription>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            {status && (
              <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Acceleration Mode</span>
                  <span className="font-semibold text-cyan-300">{status.profile.mode}</span>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Semantic Hit Rate</span>
                  <span className="font-semibold text-emerald-400">{status.hitRatePercent}% Hits</span>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Avg Cache Latency</span>
                  <span className="font-semibold text-amber-300">{status.averageLatencyMs} ms</span>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">VRAM Headroom</span>
                  <span className="font-semibold text-purple-300">{status.profile.freeVramMB} MB Free</span>
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-900/40 px-6">
          <button
            onClick={() => setActiveTab("cache")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-all ${
              activeTab === "cache"
                ? "border-cyan-500 text-cyan-300 bg-cyan-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-4 h-4" />
            Semantic Cache Explorer ({cacheEntries.length})
          </button>
          <button
            onClick={() => setActiveTab("benchmark")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-all ${
              activeTab === "benchmark"
                ? "border-cyan-500 text-cyan-300 bg-cyan-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Gauge className="w-4 h-4" />
            WebGPU Compute Benchmark
          </button>
          <button
            onClick={() => setActiveTab("reranker")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-all ${
              activeTab === "reranker"
                ? "border-cyan-500 text-cyan-300 bg-cyan-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            BGE-m3 Cross-Encoder Reranker
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: SEMANTIC CACHE EXPLORER */}
          {activeTab === "cache" && (
            <div className="space-y-6">
              {/* Live Lookup Sandbox */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-cyan-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Sub-Millisecond Semantic Cache Tester
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono text-cyan-300 border-cyan-500/40">
                    Cosine Distance Match
                  </Badge>
                </div>

                {/* Presets */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-mono">Test Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setLookupQuery("What is the read latency of Dhaka BDIX edge replication?")}
                      className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                    >
                      BDIX Read Latency (Known Hit)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLookupQuery("Tell me about bKash merchant transaction fees in 2026")}
                      className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                    >
                      bKash Fees (Paraphrase Hit)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLookupQuery("How does the canary auto-rollback trigger on SLO failure?")}
                      className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                    >
                      Canary Circuit Breaker
                    </button>
                    <button
                      type="button"
                      onClick={() => setLookupQuery("What is the culinary history of Old Dhaka biryani in 1950?")}
                      className="text-[11px] px-2.5 py-1 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 rounded border border-amber-800/60"
                    >
                      Uncached Novel Query (Cold Miss)
                    </button>
                  </div>
                </div>

                <form onSubmit={handleLookup} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      placeholder="Enter query to evaluate semantic cache lookup..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400">
                        Cosine Similarity Threshold: {(lookupThreshold * 100).toFixed(0)}%
                      </span>
                      <input
                        type="range"
                        min="0.70"
                        max="0.99"
                        step="0.01"
                        value={lookupThreshold}
                        onChange={(e) => setLookupThreshold(parseFloat(e.target.value))}
                        className="w-32 accent-cyan-500 cursor-pointer"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLookingUp || !lookupQuery.trim()}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs h-8 px-4 flex items-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      {isLookingUp ? "Evaluating Cosine Sim..." : "Execute Semantic Cache Lookup"}
                    </Button>
                  </div>
                </form>

                {/* Lookup Result Banner */}
                {lookupResult && (
                  <div
                    className={`p-4 rounded-xl border animate-in fade-in space-y-2 ${
                      lookupResult.hit
                        ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-200"
                        : "bg-amber-950/30 border-amber-500/50 text-amber-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {lookupResult.hit ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                        )}
                        <span className="font-semibold text-xs font-mono">
                          {lookupResult.hit ? "ZERO-LATENCY CACHE HIT" : "CACHE MISS — ESCALATE TO MODEL"}
                        </span>
                      </div>
                      <div className="text-xs font-mono">
                        Similarity: {(lookupResult.similarity * 100).toFixed(1)}% | Latency: {lookupResult.latencyMs}ms
                      </div>
                    </div>

                    {lookupResult.entry && (
                      <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-slate-200 space-y-1">
                        <div className="text-[11px] text-slate-400 font-mono">Cached Payload:</div>
                        <p>{lookupResult.entry.cachedResponse}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cache Entries List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-mono">
                    Active Semantic Vectors ({cacheEntries.length})
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearCache}
                    className="text-xs h-7 text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    Reset Cache
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {cacheEntries.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                            {item.domain}
                          </Badge>
                          <span className="text-xs font-semibold text-slate-200">{item.queryText}</span>
                        </div>
                        <div className="text-xs font-mono text-emerald-400 font-semibold">
                          {item.hitCount} Hits ({item.tokensSaved} tokens saved)
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                        {item.cachedResponse}
                      </p>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                        <div className="truncate mr-2">Hash: {item.queryHash}</div>
                        <span>Last Accessed: {new Date(item.lastAccessedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WEBGPU COMPUTE BENCHMARK */}
          {activeTab === "benchmark" && (
            <div className="space-y-6">
              {/* Hardware Profile Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Adapter Hardware</span>
                  <div className="text-xs font-semibold text-slate-100">{status?.profile.adapterName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">Arch: {status?.profile.architecture}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Shader Capabilities</span>
                  <div className="text-xs font-semibold text-cyan-300">Float16 Tensor Subgroups</div>
                  <div className="text-[11px] text-slate-400 font-mono">Workgroup Size: {status?.profile.maxComputeWorkgroupSizeX}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">VRAM Memory Pool</span>
                  <div className="text-xs font-semibold text-purple-300">{status?.profile.freeVramMB} MB Available</div>
                  <div className="text-[11px] text-slate-400 font-mono">Allocated: {status?.profile.allocatedVramMB} MB</div>
                </div>
              </div>

              {/* Benchmark Dispatcher */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-cyan-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-cyan-400" />
                    WebGPU Tensor Compute Shader Benchmark
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono text-cyan-300 border-cyan-500/40">
                    384-Dim Dot Product Pass
                  </Badge>
                </div>

                <p className="text-xs text-slate-400">
                  Dispatches synthetic batches of unit-normalized embedding dot products directly to the WebGPU shader compute pipeline to measure vector throughput and TOPS.
                </p>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400">Vector Batch Size:</span>
                    {[500, 1000, 2500].map((count) => (
                      <button
                        key={count}
                        onClick={() => setBenchmarkVectors(count)}
                        className={`px-3 py-1 rounded text-xs transition-all ${
                          benchmarkVectors === count
                            ? "bg-cyan-600 text-white shadow-sm"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {count} vectors
                      </button>
                    ))}
                  </div>

                  <Button
                    disabled={isBenchmarking}
                    onClick={handleRunBenchmark}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs h-8 px-4 flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {isBenchmarking ? "Dispatching Shaders..." : "Run WebGPU Benchmark"}
                  </Button>
                </div>

                {benchmarkResult && (
                  <div className="p-4 bg-slate-950 border border-cyan-500/40 rounded-xl space-y-3 font-mono text-xs animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-300 font-semibold">Benchmark Execution Completed</span>
                      <span className="text-slate-400">{benchmarkResult.durationMs} ms elapsed</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                      <div>
                        <div className="text-slate-500 text-[10px]">THROUGHPUT</div>
                        <div className="text-emerald-400 font-bold text-sm">
                          {benchmarkResult.vectorsPerSecond.toLocaleString()} vectors/sec
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-500 text-[10px]">TENSOR TOPS</div>
                        <div className="text-cyan-400 font-bold text-sm">
                          {benchmarkResult.throughputTops} TOPS
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-500 text-[10px]">ACCELERATOR MODE</div>
                        <div className="text-purple-300 font-bold text-sm">
                          {benchmarkResult.mode}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BGE-M3 CROSS-ENCODER RERANKER */}
          {activeTab === "reranker" && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-slate-900/60 border border-cyan-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Multilingual BGE-m3 Cross-Encoder Reranker
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono text-cyan-300 border-cyan-500/40">
                    Dense Cosine Scoring
                  </Badge>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 block font-mono">Query Text:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={rerankQuery}
                      onChange={(e) => setRerankQuery(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                    <Button
                      disabled={isReranking}
                      onClick={handleRerank}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs h-8 px-4"
                    >
                      {isReranking ? "Scoring..." : "Execute WebGPU Rerank"}
                    </Button>
                  </div>
                </div>

                {/* Candidate Documents */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {rerankResult ? "Reranked Output (Ranked by WebGPU Cross-Encoder):" : "Candidate Documents:"}
                  </span>

                  {(rerankResult || candidates).map((item, idx) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all space-y-1.5 ${
                        rerankResult && idx === 0
                          ? "bg-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-950/20"
                          : "bg-slate-900/50 border-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-100">{item.title}</span>
                        </div>
                        {item.rerankedScore !== undefined && (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-mono">
                            Relevance: {(item.rerankedScore * 100).toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Zero-Egress Acceleration: Compute shaders execute on local GPU tensor cores.</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-7 text-xs border-slate-700 hover:bg-slate-800"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
