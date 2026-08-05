import { describe, it, expect } from "vitest";
import { DiffusionGemmaEngine } from "../diffusion-gemma-engine";

describe("DiffusionGemmaEngine 2,000+ tok/s Non-Autoregressive Diffusion LLM", () => {
  it("should execute ultra-fast inference and return >2000 tokens/sec performance metrics", async () => {
    const result = await DiffusionGemmaEngine.generate({
      prompt: "Synthesize full chapter for PublishDrive manuscript",
      maxTokens: 2048,
    });

    expect(result.content).toBeDefined();
    expect(result.tokensPerSecond).toBeGreaterThanOrEqual(2000);
    expect(result.model).toBe("unsloth/diffusiongemma-26B-A4B-it-GGUF");
  });
});
