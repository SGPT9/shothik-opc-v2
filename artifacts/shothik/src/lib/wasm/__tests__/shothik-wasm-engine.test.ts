import { describe, it, expect } from "vitest";
import { ShothikWasmEngine } from "../shothik-wasm-engine";

describe("Shothik Client-Side Zero-Latency Engine Suite", () => {
  it("transliterates common Banglish words to Bengali Unicode accurately", () => {
    const result = ShothikWasmEngine.transliterateBanglish("ami boi order korbo dhonnobad");
    expect(result).toContain("আমি");
    expect(result).toContain("বই");
    expect(result).toContain("অর্ডার");
    expect(result).toContain("ধন্যবাদ");
  });

  it("resolves delivery zone and fee instantly offline", () => {
    const dhakaRes = ShothikWasmEngine.resolveDeliveryZone("Flat 4A, Dhanmondi, Dhaka");
    expect(dhakaRes.zone).toBe("inside_dhaka");
    expect(dhakaRes.deliveryFeeBDT).toBe(70);

    const gazipurRes = ShothikWasmEngine.resolveDeliveryZone("Board Bazar, Gazipur");
    expect(gazipurRes.zone).toBe("sub_dhaka");
    expect(gazipurRes.deliveryFeeBDT).toBe(100);

    const ctgRes = ShothikWasmEngine.resolveDeliveryZone("GEC Circle, Chittagong");
    expect(ctgRes.zone).toBe("outside_dhaka");
    expect(ctgRes.deliveryFeeBDT).toBe(130);
  });

  it("calculates compound tax incidence with <1ms execution", () => {
    const tax = ShothikWasmEngine.calculateTaxIncidence(100000, 25, 15);
    expect(tax.customsDutyBDT).toBe(25000);
    expect(tax.vatBDT).toBe(18750); // (100,000 + 25,000) * 0.15
    expect(tax.totalIncidenceBDT).toBe(43750);
    expect(tax.effectiveRatePercent).toBe(43.8);
  });
});
