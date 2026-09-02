/**
 * CampusAmbassadorService Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { campusAmbassadorService } from "../campus-ambassador-service";

describe("CampusAmbassadorService (Viral Growth Engine)", () => {
  it("generates inter-campus leaderboard sorted by referral count", () => {
    const leaderboard = campusAmbassadorService.getLeaderboard();
    expect(leaderboard.length).toBeGreaterThan(0);
    expect(leaderboard[0].totalReferralsCount).toBeGreaterThanOrEqual(leaderboard[1].totalReferralsCount);
  });

  it("redeems valid referral code and awards 15% bKash commission", () => {
    const res = campusAmbassadorService.redeemReferralCode("SHOTHIK_DU_ARIF", 2000);
    expect(res.success).toBe(true);
    expect(res.buyerBonusCredits).toBe(500);
    expect(res.ambassadorCommissionBdt).toBe(300); // 15% of 2000 BDT
  });

  it("throws error for invalid referral code", () => {
    expect(() => campusAmbassadorService.redeemReferralCode("INVALID_CODE")).toThrow("Invalid referral code");
  });
});
