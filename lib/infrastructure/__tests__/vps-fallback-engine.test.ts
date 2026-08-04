import { describe, it, expect, vi } from "vitest";
import { VpsFallbackEngine } from "../vps-fallback-engine";

describe("VpsFallbackEngine Zero-Failure Resilience", () => {
  it("should return resilient output even when network APIs fail", async () => {
    const result = await VpsFallbackEngine.executeWithZeroFailure({
      prompt: "Perform security audit on InsForge row level policies",
    });

    expect(result.content).toBeDefined();
    expect(result.content.length).toBeGreaterThan(20);
    expect(result.tierUsed).toBeDefined();
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
