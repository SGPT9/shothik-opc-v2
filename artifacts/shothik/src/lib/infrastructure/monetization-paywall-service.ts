import logger from "@/lib/logger";

export type FeatureType =
  | "cofounder_tam_analysis"
  | "web_search_validation"
  | "scenario_lab_stress_test"
  | "student_assignment_slide"
  | "nbr_tax_return"
  | "land_porcha_ocr"
  | "bcs_exam_prep"
  | "inkos_chapter_draft"
  | "inkos_boi_mela_preflight";

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

export interface OutcomePassOption {
  passId: string;
  name: string;
  persona: string;
  priceBdt: number;
  priceUsd: number;
  creditsIncluded: number;
  durationDays: number;
  highlights: string[];
  badge?: string;
}

export interface SubscriptionTier {
  tierId: string;
  packageType: "starter" | "student_plus" | "creator_pro" | "studio_max";
  name: string;
  priceBdtMonth: number;
  priceUsdMonth: number;
  targetAudience: string;
  features: string[];
}

export const FEATURE_RATE_CARDS: CreditRateCard[] = [
  { featureType: "inkos_chapter_draft", label: "InkOS Co-Writer & De-Slopper (#3, #27)", creditCost: 2 },
  { featureType: "inkos_boi_mela_preflight", label: "Boi Mela 6×9 Print PDF & Cover Spine (#40–42)", creditCost: 8 },
  { featureType: "cofounder_tam_analysis", label: "Cofounder TAM/SAM/SOM Analysis", creditCost: 5 },
  { featureType: "web_search_validation", label: "Grounded Live Web Validation", creditCost: 2 },
  { featureType: "scenario_lab_stress_test", label: "ScenarioLab 2GB RAM Stress-Test", creditCost: 3 },
  { featureType: "student_assignment_slide", label: "Student Slide Deck & 3D VTuber Audio", creditCost: 10 },
  { featureType: "nbr_tax_return", label: "NBR Individual e-TIN Tax Return", creditCost: 15 },
  { featureType: "land_porcha_ocr", label: "CS/SA/RS/BS Land Record Porcha OCR", creditCost: 10 },
  { featureType: "bcs_exam_prep", label: "BCS & University 3D VTuber Viva Mock", creditCost: 8 },
];

export const OUTCOME_PASS_OPTIONS: OutcomePassOption[] = [
  {
    passId: "assignment_sprint",
    name: "Assignment Sprint Pass",
    persona: "🎓 Academic",
    priceBdt: 199,
    priceUsd: 2.99,
    creditsIncluded: 120,
    durationDays: 30,
    badge: "STUDENT PICK",
    highlights: ["120 Task Credits", "Turnitin Safe Paraphraser", "APA/IEEE Auto-Citation"],
  },
  {
    passId: "thesis_defense",
    name: "Thesis & Journal Pass",
    persona: "🔬 Researcher",
    priceBdt: 499,
    priceUsd: 5.99,
    creditsIncluded: 350,
    durationDays: 30,
    badge: "MOST POPULAR",
    highlights: ["350 Task Credits", "Argument & Fallacy Tree (#11)", "Empirical Method Auditor (#15)"],
  },
  {
    passId: "boi_mela_author",
    name: "Ekushey Boi Mela Pass",
    persona: "✍️ Author",
    priceBdt: 799,
    priceUsd: 8.99,
    creditsIncluded: 600,
    durationDays: 30,
    badge: "AUTHOR EDITION",
    highlights: ["600 Task Credits", "All 45 InkOS Capabilities", "6×9 Royal Demy Print PDF + Cover"],
  },
  {
    passId: "pro_operator_pack",
    name: "Venture & Growth Pass",
    persona: "🚀 Founder",
    priceBdt: 1299,
    priceUsd: 12.99,
    creditsIncluded: 1100,
    durationDays: 30,
    badge: "PRO OPERATOR",
    highlights: ["1,100 Task Credits", "Twin AI + Pitch Deck Studio", "bKash/Steadfast/NBR Suite"],
  },
];

export const CREDIT_PACKAGES: CreditPackage[] = [
  { packageId: "starter_49", name: "24h Sprint Pass", priceBdt: 49, priceUsd: 0.40, credits: 300, bonusCredits: 50, badge: "INSTANT PASS" },
  { packageId: "pro_290", name: "Pro Studio Pack", priceBdt: 290, priceUsd: 2.40, credits: 2500, bonusCredits: 500, badge: "MOST POPULAR" },
  { packageId: "pro_500", name: "Pro Founder Pack", priceBdt: 500, priceUsd: 4.15, credits: 3000, bonusCredits: 500, badge: "POWER FOUNDER" },
  { packageId: "business_990", name: "Business Power Pack", priceBdt: 990, priceUsd: 8.25, credits: 10000, bonusCredits: 2500, badge: "BEST VALUE" },
];

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    tierId: "starter",
    packageType: "starter",
    name: "Starter (Free)",
    priceBdtMonth: 0,
    priceUsdMonth: 0,
    targetAudience: "Casual Users & Explorers",
    features: [
      "30 Monthly Universal Task Credits",
      "Offline Story Bible HUD (#10) — 0 Credits",
      "Basic Grammar, Paraphrase & Web Search",
      "2 Active Writing Studio Projects",
    ],
  },
  {
    tierId: "student_plus",
    packageType: "student_plus",
    name: "Student Plus",
    priceBdtMonth: 299,
    priceUsdMonth: 3.99,
    targetAudience: "🎓 University Students & Emerging Writers",
    features: [
      "150 Monthly Universal Task Credits",
      "InkOS Studio Lite (De-Slopper #3, Citation Linker #14)",
      "30 Plagiarism & AI Detector Scans / mo",
      "1-Click bKash / Nagad Student Renewal",
    ],
  },
  {
    tierId: "creator_pro",
    packageType: "creator_pro",
    name: "Creator Pro",
    priceBdtMonth: 799,
    priceUsdMonth: 8.99,
    targetAudience: "✍️ Boi Mela Authors, Researchers & Creators",
    features: [
      "550 Monthly Universal Task Credits",
      "Full 45-Capability InkOS Writing Studio",
      "6×9 Royal Demy Print PDF & Cover Spine (#40–42)",
      "Unlimited Deep Research & Slide Studio",
    ],
  },
  {
    tierId: "studio_max",
    packageType: "studio_max",
    name: "Studio Max",
    priceBdtMonth: 1999,
    priceUsdMonth: 19.99,
    targetAudience: "🚀 Publishers, Agencies & Power Operators",
    features: [
      "1,500 Monthly Universal Task Credits",
      "Multi-Voice Audio Drama (#36) & BookTok Trailer (#37)",
      "Publishing Royalties, Print-on-Demand & Team Seats",
      "Steadfast/Pathao Logistics + NBR Tax Suite",
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
