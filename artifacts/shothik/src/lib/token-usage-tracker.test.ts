/**
 * TokenUsageTracker Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { tokenUsageTracker } from "./infrastructure/token-usage-tracker";

describe("TokenUsageTracker (Token Cost & Margin Analytics)", () => {
  it("calculates model token cost in USD & BDT for DeepSeek R1 turn", () => {
    const report = tokenUsageTracker.recordUsage({
      userId: "usr_01",
      modelName: "deepseek-r1",
      promptTokens: 1000,
      completionTokens: 500,
    });

    expect(report.totalTokens).toBe(1500);
    expect(report.totalCostUsd).toBeGreaterThan(0);
    expect(report.totalCostBdt).toBeGreaterThan(0);
    expect(report.grossMarginPercent).toBeGreaterThan(80);
  });
});
