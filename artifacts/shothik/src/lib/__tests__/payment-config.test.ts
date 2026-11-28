import { describe, it, expect } from "vitest";
import {
  CREDIT_PACKS,
  VALID_PACK_IDS,
  VALID_CREDIT_AMOUNTS,
  getProviderForCountry,
  getCurrencyForProvider,
  getPackPrice,
  getPackAmount,
} from "../payment-config";

describe("payment-config", () => {
  it("defines standard credit packs with correct credit counts", () => {
    expect(VALID_PACK_IDS).toEqual(["starter", "popular", "value", "mega"]);
    expect(VALID_CREDIT_AMOUNTS).toEqual([100, 600, 2500, 6500]);
    expect(CREDIT_PACKS.starter.credits).toBe(100);
    expect(CREDIT_PACKS.popular.credits).toBe(600);
    expect(CREDIT_PACKS.value.credits).toBe(2500);
    expect(CREDIT_PACKS.mega.credits).toBe(6500);
  });

  it("resolves providers by country correctly with fallback to stripe", () => {
    expect(getProviderForCountry("bangladesh")).toBe("bkash");
    expect(getProviderForCountry("Bangladesh ")).toBe("bkash");
    expect(getProviderForCountry("india")).toBe("razorpay");
    expect(getProviderForCountry("India")).toBe("razorpay");
    expect(getProviderForCountry("usa")).toBe("stripe");
    expect(getProviderForCountry("United Kingdom")).toBe("stripe");
    expect(getProviderForCountry(null)).toBe("stripe");
    expect(getProviderForCountry("")).toBe("stripe");
  });

  it("maps providers to currencies", () => {
    expect(getCurrencyForProvider("bkash")).toBe("bdt");
    expect(getCurrencyForProvider("razorpay")).toBe("inr");
    expect(getCurrencyForProvider("stripe")).toBe("usd");
  });

  it("calculates pack prices and amounts accurately for all providers", () => {
    expect(getPackPrice("starter", "bkash")).toBe("৳119");
    expect(getPackAmount("starter", "bkash")).toBe(119);

    expect(getPackPrice("popular", "bkash")).toBe("৳599");
    expect(getPackAmount("popular", "bkash")).toBe(599);

    expect(getPackPrice("starter", "stripe")).toBe("$0.99");
    expect(getPackAmount("starter", "stripe")).toBe(0.99);

    expect(getPackPrice("value", "razorpay")).toBe("₹1,799");
    expect(getPackAmount("value", "razorpay")).toBe(1799);
  });
});
