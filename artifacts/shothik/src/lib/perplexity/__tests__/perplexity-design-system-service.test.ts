import { describe, it, expect } from "vitest";
import { PerplexityDesignSystemService } from "../perplexity-design-system-service";

describe("PerplexityDesignSystemService", () => {
  it("should route tax queries to finance_tax focus mode and NBR action card", () => {
    const res = PerplexityDesignSystemService.routeQuery("Calculate my NBR e-TIN income tax rebate");

    expect(res.detectedFocusMode).toBe("finance_tax");
    expect(res.recommendedExecutionAction).toBe("nbr_tax_clearance");
    expect(res.mappedServices.length).toBeGreaterThan(3);
  });

  it("should route courier queries to merchant focus mode and Steadfast action card", () => {
    const res = PerplexityDesignSystemService.routeQuery("Book Steadfast courier parcel pick-up");

    expect(res.detectedFocusMode).toBe("merchant");
    expect(res.recommendedExecutionAction).toBe("steadfast_book");
  });

  it("should route TAM market sizing queries to pro_search focus mode", () => {
    const res = PerplexityDesignSystemService.routeQuery("What is the TAM SAM SOM for Polsia OPC?");

    expect(res.detectedFocusMode).toBe("pro_search");
    expect(res.suggestedSources.length).toBe(3);
  });
});
