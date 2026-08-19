import { describe, it, expect } from "vitest";
import { OfflineSyncQueue } from "../offline-sync-queue";
import { FraudRiskScorer } from "../fraud-risk-scorer";
import { StatutoryVatLedger } from "../statutory-vat-ledger";

describe("🇧🇩 Demography-Aware Architecture & Database Suite (Grilling Approvals)", () => {
  describe("1. OfflineSyncQueue (Flaky 3G Mitigation)", () => {
    it("should queue orders offline and drain & sync when back online", async () => {
      OfflineSyncQueue.clearSynced();

      const order1 = OfflineSyncQueue.enqueueOrder({
        merchantId: "merch_123",
        customerName: "Rahim Uddin",
        customerPhone: "01711223344",
        deliveryAddress: "Mirpur 10, Dhaka",
        courier: "steadfast",
        codAmount: 1850,
        advanceBkashAmount: 150,
        trxId: "BK9928192X",
      });

      expect(order1.syncStatus).toBe("QUEUED");
      expect(OfflineSyncQueue.getPendingOrders().length).toBe(1);

      const syncResult = await OfflineSyncQueue.drainAndSyncQueue(async (record) => {
        return { success: true, serverOrderId: `srv_${record.clientOrderId}` };
      });

      expect(syncResult.syncedCount).toBe(1);
      expect(syncResult.failedCount).toBe(0);
      expect(OfflineSyncQueue.getPendingOrders().length).toBe(0);
    });
  });

  describe("2. FraudRiskScorer (COD Return Defense)", () => {
    it("should evaluate low risk for customers with 0 returns", () => {
      const profile = FraudRiskScorer.evaluateRisk("01812345678", 5, 0);
      expect(profile.riskTier).toBe("LOW");
      expect(profile.requiresAdvanceBkash).toBe(false);
    });

    it("should mandate ৳200 advance bKash for customers with high return records", () => {
      const profile = FraudRiskScorer.evaluateRisk("01999887766", 4, 2);
      expect(profile.riskTier).toBe("CRITICAL");
      expect(profile.requiresAdvanceBkash).toBe(true);
      expect(profile.recommendedAdvanceAmount).toBe(200);
    });
  });

  describe("3. StatutoryVatLedger (Mushak-6.3 Gapless Sequential Compliance)", () => {
    it("should generate gapless sequential Mushak-6.3 challan with 5% VAT", () => {
      const challan1 = StatutoryVatLedger.issueMushakChallan({
        merchantBin: "001234567-0101",
        customerName: "Tanveer Ahmed",
        orderId: "ord_99812",
        grossAmount: 4000,
      });

      expect(challan1.sequenceId).toBeGreaterThanOrEqual(1001);
      expect(challan1.vatAmount).toBe(200); // 5% of 4000
      expect(challan1.netPayable).toBe(4200);
      expect(challan1.challanNumber).toContain("MUSHAK6.3");
    });
  });
});
