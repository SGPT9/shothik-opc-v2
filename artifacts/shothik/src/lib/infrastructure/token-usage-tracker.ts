/**
 * Real-Time AI Model Token Usage & Unit Economics Tracker
 * Tracks input/output token counts, model cost in USD & BDT, and margin economics.
 */

export interface ModelPricing {
  inputCostPerMillionUsd: number;
  outputCostPerMillionUsd: number;
}

export interface TokenUsageRecordInput {
  userId: string;
  modelName: "deepseek-r1" | "claude-3.7-sonnet" | "gpt-4.5";
  promptTokens: number;
  completionTokens: number;
}

export interface TokenUsageReport {
  userId: string;
  modelName: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  totalCostBdt: number; // USD to BDT @ 120 BDT/USD
  grossMarginPercent: number;
  timestamp: string;
}

export class TokenUsageTracker {
  private bdtExchangeRate = 120;
  private pricingMap: Record<string, ModelPricing> = {
    "deepseek-r1": { inputCostPerMillionUsd: 0.55, outputCostPerMillionUsd: 2.19 },
    "claude-3.7-sonnet": { inputCostPerMillionUsd: 3.0, outputCostPerMillionUsd: 15.0 },
    "gpt-4.5": { inputCostPerMillionUsd: 5.0, outputCostPerMillionUsd: 15.0 },
  };

  /**
   * Calculate and record token usage unit economics
   */
  public recordUsage(input: TokenUsageRecordInput): TokenUsageReport {
    const pricing = this.pricingMap[input.modelName] || this.pricingMap["deepseek-r1"];

    const promptCost = (input.promptTokens / 1_000_000) * pricing.inputCostPerMillionUsd;
    const completionCost = (input.completionTokens / 1_000_000) * pricing.outputCostPerMillionUsd;
    const totalCostUsd = Number((promptCost + completionCost).toFixed(6));
    const totalCostBdt = Number((totalCostUsd * this.bdtExchangeRate).toFixed(4));

    // Platform pricing model assumes $0.15 flat fee charged per turn
    const chargedBdt = 18; // 18 BDT ($0.15)
    const grossMarginPercent = Number((((chargedBdt - totalCostBdt) / chargedBdt) * 100).toFixed(2));

    return {
      userId: input.userId,
      modelName: input.modelName,
      promptTokens: input.promptTokens,
      completionTokens: input.completionTokens,
      totalTokens: input.promptTokens + input.completionTokens,
      totalCostUsd,
      totalCostBdt,
      grossMarginPercent,
      timestamp: new Date().toISOString(),
    };
  }
}

export const tokenUsageTracker = new TokenUsageTracker();
