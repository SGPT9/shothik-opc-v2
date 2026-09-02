/**
 * Full Backend Financial Audit Ledger & DB Pool Sentinel Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { financialAuditLedger } from "../../../api-server/src/lib/financial-audit-ledger";
import { databasePoolSentinel } from "../../../api-server/src/lib/db-pool-sentinel";

describe("Full Backend Audit & DB Pool Sentinel Suite", () => {
  describe("FinancialAuditLedger (SHA-256 Cryptographic Hash Chain)", () => {
    it("appends entries and verifies complete chain cryptographic integrity", () => {
      const e1 = financialAuditLedger.appendEntry("tx_bkash_01", 1500, "bkash_pgw", "mch_01");
      const e2 = financialAuditLedger.appendEntry("tx_split_02", 1200, "creator_split_80", "mch_01");

      expect(e1.previousHash).toBe("0000000000000000000000000000000000000000000000000000000000000000");
      expect(e2.previousHash).toBe(e1.currentHash);

      const verification = financialAuditLedger.verifyLedgerIntegrity();
      expect(verification.isValid).toBe(true);
      expect(verification.totalEntries).toBeGreaterThanOrEqual(2);
    });
  });

  describe("DatabasePoolSentinel (Query Timeout Watchdog)", () => {
    it("executes fast query within timeout budget successfully", async () => {
      const result = await databasePoolSentinel.executeQuery("fast_query", async () => {
        return "QUERY_SUCCESS";
      });

      expect(result).toBe("QUERY_SUCCESS");
      const health = databasePoolSentinel.getHealthStatus();
      expect(health.status).toBe("HEALTHY");
      expect(health.queryTimeoutMs).toBe(5000);
    });

    it("triggers query timeout error when query execution exceeds budget", async () => {
      await expect(
        databasePoolSentinel.executeQuery("slow_query", async () => {
          await new Promise((resolve) => setTimeout(resolve, 6000));
          return "SLOW_SUCCESS";
        })
      ).rejects.toThrow("exceeded maximum execution timeout");
    });
  });
});
