import React, { useState, useEffect } from "react";
import { Cpu, Zap, Download, CheckCircle2, Play, AlertCircle, HardDrive, Terminal } from "lucide-react";
import { WebLlmAdapter, PREBUILT_WEBLEN_MODELS, WebLlmProgressReport } from "@/lib/agents/web-llm-adapter";

export function WebGpuEngineArtifact() {
  const [gpuStatus, setGpuStatus] = useState<{ supported: boolean; adapterInfo?: string; reason?: string } | null>(null);
  const [selectedModel, setSelectedModel] = useState(PREBUILT_WEBLEN_MODELS[0].id);
  const [progress, setProgress] = useState<WebLlmProgressReport | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [promptInput, setPromptInput] = useState("Calculate COD net payout for 12 delivered sarees");
  const [streamOutput, setStreamOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    const adapter = new WebLlmAdapter();
    adapter.checkWebGpuSupport().then(setGpuStatus);
  }, []);

  const handleLoadModel = async () => {
    const adapter = new WebLlmAdapter((report) => setProgress(report));
    await adapter.loadModel(selectedModel);
    setIsLoaded(true);
  };

  const handleRunInference = async () => {
    setIsStreaming(true);
    setStreamOutput("");
    const adapter = new WebLlmAdapter();

    for await (const chunk of adapter.generateStream(promptInput)) {
      setStreamOutput((prev) => prev + chunk.textChunk);
    }
    setIsStreaming(false);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-foreground bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              WebGPU In-Browser Local AI Engine
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                100% On-Device ($0.00)
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Run open weights directly on your device GPU using WebGPU. No server calls, 100% private & offline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {gpuStatus?.supported ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> WebGPU Ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <AlertCircle className="w-3.5 h-3.5" /> WebGPU Emulation Active
            </span>
          )}
        </div>
      </div>

      {/* Model Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PREBUILT_WEBLEN_MODELS.map((model) => (
          <button
            key={model.id}
            type="button"
            onClick={() => {
              setSelectedModel(model.id);
              setIsLoaded(false);
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              selectedModel === model.id
                ? "bg-emerald-950/20 border-emerald-500/50 shadow-md shadow-emerald-500/10"
                : "bg-card/50 border-border hover:border-border/80"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-foreground">{model.name}</span>
                {model.isRecommendedForMobile && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                    Mobile 2GB
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{model.description}</p>
            </div>

            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[10px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3 text-emerald-400" /> {model.downloadSizeMB} MB
              </span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-indigo-400" /> {model.vramRequiredMB} MB VRAM
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Load & Test Controls */}
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-foreground">
              Device Compute Pipeline: {selectedModel}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLoadModel}
            disabled={isLoaded}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              isLoaded
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
            }`}
          >
            {isLoaded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            {isLoaded ? "Weights Cached in IndexedDB" : "Load Weights to Device"}
          </button>
        </div>

        {/* Progress Bar */}
        {progress && progress.status !== "ready" && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-muted-foreground">
              <span>Status: {progress.status}</span>
              <span>{progress.progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Offline Inference Sandbox */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Test Offline Prompt
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-background border border-input text-xs text-foreground focus:outline-hidden focus:border-emerald-500"
              placeholder="Type offline prompt..."
            />
            <button
              type="button"
              onClick={handleRunInference}
              disabled={isStreaming}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isStreaming ? "Generating..." : "Run (0ms Network)"}
            </button>
          </div>
        </div>

        {/* Output Console */}
        {streamOutput && (
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap animate-in fade-in-50 duration-200">
            {streamOutput}
          </div>
        )}
      </div>
    </div>
  );
}
