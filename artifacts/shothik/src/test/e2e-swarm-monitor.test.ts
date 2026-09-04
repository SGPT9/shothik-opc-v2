import { describe, it, expect } from "vitest";
import { SpeculativeEngine } from "@/lib/inference/SpeculativeEngine";

describe("E2E Integration: Swarm Monitor & Intel Arc B580 WebGPU Engine", () => {
  it("verifies hardware acceleration engine initialization", async () => {
    const isAvailable = await SpeculativeEngine.checkHardware();
    expect(typeof isAvailable).toBe("boolean");
  });

  it("verifies end-to-end speculative translation and rewriting flow", async () => {
    const rawInput = "The logistics courier provides fast delivery and very good profit for the merchant.";
    
    // Step 1: Speculative Rewrite
    const rewritten = await SpeculativeEngine.rewrite(rawInput);
    expect(rewritten.output).toContain("exemplary");
    expect(rewritten.output).toContain("low-latency");

    // Step 2: Speculative Bangla Translation
    const translated = await SpeculativeEngine.translateBangla(rawInput);
    expect(translated.output).toContain("কুরিয়ার সার্ভিস");
    expect(translated.output).toContain("হোম ডেলিভারি");
    expect(translated.output).toContain("মুনাফা");

    // Step 3: ONNX WebGPU Model pipeline
    const onnxRes = await SpeculativeEngine.runOnnxWebGpuInference(rawInput, {
      modelId: "qwen2.5-coder-0.5b-intel-arc",
    });
    expect(onnxRes.output).toContain("Intel Arc B580 WebGPU");
  });
});
