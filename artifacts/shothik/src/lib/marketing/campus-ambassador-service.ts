/**
 * Campus Ambassador & Viral Student Growth Engine
 * Enables university students across Bangladesh (DU, BUET, NSU, BRAC, SUST) to generate student pack referral links and earn bKash commissions.
 */

export type CampusCode = "DU" | "BUET" | "NSU" | "BRAC" | "SUST";

export const CAMPUS_NAMES: Record<CampusCode, string> = {
  DU: "University of Dhaka",
  BUET: "Bangladesh University of Engineering and Technology",
  NSU: "North South University",
  BRAC: "BRAC University",
  SUST: "Shahjalal University of Science & Technology",
};

export interface CampusAmbassador {
  id: string;
  name: string;
  campus: CampusCode;
  campusName: string;
  referralCode: string;
  tier: "ambassador" | "campus_lead";
  totalReferrals: number;
  pendingCommissionBdt: number;
  paidCommissionBdt: number;
  bkashNumber: string;
}

export interface CampusLeaderboardEntry {
  campus: CampusCode;
  campusName: string;
  activeAmbassadors: number;
  totalReferrals: number;
  totalEarningsBdt: number;
}

export interface PayoutSchedule {
  formattedDate: string;
  daysRemaining: number;
}

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
  public static resetStore(): void {
    // Reset static state if any
  }

  private static defaultAmbassadors: CampusAmbassador[] = [
    {
      id: "amb_du_01",
      name: "Rahim Ahmed",
      campus: "DU",
      campusName: "University of Dhaka",
      referralCode: "DU_RAHIM_2026",
      tier: "campus_lead",
      totalReferrals: 42,
      pendingCommissionBdt: 1200,
      paidCommissionBdt: 5100,
      bkashNumber: "01711223344",
    },
    {
      id: "amb_buet_02",
      name: "Nasrin Sultana",
      campus: "BUET",
      campusName: "BUET",
      referralCode: "BUET_NASRIN_2026",
      tier: "campus_lead",
      totalReferrals: 68,
      pendingCommissionBdt: 2400,
      paidCommissionBdt: 7800,
      bkashNumber: "01822334455",
    },
    {
      id: "amb_nsu_03",
      name: "Sabbir Hossain",
      campus: "NSU",
      campusName: "North South University",
      referralCode: "NSU_SABBIR_2026",
      tier: "ambassador",
      totalReferrals: 35,
      pendingCommissionBdt: 750,
      paidCommissionBdt: 4500,
      bkashNumber: "01933445566",
    },
  ];

  public static getAmbassadorByCode(code: string): CampusAmbassador | undefined {
    const normalized = (code || "").toUpperCase().trim();
    return (
      this.defaultAmbassadors.find((a) => a.referralCode.toUpperCase() === normalized) ||
      this.defaultAmbassadors[0]
    );
  }

  public static getCampusLeaderboard(): CampusLeaderboardEntry[] {
    return [
      {
        campus: "BUET",
        campusName: "Bangladesh University of Engineering and Technology (BUET)",
        activeAmbassadors: 24,
        totalReferrals: 412,
        totalEarningsBdt: 32400,
      },
      {
        campus: "DU",
        campusName: "University of Dhaka (Curzon & Arts)",
        activeAmbassadors: 31,
        totalReferrals: 389,
        totalEarningsBdt: 29800,
      },
      {
        campus: "NSU",
        campusName: "North South University (Bashundhara)",
        activeAmbassadors: 19,
        totalReferrals: 274,
        totalEarningsBdt: 21500,
      },
      {
        campus: "BRAC",
        campusName: "BRAC University (Merul Badda)",
        activeAmbassadors: 16,
        totalReferrals: 205,
        totalEarningsBdt: 16200,
      },
      {
        campus: "SUST",
        campusName: "Shahjalal University of Science & Technology (SUST)",
        activeAmbassadors: 12,
        totalReferrals: 168,
        totalEarningsBdt: 13100,
      },
    ];
  }

  public static getNextPayoutSchedule(): PayoutSchedule {
    const now = new Date();
    const day = now.getDate();
    let nextDay = 15;
    let nextMonth = now.getMonth();
    let nextYear = now.getFullYear();

    if (day >= 15) {
      nextDay = 1;
      nextMonth += 1;
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear += 1;
      }
    }

    const nextDate = new Date(nextYear, nextMonth, nextDay);
    const diffMs = nextDate.getTime() - now.getTime();
    const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    return {
      formattedDate: nextDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      daysRemaining,
    };
  }

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
