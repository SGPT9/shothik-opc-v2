import { describe, it, expect } from "vitest";
import { PlatformElevatorEngine, type MerchantElevatorMetrics } from "./elevator-engine.js";

describe("PlatformElevatorEngine & Viral Growth Triggers", () => {
  it("calculates MHI score deterministically across all 4 weighted components", () => {
    const metrics: MerchantElevatorMetrics = {
      merchantId: "merch_test_mhi_01",
      merchantName: "Test Solopreneur",
      monthlyGmvBdt: 750000, // 50 pts (50% of 1.5M cap) -> 50 * 0.4 = 20 pts
      totalOrdersDispatched: 100,
      ordersDeliveredSuccessfully: 95, // 95% delivery rate -> 95 * 0.35 = 33.25 pts
      avgFulfillmentHours: 4, // 100 - (4*2) = 92 pts -> 92 * 0.15 = 13.8 pts
      binVerified: true, // 50 pts
      nidVerified: true, // 50 pts -> 100 * 0.10 = 10 pts
    };

    const { mhiScore, breakdown } = PlatformElevatorEngine.calculateMhi(metrics);
    expect(breakdown.gmvScore).toBe(100); // 750k >= 500k -> 100 pts
    expect(breakdown.codDeliveryRateScore).toBe(95);
    expect(breakdown.fulfillmentSpeedScore).toBe(92);
    expect(breakdown.statutoryVerificationScore).toBe(100);
    // Total = 40 + 33.25 + 13.8 + 10 = 97.05 -> rounded to 97.1
    expect(mhiScore).toBeCloseTo(97.1, 1);
  });

  it("progresses merchants through 4 elevator tiers with correct cumulative privileges", () => {
    // Level 1: Rookie
    const l1 = PlatformElevatorEngine.registerOrUpdateMerchant({
      merchantId: "merch_l1",
      merchantName: "Rookie Shop",
      monthlyGmvBdt: 25000,
      totalOrdersDispatched: 20,
      ordersDeliveredSuccessfully: 18,
      avgFulfillmentHours: 10,
      binVerified: false,
      nidVerified: false,
    });
    expect(l1.currentTier).toBe(1);
    expect(l1.tierTitle).toBe("Rookie Solopreneur");
    expect(l1.unlockedPrivileges.length).toBe(3);
    expect(l1.nextTierRequirements?.targetTier).toBe(2);

    // Level 3: Power Merchant
    const l3 = PlatformElevatorEngine.registerOrUpdateMerchant({
      merchantId: "merch_l3",
      merchantName: "Power Lifestyle",
      monthlyGmvBdt: 450000,
      totalOrdersDispatched: 300,
      ordersDeliveredSuccessfully: 290,
      avgFulfillmentHours: 3,
      binVerified: true,
      nidVerified: true,
    });
    expect(l3.currentTier).toBe(3);
    expect(l3.tierTitle).toBe("Power Merchant");
    expect(l3.unlockedPrivileges.some(p => p.id === "mushak_vat_auto")).toBe(true);
    expect(l3.unlockedPrivileges.some(p => p.id === "steadfast_rebate")).toBe(true);
  });

  it("handles referral code claims and ৳50 bKash cashback unlocks upon 5 deliveries", () => {
    const referrerCode = "SHOTHIK-TESTREF";
    const claim = PlatformElevatorEngine.claimReferral({
      referrerCode,
      refereeId: "referee_merch_01",
      refereeName: "New Gadget Store",
    });
    expect(claim.success).toBe(true);
    expect(claim.bonusCallMinutes).toBe(50);

    // Duplicate claim rejected
    const dupClaim = PlatformElevatorEngine.claimReferral({
      referrerCode,
      refereeId: "referee_merch_01",
      refereeName: "New Gadget Store",
    });
    expect(dupClaim.success).toBe(false);

    // Increment 4 deliveries (no cashback yet)
    for (let i = 0; i < 4; i++) {
      const res = PlatformElevatorEngine.recordRefereeDelivery({
        referrerCode,
        refereeId: "referee_merch_01",
      });
      expect(res.cashbackUnlocked).toBe(false);
    }

    // 5th delivery unlocks ৳50 cashback
    const finalDelivery = PlatformElevatorEngine.recordRefereeDelivery({
      referrerCode,
      refereeId: "referee_merch_01",
    });
    expect(finalDelivery.cashbackUnlocked).toBe(true);
    expect(finalDelivery.rewardBdt).toBe(50);

    const ledger = PlatformElevatorEngine.getReferralLedger(referrerCode);
    expect(ledger.length).toBe(1);
    expect(ledger[0].cashbackPaid).toBe(true);
  });

  it("manages 1688 group sourcing pools and tracks collective MOQ milestones", () => {
    const pool = PlatformElevatorEngine.createSourcingPool({
      productTitle: "Smart Solar Inverters (1688)",
      hsCode: "8504.40.90",
      targetQuantity: 500,
      initialQuantity: 150,
      unitPriceUsd: 45,
      poolMasterMerchantId: "merch_solar_master",
      poolMasterName: "Bengal Solar Tech",
    });

    expect(pool.committedQuantity).toBe(150);
    expect(pool.status).toBe("open");

    // Another merchant joins
    const joinRes = PlatformElevatorEngine.joinSourcingPool({
      poolId: pool.poolId,
      merchantId: "merch_solar_partner",
      merchantName: "Dhaka Green Power",
      quantity: 350,
    });

    expect(joinRes.success).toBe(true);
    expect(joinRes.pool?.committedQuantity).toBe(500);
    expect(joinRes.pool?.status).toBe("locked"); // MOQ achieved!
  });

  it("generates tamper-proof verifiable trust badge with HMAC signature", () => {
    const badge = PlatformElevatorEngine.generateTrustBadge("merch_shothik_dhaka_01");
    expect(badge).toBeDefined();
    expect(badge?.merchantName).toBe("Shothik Lifestyle & Electronics");
    expect(badge?.signature).toBeDefined();
    expect(badge?.embedSnippetHtml).toContain("data-sig=");
    expect(badge?.embedSnippetHtml).toContain("Verified Shothik OPC");
  });

  it("generates viral receipt watermark with referral tracking token", () => {
    const watermark = PlatformElevatorEngine.generateViralReceiptWatermark({
      merchantId: "merch_shothik_dhaka_01",
      invoiceNo: "INV-2026-991",
      grandTotalBdt: 3450,
    });

    expect(watermark.watermarkText).toContain("Verified Mushak 6.3");
    expect(watermark.viralQrUrl).toContain("ref=SHOTHIK-AKA_01");
    expect(watermark.conversionCta).toContain("50 Free AI Calls");
  });
});
