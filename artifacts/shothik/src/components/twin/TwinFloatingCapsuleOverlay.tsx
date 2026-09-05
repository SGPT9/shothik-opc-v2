import React, { useState, useEffect } from "react";
import { Sparkles, Square, ChevronUp, ChevronDown, X, Zap, Cpu } from "lucide-react";

export interface TwinFloatingCapsuleOverlayProps {
  active: boolean;
  statusText?: string;
  twinName?: string;
  step?: number;
  totalSteps?: number;
  onStop?: () => void;
  onDismiss?: () => void;
}

export function TwinFloatingCapsuleOverlay({
  active,
  statusText = "Autonomous Twin is deliberating next best action...",
  twinName = "Swarm Orchestrator",
  step = 1,
  totalSteps = 5,
  onStop,
  onDismiss,
}: TwinFloatingCapsuleOverlayProps) {
  const [expanded, setExpanded] = useState(false);
  const [telemetry, setTelemetry] = useState<{
    totalTokens: number;
    totalCostBdt: number;
    totalSavedBdt: number;
  }>({
    totalTokens: 1450,
    totalCostBdt: 0,
    totalSavedBdt: 1.83,
  });

  // Fetch live cost telemetry from backend
  useEffect(() => {
    if (!active) return;

    const fetchTelemetry = () => {
      fetch("/api/v1/twin/telemetry/cost")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.data) {
            setTelemetry({
              totalTokens: data.data.totalTokens || 0,
              totalCostBdt: data.data.totalCostBdt || 0,
              totalSavedBdt: data.data.totalSavedBdt || 0,
            });
          }
        })
        .catch(() => {});
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 4000);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out select-none"
      style={{ animation: "popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both" }}
    >
      <div
        className={`flex flex-col bg-zinc-950/85 dark:bg-zinc-950/90 backdrop-blur-2xl border border-white/20 shadow-2xl text-white transition-all duration-300 ${
          expanded ? "rounded-2xl p-4 w-[420px]" : "rounded-full py-1.5 px-3 max-w-[560px] w-auto items-center"
        }`}
        style={{
          boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        {/* Main Capsule Row */}
        <div className="flex items-center gap-2.5 w-full">
          {/* Glowing Animated Brand Ring */}
          <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
            <div className="absolute inset-0 rounded-full border border-amber-400/80 border-t-transparent animate-spin duration-1000" />
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-zinc-950 fill-zinc-950" />
            </div>
          </div>

          {/* Status Text & Identity */}
          <div className="flex flex-col min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/90 font-bold">
                {twinName}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                [Step {step}/{totalSteps}]
              </span>
            </div>
            <p className="text-xs font-medium text-zinc-100 truncate max-w-[260px] md:max-w-[320px]">
              {statusText}
            </p>
          </div>

          {/* Local Savings Tag */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono shrink-0">
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span>৳{telemetry.totalSavedBdt.toFixed(2)} saved</span>
          </div>

          {/* Controls: Expand, Stop, Dismiss */}
          <div className="flex items-center gap-1 shrink-0 ml-auto pl-1">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title={expanded ? "Collapse telemetry" : "Expand telemetry"}
            >
              {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>

            {onStop && (
              <button
                type="button"
                onClick={onStop}
                className="w-7 h-7 flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded-full transition-all cursor-pointer active:scale-95"
                title="Emergency Pause / Stop Autonomous Twin"
              >
                <Square className="w-3 h-3 fill-red-400 text-red-400" />
              </button>
            )}

            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                title="Dismiss capsule"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Expanded Telemetry Drawer */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-white/10 w-full flex flex-col gap-2.5 text-xs">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                <div className="text-[10px] text-zinc-400 uppercase font-mono">Tokens</div>
                <div className="text-sm font-semibold font-mono text-zinc-200">
                  {telemetry.totalTokens.toLocaleString()}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                <div className="text-[10px] text-zinc-400 uppercase font-mono">Spend</div>
                <div className="text-sm font-semibold font-mono text-zinc-200">
                  ৳{telemetry.totalCostBdt.toFixed(2)}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-[10px] text-emerald-400 uppercase font-mono">WebGPU Saved</div>
                <div className="text-sm font-semibold font-mono text-emerald-300">
                  ৳{telemetry.totalSavedBdt.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 font-mono">
              <span className="flex items-center gap-1 text-amber-400">
                <Zap className="w-3 h-3" /> Tier 1 Intel Arc B580 WebGPU Active
              </span>
              <span>Zero-Data Private</span>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes popIn {
          from {
            opacity: 0;
            transform: translate(-50%, 16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
