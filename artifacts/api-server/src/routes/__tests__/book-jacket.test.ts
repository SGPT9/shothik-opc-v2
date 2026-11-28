import { describe, it, expect } from "vitest";
import {
  createBookJacketRouter,
  calculateJacketDimensions,
  buildDefaultBookJacket,
  DEFAULT_FACE_LOCK
} from "../book-jacket.js";

describe("Capability #39: Precision 3D Book Jacket & Character Face-Lock Studio", () => {
  it("calculates accurate total wrap dimensions including front, spine, back, and French flaps", () => {
    const dim160 = calculateJacketDimensions(160, "80gsm_cream", true);
    expect(dim160.frontWidthInches).toBe(5.5);
    expect(dim160.backWidthInches).toBe(5.5);
    expect(dim160.flapWidthInches).toBe(3.5);
    expect(dim160.spineWidthMm).toBeGreaterThan(9);
    expect(dim160.spineWidthInches).toBeGreaterThan(0.35);
    // Total = 3.5 + 5.5 + spine (~0.5) + 5.5 + 3.5 = ~18.5 inches
    expect(dim160.totalWrapWidthInches).toBeGreaterThan(18.0);
    expect(dim160.bleedInches).toBe(0.125);
  });

  it("calculates jacket without flaps for standard paperback edition", () => {
    const dimNoFlaps = calculateJacketDimensions(160, "80gsm_cream", false);
    expect(dimNoFlaps.flapWidthInches).toBe(0);
    expect(dimNoFlaps.totalWrapWidthInches).toBeLessThan(12.0);
  });

  it("builds a complete default book jacket with front, spine, back blurb, ISBN, and face-lock", () => {
    const jacket = buildDefaultBookJacket("proj_test");
    expect(jacket.bookTitleBn).toBe("অনন্ত নক্ষত্রবীথি");
    expect(jacket.frontCover.headline).toBeTruthy();
    expect(jacket.spine.titleVertical).toBe("অনন্ত নক্ষত্রবীথি");
    expect(jacket.backCover.isbn13).toMatch(/^978-/);
    expect(jacket.backCover.retailPriceBdt).toBe(380);
    expect(jacket.flaps.frontFlapAuthorBioBn).toBeTruthy();
  });

  it("maintains character face-lock consistency profile with LoRA tag and seed", () => {
    expect(DEFAULT_FACE_LOCK.nameBn).toBe("হিমু");
    expect(DEFAULT_FACE_LOCK.seed).toBe(48927103);
    expect(DEFAULT_FACE_LOCK.loraTag).toContain("bengali_wanderer_v2");
    expect(DEFAULT_FACE_LOCK.consistencyConfidenceScore).toBeGreaterThanOrEqual(95);
    expect(DEFAULT_FACE_LOCK.promptGuidance).toContain("--seed 48927103");
  });

  it("exports an Express router function with valid book jacket endpoints", () => {
    const router = createBookJacketRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe("function");
  });
});
