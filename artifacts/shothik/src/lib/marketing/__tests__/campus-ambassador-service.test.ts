import { describe, it, expect, beforeEach } from "vitest";
import {
  CampusAmbassadorService,
  CAMPUS_NAMES,
} from "../campus-ambassador-service";

describe("CampusAmbassadorService (Viral Growth Engine)", () => {
  beforeEach(() => {
    CampusAmbassadorService.resetStore();
  });

  it("generates formatted ambassador referral codes", () => {
    const code = CampusAmbassadorService.generateAmbassadorCode("DU", "Rahim Ahmed", 2026);
    expect(code).toBe("DU_RAHIMAHM_2026");

    const buetCode = CampusAmbassadorService.generateAmbassadorCode("BUET", "Tasnim", 2026);
    expect(buetCode).toBe("BUET_TASNIM_2026");
  });

  it("validates seed ambassador codes and returns buyer bonus credits", () => {
    const res = CampusAmbassadorService.validateReferralCode("DU_RAHIM_2026");
    expect(res.valid).toBe(true);
    expect(res.bonusCredits).toBe(10);
    expect(res.campusName).toBe(CAMPUS_NAMES.DU);
    expect(res.ambassador?.name).toBe("Rahim Ahmed");

    const invalid = CampusAmbassadorService.validateReferralCode("INVALID_CODE_999");
    expect(invalid.valid).toBe(false);
    expect(invalid.bonusCredits).toBe(0);
  });

  it("records student pack referral purchases and updates ambassador commissions", () => {
    const ambassadorBefore = CampusAmbassadorService.getAmbassadorByCode("DU_RAHIM_2026");
    const initialCommission = ambassadorBefore?.pendingCommissionBdt || 0;
    const initialReferrals = ambassadorBefore?.totalReferrals || 0;

    // Classmate buys Quick Pass 100
    const tx1 = CampusAmbassadorService.recordReferralPurchase(
      "DU_RAHIM_2026",
      "quick_pass_100",
      "Tanvir Hasan"
    );

    expect(tx1).toBeDefined();
    expect(tx1?.commissionBdt).toBe(20);
    expect(tx1?.bonusCreditsAwarded).toBe(10);

    const ambassadorAfter = CampusAmbassadorService.getAmbassadorByCode("DU_RAHIM_2026");
    expect(ambassadorAfter?.pendingCommissionBdt).toBe(initialCommission + 20);
    expect(ambassadorAfter?.totalReferrals).toBe(initialReferrals + 1);

    // Classmate buys Student Thesis Pack 350
    const tx2 = CampusAmbassadorService.recordReferralPurchase(
      "DU_RAHIM_2026",
      "thesis_pack_350",
      "Sumaiya Akter"
    );
    expect(tx2?.commissionBdt).toBe(50);
    expect(ambassadorAfter?.pendingCommissionBdt).toBe(initialCommission + 70);
  });

  it("calculates next bi-monthly bKash disbursement schedule", () => {
    const schedule = CampusAmbassadorService.getNextPayoutSchedule(new Date(2026, 7, 5)); // Aug 5
    expect(schedule.nextPayoutDate.getDate()).toBe(15);
    expect(schedule.daysRemaining).toBe(10);

    const scheduleLateMonth = CampusAmbassadorService.getNextPayoutSchedule(new Date(2026, 7, 20)); // Aug 20
    expect(scheduleLateMonth.nextPayoutDate.getDate()).toBe(1);
  });

  it("aggregates inter-campus leaderboard sorted by referral volume", () => {
    const leaderboard = CampusAmbassadorService.getCampusLeaderboard();
    expect(leaderboard.length).toBeGreaterThanOrEqual(4);
    // DU should be highest ranked due to 112 seed referrals
    expect(leaderboard[0].campus).toBe("DU");
    expect(leaderboard[0].totalReferrals).toBeGreaterThanOrEqual(112);
  });
});
