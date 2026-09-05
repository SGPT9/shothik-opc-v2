/**
 * Shothik Twin Real-Time Token & Financial Cost Tracker
 * Inspired by OpenComet Zero-Data Cost Monitoring & Multi-Tier Inference Economics.
 */

export interface TokenUsageRecord {
  modelOrTier: "tier1_webgpu" | "tier2_cache" | "tier3_vast" | "tier4_frontier" | string;
  promptTokens: number;
  completionTokens: number;
  twinId?: string;
  taskId?: string;
  timestamp?: string;
}

export interface ModelPricing {
  promptPerMillionUsd: number;
  completionPerMillionUsd: number;
  baselineSavingsPerMillionUsd: number; // What would have been spent if routed to frontier cloud
}

export const USD_TO_BDT_RATE = 122.0;

export const TIER_PRICING_TABLE: Record<string, ModelPricing> = {
  tier1_webgpu: {
    promptPerMillionUsd: 0.0,
    completionPerMillionUsd: 0.0,
    baselineSavingsPerMillionUsd: 2.5, // Compared to cloud frontier
  },
  tier2_cache: {
    promptPerMillionUsd: 0.0,
    completionPerMillionUsd: 0.0,
    baselineSavingsPerMillionUsd: 2.0,
  },
  tier3_vast: {
    promptPerMillionUsd: 0.15,
    completionPerMillionUsd: 0.3,
    baselineSavingsPerMillionUsd: 1.8,
  },
  tier4_frontier: {
    promptPerMillionUsd: 1.5,
    completionPerMillionUsd: 3.5,
    baselineSavingsPerMillionUsd: 0.0,
  },
};

export interface CostTelemetrySummary {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalCostUsd: number;
  totalCostBdt: number;
  totalSavedUsd: number;
  totalSavedBdt: number;
  byTier: Record<
    string,
    {
      tokens: number;
      costUsd: number;
      savedUsd: number;
    }
  >;
  byTwin: Record<
    string,
    {
      tokens: number;
      costUsd: number;
      costBdt: number;
    }
  >;
  lastUpdated: string;
}

class TokenCostTracker {
  private promptTokens = 0;
  private completionTokens = 0;
  private totalCostUsd = 0;
  private totalSavedUsd = 0;
  private byTier: Record<string, { tokens: number; costUsd: number; savedUsd: number }> = {};
  private byTwin: Record<string, { tokens: number; costUsd: number; costBdt: number }> = {};
  private lastUpdated: string = new Date().toISOString();

  constructor() {
    this.reset();
  }

  public recordUsage(record: TokenUsageRecord): {
    costUsd: number;
    costBdt: number;
    savedUsd: number;
    savedBdt: number;
  } {
    const tier = record.modelOrTier || "tier1_webgpu";
    const pricing = TIER_PRICING_TABLE[tier] || TIER_PRICING_TABLE.tier1_webgpu;

    const promptTokens = Math.max(0, record.promptTokens || 0);
    const completionTokens = Math.max(0, record.completionTokens || 0);
    const totalTokens = promptTokens + completionTokens;

    const costUsd =
      (promptTokens / 1_000_000) * pricing.promptPerMillionUsd +
      (completionTokens / 1_000_000) * pricing.completionPerMillionUsd;

    const savedUsd = (totalTokens / 1_000_000) * pricing.baselineSavingsPerMillionUsd;

    const costBdt = Math.round(costUsd * USD_TO_BDT_RATE * 100) / 100;
    const savedBdt = Math.round(savedUsd * USD_TO_BDT_RATE * 100) / 100;

    this.promptTokens += promptTokens;
    this.completionTokens += completionTokens;
    this.totalCostUsd += costUsd;
    this.totalSavedUsd += savedUsd;
    this.lastUpdated = new Date().toISOString();

    // Track by Tier
    if (!this.byTier[tier]) {
      this.byTier[tier] = { tokens: 0, costUsd: 0, savedUsd: 0 };
    }
    this.byTier[tier].tokens += totalTokens;
    this.byTier[tier].costUsd += costUsd;
    this.byTier[tier].savedUsd += savedUsd;

    // Track by Twin
    const twinId = record.twinId || "general_swarm";
    if (!this.byTwin[twinId]) {
      this.byTwin[twinId] = { tokens: 0, costUsd: 0, costBdt: 0 };
    }
    this.byTwin[twinId].tokens += totalTokens;
    this.byTwin[twinId].costUsd += costUsd;
    this.byTwin[twinId].costBdt += costBdt;

    return { costUsd, costBdt, savedUsd, savedBdt };
  }

  public getSummary(): CostTelemetrySummary {
    return {
      totalTokens: this.promptTokens + this.completionTokens,
      promptTokens: this.promptTokens,
      completionTokens: this.completionTokens,
      totalCostUsd: Math.round(this.totalCostUsd * 10000) / 10000,
      totalCostBdt: Math.round(this.totalCostUsd * USD_TO_BDT_RATE * 100) / 100,
      totalSavedUsd: Math.round(this.totalSavedUsd * 10000) / 10000,
      totalSavedBdt: Math.round(this.totalSavedUsd * USD_TO_BDT_RATE * 100) / 100,
      byTier: { ...this.byTier },
      byTwin: { ...this.byTwin },
      lastUpdated: this.lastUpdated,
    };
  }

  public reset(): void {
    this.promptTokens = 0;
    this.completionTokens = 0;
    this.totalCostUsd = 0;
    this.totalSavedUsd = 0;
    this.byTier = {
      tier1_webgpu: { tokens: 0, costUsd: 0, savedUsd: 0 },
      tier2_cache: { tokens: 0, costUsd: 0, savedUsd: 0 },
      tier3_vast: { tokens: 0, costUsd: 0, savedUsd: 0 },
      tier4_frontier: { tokens: 0, costUsd: 0, savedUsd: 0 },
    };
    this.byTwin = {};
    this.lastUpdated = new Date().toISOString();
  }
}

export const tokenCostTracker = new TokenCostTracker();
