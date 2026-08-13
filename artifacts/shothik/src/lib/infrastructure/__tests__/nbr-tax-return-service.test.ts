import { describe, it, expect } from "vitest";
import { NbrTaxReturnService } from "../nbr-tax-return-service";

describe("NbrTaxReturnService Income Tax Act 2023", () => {
  it("should calculate progressive tax slabs and apply 15% investment tax rebate", () => {
    const calc = NbrTaxReturnService.calculateIncomeTax({
      taxPayerName: "Tanvir Ahmed",
      eTinNumber: "884269123456",
      genderOrCategory: "general",
      annualSalaryBdt: 850000,
      investmentAmountBdt: 100000,
    });

    expect(calc.taxableIncomeBdt).toBe(850000);
    expect(calc.taxExemptThresholdBdt).toBe(350000);
    expect(calc.taxBeforeRebateBdt).toBe(50000); // 5% on 1L + 10% on 3L + 15% on 1L = 5,000 + 30,000 + 15,000 = 50,000
    expect(calc.investmentRebateBdt).toBe(15000); // 15% of 100k = 15,000
    expect(calc.netTaxPayableBdt).toBe(35000); // 50,000 - 15,000 = 35,000
  });

  it("should generate official NBR e-Return Form 11GA Acknowledgment Receipt", () => {
    const rcpt = NbrTaxReturnService.generateETinForm11GAReceipt({
      taxPayerName: "Tanvir Ahmed",
      eTinNumber: "884269123456",
      genderOrCategory: "general",
      annualSalaryBdt: 850000,
    }, "bkash");

    expect(rcpt.acknowledgmentNumber).toContain("NBR_ACK_11GA_");
    expect(rcpt.eTinNumber).toBe("884269123456");
    expect(rcpt.assessmentYear).toBe("2025-2026");
    expect(rcpt.nbrClearanceStatus).toBe("SUBMITTED_AND_CLEARED");
  });
});
