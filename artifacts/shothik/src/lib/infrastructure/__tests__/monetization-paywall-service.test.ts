import { describe, it, expect } from "vitest";
import { MonetizationPaywallService, FEATURE_RATE_CARDS, CREDIT_PACKAGES } from "../monetization-paywall-service";

describe("MonetizationPaywallService", () => {
  it("should deduct correct feature credits when balance is sufficient", () => {
    const result = MonetizationPaywallService.deductCredits(100, "cofounder_tam_analysis");

    expect(result.success).toBe(true);
    expect(result.cost).toBe(5);
    expect(result.newBalance).toBe(95);
  });

  it("should block deduction and return error when balance is insufficient", () => {
    const result = MonetizationPaywallService.deductCredits(2, "student_assignment_slide");

    expect(result.success).toBe(false);
    expect(result.cost).toBe(10);
    expect(result.newBalance).toBe(2);
    expect(result.error).toContain("Insufficient credits");
  });

  it("should process 1-tap bKash/Nagad credit package top-up", () => {
    const topup = MonetizationPaywallService.purchaseCreditPackage("pro_500", "bkash");

    expect(topup.transactionId).toContain("TRX_TOPUP_BKASH_");
    expect(topup.paymentUrl).toContain("pay.bkash.com.bd/topup");
    expect(topup.creditsAdded).toBe(3500); // 3000 + 500 bonus
    expect(topup.totalPaidBdt).toBe(500);
  });
});
