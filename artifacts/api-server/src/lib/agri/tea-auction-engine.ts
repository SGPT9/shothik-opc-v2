/**
 * Autonomous Tea Estate Auction Bidding, Leaf Grade Quality Index & Chittagong/Sreemangal Tea Auction Clearing Engine
 * 
 * Provides automated tea estate cataloging, sensory tea taster quality appraisal (TTQI),
 * competitive real-time auction bidding, Bangladesh Tea Board (BTB) statutory cess clearing,
 * bonded warehouse delivery order (DO) release, and northern smallholder fair green leaf pricing.
 */

import { createHash } from "crypto";

export type TeaRegion =
  | "sylhet_sreemangal"
  | "chittagong"
  | "panchagarh_northern";

export type AuctionCenter =
  | "chittagong_auction_center"
  | "sreemangal_auction_center"
  | "panchagarh_auction_center";

export type TeaLeafGrade =
  | "BOP"
  | "GBOP"
  | "FBOP"
  | "OF"
  | "PF"
  | "FOF"
  | "PD"
  | "RD"
  | "D"
  | "CD"
  | "FTGFOP"
  | "GREEN_TEA_SENCHA";

export type QualityTier =
  | "prime_export"
  | "premium_domestic"
  | "standard_commercial"
  | "substandard_blend";

export interface TeaEstateProfile {
  estateId: string;
  estateNameBangla: string;
  estateNameEnglish: string;
  gardenMark: string;
  region: TeaRegion;
  district: string;
  btbLicenseNumber: string;
  elevationMeters: number;
  primaryGrades: TeaLeafGrade[];
  auctionCenter: AuctionCenter;
}

export interface TasterAppraisalInput {
  estateId: string;
  leafGrade: TeaLeafGrade;
  leafAppearanceScore: number;    // 0 to 25
  infusedAromaScore: number;      // 0 to 25
  liquorColorScore: number;       // 0 to 25
  brisknessStrengthScore: number; // 0 to 25
}

export interface TasterAppraisalOutput {
  appraisalId: string;
  estateId: string;
  leafGrade: TeaLeafGrade;
  ttqiScore: number;              // 0 to 100
  qualityTier: QualityTier;
  recommendedReservePriceBdtPerKg: number;
  exportEligible: boolean;
  tasterNotesBangla: string;
  tasterNotesEnglish: string;
  timestamp: string;
}

export interface AuctionBidInput {
  lotId: string;
  estateId: string;
  leafGrade: TeaLeafGrade;
  totalWeightKg: number;
  currentHighBidBdtPerKg: number;
  newBidBdtPerKg: number;
  bidderName: string;
  bidderBtbLicense: string;
}

export interface AuctionBidOutput {
  bidAccepted: boolean;
  rejectionReason?: string;
  lotId: string;
  highBidBdtPerKg: number;
  bidderName: string;
  projectedGrossHammerBdt: number;
  projectedStatutoryCessBdt: number;
  projectedBrokerCommissionBdt: number;
  projectedWarehouseHandlingBdt: number;
  projectedAdvanceIncomeTaxBdt: number;
  projectedTotalPayableBdt: number;
}

export interface LotClearanceInput {
  lotId: string;
  estateId: string;
  auctionCenter: AuctionCenter;
  leafGrade: TeaLeafGrade;
  totalWeightKg: number;
  finalHammerPriceBdtPerKg: number;
  buyerName: string;
  buyerBtbLicense: string;
  bondedWarehouseName: string;
}

export interface LotClearanceOutput {
  clearanceId: string;
  lotId: string;
  estateId: string;
  auctionCenter: AuctionCenter;
  leafGrade: TeaLeafGrade;
  totalWeightKg: number;
  hammerPriceBdtPerKg: number;
  grossHammerBdt: number;
  statutoryTeaCessBdt: number;
  brokerCommissionBdt: number;
  warehouseHandlingBdt: number;
  advanceIncomeTaxBdt: number;
  totalBuyerPayableBdt: number;
  netEstateProceedsBdt: number;
  deliveryOrderToken: string;
  deliveryOrderIssuedAt: string;
  qrReleasePayload: string;
}

export interface SmallholderFairPriceInput {
  averageAuctionMadeTeaPriceBdtPerKg: number;
  greenLeafKg: number;
  leafMoistureQualityPercent?: number; // default 75%
}

export interface SmallholderFairPriceOutput {
  averageAuctionMadeTeaPriceBdtPerKg: number;
  greenLeafKg: number;
  fairPricePerKgBdt: number;
  totalFarmerPayoutBdt: number;
  factoryConversionRatio: number;
  statutoryMinPriceBdtPerKg: number;
  complianceCheckBangla: string;
  complianceCheckEnglish: string;
}

// Statutory Bangladesh Tea Board (BTB) & CTTA Constants
export const STATUTORY_TEA_CESS_PER_KG_BDT = 1.50; // BTB Development Cess
export const BROKER_COMMISSION_PERCENT = 0.0125;   // 1.25% Auction Broker Commission
export const WAREHOUSE_HANDLING_PER_KG_BDT = 0.75; // Chittagong/Sreemangal Bonded Depot
export const ADVANCE_INCOME_TAX_PERCENT = 0.01;    // 1.0% AIT
export const MIN_BID_INCREMENT_BDT = 2.00;         // Minimum bid increment in auction

// Registered Prominent Tea Estates in Bangladesh
export const TEA_ESTATE_PROFILES: Record<string, TeaEstateProfile> = {
  finlay_sreemangal: {
    estateId: "finlay_sreemangal",
    estateNameBangla: "জেমস ফিনলে টি এস্টেট (শ্রীমঙ্গল)",
    estateNameEnglish: "James Finlay Tea Estate, Sreemangal",
    gardenMark: "FINLAY",
    region: "sylhet_sreemangal",
    district: "Moulvibazar",
    btbLicenseNumber: "BTB-EST-0012-SYL",
    elevationMeters: 180,
    primaryGrades: ["BOP", "GBOP", "OF", "PF", "FTGFOP"],
    auctionCenter: "sreemangal_auction_center",
  },
  ispahani_mirzapore: {
    estateId: "ispahani_mirzapore",
    estateNameBangla: "ইস্পাহানি মির্জাপুর চা বাগান",
    estateNameEnglish: "Ispahani Mirzapore Tea Estate",
    gardenMark: "MIRZAPORE",
    region: "sylhet_sreemangal",
    district: "Moulvibazar",
    btbLicenseNumber: "BTB-EST-0044-ISPA",
    elevationMeters: 210,
    primaryGrades: ["BOP", "OF", "FOF", "PD", "RD"],
    auctionCenter: "chittagong_auction_center",
  },
  duncan_camellia: {
    estateId: "duncan_camellia",
    estateNameBangla: "ডানকান ব্রাদার্স ক্যামেলিয়া এস্টেট",
    estateNameEnglish: "Duncan Brothers Camellia Estate",
    gardenMark: "CAMELLIA",
    region: "sylhet_sreemangal",
    district: "Habiganj",
    btbLicenseNumber: "BTB-EST-0089-DUNC",
    elevationMeters: 165,
    primaryGrades: ["OF", "PF", "PD", "D", "CD"],
    auctionCenter: "sreemangal_auction_center",
  },
  ntc_patrokhola: {
    estateId: "ntc_patrokhola",
    estateNameBangla: "এনটিসি পাত্রখোলা চা বাগান",
    estateNameEnglish: "National Tea Company (NTC) Patrokhola",
    gardenMark: "PATROKHOLA",
    region: "sylhet_sreemangal",
    district: "Moulvibazar",
    btbLicenseNumber: "BTB-EST-0105-NTC",
    elevationMeters: 140,
    primaryGrades: ["GBOP", "OF", "PD", "D"],
    auctionCenter: "sreemangal_auction_center",
  },
  kazi_panchagarh: {
    estateId: "kazi_panchagarh",
    estateNameBangla: "কাজী অ্যান্ড কাজী অর্গানিক টি এস্টেট",
    estateNameEnglish: "Kazi & Kazi Organic Tea Estate, Tetulia",
    gardenMark: "KK_ORGANIC",
    region: "panchagarh_northern",
    district: "Panchagarh",
    btbLicenseNumber: "BTB-EST-0158-PAN",
    elevationMeters: 85,
    primaryGrades: ["FTGFOP", "GREEN_TEA_SENCHA", "FBOP", "BOP"],
    auctionCenter: "panchagarh_auction_center",
  },
  tetulia_smallholder_coop: {
    estateId: "tetulia_smallholder_coop",
    estateNameBangla: "তেঁতুলিয়া ক্ষুদ্র চা চাষী সমবায়",
    estateNameEnglish: "Tetulia Smallholder Tea Cooperative",
    gardenMark: "TETULIA_SMALL",
    region: "panchagarh_northern",
    district: "Panchagarh",
    btbLicenseNumber: "BTB-COOP-0203-PAN",
    elevationMeters: 80,
    primaryGrades: ["BOP", "OF", "PD", "GREEN_TEA_SENCHA"],
    auctionCenter: "panchagarh_auction_center",
  },
};

// Base baseline prices per kg in BDT for standard quality (TTQI ~ 70)
const BASE_GRADE_PRICES_BDT: Record<TeaLeafGrade, number> = {
  FTGFOP: 450,
  GREEN_TEA_SENCHA: 380,
  FBOP: 260,
  GBOP: 240,
  BOP: 225,
  FOF: 235,
  OF: 220,
  PF: 215,
  PD: 210,
  RD: 200,
  D: 190,
  CD: 180,
};

/**
 * Evaluates tea sensory metrics and computes the Tea Taster Quality Index (TTQI)
 */
export function appraiseTeaSensoryQuality(input: TasterAppraisalInput): TasterAppraisalOutput {
  const leafAppearance = Math.max(0, Math.min(25, input.leafAppearanceScore));
  const infusedAroma = Math.max(0, Math.min(25, input.infusedAromaScore));
  const liquorColor = Math.max(0, Math.min(25, input.liquorColorScore));
  const brisknessStrength = Math.max(0, Math.min(25, input.brisknessStrengthScore));

  const ttqiScore = leafAppearance + infusedAroma + liquorColor + brisknessStrength;

  let qualityTier: QualityTier;
  let multiplier: number;
  let exportEligible: boolean;
  let tasterNotesBangla: string;
  let tasterNotesEnglish: string;

  if (ttqiScore >= 85) {
    qualityTier = "prime_export";
    multiplier = 1.35;
    exportEligible = true;
    tasterNotesBangla = "চমৎকার তামাটে সুবাস, নিখুঁত উজ্জ্বল লিকার এবং তীব্র তেজ। আন্তর্জাতিক রফতানি মানের প্রিমিয়াম লট।";
    tasterNotesEnglish = "Exceptional coppery infusion, vibrant golden liquor, and high briskness. Prime export grade.";
  } else if (ttqiScore >= 75) {
    qualityTier = "premium_domestic";
    multiplier = 1.15;
    exportEligible = true;
    tasterNotesBangla = "উন্নত উজ্জ্বলতা ও ভালো লিকার গভীরতা। দেশের শীর্ষ ব্র্যান্ড ব্লেন্ডের জন্য আদর্শ।";
    tasterNotesEnglish = "Bright cup, rich amber depth, and robust body. Suitable for premium domestic branded blends.";
  } else if (ttqiScore >= 60) {
    qualityTier = "standard_commercial";
    multiplier = 1.0;
    exportEligible = false;
    tasterNotesBangla = "মানসম্মত বাণিজ্যিক লট। নিয়মিত খুচরা ব্লেন্ড ও হোটেল কনজাম্পশনের জন্য উপযুক্ত।";
    tasterNotesEnglish = "Standard commercial grade with balanced briskness. Ideal for mainstream FMCG blends.";
  } else {
    qualityTier = "substandard_blend";
    multiplier = 0.80;
    exportEligible = false;
    tasterNotesBangla = "হালকা ফাইবার ও মলিন লিকার। নিম্নমানের মিশ্রণ অথবা রি-ড্রাইং প্রক্রিয়াকরণ প্রয়োজন।";
    tasterNotesEnglish = "Flaky leaf appearance, dull liquor. Secondary filler blend grade requiring price discount.";
  }

  const basePrice = BASE_GRADE_PRICES_BDT[input.leafGrade] || 210;
  const recommendedReservePriceBdtPerKg = Math.round(basePrice * multiplier);

  const appraisalId = `TTQI-${Date.now()}-${createHash("sha256")
    .update(`${input.estateId}-${input.leafGrade}-${ttqiScore}`)
    .digest("hex")
    .slice(0, 8)
    .toUpperCase()}`;

  return {
    appraisalId,
    estateId: input.estateId,
    leafGrade: input.leafGrade,
    ttqiScore,
    qualityTier,
    recommendedReservePriceBdtPerKg,
    exportEligible,
    tasterNotesBangla,
    tasterNotesEnglish,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validates and processes a competitive auction bid
 */
export function processAuctionBid(input: AuctionBidInput): AuctionBidOutput {
  const minRequiredBid = input.currentHighBidBdtPerKg + MIN_BID_INCREMENT_BDT;

  if (input.newBidBdtPerKg < minRequiredBid) {
    return {
      bidAccepted: false,
      rejectionReason: `Bid of BDT ${input.newBidBdtPerKg.toFixed(2)} is below minimum required bid of BDT ${minRequiredBid.toFixed(2)} (Min increment: BDT ${MIN_BID_INCREMENT_BDT.toFixed(2)}/kg).`,
      lotId: input.lotId,
      highBidBdtPerKg: input.currentHighBidBdtPerKg,
      bidderName: input.bidderName,
      projectedGrossHammerBdt: Math.round(input.currentHighBidBdtPerKg * input.totalWeightKg),
      projectedStatutoryCessBdt: Math.round(input.totalWeightKg * STATUTORY_TEA_CESS_PER_KG_BDT),
      projectedBrokerCommissionBdt: Math.round(input.currentHighBidBdtPerKg * input.totalWeightKg * BROKER_COMMISSION_PERCENT),
      projectedWarehouseHandlingBdt: Math.round(input.totalWeightKg * WAREHOUSE_HANDLING_PER_KG_BDT),
      projectedAdvanceIncomeTaxBdt: Math.round(input.currentHighBidBdtPerKg * input.totalWeightKg * ADVANCE_INCOME_TAX_PERCENT),
      projectedTotalPayableBdt: 0,
    };
  }

  const projectedGrossHammerBdt = Math.round(input.newBidBdtPerKg * input.totalWeightKg);
  const projectedStatutoryCessBdt = Math.round(input.totalWeightKg * STATUTORY_TEA_CESS_PER_KG_BDT);
  const projectedBrokerCommissionBdt = Math.round(projectedGrossHammerBdt * BROKER_COMMISSION_PERCENT);
  const projectedWarehouseHandlingBdt = Math.round(input.totalWeightKg * WAREHOUSE_HANDLING_PER_KG_BDT);
  const projectedAdvanceIncomeTaxBdt = Math.round(projectedGrossHammerBdt * ADVANCE_INCOME_TAX_PERCENT);

  const projectedTotalPayableBdt =
    projectedGrossHammerBdt +
    projectedStatutoryCessBdt +
    projectedBrokerCommissionBdt +
    projectedWarehouseHandlingBdt +
    projectedAdvanceIncomeTaxBdt;

  return {
    bidAccepted: true,
    lotId: input.lotId,
    highBidBdtPerKg: input.newBidBdtPerKg,
    bidderName: input.bidderName,
    projectedGrossHammerBdt,
    projectedStatutoryCessBdt,
    projectedBrokerCommissionBdt,
    projectedWarehouseHandlingBdt,
    projectedAdvanceIncomeTaxBdt,
    projectedTotalPayableBdt,
  };
}

/**
 * Clears an auction lot upon hammer fall, calculates statutory fees, and issues a cryptographically signed Delivery Order (DO)
 */
export function clearAuctionLot(input: LotClearanceInput): LotClearanceOutput {
  const grossHammerBdt = Math.round(input.finalHammerPriceBdtPerKg * input.totalWeightKg);
  const statutoryTeaCessBdt = Math.round(input.totalWeightKg * STATUTORY_TEA_CESS_PER_KG_BDT);
  const brokerCommissionBdt = Math.round(grossHammerBdt * BROKER_COMMISSION_PERCENT);
  const warehouseHandlingBdt = Math.round(input.totalWeightKg * WAREHOUSE_HANDLING_PER_KG_BDT);
  const advanceIncomeTaxBdt = Math.round(grossHammerBdt * ADVANCE_INCOME_TAX_PERCENT);

  // Buyer pays gross hammer + statutory cess + broker commission + warehouse + AIT
  const totalBuyerPayableBdt =
    grossHammerBdt +
    statutoryTeaCessBdt +
    brokerCommissionBdt +
    warehouseHandlingBdt +
    advanceIncomeTaxBdt;

  // Estate receives gross hammer minus broker commission, cess, and warehouse storage
  const netEstateProceedsBdt =
    grossHammerBdt - brokerCommissionBdt - statutoryTeaCessBdt - warehouseHandlingBdt;

  const clearanceId = `CLR-${input.auctionCenter.slice(0, 3).toUpperCase()}-${Date.now()}`;
  const deliveryOrderIssuedAt = new Date().toISOString();

  const deliveryOrderToken = createHash("sha256")
    .update(
      `${clearanceId}|${input.lotId}|${input.estateId}|${input.buyerBtbLicense}|${input.finalHammerPriceBdtPerKg}|${deliveryOrderIssuedAt}`
    )
    .digest("hex");

  const qrReleasePayload = JSON.stringify({
    clearanceId,
    lotId: input.lotId,
    estateId: input.estateId,
    auctionCenter: input.auctionCenter,
    grade: input.leafGrade,
    netWeightKg: input.totalWeightKg,
    buyerLicense: input.buyerBtbLicense,
    warehouse: input.bondedWarehouseName,
    doToken: deliveryOrderToken.slice(0, 16),
    clearedStatus: "PAID_READY_FOR_DISPATCH",
  });

  return {
    clearanceId,
    lotId: input.lotId,
    estateId: input.estateId,
    auctionCenter: input.auctionCenter,
    leafGrade: input.leafGrade,
    totalWeightKg: input.totalWeightKg,
    hammerPriceBdtPerKg: input.finalHammerPriceBdtPerKg,
    grossHammerBdt,
    statutoryTeaCessBdt,
    brokerCommissionBdt,
    warehouseHandlingBdt,
    advanceIncomeTaxBdt,
    totalBuyerPayableBdt,
    netEstateProceedsBdt,
    deliveryOrderToken,
    deliveryOrderIssuedAt,
    qrReleasePayload,
  };
}

/**
 * Calculates fair green leaf support price for smallholder flatland farmers (Panchagarh/Thakurgaon)
 * based on statutory made-tea auction realizations
 */
export function calculateSmallholderGreenLeafFairPrice(
  input: SmallholderFairPriceInput
): SmallholderFairPriceOutput {
  const factoryConversionRatio = 4.5; // ~4.5 kg fresh plucked green leaf produces 1.0 kg made tea
  const leafMoistureRatio = (input.leafMoistureQualityPercent ?? 75) / 75; // normalized around standard 75% fine plucking

  // Formula: Fair price per kg = (Auction Made Tea Avg / 4.5) * 0.90 * moisture quality factor
  const baseFairPrice = (input.averageAuctionMadeTeaPriceBdtPerKg / factoryConversionRatio) * 0.90;
  const adjustedPrice = Math.max(18.0, baseFairPrice * (1 / leafMoistureRatio));
  const fairPricePerKgBdt = Math.round(adjustedPrice * 100) / 100;

  const totalFarmerPayoutBdt = Math.round(fairPricePerKgBdt * input.greenLeafKg);
  const statutoryMinPriceBdtPerKg = 24.0; // BTB minimum recommended floor for fine plucking

  const compliancePass = fairPricePerKgBdt >= statutoryMinPriceBdtPerKg;

  const complianceCheckBangla = compliancePass
    ? `নির্ধারিত মূল্য ৳${fairPricePerKgBdt.toFixed(2)}/কেজি বাংলাদেশ চা বোর্ডের ন্যূনতম সাপোর্ট প্রাইস (৳${statutoryMinPriceBdtPerKg.toFixed(2)}) অনুসরণ করে।`
    : `সতর্কতা: প্রস্তাবিত মূল্য ৳${fairPricePerKgBdt.toFixed(2)} চা বোর্ডের ন্যূনতম সুরক্ষা মূল্যের (৳${statutoryMinPriceBdtPerKg.toFixed(2)}) নিচে।`;

  const complianceCheckEnglish = compliancePass
    ? `Fair green leaf rate of BDT ${fairPricePerKgBdt.toFixed(2)}/kg complies with BTB smallholder protection threshold (BDT ${statutoryMinPriceBdtPerKg.toFixed(2)}/kg).`
    : `Warning: Rate of BDT ${fairPricePerKgBdt.toFixed(2)}/kg is below BTB minimum recommended support floor (BDT ${statutoryMinPriceBdtPerKg.toFixed(2)}/kg).`;

  return {
    averageAuctionMadeTeaPriceBdtPerKg: input.averageAuctionMadeTeaPriceBdtPerKg,
    greenLeafKg: input.greenLeafKg,
    fairPricePerKgBdt,
    totalFarmerPayoutBdt,
    factoryConversionRatio,
    statutoryMinPriceBdtPerKg,
    complianceCheckBangla,
    complianceCheckEnglish,
  };
}
