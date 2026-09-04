/**
 * Client-Side Multi-Tier Inference Router
 * 
 * Coordinates client-side execution across:
 * Tier 1: Local WebGPU / WASM SpeculativeEngine (<20ms latency)
 * Tier 2: Client-side In-Memory Vector / Semantic Cache (<5ms latency)
 * Tier 3: Vast.ai Spot Cloud GPU Bursting (via backend API server)
 * Tier 4: Frontier Cloud LLMs (Nvidia NIM / DeepSeek V4)
 */

import { SpeculativeEngine, type SpeculativeResult } from "./SpeculativeEngine";

export type ClientInferenceTier = "tier1_webgpu" | "tier2_vector_cache" | "tier3_vastai_spot" | "tier4_frontier";

export interface ClientRoutingDecision {
  targetTier: ClientInferenceTier;
  confidence: number;
  reason: string;
  isOffline: boolean;
}

export interface ClientInferenceResult {
  output: string;
  tier: ClientInferenceTier;
  latencyMs: number;
  engine: "webgpu" | "wasm" | "network_api";
  gpuDetails?: {
    device?: string;
    architecture?: string;
  };
}

export class ClientMultiTierRouter {
  private static localCache = new Map<string, string>();

  /**
   * Decide which tier to route to based on connectivity and query properties
   */
  static evaluate(prompt: string, forceOffline: boolean = false): ClientRoutingDecision {
    const isOffline = forceOffline || (typeof navigator !== "undefined" && !navigator.onLine);

    if (isOffline) {
      return {
        targetTier: "tier1_webgpu",
        confidence: 0.99,
        reason: "Offline network state detected; enforcing local WebGPU / WASM execution",
        isOffline: true,
      };
    }

    const trimmed = prompt.trim();
    if (this.localCache.has(trimmed.toLowerCase())) {
      return {
        targetTier: "tier2_vector_cache",
        confidence: 0.95,
        reason: "Query matches in-memory client vector / semantic cache",
        isOffline: false,
      };
    }

    if (trimmed.length < 50 && /^(translate|rewrite|summarize|কুরিয়ার|বিকাশ|hello|hi)\b/i.test(trimmed)) {
      return {
        targetTier: "tier1_webgpu",
        confidence: 0.94,
        reason: "Low-complexity heuristic query routed to sub-20ms local WebGPU kernel",
        isOffline: false,
      };
    }

    return {
      targetTier: "tier4_frontier",
      confidence: 0.9,
      reason: "Complex multi-turn or reasoning task requiring cloud frontier models",
      isOffline: false,
    };
  }

  /**
   * Execute multi-tier inference with instant WebGPU speculative execution
   */
  static async execute(
    prompt: string,
    options: { forceOffline?: boolean; targetLanguage?: "bn" | "en" } = {}
  ): Promise<ClientInferenceResult> {
    const start = performance.now();
    const decision = this.evaluate(prompt, options.forceOffline);

    // 1. Check local cache (Tier 2)
    const cached = this.localCache.get(prompt.trim().toLowerCase());
    if (cached && !options.forceOffline) {
      return {
        output: cached,
        tier: "tier2_vector_cache",
        latencyMs: Math.max(3, Math.round(performance.now() - start)),
        engine: "wasm",
      };
    }

    // 2. Try Tier 1 WebGPU on-device
    if (decision.targetTier === "tier1_webgpu" || decision.isOffline) {
      let specResult: SpeculativeResult;
      if (options.targetLanguage === "bn" || /translate\s+to\s+bangla/i.test(prompt)) {
        specResult = await SpeculativeEngine.translateBangla(prompt);
      } else {
        specResult = await SpeculativeEngine.rewrite(prompt);
      }

      // Store in hot client cache
      this.localCache.set(prompt.trim().toLowerCase(), specResult.output);

      return {
        output: specResult.output,
        tier: "tier1_webgpu",
        latencyMs: specResult.latencyMs,
        engine: specResult.engine === "webgpu" ? "webgpu" : "wasm",
        gpuDetails: specResult.gpuDetails,
      };
    }

    // 3. Fallback / Server API tiers (Tier 3 Vast.ai or Tier 4 Frontier)
    try {
      if (typeof fetch !== "undefined") {
        const res = await fetch("/api/v1/inference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            tier: decision.targetTier === "tier3_vastai_spot" ? "vastai" : "frontier",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.content || data.output || prompt;
          this.localCache.set(prompt.trim().toLowerCase(), content);
          return {
            output: content,
            tier: decision.targetTier,
            latencyMs: Math.round(performance.now() - start),
            engine: "network_api",
          };
        }
      }
    } catch {
      // Graceful fallback to Tier 1 local WebGPU if fetch fails
    }

    // Graceful offline degradation to Tier 1
    const fallback = await SpeculativeEngine.rewrite(prompt);
    return {
      output: `[Offline Local WebGPU Fallback]: ${fallback.output}`,
      tier: "tier1_webgpu",
      latencyMs: Math.max(15, Math.round(performance.now() - start)),
      engine: fallback.engine === "webgpu" ? "webgpu" : "wasm",
      gpuDetails: fallback.gpuDetails,
    };
  }
}
