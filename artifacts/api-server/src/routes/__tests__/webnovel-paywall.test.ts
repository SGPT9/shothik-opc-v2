import { describe, it, expect } from "vitest";
import {
  createWebnovelPaywallRouter,
  detectCliffhangerHooks,
  sliceChapterAtCliffhanger,
  buildDefaultMonetizationPlan
} from "../webnovel-paywall.js";

describe("Capability #41: Webnovel Paywall & Cliffhanger Monetization Slicer", () => {
  it("detects dramatic cliffhanger sentences and tension indicators in Bengali text", () => {
    const text = "রফিক সাহেব টেবিলের ওপর ফাইলটা রাখলেন। হঠাৎ অন্ধকার চিরে একটি গুলির তীব্র শব্দ প্রতিধ্বনিত হলো! হিমু চমকে উঠে দাঁড়াল।";
    const hooks = detectCliffhangerHooks(text);

    expect(hooks.length).toBeGreaterThanOrEqual(1);
    const topHook = hooks[0];
    expect(topHook.tensionScore).toBeGreaterThanOrEqual(85);
    expect(topHook.paywallConversionProbability).toBeGreaterThan(70);
    expect(topHook.sentenceText).toContain("গুলির");
  });

  it("slices a chapter into free preview and locked premium segments at the optimal suspense peak", () => {
    const text = "সোডিয়াম বাতির হলুদ আলো তখন সদরঘাটের ভাঙা সিঁড়িতে গড়িয়ে পড়া পানির ফোঁটার ওপর পিছলে পড়ছে। ঠিক তখনই ড্রেন থেকে একটি ভেজা চিরকুট উদ্ধার করা হলো। চিরকুটে লেখা ছিল এক গোপন প্রতারণার ইতিহাস।";
    const slice = sliceChapterAtCliffhanger(text, 3, "অধ্যায় ৩", 15);

    expect(slice.chapterNumber).toBe(3);
    expect(slice.accessTier).toBe("premium_locked");
    expect(slice.unlockCostBdt).toBe(15);
    expect(slice.freePreviewText).toBeTruthy();
    expect(slice.freePreviewCutoffPercent).toBeGreaterThan(0);
    expect(slice.freePreviewCutoffPercent).toBeLessThan(100);
  });

  it("builds a complete default webnovel monetization plan with free preview tiers and projected ARPU", () => {
    const plan = buildDefaultMonetizationPlan("proj_test");
    expect(plan.seriesTitleBn).toBe("অনন্ত নক্ষত্রবীথি");
    expect(plan.freeChapterCount).toBe(2);
    expect(plan.totalChapters).toBe(12);
    expect(plan.chapters.length).toBe(3);
    expect(plan.chapters[0].accessTier).toBe("free_preview");
    expect(plan.chapters[2].accessTier).toBe("premium_locked");
    expect(plan.estimatedUnlockConversionRate).toBeGreaterThan(30);
  });

  it("exports an Express router function with valid webnovel paywall endpoints", () => {
    const router = createWebnovelPaywallRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe("function");
  });
});
