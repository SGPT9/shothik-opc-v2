import { createHash } from "node:crypto";

export type LandUnit =
  | "shatangsho"
  | "katha"
  | "bigha"
  | "chhotak"
  | "acre"
  | "sqft"
  | "sqmeter";

export type LandJurisdiction =
  | "dhaka_city"
  | "chattogram_city"
  | "pourashava"
  | "union_parishad";

export type LandPropertyType = "commercial" | "residential" | "agricultural";

export type SurveySurveyType =
  | "CS"
  | "SA"
  | "RS"
  | "BS"
  | "City_Survey"
  | "Baya_Deed"
  | "Current_Deed";

export interface DeedTransferRecord {
  deedNumber: string;
  deedDate: string; // YYYY-MM-DD
  surveyType: SurveySurveyType;
  transferor: string; // Seller / Grantor (বিক্রেতা / দাতা)
  transferee: string; // Buyer / Grantee (ক্রেতা / গ্রহীতা)
  transactedAreaShatangsho: number;
  hasOriginalDocument: boolean;
  mouza?: string;
  daagNumber?: string;
  notes?: string;
}

export interface DeedValuationParams {
  considerationBdt: number;
  jurisdiction: LandJurisdiction;
  propertyType: LandPropertyType;
  mouzaRateBdtPerDecimal?: number;
  landAreaShatangsho?: number;
}

export interface RegistrationFeeBreakdown {
  considerationBdt: number;
  registrationFeeBdt: number; // 1%
  stampDutyBdt: number; // 1.5%
  localGovtTaxBdt: number; // 3% or 2%
  sourceTaxAitBdt: number; // 2% - 8%
  eGovernanceFeeBdt: number; // 240
  nFeeBdt: number; // 300
  affidavitFeeBdt: number; // 300
  totalGovtFeesBdt: number;
  effectiveTaxPercentage: number;
  statutoryBasis: string;
}

export interface MutationChecklist {
  originalDeed: boolean;
  bayaDeedsComplete: boolean;
  rsKhatianPorcha: boolean;
  bsCityKhatianPorcha: boolean;
  dakhilaPaidCurrentYear: boolean;
  warishanCertificateIfApplicable: boolean;
  nidCopiesVerified: boolean;
  mouzaMapTraceAvailable: boolean;
}

export interface MutationEvaluationResult {
  readinessScorePercent: number;
  status: "READY" | "ACTION_REQUIRED" | "HIGH_RISK";
  missingRequirements: string[];
  recommendations: string[];
  acLandFilingChecklist: Array<{ item: string; mandatory: boolean; status: boolean }>;
}

export interface ChainAuditResult {
  isValid: boolean;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidenceScore: number;
  transfersAuditedCount: number;
  anomalies: string[];
  verifiedChainSummary: string;
  titleSeal: string;
}

export interface TitleDeedInfo {
  mouza: string;
  jlNumber: string;
  upazila: string;
  district: string;
  khatianNumber: string;
  daagNumber: string;
  landAreaShatangsho: number;
  currentOwner: string;
  deedNumber: string;
  considerationBdt: number;
}

export class DeedVerificationEngine {
  // Conversion factors relative to 1 shatangsho (decimal)
  // 1 shatangsho = 435.6 sq ft
  // 1 katha = 1.65 shatangsho = 720 sq ft
  // 1 bigha = 33 shatangsho = 14,400 sq ft (20 katha)
  // 1 chhotak = 0.103125 shatangsho = 45 sq ft
  // 1 acre = 100 shatangsho = 43,560 sq ft
  // 1 sq meter = 10.7639 sq ft = 0.02471 shatangsho
  private static readonly SQFT_PER_SHATANGSHO = 435.6;

  /**
   * AC-1: Area Unit Normalization & Bi-Directional Conversion
   */
  public static convertLandArea(value: number, fromUnit: LandUnit): Record<LandUnit, number> {
    if (value < 0) throw new Error("Land area value cannot be negative");

    // Convert to baseline sqft first
    let sqft = 0;
    switch (fromUnit) {
      case "shatangsho":
        sqft = value * this.SQFT_PER_SHATANGSHO;
        break;
      case "katha":
        sqft = value * 720;
        break;
      case "bigha":
        sqft = value * 14400;
        break;
      case "chhotak":
        sqft = value * 45;
        break;
      case "acre":
        sqft = value * 43560;
        break;
      case "sqft":
        sqft = value;
        break;
      case "sqmeter":
        sqft = value * 10.7639104;
        break;
    }

    const shatangsho = sqft / this.SQFT_PER_SHATANGSHO;

    return {
      shatangsho: Number(shatangsho.toFixed(4)),
      katha: Number((sqft / 720).toFixed(4)),
      bigha: Number((sqft / 14400).toFixed(4)),
      chhotak: Number((sqft / 45).toFixed(4)),
      acre: Number((sqft / 43560).toFixed(4)),
      sqft: Number(sqft.toFixed(2)),
      sqmeter: Number((sqft / 10.7639104).toFixed(2)),
    };
  }

  /**
   * AC-3: Stamp Duty & Statutory Registration Fee Calculator (Stamp Act 1899 & Registration Act 1908)
   */
  public static calculateRegistrationFees(params: DeedValuationParams): RegistrationFeeBreakdown {
    const value = Math.max(0, params.considerationBdt);

    // 1% Registration fee (minimum ৳100)
    const registrationFeeBdt = Math.max(100, Math.round(value * 0.01));

    // 1.5% Stamp Duty
    const stampDutyBdt = Math.round(value * 0.015);

    // Local Government Tax
    let localGovtRate = 0.03;
    if (params.jurisdiction === "union_parishad") {
      localGovtRate = 0.02;
    }
    const localGovtTaxBdt = Math.round(value * localGovtRate);

    // Source Tax / AIT (Section 53FF of Income Tax Act 2023)
    let aitRate = 0.03;
    if (params.jurisdiction === "dhaka_city" || params.jurisdiction === "chattogram_city") {
      aitRate = params.propertyType === "commercial" ? 0.08 : 0.04;
    } else if (params.jurisdiction === "pourashava") {
      aitRate = params.propertyType === "commercial" ? 0.05 : 0.03;
    } else {
      aitRate = 0.02; // Union Parishad rural
    }
    const sourceTaxAitBdt = Math.round(value * aitRate);

    const eGovernanceFeeBdt = 240;
    const nFeeBdt = 300;
    const affidavitFeeBdt = 300;

    const totalGovtFeesBdt =
      registrationFeeBdt +
      stampDutyBdt +
      localGovtTaxBdt +
      sourceTaxAitBdt +
      eGovernanceFeeBdt +
      nFeeBdt +
      affidavitFeeBdt;

    const effectiveTaxPercentage = value > 0 ? Number(((totalGovtFeesBdt / value) * 100).toFixed(2)) : 0;

    return {
      considerationBdt: value,
      registrationFeeBdt,
      stampDutyBdt,
      localGovtTaxBdt,
      sourceTaxAitBdt,
      eGovernanceFeeBdt,
      nFeeBdt,
      affidavitFeeBdt,
      totalGovtFeesBdt,
      effectiveTaxPercentage,
      statutoryBasis: `Stamp Act 1899, Registration Act 1908, Income Tax Act 2023 Section 53FF (${params.jurisdiction.toUpperCase()})`,
    };
  }

  /**
   * AC-2: Chain-of-Ownership (বায়া দলিল) Sequence Auditor
   */
  public static auditChainOfOwnership(
    transfers: DeedTransferRecord[],
    parentDaagAreaShatangsho?: number
  ): ChainAuditResult {
    const anomalies: string[] = [];
    let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
    let confidenceScore = 100;

    if (!transfers || transfers.length === 0) {
      return {
        isValid: false,
        riskLevel: "CRITICAL",
        confidenceScore: 0,
        transfersAuditedCount: 0,
        anomalies: ["No transfer deeds provided in chain of title"],
        verifiedChainSummary: "Empty chain of ownership",
        titleSeal: "",
      };
    }

    // Sort by deedDate
    const sorted = [...transfers].sort(
      (a, b) => new Date(a.deedDate).getTime() - new Date(b.deedDate).getTime()
    );

    // 1. Verify chronological sequence
    for (let i = 0; i < sorted.length - 1; i++) {
      const prevDate = new Date(sorted[i].deedDate).getTime();
      const nextDate = new Date(sorted[i + 1].deedDate).getTime();

      if (nextDate < prevDate) {
        anomalies.push(
          `Deed ${sorted[i + 1].deedNumber} date (${sorted[i + 1].deedDate}) predates prior transfer ${sorted[i].deedNumber} (${sorted[i].deedDate})`
        );
        confidenceScore -= 30;
      }
    }

    // 2. Verify Grantor-Grantee Linkage (বায়া দলিল ধারাবাহিকতা)
    for (let i = 1; i < sorted.length; i++) {
      const priorGrantee = sorted[i - 1].transferee.trim().toLowerCase();
      const currentGrantor = sorted[i].transferor.trim().toLowerCase();

      // Check for exact or partial name match
      const isMatch =
        priorGrantee === currentGrantor ||
        priorGrantee.includes(currentGrantor) ||
        currentGrantor.includes(priorGrantee);

      if (!isMatch) {
        anomalies.push(
          `Broken Linkage: Seller '${sorted[i].transferor}' in deed ${sorted[i].deedNumber} does not match prior buyer '${sorted[i - 1].transferee}' in deed ${sorted[i - 1].deedNumber} (Missing Warishan/Succession deed)`
        );
        confidenceScore -= 25;
      }
    }

    // 3. Verify original document retention
    const missingOriginals = sorted.filter((t) => !t.hasOriginalDocument);
    if (missingOriginals.length > 0) {
      anomalies.push(
        `${missingOriginals.length} historical deed(s) lack certified certified copies/originals: ${missingOriginals.map((d) => d.deedNumber).join(", ")}`
      );
      confidenceScore -= missingOriginals.length * 10;
    }

    // 4. Daag area overflow verification
    if (parentDaagAreaShatangsho && parentDaagAreaShatangsho > 0) {
      const maxTransacted = Math.max(...sorted.map((t) => t.transactedAreaShatangsho));
      if (maxTransacted > parentDaagAreaShatangsho) {
        anomalies.push(
          `Over-Allocation: Transacted parcel area (${maxTransacted} শতাংশ) exceeds parent Daag area (${parentDaagAreaShatangsho} শতাংশ)`
        );
        confidenceScore -= 40;
      }
    }

    // Determine final risk rating
    confidenceScore = Math.max(0, Math.min(100, confidenceScore));
    if (confidenceScore >= 85) {
      riskLevel = "LOW";
    } else if (confidenceScore >= 65) {
      riskLevel = "MEDIUM";
    } else if (confidenceScore >= 40) {
      riskLevel = "HIGH";
    } else {
      riskLevel = "CRITICAL";
    }

    const titleHashPayload = `${sorted.map((t) => `${t.deedNumber}:${t.deedDate}:${t.transferor}>${t.transferee}`).join("|")}:${riskLevel}:${confidenceScore}`;
    const titleSeal = createHash("sha256").update(titleHashPayload).digest("hex");

    const verifiedChainSummary = `${sorted.length} deeds verified. Root: ${sorted[0].surveyType} (${sorted[0].deedDate}) ➔ Current: ${sorted[sorted.length - 1].transferee}`;

    return {
      isValid: riskLevel !== "CRITICAL" && anomalies.length === 0,
      riskLevel,
      confidenceScore,
      transfersAuditedCount: sorted.length,
      anomalies,
      verifiedChainSummary,
      titleSeal,
    };
  }

  /**
   * AC-4: E-Mutation (ই-নামজারি) Compliance Gap Screener
   */
  public static evaluateMutationReadiness(checklist: MutationChecklist): MutationEvaluationResult {
    const missingRequirements: string[] = [];
    const recommendations: string[] = [];
    let score = 0;

    const items = [
      { item: "মূল সাফ-কোবালা/হেবা দলিল (Registered Title Deed)", mandatory: true, status: checklist.originalDeed, points: 25 },
      { item: "ধারাবাহিক বায়া দলিল (Chain/Baya Deeds)", mandatory: true, status: checklist.bayaDeedsComplete, points: 20 },
      { item: "আরএস খতিয়ান ও পর্চা (RS Survey Khatian)", mandatory: true, status: checklist.rsKhatianPorcha, points: 15 },
      { item: "বিএস / সিটি জরিপ খতিয়ান (BS / City Survey Khatian)", mandatory: true, status: checklist.bsCityKhatianPorcha, points: 15 },
      { item: "চলতি অর্থবছর পর্যন্ত দাখিলা (Updated Land Tax / Dakhila)", mandatory: true, status: checklist.dakhilaPaidCurrentYear, points: 10 },
      { item: "ওয়ারিশান সনদ (Succession Certificate, if applicable)", mandatory: false, status: checklist.warishanCertificateIfApplicable, points: 5 },
      { item: "এনআইডি যাচাইকৃত কপি (Verified NID copies)", mandatory: true, status: checklist.nidCopiesVerified, points: 5 },
      { item: "মৌজা নকশা ও দাগ চিহ্নিতকরণ (Mouza Map Trace Sheet)", mandatory: false, status: checklist.mouzaMapTraceAvailable, points: 5 },
    ];

    for (const entry of items) {
      if (entry.status) {
        score += entry.points;
      } else {
        missingRequirements.push(entry.item);
        if (entry.mandatory) {
          recommendations.push(`Collect and certify: ${entry.item} prior to submitting AC Land e-Mutation portal filing.`);
        }
      }
    }

    let status: "READY" | "ACTION_REQUIRED" | "HIGH_RISK" = "READY";
    if (score >= 85) {
      status = "READY";
    } else if (score >= 60) {
      status = "ACTION_REQUIRED";
    } else {
      status = "HIGH_RISK";
    }

    return {
      readinessScorePercent: score,
      status,
      missingRequirements,
      recommendations,
      acLandFilingChecklist: items.map((i) => ({ item: i.item, mandatory: i.mandatory, status: i.status })),
    };
  }

  /**
   * AC-5: Cryptographic Title Search Audit Seal
   */
  public static generateTitleAuditSeal(deedInfo: TitleDeedInfo): {
    sealHash: string;
    qrPayload: string;
    timestamp: string;
    certificateNumber: string;
  } {
    const timestamp = new Date().toISOString();
    const certificateNumber = `SHOTHIK_LAND_${deedInfo.district.toUpperCase().slice(0, 3)}_${Date.now().toString(36).toUpperCase()}`;

    const rawPayload = JSON.stringify({
      certificateNumber,
      mouza: deedInfo.mouza,
      jlNumber: deedInfo.jlNumber,
      upazila: deedInfo.upazila,
      district: deedInfo.district,
      khatian: deedInfo.khatianNumber,
      daag: deedInfo.daagNumber,
      areaShatangsho: deedInfo.landAreaShatangsho,
      currentOwner: deedInfo.currentOwner,
      deedNumber: deedInfo.deedNumber,
      considerationBdt: deedInfo.considerationBdt,
      issuedAt: timestamp,
    });

    const sealHash = createHash("sha256").update(rawPayload).digest("hex");
    const qrPayload = `https://shothik.ai/verify/land-record/${certificateNumber}?seal=${sealHash.slice(0, 16)}`;

    return {
      sealHash,
      qrPayload,
      timestamp,
      certificateNumber,
    };
  }
}
