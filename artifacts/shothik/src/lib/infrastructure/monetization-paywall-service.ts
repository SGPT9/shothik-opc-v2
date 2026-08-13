import logger from "@/lib/logger";

export type FeatureType =
  | "cofounder_tam_analysis"
  | "web_search_validation"
  | "scenario_lab_stress_test"
  | "student_assignment_slide"
  | "nbr_tax_return"
  | "land_porcha_ocr"
  | "bcs_exam_prep";

export interface CreditRateCard {
  featureType: FeatureType;
  label: string;
  creditCost: number;
}

export interface CreditPackage {
  packageId: string;
  name: string;
  priceBdt: number;
  priceUsd: number;
  credits: number;
  bonusCredits: number;
  badge?: string;
}

export interface SubscriptionTier {
  tierId: string;
  name: string;
  priceBdtMonth: number;
  priceUsdMonth: number;
  targetAudience: string;
  features: string[];
}

export const FEATURE_RATE_CARDS: CreditRateCard[] = [
  { featureType: "cofounder_tam_analysis", label: "Cofounder TAM/SAM/SOM Analysis", creditCost: 5 },
  { featureType: "web_search_validation", label: "Grounded Live Web Validation", creditCost: 2 },
  { featureType: "scenario_lab_stress_test", label: "ScenarioLab 2GB RAM Stress-Test", creditCost: 3 },
  { featureType: "student_assignment_slide", label: "Student Slide Deck & 3D VTuber Audio", creditCost: 10 },
  { featureType: "nbr_tax_return", label: "NBR Individual e-TIN Tax Return", creditCost: 15 },
  { featureType: "land_porcha_ocr", label: "CS/SA/RS/BS Land Record Porcha OCR", creditCost: 10 },
  { featureType: "bcs_exam_prep", label: "BCS & University 3D VTuber Viva Mock", creditCost: 8 },
];

export const CREDIT_PACKAGES: CreditPackage[] = [
  { packageId: "starter_100", name: "Starter Top-Up", priceBdt: 100, priceUsd: 0.85, credits: 500, bonusCredits: 50 },
  { packageId: "pro_500", name: "Pro Top-Up", priceBdt: 500, priceUsd: 4.25, credits: 3000, bonusCredits: 500, badge: "MOST POPULAR" },
  { packageId: "business_1500", name: "Business Top-Up", priceBdt: 1500, priceUsd: 12.50, credits: 10000, bonusCredits: 2000, badge: "BEST VALUE" },
];

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    tierId: "free_tier",
    name: "Free Student Tier",
    priceBdtMonth: 0,
    priceUsdMonth: 0,
    targetAudience: "Casual Learners & Explorers",
    features: ["50 Free Daily Credits", "Basic Web Search", "Standard Chat Support"],
  },
  {
    tierId: "polsia_merchant_pro",
    name: "Polsia OPC Merchant Pro",
    priceBdtMonth: 1490,
    priceUsdMonth: 12.50,
    targetAudience: "F-Commerce & E-Commerce Merchants",
    features: [
      "Unlimited ScrapeGraphAI Imports",
      "Custom .com.bd Domain Binding",
      "bKash 1-Tap Checkout Integration",
      "Steadfast Courier Auto-Booking on WhatsApp",
    ],
  },
  {
    tierId: "bcs_exam_pass",
    name: "BCS & University AI Exam Pass",
    priceBdtMonth: 490,
    priceUsdMonth: 4.00,
    targetAudience: "BCS Prelim & University Candidates",
    features: [
      "Unlimited 3D VTuber Viva Mock Interviews",
      "Textbook MCQ Generator",
      "Dual-Language Scorecards in Bangla & English",
    ],
  },
  {
    tierId: "enterprise_legal_tax",
    name: "Enterprise Legal & Tax License",
    priceBdtMonth: 3750,
    priceUsdMonth: 31.25,
    targetAudience: "Law Firms, Tax Consultants & Accounting Teams",
    features: [
      "Land Record Porcha OCR Batch Parsing",
      "High Court & Supreme Court Precedent Search",
      "NBR e-TIN Form 11GA & Form C Certificates",
    ],
  },
];

export class MonetizationPaywallService {
  /**
   * Deducts feature credits from user balance.
   */
  static deductCredits(currentBalance: number, featureType: FeatureType): { success: boolean; newBalance: number; cost: number; error?: string } {
    const rateCard = FEATURE_RATE_CARDS.find((r) => r.featureType === featureType);
    const cost = rateCard ? rateCard.creditCost : 1;

    logger.info("[monetization] Deducting feature credits", { featureType, currentBalance, cost });

    if (currentBalance < cost) {
      return {
        success: false,
        newBalance: currentBalance,
        cost,
        error: `Insufficient credits. Feature costs ${cost} credits, but current balance is ${currentBalance} credits. Please top up via bKash/Nagad.`,
      };
    }

    return {
      success: true,
      newBalance: currentBalance - cost,
      cost,
    };
  }

  /**
   * Generates 1-tap bKash/Nagad credit package purchase URL & transaction payload.
   */
  static purchaseCreditPackage(
    packageId: string,
    paymentProvider: "bkash" | "nagad" = "bkash"
  ): { transactionId: string; paymentUrl: string; creditsAdded: number; totalPaidBdt: number } {
    const pkg = CREDIT_PACKAGES.find((p) => p.packageId === packageId) || CREDIT_PACKAGES[0];
    const transactionId = `TRX_TOPUP_${paymentProvider.toUpperCase()}_${Date.now()}`;
    const creditsAdded = pkg.credits + pkg.bonusCredits;

    logger.info("[monetization] Purchasing credit package via MFS", { packageId, provider: paymentProvider, creditsAdded });

    return {
      transactionId,
      paymentUrl: `https://pay.${paymentProvider}.com.bd/topup?amount=${pkg.priceBdt}&trxId=${transactionId}`,
      creditsAdded,
      totalPaidBdt: pkg.priceBdt,
    };
  }
}
