/**
 * Coastal Aquaculture, Shrimp Gher Telemetry & Seafood Processing Escrow Engine
 * 
 * Provides automated water quality sensor telemetry monitoring (Dissolved Oxygen, Salinity, Ammonia, pH),
 * hypoxia mortality prevention, harvest size grading, cold-chain escrow release,
 * and Department of Fisheries (DoF) & EU Export Traceability Passports.
 */

import { createHash } from "crypto";

export type AquacultureSpecies =
  | "bagda_black_tiger"
  | "golda_giant_freshwater"
  | "vannamei_whiteleg"
  | "ruhi_carp"
  | "tilapia_biofloc";

export type WaterQualityRisk =
  | "normal"
  | "caution"
  | "hypoxia_kill_risk"
  | "ammonia_toxicity"
  | "salinity_shock";

export type ShrimpSizeGrade =
  | "U_10"
  | "count_16_20"
  | "count_21_25"
  | "count_31_40"
  | "count_41_50";

export interface CoastalGherProfile {
  gherId: string;
  gherNameBangla: string;
  gherNameEnglish: string;
  upazilaBangla: string;
  upazilaEnglish: string;
  district: "satkhira" | "khulna" | "bagerhat" | "coxs_bazar";
  dofRegistrationNumber: string;
  primarySpecies: AquacultureSpecies;
  waterAreaAcres: number;
  averageSalinityPpt: number;
}

export interface GherWaterTelemetryInput {
  gherId: string;
  species: AquacultureSpecies;
  dissolvedOxygenMgL: number;
  waterTemperatureCelsius: number;
  salinityPpt: number;
  phLevel: number;
  unionizedAmmoniaMgL: number;
  timestamp?: string;
}

export interface GherWaterTelemetryOutput {
  telemetryId: string;
  gherId: string;
  species: AquacultureSpecies;
  dissolvedOxygenMgL: number;
  waterTemperatureCelsius: number;
  salinityPpt: number;
  phLevel: number;
  unionizedAmmoniaMgL: number;
  waterQualityRisk: WaterQualityRisk;
  emergencyActionRequired: boolean;
  aerationRecommended: boolean;
  advisoryBangla: string;
  advisoryEnglish: string;
  timestamp: string;
}

export interface HarvestGradingInput {
  harvestId: string;
  gherId: string;
  species: AquacultureSpecies;
  totalWeightKg: number;
  gradeCountPerKg: ShrimpSizeGrade;
  iceSlurryTemperatureCelsius: number;
  destinationProcessingPlant: string;
}

export interface HarvestGradingOutput {
  harvestId: string;
  gherId: string;
  species: AquacultureSpecies;
  totalWeightKg: number;
  gradeCountPerKg: ShrimpSizeGrade;
  basePricePerKgBdt: number;
  coldChainCompliant: boolean;
  qualityDeductionBdt: number;
  netHarvestValueBdt: number;
  escrowId: string;
  milestones: {
    stage: "gate_arrival_advance" | "lab_antibiotic_clearance" | "blast_freezer_acceptance";
    stageNameBangla: string;
    percentage: number;
    amountBdt: number;
    status: "released" | "escrow_locked" | "pending";
  }[];
  summaryBangla: string;
  summaryEnglish: string;
}

export interface DofPassportInput {
  gherId: string;
  harvestId: string;
  ownerName: string;
  species: AquacultureSpecies;
  totalWeightKg: number;
  antibioticScreeningPassed: boolean;
  destinationCountry: string;
}

export interface DofPassportOutput {
  passportId: string;
  gherId: string;
  dofRegistrationNumber: string;
  species: AquacultureSpecies;
  totalWeightKg: number;
  antibioticScreeningPassed: boolean;
  euHealthCertificateApproved: boolean;
  sha256VerificationSeal: string;
  issuedAt: string;
}

export const COASTAL_GHER_PROFILES: Record<string, CoastalGherProfile> = {
  "gher_satkhira_shyamnagar": {
    gherId: "gher_satkhira_shyamnagar",
    gherNameBangla: "শ্যামনগর লবণাক্ত বাগদা চিংড়ি ঘের",
    gherNameEnglish: "Shyamnagar Coastal Bagda Gher",
    upazilaBangla: "শ্যামনগর, সাতক্ষীরা",
    upazilaEnglish: "Shyamnagar, Satkhira",
    district: "satkhira",
    dofRegistrationNumber: "DOF-SAT-SHY-2026-081",
    primarySpecies: "bagda_black_tiger",
    waterAreaAcres: 12.5,
    averageSalinityPpt: 18.0,
  },
  "gher_khulna_paikgachha": {
    gherId: "gher_khulna_paikgachha",
    gherNameBangla: "পাইকগাছা কপোতাক্ষ মডেল অ্যাকুয়াকালচার",
    gherNameEnglish: "Paikgachha Model Brackish Farm",
    upazilaBangla: "পাইকগাছা, খুলনা",
    upazilaEnglish: "Paikgachha, Khulna",
    district: "khulna",
    dofRegistrationNumber: "DOF-KHU-PAI-2026-114",
    primarySpecies: "bagda_black_tiger",
    waterAreaAcres: 8.0,
    averageSalinityPpt: 14.5,
  },
  "gher_bagerhat_rampal": {
    gherId: "gher_bagerhat_rampal",
    gherNameBangla: "রামপাল সুন্দরবন ফ্রেশওয়াটার গলদা খামার",
    gherNameEnglish: "Rampal Sundarban Golda Prawn Farm",
    upazilaBangla: "রামপাল, বাগেরহাট",
    upazilaEnglish: "Rampal, Bagerhat",
    district: "bagerhat",
    dofRegistrationNumber: "DOF-BAG-RAM-2026-049",
    primarySpecies: "golda_giant_freshwater",
    waterAreaAcres: 6.2,
    averageSalinityPpt: 3.5,
  },
  "gher_coxsbazar_chakaria": {
    gherId: "gher_coxsbazar_chakaria",
    gherNameBangla: "চকোরিয়া উপকূলীয় ব্ল্যাক টাইগার হ্যাচারি ও ঘের",
    gherNameEnglish: "Chakaria Black Tiger Hatchery & Coastal Pond",
    upazilaBangla: "চকোরিয়া, কক্সবাজার",
    upazilaEnglish: "Chakaria, Cox's Bazar",
    district: "coxs_bazar",
    dofRegistrationNumber: "DOF-COX-CHK-2026-202",
    primarySpecies: "bagda_black_tiger",
    waterAreaAcres: 15.0,
    averageSalinityPpt: 22.0,
  },
};

/**
 * Ingest real-time water quality sensors and trigger hypoxia or chemical toxicity warnings
 */
export function analyzeWaterQuality(
  input: GherWaterTelemetryInput
): GherWaterTelemetryOutput {
  if (input.dissolvedOxygenMgL < 0 || input.salinityPpt < 0 || input.phLevel < 0 || input.unionizedAmmoniaMgL < 0) {
    throw new Error("Telemetry values cannot be negative numbers");
  }

  const telemetryId = `AQUA-TEL-${input.gherId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const timestamp = input.timestamp || new Date().toISOString();

  let waterQualityRisk: WaterQualityRisk = "normal";
  let emergencyActionRequired = false;
  let aerationRecommended = false;
  let advisoryBangla = "পানির গুণমান ও দ্রবীভূত অক্সিজেন স্বাভাবিক পর্যায়ে রয়েছে। রুটিন খাদ্য সরবরাহ চালু রাখুন।";
  let advisoryEnglish = "Water quality and dissolved oxygen optimal. Maintain routine scheduled feeding.";

  // 1. Hypoxia (Low Dissolved Oxygen) Check - Most lethal risk in shrimp ghers
  if (input.dissolvedOxygenMgL < 3.5) {
    waterQualityRisk = "hypoxia_kill_risk";
    emergencyActionRequired = true;
    aerationRecommended = true;
    advisoryBangla = "চরম বিপদ সংকেত: দ্রবীভূত অক্সিজেন (DO) ৩.৫ mg/L এর নিচে! রাতের বেলায় চিংড়ি মড়কের তীব্র ঝুঁকি। অবিলম্বে প্যাডেল হুইল এরেটর চালু করুন এবং অক্সিজেন পারক্সাইড ট্যাবলেট প্রয়োগ করুন।";
    advisoryEnglish = "CRITICAL HYPOXIA HAZARD: Dissolved Oxygen below 3.5 mg/L! High risk of mass shrimp mortality. Engage paddlewheel aerators immediately and apply oxygen-release tablets.";
  } else if (input.dissolvedOxygenMgL < 5.0) {
    waterQualityRisk = "caution";
    aerationRecommended = true;
    advisoryBangla = "সতর্কতা: অক্সিজেন কিছুটা কম। এরেটর প্রস্তুত রাখুন এবং অতিরিক্ত ফিডিং বন্ধ রাখুন।";
    advisoryEnglish = "Caution: Dissolved oxygen suboptimal. Standby aerators and suspend excessive feed.";
  }

  // 2. Unionized Ammonia Toxicity Check (NH3 > 0.05 mg/L)
  if (input.unionizedAmmoniaMgL > 0.05 && waterQualityRisk !== "hypoxia_kill_risk") {
    waterQualityRisk = "ammonia_toxicity";
    emergencyActionRequired = true;
    advisoryBangla = "অ্যামোনিয়া বিষক্রিয়া ঝুঁকি: পানিতে ফ্রি অ্যামোনিয়া ০.০৫ mg/L অতিক্রম করেছে। খাদ্য প্রদান ৫০% হ্রাস করুন এবং প্রোবায়োটিক / গুড় মিশিয়ে সি/এন অনুপাত সমন্বয় করুন।";
    advisoryEnglish = "AMMONIA TOXICITY WARNING: Free ammonia exceeds 0.05 mg/L. Cut feed by 50% and dose biofloc carbon/molasses probiotic.";
  }

  // 3. Salinity Shock Check
  if (input.species === "bagda_black_tiger" && input.salinityPpt < 8.0 && waterQualityRisk === "normal") {
    waterQualityRisk = "salinity_shock";
    advisoryBangla = "লবণাক্ততা ঘাটতি: বাগদা চিংড়ির জন্য পানিতে লবণাক্ততা ৮ ppt এর নিচে। নদীর মিঠা পানির অতিরিক্ত প্রবেশ নিয়ন্ত্রণ করুন।";
    advisoryEnglish = "Salinity Shock: Salinity below 8 ppt for Black Tiger shrimp. Restrict excessive freshwater canal inflow.";
  } else if (input.species === "golda_giant_freshwater" && input.salinityPpt > 10.0 && waterQualityRisk === "normal") {
    waterQualityRisk = "salinity_shock";
    advisoryBangla = "লবণাক্ততা বৃদ্ধি: গলদা চিংড়ির জন্য লবণাক্ততা ১০ ppt অতিক্রম করেছে। মিঠা পানি সরবরাহ করুন।";
    advisoryEnglish = "High Salinity: Salinity exceeds 10 ppt for freshwater Golda prawn. Pump in fresh sweet water.";
  }

  return {
    telemetryId,
    gherId: input.gherId,
    species: input.species,
    dissolvedOxygenMgL: input.dissolvedOxygenMgL,
    waterTemperatureCelsius: input.waterTemperatureCelsius,
    salinityPpt: input.salinityPpt,
    phLevel: input.phLevel,
    unionizedAmmoniaMgL: input.unionizedAmmoniaMgL,
    waterQualityRisk,
    emergencyActionRequired,
    aerationRecommended,
    advisoryBangla,
    advisoryEnglish,
    timestamp,
  };
}

/**
 * Grade shrimp harvest by count size band, enforce cold-chain compliance, and compute factory escrow
 */
export function gradeHarvestAndCalculateEscrow(
  input: HarvestGradingInput
): HarvestGradingOutput {
  if (input.totalWeightKg <= 0) {
    throw new Error("Harvest total weight must be greater than zero kg");
  }

  const basePricePerGrade: Record<ShrimpSizeGrade, number> = {
    U_10: 1450, // Under 10 Jumbo Count BDT/kg
    count_16_20: 1180,
    count_21_25: 980,
    count_31_40: 820,
    count_41_50: 650,
  };

  const basePricePerKgBdt = basePricePerGrade[input.gradeCountPerKg] || 800;
  const grossValueBdt = Math.round(input.totalWeightKg * basePricePerKgBdt);

  // Cold-chain compliance: must be <= 4.0 °C in ice-slurry
  const coldChainCompliant = input.iceSlurryTemperatureCelsius <= 4.0;
  const qualityDeductionBdt = coldChainCompliant ? 0 : Math.round(grossValueBdt * 0.15);
  const netHarvestValueBdt = grossValueBdt - qualityDeductionBdt;

  const escrowId = `ESCROW-SEAFOOD-${Date.now().toString(36).toUpperCase()}`;

  // 3-Stage Processing Plant Escrow:
  // 1. Gate delivery advance (30%)
  // 2. Certified lab antibiotic screening pass (40%)
  // 3. Final blast freezer acceptance & packaging (30%)
  const advanceAmount = Math.round(netHarvestValueBdt * 0.3);
  const labAmount = Math.round(netHarvestValueBdt * 0.4);
  const finalAmount = netHarvestValueBdt - advanceAmount - labAmount;

  const milestones = [
    {
      stage: "gate_arrival_advance" as const,
      stageNameBangla: "কারখানায় মাছ পৌঁছানো ও ওজন যাচাই অগ্রিম (৩০%)",
      percentage: 30,
      amountBdt: advanceAmount,
      status: "released" as const,
    },
    {
      stage: "lab_antibiotic_clearance" as const,
      stageNameBangla: "ল্যাব অ্যান্টিবায়োটিক স্ক্রিনিং ছাড়পত্র (৪০%)",
      percentage: 40,
      amountBdt: labAmount,
      status: "escrow_locked" as const,
    },
    {
      stage: "blast_freezer_acceptance" as const,
      stageNameBangla: "ব্লাস্ট ফ্রিজিং ও এক্সপোর্ট প্যাকেজিং অনুমোদন (৩০%)",
      percentage: 30,
      amountBdt: finalAmount,
      status: "pending" as const,
    },
  ];

  const summaryBangla = coldChainCompliant
    ? `কোল্ড চেইন মানসম্মত (${input.iceSlurryTemperatureCelsius}°C)। নেট মূল্য: ৳${netHarvestValueBdt.toLocaleString("en-IN")}। কারখানা এসক্রো লক করা হয়েছে।`
    : `সতর্কতা: তাপমাত্রা ৪°C অতিক্রম করেছে (${input.iceSlurryTemperatureCelsius}°C)! ১৫% কোয়ালিটি পেনাল্টি কর্তন করা হয়েছে। নেট মূল্য: ৳${netHarvestValueBdt.toLocaleString("en-IN")}`;

  const summaryEnglish = coldChainCompliant
    ? `Cold chain compliant (${input.iceSlurryTemperatureCelsius}°C). Net valuation: ৳${netHarvestValueBdt.toLocaleString("en-IN")}. 3-stage factory escrow secured.`
    : `Warning: Ice slurry temperature exceeded 4°C (${input.iceSlurryTemperatureCelsius}°C). 15% quality deduction applied. Net: ৳${netHarvestValueBdt.toLocaleString("en-IN")}`;

  return {
    harvestId: input.harvestId,
    gherId: input.gherId,
    species: input.species,
    totalWeightKg: input.totalWeightKg,
    gradeCountPerKg: input.gradeCountPerKg,
    basePricePerKgBdt,
    coldChainCompliant,
    qualityDeductionBdt,
    netHarvestValueBdt,
    escrowId,
    milestones,
    summaryBangla,
    summaryEnglish,
  };
}

/**
 * Generate official Department of Fisheries (DoF) & EU Traceability Passport with SHA-256 seal
 */
export function generateDofPassport(
  input: DofPassportInput
): DofPassportOutput {
  const gher = COASTAL_GHER_PROFILES[input.gherId];
  const dofRegistrationNumber = gher ? gher.dofRegistrationNumber : `DOF-REG-${input.gherId.toUpperCase()}`;

  if (!input.antibioticScreeningPassed) {
    throw new Error("Cannot issue DoF export passport: Consignment failed mandatory antibiotic screening (chloramphenicol/nitrofuran detected)");
  }

  const passportId = `DOF-EU-PASSPORT-${Date.now().toString(36).toUpperCase()}`;
  const issuedAt = new Date().toISOString();

  const canonicalPayload = JSON.stringify({
    passportId,
    gherId: input.gherId,
    dofRegistrationNumber,
    species: input.species,
    totalWeightKg: input.totalWeightKg,
    destinationCountry: input.destinationCountry,
    issuedAt,
  });

  const sha256VerificationSeal = createHash("sha256")
    .update(canonicalPayload)
    .digest("hex");

  return {
    passportId,
    gherId: input.gherId,
    dofRegistrationNumber,
    species: input.species,
    totalWeightKg: input.totalWeightKg,
    antibioticScreeningPassed: true,
    euHealthCertificateApproved: true,
    sha256VerificationSeal,
    issuedAt,
  };
}
