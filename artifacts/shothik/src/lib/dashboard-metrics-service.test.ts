/**
 * DashboardMetricsService Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { dashboardMetricsService } from "./infrastructure/dashboard-metrics-service";

describe("DashboardMetricsService (System Telemetry & Metrics)", () => {
  it("compiles master system metrics overview cleanly", () => {
    const metrics = dashboardMetricsService.getSystemMetricsOverview();

    expect(metrics.totalGmvBdt).toBeGreaterThan(0);
    expect(metrics.activeMerchantsCount).toBe(42);
    expect(metrics.parcelsBookedToday).toBe(184);
    expect(metrics.apiSuccessRatePercent).toBe(99.85);
  });
});
