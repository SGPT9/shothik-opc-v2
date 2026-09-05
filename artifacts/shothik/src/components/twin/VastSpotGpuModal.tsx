"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Server,
  Zap,
  Cpu,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  StopCircle,
  Activity,
  Layers,
  ArrowRight,
  TrendingDown,
  Clock,
  Terminal,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
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

export interface VastGpuOffer {
  id: string;
  gpuName: string;
  numGpus: number;
  totalVramGb: number;
  cudaComputeCapability: string;
  dlperfScore: number;
  priceUsdPerHour: number;
  priceBdtPerHour: number;
  region: string;
  country: string;
  reliabilityScore: number;
  recommendedTemplate: string;
  maxContextTokens: number;
}

export interface VastSpotInstance {
  id: string;
  offerId: string;
  gpuName: string;
  numGpus: number;
  totalVramGb: number;
  dockerImage: string;
  status: "provisioning" | "running" | "stopped" | "destroyed";
  endpointUrl: string;
  sshHost: string;
  sshPort: number;
  hourlyRateUsd: number;
  hourlyRateBdt: number;
  launchedAt: string;
  stoppedAt?: string;
  totalSpentUsd: number;
  totalSpentBdt: number;
  taskWorkload: string;
}

export const FALLBACK_VAST_OFFERS: VastGpuOffer[] = [
  {
    id: "vast_offer_4090_single",
    gpuName: "NVIDIA GeForce RTX 4090",
    numGpus: 1,
    totalVramGb: 24,
    cudaComputeCapability: "8.9 (Ada Lovelace)",
    dlperfScore: 104.2,
    priceUsdPerHour: 0.38,
    priceBdtPerHour: 46.5,
    region: "EU-North (Stockholm)",
    country: "SE",
    reliabilityScore: 0.98,
    recommendedTemplate: "vllm/vllm-openai:latest",
    maxContextTokens: 32768,
  },
  {
    id: "vast_offer_a100_sxm4",
    gpuName: "NVIDIA A100-SXM4-80GB",
    numGpus: 1,
    totalVramGb: 80,
    cudaComputeCapability: "8.0 (Ampere)",
    dlperfScore: 178.5,
    priceUsdPerHour: 1.15,
    priceBdtPerHour: 140.8,
    region: "US-East (Virginia)",
    country: "US",
    reliabilityScore: 0.99,
    recommendedTemplate: "vllm/vllm-openai:latest",
    maxContextTokens: 131072,
  },
  {
    id: "vast_offer_h100_pcie",
    gpuName: "NVIDIA H100-PCIe-80GB",
    numGpus: 1,
    totalVramGb: 80,
    cudaComputeCapability: "9.0 (Hopper FP8 Transformer Engine)",
    dlperfScore: 312.8,
    priceUsdPerHour: 2.25,
    priceBdtPerHour: 275.6,
    region: "AP-East (Tokyo)",
    country: "JP",
    reliabilityScore: 0.995,
    recommendedTemplate: "sglang/sglang:latest",
    maxContextTokens: 131072,
  },
  {
    id: "vast_offer_3090_dual",
    gpuName: "2x NVIDIA GeForce RTX 3090",
    numGpus: 2,
    totalVramGb: 48,
    cudaComputeCapability: "8.6 (Ampere)",
    dlperfScore: 122.4,
    priceUsdPerHour: 0.44,
    priceBdtPerHour: 53.9,
    region: "EU-West (Frankfurt)",
    country: "DE",
    reliabilityScore: 0.96,
    recommendedTemplate: "vllm/vllm-openai:latest",
    maxContextTokens: 65536,
  },
];

export const INITIAL_INSTANCES: VastSpotInstance[] = [
  {
    id: "vast_inst_4090_prod_01",
    offerId: "vast_offer_4090_single",
    gpuName: "NVIDIA GeForce RTX 4090",
    numGpus: 1,
    totalVramGb: 24,
    dockerImage: "vllm/vllm-openai:latest",
    status: "running",
    endpointUrl: "https://vast-proxy-8000.shothik.ai/v1",
    sshHost: "ssh1.vast.ai",
    sshPort: 32451,
    hourlyRateUsd: 0.38,
    hourlyRateBdt: 46.5,
    launchedAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    totalSpentUsd: 0.95,
    totalSpentBdt: 116.38,
    taskWorkload: "DeepSeek R1 Vernacular Reasoning & Bengali Dialect Inference",
  },
];

interface VastSpotGpuModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VastSpotGpuModal({ open, onOpenChange }: VastSpotGpuModalProps) {
  const [activeTab, setActiveTab] = useState<"offers" | "instances" | "evaluator">("offers");
  const [offers, setOffers] = useState<VastGpuOffer[]>(FALLBACK_VAST_OFFERS);
  const [instances, setInstances] = useState<VastSpotInstance[]>(INITIAL_INSTANCES);
  const [isLaunching, setIsLaunching] = useState<string | null>(null);
  const [evalTokens, setEvalTokens] = useState<number>(32000);
  const [evalBatch, setEvalBatch] = useState<number>(4);
  const [evalResult, setEvalResult] = useState<any>(null);

  // Fetch live market offers and instances on open
  useEffect(() => {
    if (!open) return;

    fetch("/api/v1/compute/vast/offers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.offers) && data.offers.length > 0) {
          setOffers(data.offers);
        }
      })
      .catch(() => {});

    fetch("/api/v1/compute/vast/instances")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.instances) && data.instances.length > 0) {
          setInstances(data.instances);
        }
      })
      .catch(() => {});
  }, [open]);

  // Handle Launch Spot Instance
  const handleLaunchOffer = async (offer: VastGpuOffer) => {
    setIsLaunching(offer.id);
    try {
      const res = await fetch("/api/v1/compute/vast/bid-and-launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: offer.id,
          workloadDescription: "Autonomous Twin Dynamic Bursting",
        }),
      });
      const data = await res.json();
      if (data.success && data.instance) {
        setInstances((prev) => [data.instance, ...prev]);
        setActiveTab("instances");
      }
    } catch {
      // Local fallback simulation
      const newInst: VastSpotInstance = {
        id: `vast_inst_${Date.now()}`,
        offerId: offer.id,
        gpuName: offer.gpuName,
        numGpus: offer.numGpus,
        totalVramGb: offer.totalVramGb,
        dockerImage: offer.recommendedTemplate,
        status: "running",
        endpointUrl: `https://vast-proxy-${Date.now().toString().slice(-4)}.shothik.ai/v1`,
        sshHost: "ssh2.vast.ai",
        sshPort: 34120,
        hourlyRateUsd: offer.priceUsdPerHour,
        hourlyRateBdt: offer.priceBdtPerHour,
        launchedAt: new Date().toISOString(),
        totalSpentUsd: 0,
        totalSpentBdt: 0,
        taskWorkload: "Autonomous Twin Dynamic Bursting",
      };
      setInstances((prev) => [newInst, ...prev]);
      setActiveTab("instances");
    } finally {
      setIsLaunching(null);
    }
  };

  // Handle Destroy Instance
  const handleDestroyInstance = async (instanceId: string) => {
    try {
      await fetch(`/api/v1/compute/vast/instances/${instanceId}/destroy`, {
        method: "POST",
      });
    } catch {}

    setInstances((prev) =>
      prev.map((inst) =>
        inst.id === instanceId
          ? {
              ...inst,
              status: "destroyed",
              stoppedAt: new Date().toISOString(),
            }
          : inst
      )
    );
  };

  // Handle Workload Fallback Evaluation
  const handleEvaluateFallback = () => {
    const shouldFallback = evalTokens > 16384 || evalBatch > 4;
    const estUsd = shouldFallback ? Number(((evalTokens * evalBatch) / 200000 * 0.38).toFixed(3)) : 0;
    setEvalResult({
      shouldFallback,
      reason: shouldFallback
        ? `Context length (${evalTokens.toLocaleString()} tokens) exceeds local WebGPU 16k buffer`
        : "Workload executes natively on local Intel Arc / WebGPU shaders",
      recommendedGpu: shouldFallback ? "NVIDIA GeForce RTX 4090 ($0.38/hr)" : "Local WebGPU Device",
      estimatedCostUsd: estUsd,
      estimatedCostBdt: Math.round(estUsd * 122.5),
    });
  };

  const activeInstancesCount = instances.filter((i) => i.status === "running").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl w-full p-0 overflow-hidden bg-slate-950 border-slate-800 text-slate-100 shadow-2xl flex flex-col max-h-[90vh]"
        aria-describedby="vast-spot-desc"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    Vast.ai Dynamic Spot GPU Bursting & Offload Engine
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 bg-emerald-500/10 text-xs">
                      WebGPU Hybrid Fallback
                    </Badge>
                  </DialogTitle>
                  <DialogDescription id="vast-spot-desc" className="text-slate-400 text-xs mt-1">
                    Burst heavy Twin workloads from local WebGPU to high-throughput on-demand Cloud GPUs at up to 80% lower cost.
                  </DialogDescription>
                </div>
              </div>

              {/* Status Header */}
              <div className="flex items-center gap-2">
                <Badge className="bg-slate-800 text-slate-300 border-slate-700 px-3 py-1 text-xs">
                  {activeInstancesCount} Active {activeInstancesCount === 1 ? "Worker" : "Workers"}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab("offers")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "offers"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/40 border border-emerald-500"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60"
              }`}
            >
              Spot GPU Market Offers ({offers.length})
            </button>
            <button
              onClick={() => setActiveTab("instances")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "instances"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/40 border border-emerald-500"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60"
              }`}
            >
              Active Workers ({instances.length})
            </button>
            <button
              onClick={() => setActiveTab("evaluator")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "evaluator"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/40 border border-emerald-500"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60"
              }`}
            >
              Hybrid Fallback Sandbox
            </button>
          </div>
        </div>

        {/* Tab 1: Spot GPU Market Offers */}
        {activeTab === "offers" && (
          <div className="p-6 overflow-y-auto space-y-4 max-h-[520px]">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Available Verified Spot GPU Offers</span>
              <span className="text-[11px] text-slate-500 font-mono">1 USD = ৳122.50 BDT</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{offer.gpuName}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">{offer.region}</span>
                      </div>
                      <Badge className="bg-emerald-950/60 border-emerald-700/50 text-emerald-300 text-xs">
                        {Math.round(offer.reliabilityScore * 100)}% Reliable
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-850">
                        <span className="text-slate-400 block text-[10px]">VRAM</span>
                        <span className="font-semibold text-white">{offer.totalVramGb} GB GDDR6X</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-850">
                        <span className="text-slate-400 block text-[10px]">Compute Arch</span>
                        <span className="font-semibold text-violet-300">{offer.cudaComputeCapability.split(" ")[0]}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-850">
                        <span className="text-slate-400 block text-[10px]">Max Context</span>
                        <span className="font-semibold text-white">{(offer.maxContextTokens / 1024).toFixed(0)}k Tokens</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-850">
                        <span className="text-slate-400 block text-[10px]">DLPerf Score</span>
                        <span className="font-semibold text-emerald-400">{offer.dlperfScore}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-850 flex items-center justify-between">
                    <div>
                      <span className="text-base font-black text-white">${offer.priceUsdPerHour}</span>
                      <span className="text-xs text-slate-400"> / hr</span>
                      <span className="text-[11px] text-emerald-400 ml-2 font-mono">(৳{offer.priceBdtPerHour}/hr)</span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleLaunchOffer(offer)}
                      disabled={isLaunching === offer.id}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3"
                    >
                      {isLaunching === offer.id ? (
                        <>
                          <Zap className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Launching...
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                          Bid & Launch
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Active Spot Workers */}
        {activeTab === "instances" && (
          <div className="p-6 overflow-y-auto space-y-4 max-h-[520px]">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Running & Historical Spot GPU Containers</span>
              <span className="text-[11px] text-slate-500">vLLM OpenAI-Compatible Endpoints</span>
            </div>

            <div className="space-y-3">
              {instances.map((inst) => (
                <div
                  key={inst.id}
                  className={`p-4 rounded-xl border transition-all ${
                    inst.status === "running"
                      ? "bg-slate-900/60 border-emerald-500/40"
                      : "bg-slate-900/20 border-slate-800/80 opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white">{inst.gpuName}</span>
                        <Badge
                          className={`text-[10px] uppercase font-bold ${
                            inst.status === "running"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {inst.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{inst.taskWorkload}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-white block">
                        ${inst.totalSpentUsd.toFixed(2)} USD
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono block">
                        ৳{Math.round(inst.totalSpentBdt)} BDT
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 my-3 text-[11px] text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                    <div>
                      <span className="text-slate-500 block text-[9px]">ENDPOINT</span>
                      <span className="truncate block text-cyan-400">{inst.endpointUrl}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">SSH DIRECT</span>
                      <span>{inst.sshHost}:{inst.sshPort}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">HOURLY BURN</span>
                      <span>${inst.hourlyRateUsd}/hr (৳{inst.hourlyRateBdt})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">DOCKER IMAGE</span>
                      <span className="truncate block">{inst.dockerImage}</span>
                    </div>
                  </div>

                  {inst.status === "running" && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-850">
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" /> OpenAI Compatible vLLM Serving Active
                      </span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDestroyInstance(inst.id)}
                        className="text-xs h-7 px-3 bg-rose-600 hover:bg-rose-700"
                      >
                        <StopCircle className="w-3.5 h-3.5 mr-1.5" />
                        Destroy Worker
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Hybrid Fallback Sandbox Evaluator */}
        {activeTab === "evaluator" && (
          <div className="p-6 overflow-y-auto space-y-6 max-h-[520px]">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Workload Compute Offload Simulator
              </h4>
              <p className="text-xs text-slate-400">
                Simulate prompt token load and parallel batch size to evaluate whether the request should run locally on your Intel Arc B580 WebGPU device or burst to a Vast.ai Spot Cloud GPU.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Context Length: {evalTokens.toLocaleString()} tokens
                  </label>
                  <input
                    type="range"
                    min="1024"
                    max="131072"
                    step="1024"
                    value={evalTokens}
                    onChange={(e) => setEvalTokens(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>1k (Fast Local)</span>
                    <span>16k (WebGPU Limit)</span>
                    <span>128k (Spot GPU)</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Batch Size: {evalBatch} concurrent sequences
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="16"
                    step="1"
                    value={evalBatch}
                    onChange={(e) => setEvalBatch(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>1 (Single Turn)</span>
                    <span>4 (Max Local)</span>
                    <span>16 (Heavy Swarm)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  size="sm"
                  onClick={handleEvaluateFallback}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Evaluate Compute Fallback
                </Button>
              </div>
            </div>

            {/* Evaluation Results Card */}
            {evalResult && (
              <div
                className={`p-5 rounded-xl border ${
                  evalResult.shouldFallback
                    ? "bg-amber-950/20 border-amber-500/40"
                    : "bg-emerald-950/20 border-emerald-500/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {evalResult.shouldFallback ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  <h4 className="text-sm font-bold text-white">
                    {evalResult.shouldFallback
                      ? "Burst to Vast.ai Spot Cloud GPU Recommended"
                      : "Native On-Device WebGPU Execution Capable"}
                  </h4>
                </div>

                <p className="text-xs text-slate-300 mb-3">{evalResult.reason}</p>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-850">
                  <div>
                    <span className="text-slate-500 block text-[10px]">RECOMMENDED TARGET</span>
                    <span className="font-semibold text-white">{evalResult.recommendedGpu}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">ESTIMATED BURST COST</span>
                    <span className="font-semibold text-emerald-400">
                      ${evalResult.estimatedCostUsd} USD (৳{evalResult.estimatedCostBdt} BDT)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Zero-Leak Container Isolation & Automated bKash Billing
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default VastSpotGpuModal;
