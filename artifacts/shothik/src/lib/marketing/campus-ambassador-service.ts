/**
 * Campus Ambassador & Viral Student Growth Engine
 * Enables university students across Bangladesh (DU, BUET, NSU, BRAC, SUST) to generate student pack referral links and earn bKash commissions.
 */

export interface AmbassadorProfile {
  id: string;
  studentName: string;
  universityName: string;
  referralCode: string;
  totalReferralsCount: number;
  totalEarnedCommissionBdt: number;
  unpaidCommissionBdt: number;
  bkashNumber: string;
}

export interface ReferralRedeemResult {
  success: boolean;
  ambassadorId: string;
  buyerBonusCredits: number;
  ambassadorCommissionBdt: number;
  timestamp: string;
}

export class CampusAmbassadorService {
  private ambassadors: AmbassadorProfile[] = [
    {
      id: "amb_du_01",
      studentName: "আরিফুর রহমান",
      universityName: "Dhaka University (DU)",
      referralCode: "SHOTHIK_DU_ARIF",
      totalReferralsCount: 42,
      totalEarnedCommissionBdt: 6300,
      unpaidCommissionBdt: 1200,
      bkashNumber: "01711223344",
    },
    {
      id: "amb_buet_02",
      studentName: "নাসরিন সুলতানা",
      universityName: "BUET",
      referralCode: "SHOTHIK_BUET_NASRIN",
      totalReferralsCount: 68,
      totalEarnedCommissionBdt: 10200,
      unpaidCommissionBdt: 2400,
      bkashNumber: "01822334455",
    },
    {
      id: "amb_nsu_03",
      studentName: "সাব্বির হোসেন",
      universityName: "North South University (NSU)",
      referralCode: "SHOTHIK_NSU_SABBIR",
      totalReferralsCount: 35,
      totalEarnedCommissionBdt: 5250,
      unpaidCommissionBdt: 750,
      bkashNumber: "01933445566",
    },
  ];

  /**
   * Retrieve campus ambassador leaderboard
   */
  public getLeaderboard(): AmbassadorProfile[] {
    return [...this.ambassadors].sort((a, b) => b.totalReferralsCount - a.totalReferralsCount);
  }

  /**
   * Redeem student referral code (15% commission to ambassador + 500 bonus credits to buyer)
   */
  public redeemReferralCode(code: string, purchaseBdt: number = 1000): ReferralRedeemResult {
    const ambassador = this.ambassadors.find((a) => a.referralCode === code.toUpperCase().trim());
    if (!ambassador) {
      throw new Error(`Invalid referral code ${code}`);
    }

    const ambassadorCommissionBdt = Math.round(purchaseBdt * 0.15); // 15% commission
    const buyerBonusCredits = 500;

    ambassador.totalReferralsCount += 1;
    ambassador.totalEarnedCommissionBdt += ambassadorCommissionBdt;
    ambassador.unpaidCommissionBdt += ambassadorCommissionBdt;

    return {
      success: true,
      ambassadorId: ambassador.id,
      buyerBonusCredits,
      ambassadorCommissionBdt,
      timestamp: new Date().toISOString(),
    };
  }
}

export const campusAmbassadorService = new CampusAmbassadorService();
