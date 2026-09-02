/**
 * NbrVatTaxService Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { nbrVatTaxService } from "../nbr-vat-tax-service";

describe("NbrVatTaxService (Statutory Tax & VAT Compliance)", () => {
  it("calculates Section 78 individual income tax & investment rebates", () => {
    const res = nbrVatTaxService.calculateIncomeTax({
      annualIncomeBdt: 650000,
      gender: "male",
      investmentBdt: 100000,
    });

    expect(res.taxableIncomeBdt).toBe(300000); // 650,000 - 350,000
    expect(res.grossTaxBdt).toBe(25000); // 5000 + 100000 * 0.1
    expect(res.investmentRebateBdt).toBe(3750); // 15% of 25000
    expect(res.netTaxPayableBdt).toBe(21250);
  });

  it("generates gapless sequential Mushak-6.3 VAT challan record", () => {
    const challan = nbrVatTaxService.generateMushakChallan({
      merchantId: "mch_01",
      customerName: "তানভীর আহমেদ",
      itemDescription: "প্রিমিয়াম কাতান শাড়ি",
      quantity: 2,
      unitPriceBdt: 3500,
      vatRatePercent: 5,
    });

    expect(challan.challanNumber).toContain("MUSHAK-6.3-2026-");
    expect(challan.totalBeforeVatBdt).toBe(7000);
    expect(challan.vatAmountBdt).toBe(350); // 5% of 7000 BDT
    expect(challan.totalWithVatBdt).toBe(7350);
    expect(challan.formattedMushak63PdfUrl).toContain(".pdf");
  });
});
