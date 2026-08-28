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
  { packageId: "starter_49", name: "24h Sprint Pass", priceBdt: 49, priceUsd: 0.40, credits: 300, bonusCredits: 50, badge: "INSTANT PASS" },
  { packageId: "pro_290", name: "Pro Studio Pack", priceBdt: 290, priceUsd: 2.40, credits: 2500, bonusCredits: 500, badge: "MOST POPULAR" },
  { packageId: "business_990", name: "Business Power Pack", priceBdt: 990, priceUsd: 8.25, credits: 10000, bonusCredits: 2500, badge: "BEST VALUE" },
];

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    tierId: "starter_free",
    name: "Free Explorer",
    priceBdtMonth: 0,
    priceUsdMonth: 0,
    targetAudience: "Casual Users & Students",
    features: ["50 Free Daily Credits", "Basic Web Search", "Standard Chat Support", "Watermarked Exports"],
  },
  {
    tierId: "pro_monthly",
    name: "Shothik Pro Co-Founder",
    priceBdtMonth: 599,
    priceUsdMonth: 4.99,
    targetAudience: "Founders, Professionals & Creators",
    features: [
      "Unlimited Deep Research Dossiers",
      "Full Work Canvas & Slide Studio (.pptx, Marp)",
      "Dynamic Financial Spreadsheet Engine & CSV",
      "Frontier Reasoning Models (DeepSeek V4, Claude, GPT-4o)",
      "1-Click bKash / Nagad Instant Renewal",
    ],
  },
  {
    tierId: "business_team",
    name: "Business & Merchant Hub",
    priceBdtMonth: 1490,
    priceUsdMonth: 12.50,
    targetAudience: "E-Commerce, F-Commerce & Agencies",
    features: [
      "Everything in Pro + 5 Team Seats",
      "Steadfast & Pathao Courier API Auto-Booking",
      "bKash / Nagad TrxID Instant Fraud Verification",
      "NBR Section 78 Tax & VAT Rebate Schedule Generator",
      "Custom Branded Slide & Document Exports",
    ],
  },
  {
    tierId: "enterprise_legal_tax",
    name: "Corporate & Legal Enterprise",
    priceBdtMonth: 3490,
    priceUsdMonth: 29.00,
    targetAudience: "Law Firms, Tax Consultants & Accounting Teams",
    features: [
      "High Court & Supreme Court Legal Precedent Search",
      "Land Record Porcha OCR & CS/SA/RS Verification",
      "NBR e-TIN Form 11GA & Mushak-6.3 Auto-Challan",
      "Dedicated Account Manager & Priority SLA",
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
