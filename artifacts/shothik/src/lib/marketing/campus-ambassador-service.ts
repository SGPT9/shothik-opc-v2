/**
 * Campus Ambassador & Viral Referral Commission Engine
 * Implements organic growth mechanics for university students across Bangladesh (DU, BUET, NSU, BRAC)
 * with direct bKash mobile wallet commission payouts.
 */

export type CampusCode =
  | "DU"
  | "BUET"
  | "NSU"
  | "BRAC"
  | "RU"
  | "CU"
  | "IUT"
  | "SUST"
  | "OTHER";

export const CAMPUS_NAMES: Record<CampusCode, string> = {
  DU: "University of Dhaka",
  BUET: "Bangladesh University of Engineering and Technology",
  NSU: "North South University",
  BRAC: "BRAC University",
  RU: "University of Rajshahi",
  CU: "University of Chittagong",
  IUT: "Islamic University of Technology",
  SUST: "Shahjalal University of Science and Technology",
  OTHER: "General Campus Network",
};

export type AmbassadorTier = "bronze" | "silver" | "gold" | "campus_lead";

export interface CampusAmbassador {
  id: string;
  name: string;
  campus: CampusCode;
  referralCode: string;
  bkashNumber: string;
  totalReferrals: number;
  pendingCommissionBdt: number;
  paidCommissionBdt: number;
  tier: AmbassadorTier;
  joinedAt: number;
}

export type StudentPackType =
  | "quick_pass_100"
  | "thesis_pack_350"
  | "courier_credit_500";

export interface ReferralTransaction {
  id: string;
  ambassadorId: string;
  referralCode: string;
  buyerName: string;
  packType: StudentPackType;
  amountBdt: number;
  commissionBdt: number;
  bonusCreditsAwarded: number;
  status: "verified" | "queued_for_payout" | "paid";
  createdAt: number;
}

export const STUDENT_PACK_CONFIG: Record<
  StudentPackType,
  { priceBdt: number; commissionBdt: number; bonusCredits: number; label: string }
> = {
  quick_pass_100: {
    priceBdt: 100,
    commissionBdt: 20,
    bonusCredits: 10,
    label: "৳100 Quick Pass",
  },
  thesis_pack_350: {
    priceBdt: 350,
    commissionBdt: 50,
    bonusCredits: 35,
    label: "৳350 Student Thesis Pack",
  },
  courier_credit_500: {
    priceBdt: 500,
    commissionBdt: 100,
    bonusCredits: 50,
    label: "৳500 F-Commerce Free Courier",
  },
};

// In-Memory Database Store for Campus Ambassadors and Referral Transactions
const AMBASSADORS = new Map<string, CampusAmbassador>();
const TRANSACTIONS: ReferralTransaction[] = [];

// Seed Default Campus Ambassadors
const SEED_AMBASSADORS: CampusAmbassador[] = [
  {
    id: "amb_du_01",
    name: "Rahim Ahmed",
    campus: "DU",
    referralCode: "DU_RAHIM_2026",
    bkashNumber: "01711223344",
    totalReferrals: 112,
    pendingCommissionBdt: 2240,
    paidCommissionBdt: 6800,
    tier: "campus_lead",
    joinedAt: Date.now() - 60 * 24 * 3600 * 1000,
  },
  {
    id: "amb_buet_02",
    name: "Tasnim Chowdhury",
    campus: "BUET",
    referralCode: "BUET_TAS_2026",
    bkashNumber: "01819556677",
    totalReferrals: 89,
    pendingCommissionBdt: 1780,
    paidCommissionBdt: 4500,
    tier: "gold",
    joinedAt: Date.now() - 45 * 24 * 3600 * 1000,
  },
  {
    id: "amb_nsu_03",
    name: "Farhan Kabir",
    campus: "NSU",
    referralCode: "NSU_FARHAN_2026",
    bkashNumber: "01912334455",
    totalReferrals: 64,
    pendingCommissionBdt: 1280,
    paidCommissionBdt: 3200,
    tier: "silver",
    joinedAt: Date.now() - 30 * 24 * 3600 * 1000,
  },
  {
    id: "amb_brac_04",
    name: "Sadia Rahman",
    campus: "BRAC",
    referralCode: "BRAC_SADIA_2026",
    bkashNumber: "01677889900",
    totalReferrals: 42,
    pendingCommissionBdt: 840,
    paidCommissionBdt: 1800,
    tier: "silver",
    joinedAt: Date.now() - 20 * 24 * 3600 * 1000,
  },
];

SEED_AMBASSADORS.forEach((a) => AMBASSADORS.set(a.referralCode, a));

export class CampusAmbassadorService {
  /**
   * Generates a standard uppercase campus ambassador referral code
   */
  public static generateAmbassadorCode(
    campus: CampusCode,
    studentName: string,
    year = 2026
  ): string {
    const cleanName = studentName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8);
    return `${campus}_${cleanName}_${year}`;
  }

  /**
   * Registers a new campus ambassador
   */
  public static registerAmbassador(params: {
    name: string;
    campus: CampusCode;
    bkashNumber: string;
    customCode?: string;
  }): CampusAmbassador {
    const referralCode =
      params.customCode?.toUpperCase().trim() ||
      this.generateAmbassadorCode(params.campus, params.name);

    const existing = AMBASSADORS.get(referralCode);
    if (existing) {
      return existing;
    }

    const ambassador: CampusAmbassador = {
      id: `amb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: params.name,
      campus: params.campus,
      referralCode,
      bkashNumber: params.bkashNumber,
      totalReferrals: 0,
      pendingCommissionBdt: 0,
      paidCommissionBdt: 0,
      tier: "bronze",
      joinedAt: Date.now(),
    };

    AMBASSADORS.set(referralCode, ambassador);
    return ambassador;
  }

  /**
   * Retrieves an ambassador by their referral code
   */
  public static getAmbassadorByCode(code: string): CampusAmbassador | undefined {
    return AMBASSADORS.get(code.trim().toUpperCase());
  }

  /**
   * Validates a referral code and computes buyer benefits
   */
  public static validateReferralCode(code: string): {
    valid: boolean;
    ambassador?: CampusAmbassador;
    bonusCredits: number;
    campusName?: string;
  } {
    const ambassador = this.getAmbassadorByCode(code);
    if (!ambassador) {
      return { valid: false, bonusCredits: 0 };
    }

    return {
      valid: true,
      ambassador,
      bonusCredits: 10,
      campusName: CAMPUS_NAMES[ambassador.campus] || "University Network",
    };
  }

  /**
   * Records a student purchase and calculates bKash commissions
   */
  public static recordReferralPurchase(
    referralCode: string,
    packType: StudentPackType,
    buyerName: string
  ): ReferralTransaction | null {
    const ambassador = this.getAmbassadorByCode(referralCode);
    if (!ambassador) return null;

    const config = STUDENT_PACK_CONFIG[packType];
    const tx: ReferralTransaction = {
      id: `tx_ref_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ambassadorId: ambassador.id,
      referralCode: ambassador.referralCode,
      buyerName,
      packType,
      amountBdt: config.priceBdt,
      commissionBdt: config.commissionBdt,
      bonusCreditsAwarded: config.bonusCredits,
      status: "queued_for_payout",
      createdAt: Date.now(),
    };

    TRANSACTIONS.push(tx);

    // Update ambassador statistics
    ambassador.totalReferrals += 1;
    ambassador.pendingCommissionBdt += config.commissionBdt;

    // Recalculate tier
    if (ambassador.totalReferrals >= 100) {
      ambassador.tier = "campus_lead";
    } else if (ambassador.totalReferrals >= 50) {
      ambassador.tier = "gold";
    } else if (ambassador.totalReferrals >= 20) {
      ambassador.tier = "silver";
    }

    AMBASSADORS.set(ambassador.referralCode, ambassador);
    return tx;
  }

  /**
   * Calculates the next bi-monthly payout schedule (1st and 15th of each month)
   */
  public static getNextPayoutSchedule(currentDate = new Date()): {
    nextPayoutDate: Date;
    daysRemaining: number;
    formattedDate: string;
  } {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();

    let targetDate: Date;

    if (day < 15) {
      targetDate = new Date(year, month, 15, 0, 0, 0);
    } else {
      // 1st of next month
      targetDate = new Date(year, month + 1, 1, 0, 0, 0);
    }

    const currentMidnight = new Date(year, month, day, 0, 0, 0);
    const diffMs = targetDate.getTime() - currentMidnight.getTime();
    const daysRemaining = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

    const formattedDate = targetDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return { nextPayoutDate: targetDate, daysRemaining, formattedDate };
  }

  /**
   * Aggregates live campus performance leaderboard
   */
  public static getCampusLeaderboard(): Array<{
    campus: CampusCode;
    campusName: string;
    activeAmbassadors: number;
    totalReferrals: number;
    totalEarningsBdt: number;
  }> {
    const stats: Record<
      CampusCode,
      { activeAmbassadors: number; totalReferrals: number; totalEarningsBdt: number }
    > = {
      DU: { activeAmbassadors: 0, totalReferrals: 0, totalEarningsBdt: 0 },
      BUET: { activeAmbassadors: 0, totalReferrals: 0, totalEarningsBdt: 0 },
      NSU: { activeAmbassadors: 0, totalReferrals: 0, totalEarningsBdt: 0 },
      BRAC: { activeAmbassadors: 0, totalReferrals: 0, totalEarningsBdt: 0 },
      RU: { activeAmbassadors: 0, totalReferrals: 0, totalEarningsBdt: 0 },
      CU: { activeAmbassadors: 0, totalReferrals: 0, totalEarningsBdt: 0 },
      IUT: { activeAmbassadors: 0, totalReferrals: 0, totalEarningsBdt: 0 },
      SUST: { activeAmbassadors: 0, totalReferrals: 0, totalEarningsBdt: 0 },
      OTHER: { activeAmbassadors: 0, totalReferrals: 0, totalEarningsBdt: 0 },
    };

    AMBASSADORS.forEach((amb) => {
      if (stats[amb.campus]) {
        stats[amb.campus].activeAmbassadors += 1;
        stats[amb.campus].totalReferrals += amb.totalReferrals;
        stats[amb.campus].totalEarningsBdt +=
          amb.paidCommissionBdt + amb.pendingCommissionBdt;
      }
    });

    return (Object.keys(stats) as CampusCode[])
      .map((code) => ({
        campus: code,
        campusName: CAMPUS_NAMES[code],
        ...stats[code],
      }))
      .filter((c) => c.totalReferrals > 0)
      .sort((a, b) => b.totalReferrals - a.totalReferrals);
  }

  /**
   * Returns transaction history for an ambassador
   */
  public static getAmbassadorTransactions(
    ambassadorId: string
  ): ReferralTransaction[] {
    return TRANSACTIONS.filter((t) => t.ambassadorId === ambassadorId).sort(
      (a, b) => b.createdAt - a.createdAt
    );
  }

  /**
   * Resets database state for testing
   */
  public static resetStore(): void {
    AMBASSADORS.clear();
    TRANSACTIONS.length = 0;
    SEED_AMBASSADORS.forEach((a) => AMBASSADORS.set(a.referralCode, { ...a }));
  }
}
