import { describe, it, expect } from "vitest";
import { SpeculativeEngine } from "../SpeculativeEngine";

describe("SpeculativeEngine: Zero-Latency Client Inference", () => {
  it("executes speculative rewrite in <50ms", async () => {
    const original = "This is a very good logistics system with fast delivery.";
    const result = await SpeculativeEngine.rewrite(original);

    expect(result.output).toContain("exemplary");
    expect(result.output).toContain("low-latency");
    expect(result.latencyMs).toBeLessThan(100);
    expect(["webgpu", "wasm"]).toContain(result.engine);
  });

  it("executes speculative Bangla translation with dictionary matching", async () => {
    const original = "The courier provides cash on delivery for every merchant.";
    const result = await SpeculativeEngine.translateBangla(original);

    expect(result.output).toContain("কুরিয়ার সার্ভিস");
    expect(result.output).toContain("ক্যাশ অন ডেলিভারি");
    expect(result.output).toContain("মার্চেন্ট বা বিক্রেতা");
  });

  it("executes high-speed text condensing", async () => {
    const original = "Bangladesh emerging markets have high smartphone penetration. Courier logistics is expanding by 24% annually. E-commerce is the main driver.";
    const result = await SpeculativeEngine.condense(original);

    expect(result.output.length).toBeLessThan(original.length);
    expect(result.output).toContain("Key insight");
  });
});
