export type ComputeTier = "Tier 0 (WASM)" | "Tier 1 (VPS 7B)" | "Tier 3 (Batch GPU)" | "Tier 4 (Frontier MoE)";

export interface RouteDecision {
  tier: ComputeTier;
  recommendedModel: string;
  estimatedCostBdt: number;
  latencyBudgetMs: number;
  reason: string;
}

export class ModelMeshRouter {
  /**
   * Fast <10ms heuristic complexity & budget classifier
   */
  public routePrompt(prompt: string, options?: { forceTier?: ComputeTier; isOvernight?: boolean }): RouteDecision {
    if (options?.forceTier) {
      return {
        tier: options.forceTier,
        recommendedModel: options.forceTier === "Tier 4 (Frontier MoE)" ? "deepseek/deepseek-r1" : "qwen2.5-coder:7b",
        estimatedCostBdt: options.forceTier === "Tier 4 (Frontier MoE)" ? 0.04 : 0.003,
        latencyBudgetMs: options.forceTier === "Tier 4 (Frontier MoE)" ? 2500 : 150,
        reason: "Explicit user override",
      };
    }

    if (options?.isOvernight) {
      return {
        tier: "Tier 3 (Batch GPU)",
        recommendedModel: "deepseek/deepseek-r1-distill-qwen-32b",
        estimatedCostBdt: 0.001,
        latencyBudgetMs: 30000,
        reason: "Overnight batch execution budget optimization",
      };
    }

    const trimmed = prompt.trim().toLowerCase();
    const tokenCount = prompt.split(/\s+/).length;

    // 1. Tier 0: Simple Navigation, Intent Classifier & Shortcuts (<5 words)
    if (tokenCount <= 4 && (trimmed.startsWith("open") || trimmed.startsWith("go to") || trimmed.startsWith("show"))) {
      return {
        tier: "Tier 0 (WASM)",
        recommendedModel: "browser-wasm-intent",
        estimatedCostBdt: 0.0,
        latencyBudgetMs: 5,
        reason: "Edge regex & WASM intent parsing",
      };
    }

    // 2. Tier 4: Frontier Multi-Step Reasoning / Deep Legal / Complex Architecture (>150 tokens or explicit keywords)
    const isFrontierTask =
      tokenCount > 100 ||
      trimmed.includes("income tax act") ||
      trimmed.includes("section 78") ||
      trimmed.includes("formal verification") ||
      trimmed.includes("investor pitch deck") ||
      trimmed.includes("complex refactor");

    if (isFrontierTask) {
      return {
        tier: "Tier 4 (Frontier MoE)",
        recommendedModel: "google/gemini-2.0-flash-001",
        estimatedCostBdt: 0.04,
        latencyBudgetMs: 1800,
        reason: "High complexity multi-step reasoning requirement",
      };
    }

    // 3. Tier 1: Routine Banglish, E-commerce DMs, Short Paraphrasing, Standard Q&A
    return {
      tier: "Tier 1 (VPS 7B)",
      recommendedModel: "qwen2:7b",
      estimatedCostBdt: 0.003,
      latencyBudgetMs: 120,
      reason: "Standard conversational inquiry routed to domestic VPS GPU pool",
    };
  }
}

export const modelMeshRouter = new ModelMeshRouter();
