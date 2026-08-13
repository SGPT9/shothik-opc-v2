import { describe, it, expect } from "vitest";
import { VastAiGpuBurstingService } from "../vast-ai-gpu-bursting";

describe("VastAiGpuBurstingService Dynamic GPU Cloud Bursting", () => {
  it("should provision ultra-low-cost Vast.ai RTX 4090 GPU instance ($0.18/hr)", async () => {
    const gpu = await VastAiGpuBurstingService.burstGpuInstance({
      maxCostPerHour: 0.25,
      minVramGb: 24,
    });

    expect(gpu.gpuName).toContain("RTX 4090");
    expect(gpu.costPerHour).toBeLessThanOrEqual(0.25);
    expect(gpu.status).toBe("running");
  });

  it("should terminate Vast.ai GPU instance immediately after job completion", async () => {
    const terminated = await VastAiGpuBurstingService.terminateGpuInstance("vast_gpu_123");
    expect(terminated).toBe(true);
  });
});
