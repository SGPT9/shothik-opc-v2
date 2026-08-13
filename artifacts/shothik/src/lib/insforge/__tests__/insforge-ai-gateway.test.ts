import { describe, it, expect } from "vitest";
import { InsForgeOpenRouterAiGateway } from "../insforge-ai-gateway";

describe("InsForgeOpenRouterAiGateway", () => {
  it("should route prompt to DeepSeek-R1 via OpenRouter API Gateway", async () => {
    const res = await InsForgeOpenRouterAiGateway.completeChat({
      model: "deepseek/deepseek-r1",
      messages: [{ role: "user", content: "Explain Banglish NLP optimization" }],
    });

    expect(res.modelUsed).toBe("deepseek/deepseek-r1");
    expect(res.content).toContain("deepseek/deepseek-r1");
    expect(res.tokensUsed).toBeGreaterThan(0);
  });
});
