/**
 * HealthProbeService Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { healthProbeService } from "./infrastructure/health-probe-service";

describe("HealthProbeService (Liveness & Readiness Probes)", () => {
  it("returns UP status for liveness check", () => {
    const res = healthProbeService.checkLiveness();
    expect(res.status).toBe("UP");
    expect(res.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });

  it("returns UP status and system metrics for readiness check", () => {
    const res = healthProbeService.checkReadiness();
    expect(res.status).toBe("UP");
    expect(res.checks.database).toBe(true);
    expect(res.checks.redis).toBe(true);
    expect(res.checks.memoryHeapUsedMb).toBeGreaterThan(0);
  });
});
