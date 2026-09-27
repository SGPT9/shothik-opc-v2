import { describe, it, expect, beforeEach } from "vitest";
import { RtoFraudEngine } from "../rto-fraud-engine.js";

describe("RtoFraudEngine (Slice 77: Autonomous Steadfast & Pathao RTO Prediction & Fraud Blacklist Sync)", () => {
  it("normalizes diverse Bangladeshi phone number formats and resolves operator", () => {
    const p1 = RtoFraudEngine.normalizeBdPhone("+880 1711-002233");
    expect(p1.isValid).toBe(true);
    expect(p1.normalized).toBe("01711002233");
    expect(p1.operator).toBe("Grameenphone");

    const p2 = RtoFraudEngine.normalizeBdPhone("8801822334455");
    expect(p2.isValid).toBe(true);
    expect(p2.normalized).toBe("01822334455");
    expect(p2.operator).toBe("Robi");

    const p3 = RtoFraudEngine.normalizeBdPhone("01912345678");
    expect(p3.isValid).toBe(true);
    expect(p3.normalized).toBe("01912345678");
    expect(p3.operator).toBe("Banglalink");

    const pInvalid = RtoFraudEngine.normalizeBdPhone("123456");
    expect(pInvalid.isValid).toBe(false);
    expect(pInvalid.operator).toBe("UNKNOWN");
  });

  it("evaluates a trusted buyer with high courier DSR and generates zero-advance policy", () => {
    const res = RtoFraudEngine.predictRTORisk({
      phone: "01711002233",
      codAmountBdt: 2500,
      district: "Dhaka",
      deliveryAddress: "Road 10, House 4, Dhanmondi, Dhaka",
      orderRef: "ORD_TRUSTED_01",
    });

    expect(res.normalizedPhone).toBe("01711002233");
    expect(res.isBlacklisted).toBe(false);
    expect(res.credibilityScore).toBeGreaterThanOrEqual(85);
    expect(res.rtoProbabilityPercent).toBeLessThanOrEqual(15);
    expect(res.riskTier).toBe("TIER_VERIFIED_LOW");
    expect(res.totalHistoricalDelivered).toBeGreaterThan(0);
    expect(res.advancePolicy.requiresAdvance).toBe(false);
    expect(res.advancePolicy.policyType).toBe("NO_ADVANCE");
    expect(res.auditHash).toBeDefined();
    expect(res.auditHash.length).toBe(64);
  });

  it("detects high-risk chronic return buyer and enforces partial bKash delivery fee advance", () => {
    const res = RtoFraudEngine.predictRTORisk({
      phone: "01899112233",
      codAmountBdt: 4500,
      district: "Sylhet",
      deliveryAddress: "Zindabazar, Sylhet",
      orderRef: "ORD_RISK_02",
    });

    expect(res.isBlacklisted).toBe(false);
    expect(res.credibilityScore).toBeLessThan(65);
    expect(res.riskTier).toBe("TIER_HIGH_RISK");
    expect(res.advancePolicy.requiresAdvance).toBe(true);
    expect(res.advancePolicy.policyType).toBe("PARTIAL_DELIVERY_CHARGE");
    expect(res.advancePolicy.recommendedAdvanceAmountBdt).toBe(150); // Outside Dhaka
    expect(res.advancePolicy.paymentLink).toContain("ORD_RISK_02");
    expect(res.advancePolicy.whatsappTemplate).toContain("বিকাশ/নগদে প্রদান করতে হবে");
  });

  it("reports a customer to the community fraud blacklist and triggers TIER_CRITICAL_BLOCKED", () => {
    const targetPhone = "01555443322";

    // Before reporting
    const beforeCheck = RtoFraudEngine.checkBlacklist(targetPhone);
    expect(beforeCheck.isBlacklisted).toBe(false);

    // Report fraud
    const reportRes = RtoFraudEngine.reportFraud({
      phone: targetPhone,
      category: "FAKE_ORDER",
      reporterMerchant: "Chattogram Gadget Store",
      orderRef: "ORD_FAKE_882",
      notes: "Ordered iPhone case and power bank, phone switched off upon delivery.",
    });

    expect(reportRes.success).toBe(true);
    expect(reportRes.report.phone).toBe("01555443322");
    expect(reportRes.report.phoneHash).toBeDefined();

    // Check blacklist status
    const afterCheck = RtoFraudEngine.checkBlacklist(targetPhone);
    expect(afterCheck.isBlacklisted).toBe(true);
    expect(afterCheck.reports).toHaveLength(1);

    // Predict RTO for this newly blacklisted buyer
    const prediction = RtoFraudEngine.predictRTORisk({
      phone: targetPhone,
      codAmountBdt: 3200,
      district: "Chittagong",
      deliveryAddress: "GEC Circle, Chittagong",
      orderRef: "ORD_TEST_BLOCKED",
    });

    expect(prediction.isBlacklisted).toBe(true);
    expect(prediction.credibilityScore).toBe(0);
    expect(prediction.riskTier).toBe("TIER_CRITICAL_BLOCKED");
    expect(prediction.rtoProbabilityPercent).toBeGreaterThanOrEqual(95);
    expect(prediction.advancePolicy.requiresAdvance).toBe(true);
    expect(prediction.advancePolicy.policyType).toBe("FULL_PREPAYMENT");
    expect(prediction.advancePolicy.recommendedAdvanceAmountBdt).toBe(3200);

    // Clean up / whitelist test number
    const removeRes = RtoFraudEngine.removeFromBlacklist(targetPhone);
    expect(removeRes.success).toBe(true);
    expect(RtoFraudEngine.checkBlacklist(targetPhone).isBlacklisted).toBe(false);
  });

  it("lists all community blacklisted entries", () => {
    const list = RtoFraudEngine.listBlacklist();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    const item = list[0];
    expect(item.phone).toBeDefined();
    expect(item.phoneHash).toBeDefined();
    expect(item.categories.length).toBeGreaterThan(0);
  });
});
