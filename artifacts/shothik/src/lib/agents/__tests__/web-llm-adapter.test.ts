import { describe, it, expect } from "vitest";
import { WebLlmAdapter, PREBUILT_WEBLEN_MODELS } from "../web-llm-adapter";

describe("⚡ WebLLM In-Browser WebGPU Adapter TDD Suite", () => {
  it("should list prebuilt lightweight models tailored for low-RAM devices", () => {
    expect(PREBUILT_WEBLEN_MODELS.length).toBeGreaterThanOrEqual(3);
    const qwen05 = PREBUILT_WEBLEN_MODELS[0];
    expect(qwen05.id).toBe("Qwen2.5-0.5B-Instruct-q4f16_1-MLC");
    expect(qwen05.isRecommendedForMobile).toBe(true);
    expect(qwen05.vramRequiredMB).toBeLessThan(500);
  });

  it("should simulate progressive model download and shader compilation", async () => {
    const progressReports: any[] = [];
    const adapter = new WebLlmAdapter((report) => progressReports.push(report));

    const success = await adapter.loadModel("Qwen2.5-0.5B-Instruct-q4f16_1-MLC");
    expect(success).toBe(true);
    expect(progressReports.length).toBeGreaterThanOrEqual(3);
    expect(progressReports[progressReports.length - 1].status).toBe("ready");
    expect(progressReports[progressReports.length - 1].progressPercent).toBe(100);
  });

  it("should stream offline tokens with tok/s telemetry", async () => {
    const adapter = new WebLlmAdapter();
    const chunks: string[] = [];

    for await (const chunk of adapter.generateStream("Calculate COD net payout")) {
      chunks.push(chunk.textChunk);
      expect(chunk.tokPerSec).toBeGreaterThan(0);
    }

    const fullResponse = chunks.join("");
    expect(fullResponse).toContain("[Offline In-Browser WebGPU Response");
    expect(fullResponse).toContain("Calculate COD net payout");
  });
});
