import { describe, it, expect } from "vitest";
import { LandRecordPorchaService } from "../land-record-porcha-service";

describe("LandRecordPorchaService", () => {
  it("should parse RS Land Record Porcha and return Khatian 452, Dag 1208, and Tejgaon Mouza", () => {
    const porcha = LandRecordPorchaService.parsePorchaDocument("RS");

    expect(porcha.surveyType).toBe("RS");
    expect(porcha.khatianNumber).toBe("452");
    expect(porcha.dagNumber).toBe("1208");
    expect(porcha.mouza).toContain("Tejgaon");
    expect(porcha.areaShatakDecimal).toBe(15.5);
  });

  it("should calculate Land Development Tax (Khajna) for 15.5 Decimals of commercial land with penalty", () => {
    const tax = LandRecordPorchaService.calculateLandTax({
      surveyType: "RS",
      landClass: "commercial",
      areaShatakDecimal: 15.5,
      unpaidYears: 2,
      district: "Dhaka",
    });

    expect(tax.annualTaxBdt).toBe(4650);
    expect(tax.arrearsBdt).toBe(9300);
    expect(tax.lateSurchargeBdt).toBe(930); // 10% penalty
    expect(tax.totalTaxPayableBdt).toBe(10230);
  });

  it("should generate Ministry of Land e-Challan tax clearance receipt", () => {
    const rcpt = LandRecordPorchaService.generateLandTaxReceipt("452", "1208", "Tejgaon I/A", "Tanvir Ahmed", 10230, "bkash");

    expect(rcpt.challanNumber).toContain("CHALLAN_MOL_");
    expect(rcpt.taxPayerName).toBe("Tanvir Ahmed");
    expect(rcpt.amountPaidBdt).toBe(10230);
    expect(rcpt.paymentMethod).toBe("BKASH");
  });
});
