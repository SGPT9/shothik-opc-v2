import { describe, it, expect, vi, beforeEach } from "vitest";
import { LocalComputeAdapter } from "../LocalComputeAdapter.js";

describe("LocalComputeAdapter", () => {
  let adapter: LocalComputeAdapter;

  beforeEach(() => {
    adapter = new LocalComputeAdapter();
    vi.restoreAllMocks();
  });

  it("checks local health status successfully", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ models: [] }),
    } as any);

    const isHealthy = await adapter.checkHealth();
    expect(isHealthy).toBe(true);
  });

  it("executes local inference generation", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        model: "qwen2.5-coder:7b",
        response: "const total = a + b;",
        total_duration: 350000000,
        eval_count: 12,
      }),
    } as any);

    const result = await adapter.generate({
      prompt: "Write add function",
    });

    expect(result.model).toBe("qwen2.5-coder:7b");
    expect(result.response).toBe("const total = a + b;");
    expect(result.totalDurationMs).toBe(350);
  });
});
