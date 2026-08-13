import { describe, it, expect } from "vitest";
import { StartupValidationFunnelService } from "../startup-validation-funnel-service";

describe("StartupValidationFunnelService", () => {
  it("should run Step 1: Cofounder Analysis and calculate TAM, SAM, SOM", () => {
    const analysis = StartupValidationFunnelService.runCofounderAnalysis("Kirana B2B Quick Commerce");

    expect(analysis.tamBdtUsd.tamUsd).toBe("$10.0 Billion USD");
    expect(analysis.samBdtUsd.samUsd).toBe("$1.5 Billion USD");
    expect(analysis.somBdtUsd.somUsd).toBe("$150 Million USD");
    expect(analysis.keyGrowthDrivers).toHaveLength(3);
  });

  it("should run Step 2: Web Search Validation and audit competitors & regulations", () => {
    const web = StartupValidationFunnelService.runWebSearchValidation("Kirana B2B Quick Commerce");

    expect(web.competitorLandscape).toHaveLength(3);
    expect(web.regulatoryCompliance[0].status).toBe("COMPLIANT");
    expect(web.liveWebCitationSummary).toContain("e-Commerce Gazette");
  });

  it("should run Step 3: ScenarioLab Stress-Test and evaluate 2GB RAM & MFS fraud risks", () => {
    const stress = StartupValidationFunnelService.runScenarioLabStressTest("Kirana B2B Quick Commerce");

    expect(stress.hardwareLowRamFootprint.domMemoryMb).toBeLessThan(48);
    expect(stress.hardwareLowRamFootprint.passFail).toBe("PASS");
    expect(stress.mfsBkashNagadFraudRiskScore).toBeLessThan(20);
    expect(stress.overallStressTestRating).toBe("EXCELLENT");
  });

  it("should run full 3-step validation funnel report", () => {
    const report = StartupValidationFunnelService.runFullValidationFunnel("Kirana B2B Quick Commerce");

    expect(report.runId).toContain("funnel_run_");
    expect(report.cofounder).toBeDefined();
    expect(report.webSearch).toBeDefined();
    expect(report.scenarioLab).toBeDefined();
  });
});
