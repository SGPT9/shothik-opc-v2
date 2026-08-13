import { describe, it, expect } from "vitest";
import { InsForgeAuditScheduleService } from "../insforge-audit-schedule";

describe("InsForgeAuditScheduleService Security Audits", () => {
  it("should run nightly database audit and verify 100% RLS policy enforcement", async () => {
    const report = await InsForgeAuditScheduleService.runNightlySecurityAudit();

    expect(report.auditPassed).toBe(true);
    expect(report.rlsPoliciesEnforced).toBe(true);
    expect(report.unauthorizedAccessCount).toBe(0);
    expect(report.scannedTables.length).toBeGreaterThan(5);
  });
});
