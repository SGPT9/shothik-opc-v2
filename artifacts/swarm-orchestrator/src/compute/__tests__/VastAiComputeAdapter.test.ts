import { describe, it, expect, vi, beforeEach } from "vitest";
import { VastAiComputeAdapter } from "../VastAiComputeAdapter.js";

describe("VastAiComputeAdapter", () => {
  let adapter: VastAiComputeAdapter;

  beforeEach(() => {
    adapter = new VastAiComputeAdapter({ apiKey: "test_vast_key" });
    vi.restoreAllMocks();
  });

  it("identifies configured state correctly", () => {
    expect(adapter.isConfigured()).toBe(true);
    const unconfigured = new VastAiComputeAdapter({ apiKey: "" });
    expect(unconfigured.isConfigured()).toBe(false);
  });

  it("searches spot instances via Vast API", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        offers: [
          { id: 101, gpu_name: "RTX 3090", dph_total: 0.18, gpu_ram: 24576 },
        ],
      }),
    } as any);

    const instances = await adapter.searchInstances();
    expect(instances).toHaveLength(1);
    expect(instances[0].gpu).toBe("RTX 3090");
    expect(instances[0].vram).toBe(24);
  });

  it("executes batch inference successfully", async () => {
    const result = await adapter.executeInference({
      model: "deepseek/deepseek-r1-distill-qwen-32b",
      prompt: "Synthesize market report",
    });

    expect(result.model).toBe("deepseek/deepseek-r1-distill-qwen-32b");
    expect(result.response).toContain("[Vast.ai GPU Generated]");
    expect(result.costUsd).toBeGreaterThan(0);
  });
});
