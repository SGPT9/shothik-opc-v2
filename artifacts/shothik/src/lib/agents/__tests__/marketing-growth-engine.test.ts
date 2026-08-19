import { describe, it, expect } from "vitest";
import { MarketingGrowthEngine, ProductMarketingContext } from "../marketing-growth-engine";

describe("📈 Marketing Growth & Copywriting Engine TDD Suite", () => {
  it("should generate full Banglish Facebook Live hook and WhatsApp cart recovery copy", () => {
    const context: ProductMarketingContext = {
      productName: "Dhakai Jamdani Saree",
      category: "apparel",
      regularPrice: 4500,
      costPrice: 2800,
      targetAudience: "Women aged 22-45 in Dhaka, Chittagong, Sylhet",
      uspBulletPoints: ["100% Handloom Cotton", "Original Tangail Weave", "Fast 24h Delivery"],
    };

    const pkg = MarketingGrowthEngine.generateGrowthPackage(context);

    expect(pkg.productName).toBe("Dhakai Jamdani Saree");
    expect(pkg.facebookLiveHook.banglishHeadline).toContain("Dhakai Jamdani Saree");
    expect(pkg.whatsappCartRecoveryMessage).toContain("৳150 advance bKash");
    expect(pkg.pricingTiers.length).toBe(3);
    expect(pkg.pricingTiers[1].tierName).toContain("Duo Value Combo");
    expect(pkg.croChecklist.length).toBeGreaterThanOrEqual(3);
    expect(pkg.croChecklist[0].expectedConversionLiftPercent).toBeGreaterThan(0);
  });
});
