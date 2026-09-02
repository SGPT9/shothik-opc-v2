/**
 * NightShiftDigestWorker Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { nightShiftDigestWorker } from "../nightshift-digest-worker";

describe("NightShiftDigestWorker Service", () => {
  it("compiles formatted 8:00 AM daily summary briefing in Bangla", () => {
    const summary = nightShiftDigestWorker.compileDigestSummary({
      merchantId: "mch_01",
      merchantName: "শখের শাড়ি হাউস",
      totalOrdersCount: 15,
      totalGmvBdt: 45000,
      bkashSettledBdt: 38000,
      bkashPendingBdt: 7000,
      steadfastDeliveredCount: 10,
      steadfastInTransitCount: 5,
      lowStockItems: ["কাতান শাড়ি (নীল)"],
    });

    expect(summary).toContain("সঠিকজিপিটি নাইটশিফট ডেইলি রিপোর্ট");
    expect(summary).toContain("শখের শাড়ি হাউস");
    expect(summary).toContain("৳45,000");
    expect(summary).toContain("লো স্টোক অ্যালার্ট");
  });

  it("runs digest worker dispatch for Telegram", async () => {
    const res = await nightShiftDigestWorker.runDigestWorker({
      merchantId: "mch_02",
      merchantName: "ঢাকা ফ্যাশন",
      totalOrdersCount: 8,
      totalGmvBdt: 18000,
      bkashSettledBdt: 18000,
      bkashPendingBdt: 0,
      steadfastDeliveredCount: 6,
      steadfastInTransitCount: 2,
      lowStockItems: [],
    }, "telegram");

    expect(res.success).toBe(true);
    expect(res.dispatchChannel).toBe("telegram");
    expect(res.formattedSummaryBangla).toContain("ঢাকা ফ্যাশন");
  });
});
