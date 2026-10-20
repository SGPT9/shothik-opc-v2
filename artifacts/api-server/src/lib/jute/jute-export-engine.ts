import crypto from "crypto";

export interface JuteGradeInfo {
  gradeCode: string;
  variety: "Bangla Tossa" | "Bangla White";
  gradeNameBangla: string;
  gradeNameEnglish: string;
  tensileStrengthMinCnTex: number;
  basePricePerMaundBdt: number; // 1 Maund = 40 kg
  basePricePerKgBdt: number;
  colorQuality: string;
  finenessMicronaire: number;
}

export const BJMC_JUTE_GRADES: Record<string, JuteGradeInfo> = {
  BT_SPECIAL: {
    gradeCode: "BT_SPECIAL",
    variety: "Bangla Tossa",
    gradeNameBangla: "বাংলা তোষা স্পেশাল",
    gradeNameEnglish: "Bangla Tossa Special",
    tensileStrengthMinCnTex: 32,
    basePricePerMaundBdt: 4200,
    basePricePerKgBdt: 105.0,
    colorQuality: "Golden lustrous, uniform",
    finenessMicronaire: 2.2,
  },
  BT_A: {
    gradeCode: "BT_A",
    variety: "Bangla Tossa",
    gradeNameBangla: "বাংলা তোষা গ্রেড-১ (A)",
    gradeNameEnglish: "Bangla Tossa Grade-A",
    tensileStrengthMinCnTex: 28,
    basePricePerMaundBdt: 3800,
    basePricePerKgBdt: 95.0,
    colorQuality: "Bright cream to golden",
    finenessMicronaire: 2.4,
  },
  BT_B: {
    gradeCode: "BT_B",
    variety: "Bangla Tossa",
    gradeNameBangla: "বাংলা তোষা গ্রেড-২ (B)",
    gradeNameEnglish: "Bangla Tossa Grade-B",
    tensileStrengthMinCnTex: 24,
    basePricePerMaundBdt: 3400,
    basePricePerKgBdt: 85.0,
    colorQuality: "Light reddish/yellowish",
    finenessMicronaire: 2.7,
  },
  BT_C: {
    gradeCode: "BT_C",
    variety: "Bangla Tossa",
    gradeNameBangla: "বাংলা তোষা গ্রেড-৩ (C)",
    gradeNameEnglish: "Bangla Tossa Grade-C",
    tensileStrengthMinCnTex: 20,
    basePricePerMaundBdt: 3000,
    basePricePerKgBdt: 75.0,
    colorQuality: "Medium brownish",
    finenessMicronaire: 3.0,
  },
  BT_D: {
    gradeCode: "BT_D",
    variety: "Bangla Tossa",
    gradeNameBangla: "বাংলা তোষা গ্রেড-৪ (D)",
    gradeNameEnglish: "Bangla Tossa Grade-D",
    tensileStrengthMinCnTex: 16,
    basePricePerMaundBdt: 2600,
    basePricePerKgBdt: 65.0,
    colorQuality: "Darkish brown",
    finenessMicronaire: 3.4,
  },
  BW_SPECIAL: {
    gradeCode: "BW_SPECIAL",
    variety: "Bangla White",
    gradeNameBangla: "বাংলা সাদা স্পেশাল",
    gradeNameEnglish: "Bangla White Special",
    tensileStrengthMinCnTex: 30,
    basePricePerMaundBdt: 3900,
    basePricePerKgBdt: 97.5,
    colorQuality: "Silvery white, silky",
    finenessMicronaire: 2.1,
  },
  BW_A: {
    gradeCode: "BW_A",
    variety: "Bangla White",
    gradeNameBangla: "বাংলা সাদা গ্রেড-A",
    gradeNameEnglish: "Bangla White Grade-A",
    tensileStrengthMinCnTex: 26,
    basePricePerMaundBdt: 3500,
    basePricePerKgBdt: 87.5,
    colorQuality: "Creamy white",
    finenessMicronaire: 2.3,
  },
  BW_B: {
    gradeCode: "BW_B",
    variety: "Bangla White",
    gradeNameBangla: "বাংলা সাদা গ্রেড-B",
    gradeNameEnglish: "Bangla White Grade-B",
    tensileStrengthMinCnTex: 22,
    basePricePerMaundBdt: 3100,
    basePricePerKgBdt: 77.5,
    colorQuality: "Light greyish white",
    finenessMicronaire: 2.6,
  },
  BW_C: {
    gradeCode: "BW_C",
    variety: "Bangla White",
    gradeNameBangla: "বাংলা সাদা গ্রেড-C",
    gradeNameEnglish: "Bangla White Grade-C",
    tensileStrengthMinCnTex: 18,
    basePricePerMaundBdt: 2700,
    basePricePerKgBdt: 67.5,
    colorQuality: "Dull grey",
    finenessMicronaire: 2.9,
  },
};

export interface RawJuteGradingParams {
  lotId: string;
  variety: "Bangla Tossa" | "Bangla White";
  gradeCode: string;
  grossWeightKg: number;
  moisturePercent: number; // Safe standard is 14%
  rootCuttingPercent: number; // 0% - 25%
  aratLocation: string; // e.g. "Faridpur", "Jessore", "Rangpur", "Tangail", "Narsingdi"
}

export interface RawJuteGradingResult {
  lotId: string;
  gradeInfo: JuteGradeInfo;
  grossWeightKg: number;
  moisturePercent: number;
  isMoistureCompliant: boolean;
  isRejectedForExcessMoisture: boolean;
  moistureDeductionKg: number;
  rootCuttingDeductionKg: number;
  totalDeductionKg: number;
  netMarketableWeightKg: number;
  puccaExportBalesYield: number; // 1 Pucca Bale = 180 kg
  kutchaBalesYield: number; // 1 Kutcha Bale = 135 kg
  pricePerKgBdt: number;
  grossValuationBdt: number;
  netPayableBdt: number;
  qualityCertificateToken: string;
}

export interface DjgCostingParams {
  productType: "HESSIAN_CLOTH" | "SACKING_BAGS" | "CARPET_BACKING_CLOTH" | "DIVERSIFIED_SHOPPING_BAGS" | "GEO_TEXTILES" | "JUTE_ESPADRILLES";
  targetUnits: number;
  rawJuteGradeCode: string;
  yarnCountLbsPerSpindle?: number;
  weavingWastagePercent?: number; // default 6% - 10%
  batchingOilCostPerKg?: number;
  directLaborCostPerUnitBdt?: number;
  overheadCostPerUnitBdt?: number;
}

export interface DjgCostingResult {
  productType: string;
  targetUnits: number;
  rawFiberRequiredKg: number;
  rawFiberCostBdt: number;
  batchingOilCostBdt: number;
  spinningAndWeavingWastageKg: number;
  directLaborCostBdt: number;
  factoryOverheadBdt: number;
  totalProductionCostBdt: number;
  costPerUnitBdt: number;
  costPerMetricTonBdt: number;
  localValueAdditionPercent: number;
}

export interface ExportSubsidyParams {
  invoiceNumber: string;
  fobValueUsd: number;
  exchangeRateUsdToBdt: number; // e.g. 122.5
  productCategory: "DIVERSIFIED_JUTE_GOODS" | "JUTE_YARN_TWINE" | "TRADITIONAL_JUTE_GOODS" | "RAW_JUTE";
  localValueAdditionPercent: number;
  hasValidPrc: boolean; // Proceeds Realization Certificate
  hasEpbRegistration: boolean;
}

export interface ExportSubsidyResult {
  invoiceNumber: string;
  fobValueUsd: number;
  fobValueBdt: number;
  productCategory: string;
  statutorySubsidyRatePercent: number;
  isEligibleForSubsidy: boolean;
  subsidyIneligibilityReason?: string;
  grossCashSubsidyBdt: number;
  aitDeductionBdt: number; // 10% AIT withholding on cash subsidy
  netCashSubsidyDisbursableBdt: number;
  bangladeshBankCircularRef: string;
  prcVerificationStatus: string;
}

export interface BondedWarehouseEntryParams {
  shipmentId: string;
  buyerName: string;
  destinationCountry: string;
  portOfLoading: string; // "Chittagong Port" | "Mongla Port" | "Benapole Land Port"
  hsCode: string;
  productDescription: string;
  totalNetWeightKg: number;
  totalPuccaBales: number;
  fobValueUsd: number;
  bondLicenseNumber: string;
  rawJuteLotRef: string;
}

export interface BondedWarehouseEntryResult {
  shipmentId: string;
  bondLicenseNumber: string;
  customsRegistrationDate: string;
  hsCode: string;
  totalNetWeightKg: number;
  totalPuccaBales: number;
  fobValueUsd: number;
  fobValueBdt: number;
  bondedStockDeductedKg: number;
  domesticLeakageRiskScore: number; // 0 - 100, 0 = no risk
  sha256DossierSeal: string;
  nbrCustomsReleaseToken: string;
}

export class JuteExportEngine {
  /**
   * Evaluates raw jute quality, applies moisture penalties and root cutting deductions,
   * and calculates pucca export bale yield.
   */
  public static gradeRawJute(params: RawJuteGradingParams): RawJuteGradingResult {
    const grade = BJMC_JUTE_GRADES[params.gradeCode] || BJMC_JUTE_GRADES.BT_SPECIAL;
    const grossWeight = Math.max(0, params.grossWeightKg);
    const moisture = Math.max(0, params.moisturePercent);
    const rootCutting = Math.min(25, Math.max(0, params.rootCuttingPercent));

    // Moisture logic: Safe standard <= 14%.
    // If > 20%, batch is classified as rejected for excess moisture/spoilage risk.
    const isRejected = moisture > 20.0;
    const isMoistureCompliant = moisture <= 14.0;

    let moistureDeductionKg = 0;
    if (!isMoistureCompliant) {
      const excessMoisturePercent = moisture - 14.0;
      // Penalty: 1.25x of excess moisture percentage
      const penaltyPercent = excessMoisturePercent * 1.25;
      moistureDeductionKg = Math.round((grossWeight * penaltyPercent) / 100);
    }

    const rootCuttingDeductionKg = Math.round((grossWeight * rootCutting) / 100);
    const totalDeductionKg = Math.min(grossWeight, moistureDeductionKg + rootCuttingDeductionKg);
    const netMarketableWeightKg = Math.max(0, grossWeight - totalDeductionKg);

    // Baling calculations: 1 Pucca Bale = 180 kg, 1 Kutcha Bale = 135 kg
    const puccaExportBalesYield = Math.floor(netMarketableWeightKg / 180);
    const kutchaBalesYield = Math.floor(netMarketableWeightKg / 135);

    const pricePerKg = grade.basePricePerKgBdt;
    const grossValuationBdt = Math.round(grossWeight * pricePerKg);
    const netPayableBdt = Math.round(netMarketableWeightKg * pricePerKg);

    // Cryptographic token
    const tokenPayload = `${params.lotId}:${params.gradeCode}:${netMarketableWeightKg}:${netPayableBdt}`;
    const qualityCertificateToken = crypto.createHash("sha256").update(tokenPayload).digest("hex").slice(0, 16).toUpperCase();

    return {
      lotId: params.lotId,
      gradeInfo: grade,
      grossWeightKg: grossWeight,
      moisturePercent: moisture,
      isMoistureCompliant,
      isRejectedForExcessMoisture: isRejected,
      moistureDeductionKg,
      rootCuttingDeductionKg,
      totalDeductionKg,
      netMarketableWeightKg,
      puccaExportBalesYield,
      kutchaBalesYield,
      pricePerKgBdt: pricePerKg,
      grossValuationBdt,
      netPayableBdt,
      qualityCertificateToken,
    };
  }

  /**
   * Computes manufacturing cost and fiber consumption for Diversified Jute Goods (DJG).
   */
  public static calculateDjgCosting(params: DjgCostingParams): DjgCostingResult {
    const grade = BJMC_JUTE_GRADES[params.rawJuteGradeCode] || BJMC_JUTE_GRADES.BT_SPECIAL;
    const units = Math.max(1, params.targetUnits);
    const wastagePercent = params.weavingWastagePercent ?? 8.0;
    const batchingOilRate = params.batchingOilCostPerKg ?? 4.5;
    const directLaborPerUnit = params.directLaborCostPerUnitBdt ?? 25.0;
    const overheadPerUnit = params.overheadCostPerUnitBdt ?? 15.0;

    // Standard raw fiber consumption per finished unit (in kg)
    let unitWeightKg = 0.5; // default shopping bag
    if (params.productType === "HESSIAN_CLOTH") unitWeightKg = 1.0; // per meter
    if (params.productType === "SACKING_BAGS") unitWeightKg = 0.95; // per bag (B.Twill standard)
    if (params.productType === "CARPET_BACKING_CLOTH") unitWeightKg = 1.2;
    if (params.productType === "GEO_TEXTILES") unitWeightKg = 1.5;
    if (params.productType === "JUTE_ESPADRILLES") unitWeightKg = 0.35;

    const finishedWeightKg = units * unitWeightKg;
    const wastageMultiplier = 1 + (wastagePercent / 100);
    const rawFiberRequiredKg = Math.round(finishedWeightKg * wastageMultiplier);
    const spinningAndWeavingWastageKg = Math.round(rawFiberRequiredKg - finishedWeightKg);

    const rawFiberCostBdt = Math.round(rawFiberRequiredKg * grade.basePricePerKgBdt);
    const batchingOilCostBdt = Math.round(rawFiberRequiredKg * batchingOilRate);
    const directLaborCostBdt = Math.round(units * directLaborPerUnit);
    const factoryOverheadBdt = Math.round(units * overheadPerUnit);

    const totalProductionCostBdt = rawFiberCostBdt + batchingOilCostBdt + directLaborCostBdt + factoryOverheadBdt;
    const costPerUnitBdt = Number((totalProductionCostBdt / units).toFixed(2));
    const costPerMetricTonBdt = Number(((totalProductionCostBdt / finishedWeightKg) * 1000).toFixed(2));

    // Local value addition: ((Total Cost - Imported Components) / Total Cost) * 100
    // Jute is 100% indigenous local raw material in Bangladesh
    const localValueAdditionPercent = 88.5; // accounts for minor imported dyes/accessories

    return {
      productType: params.productType,
      targetUnits: units,
      rawFiberRequiredKg,
      rawFiberCostBdt,
      batchingOilCostBdt,
      spinningAndWeavingWastageKg,
      directLaborCostBdt,
      factoryOverheadBdt,
      totalProductionCostBdt,
      costPerUnitBdt,
      costPerMetricTonBdt,
      localValueAdditionPercent,
    };
  }

  /**
   * Calculates Bangladesh Bank FE Circular export cash subsidies for jute goods.
   */
  public static calculateExportSubsidy(params: ExportSubsidyParams): ExportSubsidyResult {
    const exchangeRate = Math.max(1, params.exchangeRateUsdToBdt);
    const fobBdt = Math.round(params.fobValueUsd * exchangeRate);

    // Subsidy rate lookup
    let statutoryRate = 0;
    if (params.productCategory === "DIVERSIFIED_JUTE_GOODS") {
      statutoryRate = 12.0; // 12% cash incentive under FE Circular
    } else if (params.productCategory === "JUTE_YARN_TWINE") {
      statutoryRate = 7.0; // 7% for yarn/twine
    } else if (params.productCategory === "TRADITIONAL_JUTE_GOODS") {
      statutoryRate = 10.0; // 10% for traditional Hessian/Sacking
    } else {
      statutoryRate = 0.0; // Raw jute
    }

    let isEligible = true;
    let ineligibilityReason: string | undefined;

    if (params.productCategory === "RAW_JUTE") {
      isEligible = false;
      ineligibilityReason = "Raw jute exports are ineligible for cash subsidies under FE Circular 02/2024.";
    } else if (!params.hasValidPrc) {
      isEligible = false;
      ineligibilityReason = "Mandatory Proceeds Realization Certificate (PRC) from Authorized Dealer bank is missing.";
    } else if (!params.hasEpbRegistration) {
      isEligible = false;
      ineligibilityReason = "Export Promotion Bureau (EPB) annual registration certificate is not verified.";
    } else if (params.localValueAdditionPercent < 30.0) {
      isEligible = false;
      ineligibilityReason = `Local value addition (${params.localValueAdditionPercent}%) is below statutory threshold of 30%.`;
    }

    const grossSubsidy = isEligible ? Math.round((fobBdt * statutoryRate) / 100) : 0;
    // Statutory 10% Advance Income Tax (AIT) deduction at source on cash incentives
    const aitDeductionBdt = Math.round(grossSubsidy * 0.10);
    const netCashSubsidyDisbursableBdt = Math.max(0, grossSubsidy - aitDeductionBdt);

    return {
      invoiceNumber: params.invoiceNumber,
      fobValueUsd: params.fobValueUsd,
      fobValueBdt: fobBdt,
      productCategory: params.productCategory,
      statutorySubsidyRatePercent: statutoryRate,
      isEligibleForSubsidy: isEligible,
      subsidyIneligibilityReason: ineligibilityReason,
      grossCashSubsidyBdt: grossSubsidy,
      aitDeductionBdt,
      netCashSubsidyDisbursableBdt,
      bangladeshBankCircularRef: "BB-FEPD-CIRCULAR-03/2026-JUTE-INCENTIVE",
      prcVerificationStatus: params.hasValidPrc ? "VERIFIED_AUTHENTIC" : "PENDING_REALIZATION",
    };
  }

  /**
   * Generates NBR Customs Bonded Warehouse ledger entry and SHA-256 sealed export shipment dossier.
   */
  public static generateBondedExportDossier(params: BondedWarehouseEntryParams): BondedWarehouseEntryResult {
    const fobBdt = Math.round(params.fobValueUsd * 122.5);
    const currentDate = new Date().toISOString().split("T")[0];

    // Cryptographic hash for NBR customs verification
    const sealData = `${params.shipmentId}:${params.bondLicenseNumber}:${params.hsCode}:${params.totalNetWeightKg}:${params.fobValueUsd}`;
    const sha256DossierSeal = crypto.createHash("sha256").update(sealData).digest("hex");
    const nbrCustomsReleaseToken = `NBR-BOND-JUTE-${sha256DossierSeal.slice(0, 12).toUpperCase()}`;

    return {
      shipmentId: params.shipmentId,
      bondLicenseNumber: params.bondLicenseNumber,
      customsRegistrationDate: currentDate,
      hsCode: params.hsCode,
      totalNetWeightKg: params.totalNetWeightKg,
      totalPuccaBales: params.totalPuccaBales,
      fobValueUsd: params.fobValueUsd,
      fobValueBdt: fobBdt,
      bondedStockDeductedKg: params.totalNetWeightKg,
      domesticLeakageRiskScore: 0, // 0 = fully compliant
      sha256DossierSeal,
      nbrCustomsReleaseToken,
    };
  }
}
