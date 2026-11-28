import React from "react";
import { Clock, Coins, Cpu } from "lucide-react";

export interface MessageTokenMetrics {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  latencySeconds?: number;
  modelName?: string;
  costEstimatedUsd?: number;
}

export interface MessageTokenBadgeProps {
  metrics?: MessageTokenMetrics;
  className?: string;
}

export function MessageTokenBadge({ metrics, className = "" }: MessageTokenBadgeProps) {
  if (!metrics) return null;

  const {
    promptTokens = 0,
    completionTokens = 0,
    totalTokens = (promptTokens || 0) + (completionTokens || 0),
    latencySeconds,
    modelName,
    costEstimatedUsd,
  } = metrics;

  // Don't render empty badges if no telemetry is present
  if (!totalTokens && !latencySeconds) return null;

  return (
    <div
      role="status"
      aria-label="Message token and performance metrics"
      className={`inline-flex items-center flex-wrap gap-2 text-[10px] font-mono text-zinc-400 select-none pt-1.5 ${className}`}
    >
      {/* Latency */}
      {latencySeconds !== undefined && latencySeconds > 0 && (
        <span className="inline-flex items-center gap-1 bg-white/[0.03] border border-white/5 rounded-md px-1.5 py-0.5">
          <Clock className="w-2.5 h-2.5 text-zinc-400" />
          <span>{latencySeconds.toFixed(1)}s</span>
        </span>
      )}

      {/* Tokens */}
      {totalTokens > 0 && (
        <span className="inline-flex items-center gap-1 bg-white/[0.03] border border-white/5 rounded-md px-1.5 py-0.5">
          <Coins className="w-2.5 h-2.5 text-emerald-400" />
          <span>
            {promptTokens > 0 && `${promptTokens} in / `}
            {completionTokens > 0 && `${completionTokens} out `}
            {`(${totalTokens.toLocaleString()} tokens)`}
          </span>
        </span>
      )}

      {/* Model Name */}
      {modelName && (
        <span className="inline-flex items-center gap-1 bg-white/[0.03] border border-white/5 rounded-md px-1.5 py-0.5 text-zinc-300">
          <Cpu className="w-2.5 h-2.5 text-cyan-400" />
          <span>{modelName}</span>
        </span>
      )}

      {/* Estimated USD cost */}
      {costEstimatedUsd !== undefined && costEstimatedUsd > 0 && (
        <span className="bg-emerald-500/10 text-emerald-400 rounded-md px-1.5 py-0.5 border border-emerald-500/20 font-bold">
          ${costEstimatedUsd.toFixed(4)}
        </span>
      )}
    </div>
  );
}
