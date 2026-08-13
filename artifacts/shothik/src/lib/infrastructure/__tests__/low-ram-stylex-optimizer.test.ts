import { describe, it, expect } from "vitest";
import { LowRamStylexOptimizerService } from "../low-ram-stylex-optimizer";

describe("LowRamStylexOptimizerService", () => {
  it("should detect device capability and enable StyleX compile-time mode", () => {
    const config = LowRamStylexOptimizerService.detectDeviceCapabilities();

    expect(config.stylexCompileTimeActive).toBe(true);
    expect(config.deviceMemoryGb).toBeDefined();
    expect(config.virtualizationBatchSize).toBeGreaterThan(0);
  });

  it("should enforce 0ms CSS calculation runtime overhead and sub-1.2s LCP", () => {
    const metrics = LowRamStylexOptimizerService.measurePerformance(100);

    expect(metrics.cssRenderTimeMs).toBe(0); // 0ms CSS calculation overhead
    expect(metrics.lcpTimeMs).toBeLessThan(1200); // LCP < 1.2s
  });
});
