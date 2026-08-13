import { describe, it, expect } from "vitest";
import { GovernmentTradeLicenseService } from "../government-trade-license-service";

describe("GovernmentTradeLicenseService", () => {
  it("should check domain availability for .com, .com.bd, and .app domains", async () => {
    const domains = await GovernmentTradeLicenseService.checkDomainAvailability("polsiastore");
    expect(domains).toHaveLength(4);
    expect(domains[0].domainName).toBe("polsiastore.com");
    expect(domains[1].domainName).toBe("polsiastore.com.bd");
    expect(domains[1].priceBdt).toBe(1800);
  });

  it("should generate E-Trade License application form and submission receipt", async () => {
    const res = await GovernmentTradeLicenseService.applyForTradeLicense({
      businessName: "Polsia Tech OPC",
      proprietorName: "Tanvir Ahmed",
      nidNumber: "1990123456789",
      cityCorporation: "DNCC",
      businessAddress: "Banani, Dhaka",
      businessCategory: "E-Commerce & Software",
    });

    expect(res.status).toBe("submitted");
    expect(res.applicationId).toContain("TL_DNCC_");
    expect(res.feeBdt).toBe(4500);
    expect(res.pdfFormUrl).toContain("trade_license_");
  });
});
