/**
 * Waterway Cargo & Inland River Vessel Telemetry Engine
 * 
 * Provides automated river navigation draught monitoring, shoal grounding hazard alerts,
 * stevedoring laytime & demurrage calculation, and statutory BIWTA river conservation tolls.
 */

import { createHash } from "crypto";

export type VesselType =
  | "bulk_coaster"
  | "dumb_barge"
  | "cargo_coaster"
  | "oil_tanker"
  | "container_feeder";

export type RiverCorridorId =
  | "chittagong_dhaka_meghna"
  | "mongla_khulna_barisal"
  | "paturia_daulatdia_padma"
  | "narayanganj_ashuganj_surma"
  | "chattogram_chandpur";

export type GroundingRiskStatus = "safe" | "caution" | "critical_grounding_risk";

export interface RiverCorridor {
  corridorId: RiverCorridorId;
  corridorNameBangla: string;
  corridorNameEnglish: string;
  riverDistanceKm: number;
  classificationClass: "Class-I" | "Class-II" | "Class-III";
  minimumNavigableDepthMeters: number;
  tollRatePerDwtBdt: number;
  primaryGhats: string[];
}

export interface InlandVessel {
  vesselId: string;
  vesselName: string;
  registrationNo: string;
  vesselType: VesselType;
  deadweightTonnage: number; // DWT in Metric Tons
  maxPermissibleDraftMeters: number;
  currentDraftMeters: number;
}

export interface VesselAisTelemetryInput {
  vesselId: string;
  corridorId: RiverCorridorId;
  latitude: number;
  longitude: number;
  speedKnots: number;
  headingDegrees: number;
  riverKilometerMarker: number;
  currentWaterDepthMeters: number;
  currentDraftMeters: number;
  timestamp?: string;
}

export interface VesselAisTelemetryOutput {
  telemetryId: string;
  vesselId: string;
  corridorId: RiverCorridorId;
  speedKnots: number;
  currentWaterDepthMeters: number;
  currentDraftMeters: number;
  draftClearanceMeters: number;
  groundingRiskStatus: GroundingRiskStatus;
  navigationalAdvisoryBangla: string;
  navigationalAdvisoryEnglish: string;
  speedRecommendationKnots: number;
  timestamp: string;
}

export interface LaytimeAuditInput {
  consignmentId: string;
  vesselId: string;
  cargoType: string;
  cargoQuantityMt: number;
  dischargePortGhat: string;
  norAcceptedAt: string; // ISO 8601
  dischargeCompletedAt: string; // ISO 8601
  customFreeLaytimeHours?: number; // optional contractual override
  weatherExceptionHours?: number; // Monsoon storm signal 4+ or rain interruptions
  demurrageDailyRateBdt?: number; // default 25,000 BDT/day
  despatchDailyRateBdt?: number; // default 12,500 BDT/day
}

export interface LaytimeAuditOutput {
  consignmentId: string;
  vesselId: string;
  cargoType: string;
  cargoQuantityMt: number;
  totalElapsedHours: number;
  weatherExceptionHours: number;
  netBillableLaytimeHours: number;
  contractualFreeLaytimeHours: number;
  demurrageHours: number;
  despatchHours: number;
  demurrageFeeBdt: number;
  despatchRebateBdt: number;
  settlementStatus: "demurrage_due" | "despatch_payable" | "within_laytime";
  summaryBangla: string;
  summaryEnglish: string;
}

export interface BiwtaReceiptInput {
  vesselId: string;
  vesselName: string;
  registrationNo: string;
  deadweightTonnage: number;
  corridorId: RiverCorridorId;
  berthingDays: number;
  requiresPilotage: boolean;
}

export interface BiwtaStatutoryReceiptOutput {
  receiptId: string;
  vesselId: string;
  vesselName: string;
  registrationNo: string;
  corridorId: RiverCorridorId;
  riverConservationTollBdt: number;
  berthingChargesBdt: number;
  pilotageFeeBdt: number;
  subtotalBdt: number;
  vat5PercentBdt: number;
  grandTotalBdt: number;
  sha256VerificationSeal: string;
  generatedAt: string;
}

export const BIWTA_RIVER_CORRIDORS: Record<RiverCorridorId, RiverCorridor> = {
  chittagong_dhaka_meghna: {
    corridorId: "chittagong_dhaka_meghna",
    corridorNameBangla: "চট্টগ্রাম-মেঘনা-ঢাকা নদী করিডোর (সদরঘাট/কাঁচপুর)",
    corridorNameEnglish: "Chittagong-Meghna-Dhaka River Corridor",
    riverDistanceKm: 275,
    classificationClass: "Class-I",
    minimumNavigableDepthMeters: 3.9,
    tollRatePerDwtBdt: 14.5,
    primaryGhats: ["Sadarghat", "Kanchpur", "Munshiganj", "Mukterpur", "Chandpur"],
  },
  mongla_khulna_barisal: {
    corridorId: "mongla_khulna_barisal",
    corridorNameBangla: "মোংলা-খুলনা-বরিশাল নদী করিডোর (কীর্তনখোলা/পশুর)",
    corridorNameEnglish: "Mongla-Khulna-Barisal River Corridor",
    riverDistanceKm: 180,
    classificationClass: "Class-I",
    minimumNavigableDepthMeters: 3.8,
    tollRatePerDwtBdt: 12.0,
    primaryGhats: ["Mongla Ghat", "Rupsha", "Kirtankhola Terminal", "Barisal Steamer Ghat"],
  },
  paturia_daulatdia_padma: {
    corridorId: "paturia_daulatdia_padma",
    corridorNameBangla: "পাটুরিয়া-দৌলতদিয়া-পদ্মা করিডোর",
    corridorNameEnglish: "Paturia-Daulatdia Padma River Corridor",
    riverDistanceKm: 95,
    classificationClass: "Class-II",
    minimumNavigableDepthMeters: 2.8,
    tollRatePerDwtBdt: 9.5,
    primaryGhats: ["Paturia Launch Ghat", "Daulatdia Ghat", "Aricha Ghat", "Nagarbari"],
  },
  narayanganj_ashuganj_surma: {
    corridorId: "narayanganj_ashuganj_surma",
    corridorNameBangla: "নারায়ণগঞ্জ-আশুগঞ্জ-মেঘনা/সুরমা নদী করিডোর",
    corridorNameEnglish: "Narayanganj-Ashuganj Surma Corridor",
    riverDistanceKm: 140,
    classificationClass: "Class-II",
    minimumNavigableDepthMeters: 2.7,
    tollRatePerDwtBdt: 10.0,
    primaryGhats: ["Narayanganj Port", "Ashuganj Inland Port", "Bhairab Bazar"],
  },
  chattogram_chandpur: {
    corridorId: "chattogram_chandpur",
    corridorNameBangla: "চট্টগ্রাম-চাঁদপুর মেঘনা মোহনা করিডোর",
    corridorNameEnglish: "Chattogram-Chandpur Estuary Corridor",
    riverDistanceKm: 165,
    classificationClass: "Class-I",
    minimumNavigableDepthMeters: 3.6,
    tollRatePerDwtBdt: 11.5,
    primaryGhats: ["Chandpur Ghat", "Haimchar", "Sandwip Channel", "Sadarghat CTG"],
  },
};

/**
 * Ingest live vessel AIS telemetry and perform draught clearance / grounding risk analysis
 */
export function analyzeVesselTelemetry(
  input: VesselAisTelemetryInput
): VesselAisTelemetryOutput {
  const corridor = BIWTA_RIVER_CORRIDORS[input.corridorId];
  if (!corridor) {
    throw new Error(`Invalid river corridor ID: ${input.corridorId}`);
  }

  if (input.currentWaterDepthMeters <= 0) {
    throw new Error("Water depth must be greater than zero");
  }

  if (input.currentDraftMeters <= 0) {
    throw new Error("Current vessel draft must be greater than zero");
  }

  // Under-keel draft clearance calculation
  const draftClearanceMeters = Math.round((input.currentWaterDepthMeters - input.currentDraftMeters) * 100) / 100;
  const timestamp = input.timestamp || new Date().toISOString();
  const telemetryId = `AIS-${input.vesselId.toUpperCase()}-${Date.now().toString(36)}`;

  let groundingRiskStatus: GroundingRiskStatus = "safe";
  let navigationalAdvisoryBangla = "চ্যানেলের গভীরতা নিরাপদ। নির্ধারিত স্পিডে চলাচল অব্যাহত রাখুন।";
  let navigationalAdvisoryEnglish = "Safe under-keel clearance. Maintain standard cruising speed.";
  let speedRecommendationKnots = Math.min(input.speedKnots, 12);

  if (draftClearanceMeters < 0.3) {
    groundingRiskStatus = "critical_grounding_risk";
    navigationalAdvisoryBangla = "জরুরী সতর্কতা: আন্ডার-কিল ক্লিয়ারেন্স ০.৩ মিটারের নিচে! চর বা চরের বালিতে আটকে যাওয়ার চরম ঝুঁকি। অবিলম্বে গতি হ্রাস করুন ও নিরাপদ নোঙ্গর ফেলুন।";
    navigationalAdvisoryEnglish = "CRITICAL HAZARD: Under-keel clearance below 0.3m! Immediate shoal grounding risk. Drop speed and prepare emergency anchoring.";
    speedRecommendationKnots = Math.min(input.speedKnots, 3);
  } else if (draftClearanceMeters < 0.6) {
    groundingRiskStatus = "caution";
    navigationalAdvisoryBangla = "সতর্কতা: অগভীর চ্যানেল। নদীর নাব্যতা সীমিত। গতি ৫ নটের মধ্যে সীমিত রাখুন এবং সতর্কতার সাথে ড্রেজিং চ্যানেল অনুসরণ করুন।";
    navigationalAdvisoryEnglish = "CAUTION: Shallow channel reach. Restrict speed to max 5 knots and adhere to marked dredged navigation channel.";
    speedRecommendationKnots = Math.min(input.speedKnots, 5);
  }

  return {
    telemetryId,
    vesselId: input.vesselId,
    corridorId: input.corridorId,
    speedKnots: input.speedKnots,
    currentWaterDepthMeters: input.currentWaterDepthMeters,
    currentDraftMeters: input.currentDraftMeters,
    draftClearanceMeters,
    groundingRiskStatus,
    navigationalAdvisoryBangla,
    navigationalAdvisoryEnglish,
    speedRecommendationKnots,
    timestamp,
  };
}

/**
 * Audit bulk cargo stevedoring laytime and compute demurrage vs despatch
 */
export function auditCargoLaytime(input: LaytimeAuditInput): LaytimeAuditOutput {
  if (input.cargoQuantityMt <= 0) {
    throw new Error("Cargo quantity must be greater than 0 MT");
  }

  const norDate = new Date(input.norAcceptedAt);
  const dischargeDate = new Date(input.dischargeCompletedAt);

  if (isNaN(norDate.getTime()) || isNaN(dischargeDate.getTime())) {
    throw new Error("Invalid ISO date string provided for laytime calculations");
  }

  if (dischargeDate.getTime() <= norDate.getTime()) {
    throw new Error("Discharge completion time must be strictly after Notice of Readiness (NOR) acceptance");
  }

  const totalElapsedHours = Math.round(((dischargeDate.getTime() - norDate.getTime()) / (1000 * 60 * 60)) * 10) / 10;
  const weatherExceptionHours = Math.max(0, input.weatherExceptionHours || 0);

  const netBillableLaytimeHours = Math.max(0, Math.round((totalElapsedHours - weatherExceptionHours) * 10) / 10);

  // Default free laytime based on standard Bangladeshi river ghat stevedoring:
  // e.g., 500 MT per 24h work day -> (tonnage / 500) * 24 hours, minimum 48 hours
  const contractualFreeLaytimeHours = input.customFreeLaytimeHours !== undefined && input.customFreeLaytimeHours > 0
    ? input.customFreeLaytimeHours
    : Math.max(48, Math.round((input.cargoQuantityMt / 500) * 24 * 10) / 10);

  const demurrageDailyRate = input.demurrageDailyRateBdt !== undefined && input.demurrageDailyRateBdt > 0
    ? input.demurrageDailyRateBdt
    : 25000;

  const despatchDailyRate = input.despatchDailyRateBdt !== undefined && input.despatchDailyRateBdt > 0
    ? input.despatchDailyRateBdt
    : 12500;

  let demurrageHours = 0;
  let despatchHours = 0;
  let demurrageFeeBdt = 0;
  let despatchRebateBdt = 0;
  let settlementStatus: "demurrage_due" | "despatch_payable" | "within_laytime" = "within_laytime";
  let summaryBangla = "নির্ধারিত ফ্রি লেই-টাইমের মধ্যে মালামাল খালাস সম্পন্ন হয়েছে।";
  let summaryEnglish = "Discharge completed within permissible contractual free laytime.";

  if (netBillableLaytimeHours > contractualFreeLaytimeHours) {
    demurrageHours = Math.round((netBillableLaytimeHours - contractualFreeLaytimeHours) * 10) / 10;
    demurrageFeeBdt = Math.round((demurrageHours / 24) * demurrageDailyRate);
    settlementStatus = "demurrage_due";
    summaryBangla = `ফ্রি লেই-টাইম অতিক্রম করেছে (${demurrageHours} ঘণ্টা বিলম্ব)। মোট ডেমারেজ বিল: ৳${demurrageFeeBdt.toLocaleString("en-IN")}`;
    summaryEnglish = `Laytime exceeded by ${demurrageHours} hours. Demurrage incurred: ৳${demurrageFeeBdt.toLocaleString("en-IN")}`;
  } else if (netBillableLaytimeHours < contractualFreeLaytimeHours) {
    despatchHours = Math.round((contractualFreeLaytimeHours - netBillableLaytimeHours) * 10) / 10;
    despatchRebateBdt = Math.round((despatchHours / 24) * despatchDailyRate);
    settlementStatus = "despatch_payable";
    summaryBangla = `নির্ধারিত সময়ের ${despatchHours} ঘণ্টা পূর্বে খালাস সম্পন্ন! ডিসপ্যাচ ইনসেনটিভ রিবেট: ৳${despatchRebateBdt.toLocaleString("en-IN")}`;
    summaryEnglish = `Discharge completed ${despatchHours} hours ahead of schedule. Despatch incentive rebate: ৳${despatchRebateBdt.toLocaleString("en-IN")}`;
  }

  return {
    consignmentId: input.consignmentId,
    vesselId: input.vesselId,
    cargoType: input.cargoType,
    cargoQuantityMt: input.cargoQuantityMt,
    totalElapsedHours,
    weatherExceptionHours,
    netBillableLaytimeHours,
    contractualFreeLaytimeHours,
    demurrageHours,
    despatchHours,
    demurrageFeeBdt,
    despatchRebateBdt,
    settlementStatus,
    summaryBangla,
    summaryEnglish,
  };
}

/**
 * Generate statutory BIWTA river conservation and port dues receipt with SHA-256 seal
 */
export function generateBiwtaStatutoryReceipt(
  input: BiwtaReceiptInput
): BiwtaStatutoryReceiptOutput {
  const corridor = BIWTA_RIVER_CORRIDORS[input.corridorId];
  if (!corridor) {
    throw new Error(`Invalid river corridor ID: ${input.corridorId}`);
  }

  if (input.deadweightTonnage <= 0) {
    throw new Error("Deadweight tonnage must be greater than zero");
  }

  const berthingDays = Math.max(1, input.berthingDays || 1);

  // BIWTA River Conservation Toll: DWT * rate per ton
  const riverConservationTollBdt = Math.round(input.deadweightTonnage * corridor.tollRatePerDwtBdt);

  // Port Ghat Berthing Charges: ৳1.25 per DWT per day (minimum ৳1,500/day)
  const berthingRatePerDay = Math.max(1500, Math.round(input.deadweightTonnage * 1.25));
  const berthingChargesBdt = berthingRatePerDay * berthingDays;

  // BIWTA Pilotage Fee (for Class-I estuaries or vessels > 1000 DWT)
  let pilotageFeeBdt = 0;
  if (input.requiresPilotage || corridor.classificationClass === "Class-I") {
    pilotageFeeBdt = input.deadweightTonnage > 1000 ? 5500 : 3200;
  }

  const subtotalBdt = riverConservationTollBdt + berthingChargesBdt + pilotageFeeBdt;
  const vat5PercentBdt = Math.round(subtotalBdt * 0.05);
  const grandTotalBdt = subtotalBdt + vat5PercentBdt;

  const generatedAt = new Date().toISOString();
  const receiptId = `BIWTA-TOLL-${input.vesselId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  const canonicalPayload = JSON.stringify({
    receiptId,
    vesselId: input.vesselId,
    registrationNo: input.registrationNo,
    corridorId: input.corridorId,
    grandTotalBdt,
    generatedAt,
  });

  const sha256VerificationSeal = createHash("sha256")
    .update(canonicalPayload)
    .digest("hex");

  return {
    receiptId,
    vesselId: input.vesselId,
    vesselName: input.vesselName,
    registrationNo: input.registrationNo,
    corridorId: input.corridorId,
    riverConservationTollBdt,
    berthingChargesBdt,
    pilotageFeeBdt,
    subtotalBdt,
    vat5PercentBdt,
    grandTotalBdt,
    sha256VerificationSeal,
    generatedAt,
  };
}
