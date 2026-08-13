import { describe, it, expect } from "vitest";
import { FreelancerTaxRemittanceService } from "../freelancer-tax-remittance-service";

describe("FreelancerTaxRemittanceService", () => {
  it("should calculate gross BDT ৳306,250 and apply 0% NBR SRO software export tax exemption", () => {
    const calc = FreelancerTaxRemittanceService.calculateRemittance({
      grossUsd: 2500,
      exchangeRateBdt: 122.50,
      wireProvider: "wise",
      serviceCategory: "it_software_export",
      freelancerName: "Tanvir Ahmed",
      passportOrNid: "19942691234567890",
    });

    expect(calc.grossAmountBdt).toBe(306250);
    expect(calc.taxExempt).toBe(true);
    expect(calc.taxRatePercent).toBe(0);
    expect(calc.tdsDeductedBdt).toBe(0);
    expect(calc.nbrSroReference).toContain("NBR SRO No. 228");
    expect(calc.netPayoutBdt).toBeLessThan(306250);
  });

  it("should generate Bangladesh Bank Form C Encashment Certificate metadata", () => {
    const cert = FreelancerTaxRemittanceService.generateFormCCertificate({
      grossUsd: 1500,
      exchangeRateBdt: 122.50,
      wireProvider: "payoneer",
      serviceCategory: "it_software_export",
      freelancerName: "Tanvir Ahmed",
      passportOrNid: "19942691234567890",
    });

    expect(cert.certificateId).toContain("BB_FORMC_");
    expect(cert.freelancerName).toBe("Tanvir Ahmed");
    expect(cert.issuingBank).toContain("Dutch-Bangla Bank");
    expect(cert.foreignCurrencyUsd).toBe(1500);
  });

  it("should generate Word .docx invoice download structure for foreign client", () => {
    const invoice = FreelancerTaxRemittanceService.generateDocxInvoiceTemplate(
      "Acme Corp LLC",
      "United States",
      "Full-Stack Web App Development Services",
      2500
    );

    expect(invoice.invoiceNumber).toContain("INV_INT_");
    expect(invoice.clientName).toBe("Acme Corp LLC");
    expect(invoice.docxBlobUrl).toContain(".docx");
    expect(invoice.amountUsd).toBe(2500);
  });
});
