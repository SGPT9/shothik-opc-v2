import { describe, it, expect } from "vitest";
import { MerchantOnboardingWizardService } from "../merchant-onboarding-wizard";

describe("MerchantOnboardingWizardService", () => {
  it("should scrape Facebook Page catalog and return 3 products with prices in BDT ৳", async () => {
    const catalog = await MerchantOnboardingWizardService.scrapeFacebookCatalog("https://facebook.com/jamdani_crafts");

    expect(catalog).toHaveLength(3);
    expect(catalog[0].title).toContain("JAMDANI_CRAFTS");
    expect(catalog[0].priceBdt).toBe(3500);
    expect(catalog[0].stockCount).toBeGreaterThan(0);
  });

  it("should provision InsForge workspace, bind custom .com.bd domain, and launch store", async () => {
    const launch = await MerchantOnboardingWizardService.launchMerchantStore({
      merchantName: "Jamdani Crafts Dhaka",
      facebookPageUrl: "https://facebook.com/jamdani_crafts",
      customDomain: "jamdanicrafts.com.bd",
      bkashMerchantPhone: "01712345678",
      nagadMerchantPhone: "01812345678",
      ownerEmail: "tanvir@jamdanicrafts.com.bd",
    });

    expect(launch.merchantName).toBe("Jamdani Crafts Dhaka");
    expect(launch.liveStoreUrl).toBe("https://jamdanicrafts.com.bd");
    expect(launch.scrapedProductsCount).toBe(3);
    expect(launch.bkashCheckoutActive).toBe(true);
    expect(launch.nagadCheckoutActive).toBe(true);
    expect(launch.customDomainStatus).toBe("bound");
  });
});
