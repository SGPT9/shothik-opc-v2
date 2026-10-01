/**
 * Cottage Artisan Handloom & Geographical Indication (GI) Export Certification Engine
 * 
 * Provides automated technical verification for Bangladeshi GI heritage textiles
 * (Dhakai Jamdani, Tangail Saree, Rajshahi Silk, Rangpur Shatranji, Dhakai Muslin),
 * Fair-Trade weaver living wage milestone escrow, and EPB/BSCIC Certificate of Origin generation.
 */

import { createHash } from "crypto";

export type GiCraftId =
  | "dhakai_jamdani"
  | "tangail_saree"
  | "rajshahi_silk"
  | "rangpur_shatranji"
  | "dhakai_muslin";

export type LoomType =
  | "traditional_pit_loom"
  | "throw_shuttle_frame_loom"
  | "jacquard_handloom"
  | "power_loom";

export type MotifComplexity =
  | "standard_buti"
  | "tercha_floral"
  | "jalar_heavy"
  | "panna_hazar_royal";

export interface GiCraftProfile {
  craftId: GiCraftId;
  giRegistrationNo: string;
  nameBangla: string;
  nameEnglish: string;
  clusterRegionBangla: string;
  clusterRegionEnglish: string;
  minimumWarpCount: number;
  minimumWeftCount: number;
  allowedLoomTypes: LoomType[];
  hsCode: string;
  dutyRebateRatePercent: number;
}

export interface GiVerificationInput {
  craftId: GiCraftId;
  artisanName: string;
  artisanNid: string;
  clusterLocation: string;
  loomType: LoomType;
  warpYarnCount: number;
  weftYarnCount: number;
  naturalFiberPercent: number; // e.g. 100 for pure cotton/silk
  motifComplexity: MotifComplexity;
}

export interface GiVerificationOutput {
  auditId: string;
  craftId: GiCraftId;
  certificationStatus: "certified_gi_authentic" | "substandard_blend" | "rejected_counterfeit_machine_made";
  authenticityScorePercent: number;
  verdictBangla: string;
  verdictEnglish: string;
  giTagNumber: string;
  timestamp: string;
}

export interface WeaverEscrowInput {
  craftId: GiCraftId;
  artisanName: string;
  artisanWalletNumber: string; // bKash or Nagad
  motifComplexity: MotifComplexity;
  estimatedWeavingDays: number;
  rawYarnCostBdt: number;
  buyerBudgetBdt: number;
}

export interface WeaverEscrowOutput {
  escrowId: string;
  craftId: GiCraftId;
  baseArtisanDailyWageBdt: number;
  complexityMultiplier: number;
  fairLaborWageBdt: number;
  totalCraftCostBdt: number;
  fairTradeCompliant: boolean;
  milestones: {
    stage: "yarn_procurement_advance" | "midway_loom_audit" | "final_delivery_pass";
    stageNameBangla: string;
    percentage: number;
    amountBdt: number;
    releaseStatus: "released" | "escrow_locked" | "pending";
  }[];
  summaryBangla: string;
  summaryEnglish: string;
}

export interface ExportCertificateInput {
  craftId: GiCraftId;
  artisanName: string;
  exporterName: string;
  destinationCountry: string;
  consignmentUnits: number;
  unitValueFobUsd: number;
  giTagNumber: string;
}

export interface ExportCertificateOutput {
  certificateId: string;
  craftId: GiCraftId;
  hsCode: string;
  totalConsignmentValueUsd: number;
  totalConsignmentValueBdt: number;
  estimatedDutyDrawbackBdt: number;
  epbCertificateStatus: "approved_certified_origin";
  sha256VerificationSeal: string;
  issuedAt: string;
}

export const GI_CRAFT_PROFILES: Record<GiCraftId, GiCraftProfile> = {
  dhakai_jamdani: {
    craftId: "dhakai_jamdani",
    giRegistrationNo: "BD/GI-01/DPDT",
    nameBangla: "ঢাকাই জামদানি (রূপগঞ্জ/সোনারগাঁও)",
    nameEnglish: "Dhakai Jamdani Handloom",
    clusterRegionBangla: "রূপগঞ্জ, তারাব ও সোনারগাঁও, নারায়ণগঞ্জ",
    clusterRegionEnglish: "Rupganj, Tarabo & Sonargaon, Narayanganj",
    minimumWarpCount: 80,
    minimumWeftCount: 80,
    allowedLoomTypes: ["traditional_pit_loom"],
    hsCode: "5208.51.10",
    dutyRebateRatePercent: 10.0,
  },
  tangail_saree: {
    craftId: "tangail_saree",
    giRegistrationNo: "BD/GI-27/DPDT",
    nameBangla: "টাঙ্গাইল শাড়ি (দেলদুয়ার/বাজিতপুর)",
    nameEnglish: "Tangail Handloom Saree",
    clusterRegionBangla: "দেলদুয়ার, বাজিতপুর ও কালিহাতী, টাঙ্গাইল",
    clusterRegionEnglish: "Delduar, Bajitpur & Kalihati, Tangail",
    minimumWarpCount: 70,
    minimumWeftCount: 70,
    allowedLoomTypes: ["traditional_pit_loom", "throw_shuttle_frame_loom"],
    hsCode: "5208.52.20",
    dutyRebateRatePercent: 8.5,
  },
  rajshahi_silk: {
    craftId: "rajshahi_silk",
    giRegistrationNo: "BD/GI-08/DPDT",
    nameBangla: "রাজশাহী সিল্ক (ভোলাহাট/মিরগঞ্জ)",
    nameEnglish: "Rajshahi Mulberry Pure Silk",
    clusterRegionBangla: "ভোলাহাট, শিবগঞ্জ ও মিরগঞ্জ, রাজশাহী",
    clusterRegionEnglish: "Bholahat, Shibganj & Mirganj, Rajshahi",
    minimumWarpCount: 20, // Denier equivalent for mulberry silk filament
    minimumWeftCount: 22,
    allowedLoomTypes: ["traditional_pit_loom", "throw_shuttle_frame_loom", "jacquard_handloom"],
    hsCode: "5007.20.00",
    dutyRebateRatePercent: 12.0,
  },
  rangpur_shatranji: {
    craftId: "rangpur_shatranji",
    giRegistrationNo: "BD/GI-03/DPDT",
    nameBangla: "রংপুর শতরঞ্জি (নিশবেতগঞ্জ)",
    nameEnglish: "Rangpur Shatranji Tapestry",
    clusterRegionBangla: "নিশবেতগঞ্জ, পীরগাছা, রংপুর",
    clusterRegionEnglish: "Nisbetganj, Pirgachha, Rangpur",
    minimumWarpCount: 10,
    minimumWeftCount: 10,
    allowedLoomTypes: ["traditional_pit_loom", "throw_shuttle_frame_loom"],
    hsCode: "5702.42.00",
    dutyRebateRatePercent: 7.5,
  },
  dhakai_muslin: {
    craftId: "dhakai_muslin",
    giRegistrationNo: "BD/GI-04/DPDT",
    nameBangla: "ঢাকাই ঐতিহ্যবাহী মসলিন (ফুটি কার্পাস)",
    nameEnglish: "Dhakai Royal Phuti Karpas Muslin",
    clusterRegionBangla: "মেঘনা নদী অববাহিকা, ডেমরা ও রূপগঞ্জ",
    clusterRegionEnglish: "Meghna Basin, Demra & Rupganj",
    minimumWarpCount: 250,
    minimumWeftCount: 250,
    allowedLoomTypes: ["traditional_pit_loom"],
    hsCode: "5208.59.00",
    dutyRebateRatePercent: 15.0,
  },
};

/**
 * Verify GI craftsmanship authenticity against official DPDT/BSCIC standards
 */
export function verifyGiCraftAuthenticity(
  input: GiVerificationInput
): GiVerificationOutput {
  const profile = GI_CRAFT_PROFILES[input.craftId];
  if (!profile) {
    throw new Error(`Invalid GI Craft identifier: ${input.craftId}`);
  }

  const auditId = `GI-AUDIT-${input.craftId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const timestamp = new Date().toISOString();

  // Strict power-loom machine rejection (prevents counterfeit industrial fabric passing as handloom)
  if (input.loomType === "power_loom") {
    return {
      auditId,
      craftId: input.craftId,
      certificationStatus: "rejected_counterfeit_machine_made",
      authenticityScorePercent: 12,
      verdictBangla: "প্রত্যাখ্যাত: পাওয়ার লুম/মেশিন মেইড কাপড়। হস্তচালিত তাঁতের প্রকৃত জিআই সনদের অযোগ্য।",
      verdictEnglish: "REJECTED: Machine-loom fabrication detected. Ineligible for authentic Handloom GI Certification.",
      giTagNumber: "VOID-COUNTERFEIT",
      timestamp,
    };
  }

  let authenticityScore = 100;

  // Yarn count check
  if (input.warpYarnCount < profile.minimumWarpCount) {
    authenticityScore -= 20;
  }
  if (input.weftYarnCount < profile.minimumWeftCount) {
    authenticityScore -= 20;
  }

  // Natural fiber blend check
  if (input.naturalFiberPercent < 90) {
    authenticityScore -= 30;
  }

  // Loom type compliance
  if (!profile.allowedLoomTypes.includes(input.loomType)) {
    authenticityScore -= 15;
  }

  authenticityScore = Math.max(0, Math.min(100, authenticityScore));

  let certificationStatus: "certified_gi_authentic" | "substandard_blend" | "rejected_counterfeit_machine_made" = "certified_gi_authentic";
  let verdictBangla = `প্রমাণিত ঐতিহ্যবাহী জিআই কারুশিল্প (${profile.nameBangla})। শতভাগ হস্তচালিত বিশুদ্ধ কারুকাজ।`;
  let verdictEnglish = `Certified authentic GI Heritage Craft (${profile.nameEnglish}). Fully compliant with BSCIC handloom standards.`;

  if (authenticityScore < 60) {
    certificationStatus = "substandard_blend";
    verdictBangla = "মানোত্তীর্ণ নয়: সুতার কাউন্ট বা প্রাকৃতিক তন্তুর ঘনত্ব জিআই স্ট্যান্ডার্ডের নিচে।";
    verdictEnglish = "Substandard: Yarn count or natural fiber density is below the mandatory GI threshold.";
  }

  const giTagNumber = certificationStatus === "certified_gi_authentic"
    ? `GI-${input.craftId.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`
    : "NOT-CERTIFIED";

  return {
    auditId,
    craftId: input.craftId,
    certificationStatus,
    authenticityScorePercent: authenticityScore,
    verdictBangla,
    verdictEnglish,
    giTagNumber,
    timestamp,
  };
}

/**
 * Calculate Fair-Trade living wage and generate 3-stage milestone escrow schedule
 */
export function calculateWeaverWageEscrow(
  input: WeaverEscrowInput
): WeaverEscrowOutput {
  if (input.estimatedWeavingDays <= 0) {
    throw new Error("Estimated weaving days must be at least 1 day");
  }

  if (input.rawYarnCostBdt < 0) {
    throw new Error("Raw yarn cost cannot be negative");
  }

  const baseArtisanDailyWageBdt = 950; // BDT 950/day standard living craft wage

  const complexityMultipliers: Record<MotifComplexity, number> = {
    standard_buti: 1.0,
    tercha_floral: 1.35,
    jalar_heavy: 1.65,
    panna_hazar_royal: 2.1,
  };

  const complexityMultiplier = complexityMultipliers[input.motifComplexity] || 1.0;
  const fairLaborWageBdt = Math.round(input.estimatedWeavingDays * baseArtisanDailyWageBdt * complexityMultiplier);
  const totalCraftCostBdt = fairLaborWageBdt + input.rawYarnCostBdt;

  const fairTradeCompliant = input.buyerBudgetBdt >= totalCraftCostBdt;

  const escrowId = `ESCROW-WEAVER-${Date.now().toString(36).toUpperCase()}`;

  // 3-Stage Escrow Milestones:
  // 1. Yarn procurement advance (30%)
  // 2. Midway loom inspection (40%)
  // 3. Final quality audit pass & dispatch (30%)
  const advanceAmount = Math.round(totalCraftCostBdt * 0.3);
  const midwayAmount = Math.round(totalCraftCostBdt * 0.4);
  const finalAmount = totalCraftCostBdt - advanceAmount - midwayAmount;

  const milestones = [
    {
      stage: "yarn_procurement_advance" as const,
      stageNameBangla: "সুতা ক্রয় ও তাঁত সাজানো অগ্রিম (৩০%)",
      percentage: 30,
      amountBdt: advanceAmount,
      releaseStatus: "released" as const,
    },
    {
      stage: "midway_loom_audit" as const,
      stageNameBangla: "মধ্যবর্তী বুনন ও নকশা পরিদর্শন (৪০%)",
      percentage: 40,
      amountBdt: midwayAmount,
      releaseStatus: "escrow_locked" as const,
    },
    {
      stage: "final_delivery_pass" as const,
      stageNameBangla: "চূড়ান্ত ফিনিশিং ও কোয়ালিটি ছাড়পত্র (৩০%)",
      percentage: 30,
      amountBdt: finalAmount,
      releaseStatus: "pending" as const,
    },
  ];

  const summaryBangla = fairTradeCompliant
    ? `ন্যায্য মজুরি নিশ্চিত (মোট মজুরি: ৳${fairLaborWageBdt.toLocaleString("en-IN")})। ৩-ধাপের তাঁতি এসক্রো সক্রিয়।`
    : `সতর্কতা: ক্রেতার প্রস্তাবিত মূল্য ন্যায্য মজুরির চেয়ে ৳${(totalCraftCostBdt - input.buyerBudgetBdt).toLocaleString("en-IN")} কম।`;

  const summaryEnglish = fairTradeCompliant
    ? `Fair-Trade compliant (total labor wage: ৳${fairLaborWageBdt.toLocaleString("en-IN")}). 3-stage artisan escrow locked.`
    : `Warning: Budget underpays fair artisan wage by ৳${(totalCraftCostBdt - input.buyerBudgetBdt).toLocaleString("en-IN")}.`;

  return {
    escrowId,
    craftId: input.craftId,
    baseArtisanDailyWageBdt,
    complexityMultiplier,
    fairLaborWageBdt,
    totalCraftCostBdt,
    fairTradeCompliant,
    milestones,
    summaryBangla,
    summaryEnglish,
  };
}

/**
 * Generate Export Certificate of Origin (CO) with statutory duty drawback estimation and SHA-256 seal
 */
export function generateArtisanExportCertificate(
  input: ExportCertificateInput
): ExportCertificateOutput {
  const profile = GI_CRAFT_PROFILES[input.craftId];
  if (!profile) {
    throw new Error(`Invalid GI Craft identifier: ${input.craftId}`);
  }

  if (input.consignmentUnits <= 0 || input.unitValueFobUsd <= 0) {
    throw new Error("Units and FOB unit value must be positive numbers");
  }

  const bdtUsdRate = 122.5; // Commercial exchange rate
  const totalConsignmentValueUsd = Math.round(input.consignmentUnits * input.unitValueFobUsd * 100) / 100;
  const totalConsignmentValueBdt = Math.round(totalConsignmentValueUsd * bdtUsdRate);

  // Export promotion cash incentive / duty drawback calculation
  const estimatedDutyDrawbackBdt = Math.round(totalConsignmentValueBdt * (profile.dutyRebateRatePercent / 100));

  const certificateId = `EPB-GI-CO-${input.craftId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const issuedAt = new Date().toISOString();

  const canonicalPayload = JSON.stringify({
    certificateId,
    craftId: input.craftId,
    hsCode: profile.hsCode,
    giTagNumber: input.giTagNumber,
    exporterName: input.exporterName,
    destinationCountry: input.destinationCountry,
    totalConsignmentValueUsd,
    issuedAt,
  });

  const sha256VerificationSeal = createHash("sha256")
    .update(canonicalPayload)
    .digest("hex");

  return {
    certificateId,
    craftId: input.craftId,
    hsCode: profile.hsCode,
    totalConsignmentValueUsd,
    totalConsignmentValueBdt,
    estimatedDutyDrawbackBdt,
    epbCertificateStatus: "approved_certified_origin",
    sha256VerificationSeal,
    issuedAt,
  };
}
