import { describe, it, expect, beforeEach } from "vitest";
import { PeerDelegationEngine } from "../../agents/peer-delegation";
import { BrowserTrackingSyncEngine } from "../browser-tracking-sync";

describe("🤝 Peer Delegation & Autonomous Tracking Sync TDD Suite", () => {
  describe("1. PeerDelegationEngine (Rakazo Architecture)", () => {
    let engine: PeerDelegationEngine;

    beforeEach(() => {
      engine = new PeerDelegationEngine();
    });

    it("should retrieve and update persistent agent memory tables", () => {
      const initialBin = engine.getMemory("tax_accounting_agent", "company_bin");
      expect(initialBin?.value).toBe("002938192-0102");

      engine.setMemory({
        id: "mem-custom",
        agentRole: "sales_twin",
        category: "customer_preference",
        key: "preferred_discount_ceiling",
        value: "10%",
        confidence: 0.99,
        updatedAt: new Date().toISOString(),
      });

      const preference = engine.getMemory("sales_twin", "preferred_discount_ceiling");
      expect(preference?.value).toBe("10%");
    });

    it("should enforce strict idempotency on inbound bKash IPN and carrier webhooks", () => {
      const eventPayload = {
        eventId: "evt-bkash-9921",
        source: "bkash_ipn" as const,
        idempotencyKey: "IPN_BK99281726X_SETTLE",
        payload: { trxId: "BK99281726X", amount: 1850 },
      };

      const firstIngest = engine.ingestEvent(eventPayload);
      expect(firstIngest.accepted).toBe(true);
      expect(firstIngest.isDuplicate).toBe(false);

      // Replaying the exact same event must be rejected as duplicate
      const secondIngest = engine.ingestEvent(eventPayload);
      expect(secondIngest.accepted).toBe(false);
      expect(secondIngest.isDuplicate).toBe(true);
    });

    it("should execute peer delegation from Sales Twin to NBR Tax Accounting Agent", async () => {
      const delegation = await engine.delegateTask(
        "sales_twin",
        "tax_accounting_agent",
        "generate_mushak_63",
        { amount: 10000, vatRate: 7.5 }
      );

      expect(delegation.status).toBe("completed");
      expect(delegation.result.challanNo).toMatch(/^MUS-6\.3-\d{6}$/);
      expect(delegation.result.binNumber).toBe("002938192-0102");
      expect(delegation.result.vatPayable).toBe(750);
    });

    it("should execute peer delegation from Sales Twin to Logistics Agent", async () => {
      const delegation = await engine.delegateTask(
        "sales_twin",
        "logistics_agent",
        "dispatch_courier",
        { preferredCarrier: "steadfast", codAmount: 1850 }
      );

      expect(delegation.status).toBe("completed");
      expect(delegation.result.consignmentId).toMatch(/^ST-\d{6}$/);
      expect(delegation.result.trackingCode).toMatch(/^TRK-BD-\d{6}$/);
      expect(delegation.result.carrier).toBe("steadfast");
    });
  });

  describe("2. BrowserTrackingSyncEngine (Gobii Web Scraper Architecture)", () => {
    it("should parse Delivered milestone and reconcile merchant COD ledger", () => {
      const rawDom = `<div class="status-badge">Delivery Completed · Cash Received ৳1,850</div>`;
      const parsed = BrowserTrackingSyncEngine.parseTrackingDom(rawDom, "ST-571462", "steadfast", 1850);

      expect(parsed.milestone).toBe("DELIVERED_CASH_COLLECTED");
      expect(parsed.requiresCustomerRescue).toBe(false);

      const reconciliation = BrowserTrackingSyncEngine.reconcileCodSettlement(parsed, true);
      // Outside Dhaka: ৳1,850 - ৳120 delivery - ৳18.50 COD fee = ৳1,711.50 ~ ৳1,712
      expect(reconciliation.settlementStatus).toBe("READY_FOR_DISBURSEMENT");
      expect(reconciliation.courierDeliveryCharge).toBe(120);
      expect(reconciliation.codSurchargeAmount).toBe(19); // 1% of 1850 rounded
      expect(reconciliation.netMerchantPayable).toBe(1711);
    });

    it("should trigger Zero-Return Banglish rescue alert when customer is unreachable", () => {
      const rawDom = `<div class="status-fail">Delivery Failed: Customer Phone Unreachable (ফোন রিসিভ করেননি)</div>`;
      const parsed = BrowserTrackingSyncEngine.parseTrackingDom(
        rawDom,
        "ST-571462",
        "steadfast",
        1850,
        "তানভীর আহমেদ"
      );

      expect(parsed.milestone).toBe("DELIVERY_FAILED_UNREACHABLE");
      expect(parsed.requiresCustomerRescue).toBe(true);
      expect(parsed.rescueMessage).toContain("Assalamu Alaikum তানভীর আহমেদ");
      expect(parsed.rescueMessage).toContain("STEADFAST rider delivery korte eshechilo");
    });
  });
});
