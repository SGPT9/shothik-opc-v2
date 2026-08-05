import { describe, it, expect } from "vitest";
import { WigoloWebIntelligenceService } from "../wigolo-service";

describe("WigoloWebIntelligenceService Local Keyless Web Search", () => {
  it("should execute keyless multi-engine rank fusion web search and return structured evidence scores", async () => {
    const result = await WigoloWebIntelligenceService.searchWeb({
      query: "Next.js 16 Server Actions and Performance Optimization",
      maxResults: 5,
    });

    expect(result.query).toBeDefined();
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].citationId).toBe("src-1");
    expect(result.results[0].evidenceScore).toBeGreaterThan(0.8);
    expect(result.engineUsed).toBe("wigolo-rank-fusion-local");
  });
});
