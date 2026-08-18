"use client";

import { useState } from "react";
import {
  Swords,
  Play,
  Copy,
  Check,
  Sparkles,
  Zap,
  Cpu,
  ThumbsUp,
  Award,
  RefreshCw,
  Trophy,
} from "lucide-react";
import { LiquidGlassCard } from "../LiquidGlassCard";
import { cn } from "@/lib/utils";

export interface ModelResponse {
  modelName: string;
  badge: string;
  latencyMs: number;
  tokensPerSec: number;
  costEst: string;
  output: string;
  thinking?: string;
}

export function ModelArenaArtifact() {
  const [prompt, setPrompt] = useState(
    "Compare bKash tokenized PGW vs Nagad Direct API for a high-concurrency Dhaka e-commerce flash sale."
  );
  const [isRunning, setIsRunning] = useState(false);
  const [vote, setVote] = useState<"A" | "B" | "tie" | null>(null);

  const [modelA, setModelA] = useState<ModelResponse>({
    modelName: "DeepSeek-R1:7b (Local GPU)",
    badge: "Port 11434 · Zero Cloud Cost",
    latencyMs: 420,
    tokensPerSec: 58.4,
    costEst: "$0.00 / 1k tokens",
    thinking: `1. Flash sale requires handling 15k req/sec with strict idempotency.
2. bKash Tokenized Agreement API allows 1-click recurring charges without re-entering PIN.
3. Nagad Direct API requires manual OTP roundtrips which creates 4.2s dropoff bottleneck during flash sales.`,
    output: `### Comparative Architecture: bKash Tokenized PGW vs Nagad Direct API

#### 1. Concurrency & Throughput
- **bKash Tokenized PGW:** Utilizes asynchronous webhook callbacks with pre-authenticated token agreements. Capable of processing **12,000+ orders/min** with sub-350ms token execution latency.
- **Nagad Direct API:** Requires synchronous 2-factor OTP verification for every single checkout, creating a high bounce rate during 1-hour flash sale surges.

#### 2. Recommendation
For high-concurrency flash campaigns, implement **bKash Tokenized Checkout** as the default payment rail and provide Nagad as a secondary fallback.`,
  });

  const [modelB, setModelB] = useState<ModelResponse>({
    modelName: "Claude 3.7 Sonnet (Hybrid Cloud)",
    badge: "Cloud Extended Thinking",
    latencyMs: 1150,
    tokensPerSec: 42.1,
    costEst: "$0.015 / 1k tokens",
    thinking: `Analyzing payment gateway resilience under peak concurrency loads in Bangladesh...`,
    output: `### Flash Sale Gateway Evaluation

1. **bKash Tokenized PGW**:
   - **Pros:** Native tokenization, automated agreement creation, higher merchant brand trust (82% market share in BD).
   - **Cons:** 1.5% MDR (Merchant Discount Rate).

2. **Nagad Direct API**:
   - **Pros:** Slightly lower MDR (0.99% promo tier for certain sectors).
   - **Cons:** Slower gateway handshake and occasional session timeouts under high packet load.

**Summary:** bKash wins on conversion rate optimization and server reliability.`,
  });

  const handleRunArena = () => {
    setIsRunning(true);
    setVote(null);

    setTimeout(() => {
      setIsRunning(false);
    }, 1400);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Header ── */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Multi-Model Battle Arena</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-semibold">
                Side-by-Side Benchmark
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Compare local DeepSeek-R1 against cloud models on identical prompts
            </p>
          </div>
        </div>

        {vote && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5" />
            <span>Voted: {vote === "tie" ? "Tie" : `Model ${vote}`}</span>
          </div>
        )}
      </div>

      {/* ── Prompt Input Area ── */}
      <div className="p-4 border-b border-border bg-muted/10 space-y-2 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRunArena()}
            placeholder="Enter a benchmark prompt to duel across models..."
            className="flex-1 text-xs bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-purple-400"
          />
          <button
            type="button"
            onClick={handleRunArena}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? "Running..." : "Duel"}</span>
          </button>
        </div>
      </div>

      {/* ── Side-by-Side Arena Viewport ── */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Model A */}
        <div className="flex flex-col h-full border-r border-border bg-card overflow-hidden">
          <div className="h-12 px-4 border-b border-border flex items-center justify-between bg-muted/20 shrink-0">
            <div>
              <div className="text-xs font-bold text-foreground">{modelA.modelName}</div>
              <div className="text-[10px] text-muted-foreground font-mono">{modelA.badge}</div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
              <span>{modelA.latencyMs}ms</span>
              <span>·</span>
              <span>{modelA.tokensPerSec} t/s</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed">
            {modelA.thinking && (
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-[11px] font-mono text-purple-300/80 space-y-1">
                <span className="font-bold uppercase tracking-wider text-purple-400 block text-[9px]">
                  Reasoning Thought Stream
                </span>
                <p className="whitespace-pre-wrap">{modelA.thinking}</p>
              </div>
            )}
            <div className="whitespace-pre-wrap text-foreground">{modelA.output}</div>
          </div>

          {/* Vote Button */}
          <div className="p-3 border-t border-border bg-muted/10 shrink-0">
            <button
              type="button"
              onClick={() => setVote("A")}
              className={cn(
                "w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer",
                vote === "A" ? "bg-emerald-600 text-white" : "bg-muted/50 hover:bg-muted text-foreground"
              )}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Model A is Better</span>
            </button>
          </div>
        </div>

        {/* Model B */}
        <div className="flex flex-col h-full bg-card overflow-hidden">
          <div className="h-12 px-4 border-b border-border flex items-center justify-between bg-muted/20 shrink-0">
            <div>
              <div className="text-xs font-bold text-foreground">{modelB.modelName}</div>
              <div className="text-[10px] text-muted-foreground font-mono">{modelB.badge}</div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-indigo-400">
              <span>{modelB.latencyMs}ms</span>
              <span>·</span>
              <span>{modelB.tokensPerSec} t/s</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed">
            {modelB.thinking && (
              <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-[11px] font-mono text-indigo-300/80 space-y-1">
                <span className="font-bold uppercase tracking-wider text-indigo-400 block text-[9px]">
                  Reasoning Thought Stream
                </span>
                <p className="whitespace-pre-wrap">{modelB.thinking}</p>
              </div>
            )}
            <div className="whitespace-pre-wrap text-foreground">{modelB.output}</div>
          </div>

          {/* Vote Button */}
          <div className="p-3 border-t border-border bg-muted/10 shrink-0">
            <button
              type="button"
              onClick={() => setVote("B")}
              className={cn(
                "w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer",
                vote === "B" ? "bg-emerald-600 text-white" : "bg-muted/50 hover:bg-muted text-foreground"
              )}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Model B is Better</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelArenaArtifact;
