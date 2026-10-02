import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../../../app";
import { SyntheticJourneyRunner } from "../synthetic-journey-runner";

describe("Autonomous Synthetic User Journey Canary Test Suite", () => {
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = (server.address() as any).port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  it("executes the full multi-stage founder transaction journey with 100% success", async () => {
    const runner = new SyntheticJourneyRunner(baseUrl);
    const report = await runner.runFullJourney();

    expect(report.allPassed).toBe(true);
    expect(report.steps.length).toBe(5);
    expect(report.totalDurationMs).toBeLessThan(10000);

    const stepNames = report.steps.map((s) => s.step);
    expect(stepNames).toContain("01_health_diagnostics");
    expect(stepNames).toContain("02_tea_estate_catalog");
    expect(stepNames).toContain("03_tea_auction_bid");
    expect(stepNames).toContain("04_mfs_payment_clearing");
    expect(stepNames).toContain("05_zero_pii_gasket_audit");
  });
});
