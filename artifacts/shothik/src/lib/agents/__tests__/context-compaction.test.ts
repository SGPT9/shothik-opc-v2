import { describe, it, expect } from "vitest";
import { DeepSeekCompactionEngine, ConversationTurn } from "../context-compaction";

describe("🧠 DeepSeek Context Compaction Engine TDD Suite", () => {
  it("should calculate context occupancy and identify critical pressure", () => {
    const engine = new DeepSeekCompactionEngine({
      maxContextTokens: 1000,
      thresholdRatio: 0.8, // 800 tokens
    });

    const smallTurns: ConversationTurn[] = [
      { id: "1", role: "user", content: "Hello", tokensEstimated: 20, timestamp: "" },
      { id: "2", role: "assistant", content: "Hi there!", tokensEstimated: 30, timestamp: "" },
    ];

    const lowPressure = engine.calculatePressure(smallTurns);
    expect(lowPressure.totalTokens).toBe(50);
    expect(lowPressure.isPressureCritical).toBe(false);
    expect(lowPressure.occupancyPercentage).toBe(5);

    const largeTurns: ConversationTurn[] = [
      { id: "1", role: "user", content: "Large query", tokensEstimated: 500, timestamp: "" },
      { id: "2", role: "assistant", content: "Large response", tokensEstimated: 400, timestamp: "" },
    ];

    const highPressure = engine.calculatePressure(largeTurns);
    expect(highPressure.totalTokens).toBe(900);
    expect(highPressure.isPressureCritical).toBe(true);
    expect(highPressure.occupancyPercentage).toBe(90);
  });

  it("should compact older turns while preserving recent tail and saving tokens", () => {
    const engine = new DeepSeekCompactionEngine({
      maxContextTokens: 1000,
      thresholdRatio: 0.5,
      retainRatio: 0.2, // Retain ~200 tokens of tail
    });

    const turns: ConversationTurn[] = [
      { id: "t1", role: "user", content: "Book Steadfast parcel for Tanveer", tokensEstimated: 200, timestamp: "" },
      { id: "t2", role: "assistant", content: "Consignment ST-582910 booked with tracking TRK-BD-99182.", tokensEstimated: 250, timestamp: "" },
      { id: "t3", role: "user", content: "Generate Mushak-6.3 tax invoice", tokensEstimated: 150, timestamp: "" },
      { id: "t4", role: "assistant", content: "Mushak-6.3 issued with ৳750 VAT.", tokensEstimated: 200, timestamp: "" },
      { id: "t5", role: "user", content: "Now calculate shipping discount", tokensEstimated: 50, timestamp: "" },
      { id: "t6", role: "assistant", content: "Applied ৳30 promo discount.", tokensEstimated: 60, timestamp: "" },
    ];

    const result = engine.compactTranscript(turns);

    expect(result.compacted).toBe(true);
    expect(result.checkpoint).toBeDefined();
    expect(result.checkpoint!.tokensSaved).toBeGreaterThan(300);
    expect(result.remainingTurns[0].role).toBe("system");
    expect(result.remainingTurns[0].content).toContain("<compacted-summary>");
    expect(result.remainingTurns[0].content).toContain("Logistics consignment booked");
    // Recent tail preserved
    expect(result.remainingTurns[result.remainingTurns.length - 1].content).toBe("Applied ৳30 promo discount.");
  });
});
