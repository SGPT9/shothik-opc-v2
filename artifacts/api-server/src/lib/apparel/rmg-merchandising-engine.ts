import crypto from "node:crypto";

export type GarmentType =
  | "basic_tshirt"
  | "polo_shirt"
  | "hoodie"
  | "denim_jeans"
  | "twill_chino"
  | "woven_shirt";

export type SizeGrade = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export interface MeasurementPoint {
  code: string;
  name: string;
  nameBangla: string;
  baseToleranceCm: number;
  gradeStepCm: number;
  sizeValuesCm: Record<SizeGrade, number>;
}

export interface FabricConsumptionRequest {
  garmentType: GarmentType;
  orderQuantityPcs: number;
  fabricGsm: number;
  bodyLengthCm: number;
  halfChestCm: number;
  sleeveLengthCm: number;
  markerEfficiencyPercent?: number; // default 85%
  wastageAllowancePercent?: number;  // default 7%
}

export interface FabricConsumptionResult {
  garmentType: GarmentType;
  orderQuantityPcs: number;
  orderQuantityDozens: number;
  fabricGsm: number;
  bodyConsumptionKgPerDozen: number;
  sleeveConsumptionKgPerDozen: number;
  netConsumptionKgPerDozen: number;
  grossConsumptionKgPerDozen: number;
  totalFabricRequiredKg: number;
  standardFabricRollsCount: number; // 22kg/roll
  yarnRequirementKg: number;        // factoring 5% knitting loss
  markerEfficiencyPercent: number;
  wastageAllowancePercent: number;
  calculationSealSha256: string;
}

export interface TechPackRequest {
  styleCode: string;
  styleName: string;
  garmentType: GarmentType;
  fabricComposition: string;
  fabricGsm: number;
  yarnCount: string;
  orderQuantityPcs: number;
  cmCostPerDozenBdt: number;
  factoryName: string;
}

export interface TechPackResult {
  techPackId: string;
  styleCode: string;
  styleName: string;
  garmentType: GarmentType;
  fabricComposition: string;
  fabricGsm: number;
  yarnCount: string;
  orderQuantityPcs: number;
  orderQuantityDozens: number;
  cmCostPerDozenBdt: number;
  totalCmContractBdt: number;
  measurements: MeasurementPoint[];
  billOfMaterials: Array<{
    item: string;
    specification: string;
    unit: string;
    quantityPerDozen: number;
  }>;
  issuedAt: string;
  techPackSealSha256: string;
}

export interface SubcontractMilestone {
  stage: number;
  title: string;
  percentage: number;
  amountBdt: number;
  status: "PENDING" | "FUNDED" | "DISBURSED";
  releaseRequirement: string;
  disbursedAt?: string;
  escrowReference: string;
}

export interface SubcontractContractResult {
  contractId: string;
  techPackId: string;
  factoryName: string;
  subcontractorName: string;
  totalOrderPcs: number;
  totalCmValueBdt: number;
  currentStage: number;
  overallStatus: "ACTIVE" | "IN_PROGRESS" | "AQL_AUDIT_PASSED" | "COMPLETED";
  milestones: SubcontractMilestone[];
  createdAt: string;
  contractSealSha256: string;
}

export class RmgMerchandisingEngine {
  /**
   * AC-2: Fabric Consumption & Yield Calculator
   */
  public calculateFabricConsumption(req: FabricConsumptionRequest): FabricConsumptionResult {
    const markerEfficiency = req.markerEfficiencyPercent ?? 85.0;
    const wastageAllowance = req.wastageAllowancePercent ?? 7.0;
    const allowanceCm = 5.0; // standard seam allowance

    // Standard CAD body consumption formula in kg/dozen
    // Formula: (Length + allowance) * (HalfChest + allowance) * 2 * GSM * 12 / (10,000,000 * (efficiency/100))
    const bodyAreaSqM = ((req.bodyLengthCm + allowanceCm) * (req.halfChestCm + allowanceCm) * 2) / 10000;
    const bodyConsumptionKgPerDozen = Math.round(((bodyAreaSqM * req.fabricGsm * 12) / 1000 / (markerEfficiency / 100)) * 100) / 100;

    // Sleeve consumption formula (muscle width estimated as 0.4 * chest)
    const muscleWidthCm = req.halfChestCm * 0.4;
    const sleeveAreaSqM = ((req.sleeveLengthCm + allowanceCm) * (muscleWidthCm + allowanceCm) * 2) / 10000;
    const sleeveConsumptionKgPerDozen = Math.round(((sleeveAreaSqM * req.fabricGsm * 12) / 1000 / (markerEfficiency / 100)) * 100) / 100;

    const netConsumptionKgPerDozen = Math.round((bodyConsumptionKgPerDozen + sleeveConsumptionKgPerDozen) * 100) / 100;
    const grossConsumptionKgPerDozen = Math.round(netConsumptionKgPerDozen * (1 + wastageAllowance / 100) * 100) / 100;

    const orderQuantityDozens = Math.round((req.orderQuantityPcs / 12) * 100) / 100;
    const totalFabricRequiredKg = Math.round(grossConsumptionKgPerDozen * orderQuantityDozens * 100) / 100;
    const standardFabricRollsCount = Math.ceil(totalFabricRequiredKg / 22); // 22kg typical knitted fabric roll
    const yarnRequirementKg = Math.round(totalFabricRequiredKg * 1.05 * 100) / 100; // 5% knitting loss buffer

    const payload = `${req.garmentType}|${req.orderQuantityPcs}|${req.fabricGsm}|${totalFabricRequiredKg}|${yarnRequirementKg}`;
    const calculationSealSha256 = crypto.createHash("sha256").update(payload).digest("hex");

    return {
      garmentType: req.garmentType,
      orderQuantityPcs: req.orderQuantityPcs,
      orderQuantityDozens,
      fabricGsm: req.fabricGsm,
      bodyConsumptionKgPerDozen,
      sleeveConsumptionKgPerDozen,
      netConsumptionKgPerDozen,
      grossConsumptionKgPerDozen,
      totalFabricRequiredKg,
      standardFabricRollsCount,
      yarnRequirementKg,
      markerEfficiencyPercent: markerEfficiency,
      wastageAllowancePercent: wastageAllowance,
      calculationSealSha256,
    };
  }

  /**
   * AC-1: Generate Technical Sheet & Bill of Materials
   */
  public generateTechPack(req: TechPackRequest): TechPackResult {
    const orderQuantityDozens = Math.round((req.orderQuantityPcs / 12) * 100) / 100;
    const totalCmContractBdt = Math.round(orderQuantityDozens * req.cmCostPerDozenBdt);
    const techPackId = `TP-${req.styleCode.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    // Standard graded measurement points
    const measurements: MeasurementPoint[] = [
      {
        code: "POM-01",
        name: "Body Length from HPS",
        nameBangla: "বডি দৈর্ঘ্য (এইচপিএস থেকে)",
        baseToleranceCm: 1.0,
        gradeStepCm: 2.0,
        sizeValuesCm: { XS: 66, S: 68, M: 70, L: 72, XL: 74, XXL: 76 },
      },
      {
        code: "POM-02",
        name: "Chest Width (1\" below armhole)",
        nameBangla: "বুকের প্রস্থ",
        baseToleranceCm: 1.0,
        gradeStepCm: 2.5,
        sizeValuesCm: { XS: 48, S: 50.5, M: 53, L: 55.5, XL: 58, XXL: 60.5 },
      },
      {
        code: "POM-03",
        name: "Sleeve Length from Shoulder",
        nameBangla: "হাতার দৈর্ঘ্য",
        baseToleranceCm: 0.75,
        gradeStepCm: 1.0,
        sizeValuesCm: { XS: 20, S: 21, M: 22, L: 23, XL: 24, XXL: 25 },
      },
      {
        code: "POM-04",
        name: "Across Shoulder",
        nameBangla: "কাঁধের বিস্তার",
        baseToleranceCm: 0.75,
        gradeStepCm: 1.5,
        sizeValuesCm: { XS: 42, S: 43.5, M: 45, L: 46.5, XL: 48, XXL: 49.5 },
      },
      {
        code: "POM-05",
        name: "Neck Width (seam to seam)",
        nameBangla: "কলার/নেক প্রস্থ",
        baseToleranceCm: 0.5,
        gradeStepCm: 0.5,
        sizeValuesCm: { XS: 17, S: 17.5, M: 18, L: 18.5, XL: 19, XXL: 19.5 },
      },
    ];

    const billOfMaterials = [
      {
        item: "Main Body Fabric",
        specification: `${req.fabricComposition}, ${req.fabricGsm} GSM, ${req.yarnCount}`,
        unit: "kg",
        quantityPerDozen: 2.75,
      },
      {
        item: "1x1 Spun Rib Collar",
        specification: "95% Cotton 5% Spandex, 240 GSM",
        unit: "kg",
        quantityPerDozen: 0.28,
      },
      {
        item: "Sewing Thread",
        specification: "100% Spun Polyester 40/2 (Color Matched)",
        unit: "meters",
        quantityPerDozen: 180,
      },
      {
        item: "Woven Satin Main Label",
        specification: "Ultrasonic cut, heat transfer backing",
        unit: "pcs",
        quantityPerDozen: 12,
      },
      {
        item: "Printed Care & Composition Label",
        specification: "Taffeta printed with Bangla/English wash symbols",
        unit: "pcs",
        quantityPerDozen: 12,
      },
      {
        item: "Polybag Packaging",
        specification: "Self-adhesive OPP, with warning imprint (0.04mm)",
        unit: "pcs",
        quantityPerDozen: 12,
      },
    ];

    const payload = `${techPackId}|${req.styleCode}|${totalCmContractBdt}|${req.orderQuantityPcs}`;
    const techPackSealSha256 = crypto.createHash("sha256").update(payload).digest("hex");

    return {
      techPackId,
      styleCode: req.styleCode,
      styleName: req.styleName,
      garmentType: req.garmentType,
      fabricComposition: req.fabricComposition,
      fabricGsm: req.fabricGsm,
      yarnCount: req.yarnCount,
      orderQuantityPcs: req.orderQuantityPcs,
      orderQuantityDozens,
      cmCostPerDozenBdt: req.cmCostPerDozenBdt,
      totalCmContractBdt,
      measurements,
      billOfMaterials,
      issuedAt: new Date().toISOString(),
      techPackSealSha256,
    };
  }

  /**
   * AC-3: 4-Tier Subcontracting CM Milestone Escrow
   */
  public createSubcontractContract(
    techPack: TechPackResult,
    subcontractorName: string,
  ): SubcontractContractResult {
    const contractId = `SC-${techPack.styleCode}-${Date.now().toString(36).toUpperCase()}`;
    const total = techPack.totalCmContractBdt;

    const milestones: SubcontractMilestone[] = [
      {
        stage: 1,
        title: "Cutting Lay Advance",
        percentage: 25,
        amountBdt: Math.round(total * 0.25),
        status: "FUNDED",
        releaseRequirement: "Fabric inspection passed & lay cutting initiated.",
        escrowReference: `ESCROW-M1-${contractId}`,
        disbursedAt: new Date().toISOString(),
      },
      {
        stage: 2,
        title: "Mid-Stage Sewing Line Progress",
        percentage: 35,
        amountBdt: Math.round(total * 0.35),
        status: "PENDING",
        releaseRequirement: "50% assembly line bundles passed through inline QC.",
        escrowReference: `ESCROW-M2-${contractId}`,
      },
      {
        stage: 3,
        title: "Finishing & AQL 2.5 Audit Pass",
        percentage: 25,
        amountBdt: Math.round(total * 0.25),
        status: "PENDING",
        releaseRequirement: "Ironing, thread trimming & certified AQL 2.5 audit passed.",
        escrowReference: `ESCROW-M3-${contractId}`,
      },
      {
        stage: 4,
        title: "Final Dispatch & Warehouse Acceptance",
        percentage: 15,
        amountBdt: Math.round(total * 0.15),
        status: "PENDING",
        releaseRequirement: "Carton packing & courier/truck consignment bill of lading received.",
        escrowReference: `ESCROW-M4-${contractId}`,
      },
    ];

    const payload = `${contractId}|${techPack.techPackId}|${total}|${subcontractorName}`;
    const contractSealSha256 = crypto.createHash("sha256").update(payload).digest("hex");

    return {
      contractId,
      techPackId: techPack.techPackId,
      factoryName: "Shothik Smart Apparel Hub, Narayanganj",
      subcontractorName,
      totalOrderPcs: techPack.orderQuantityPcs,
      totalCmValueBdt: total,
      currentStage: 1,
      overallStatus: "ACTIVE",
      milestones,
      createdAt: new Date().toISOString(),
      contractSealSha256,
    };
  }

  /**
   * AC-4: Compile Statutory Mushak-4.3 Input-Output Declaration
   */
  public compileMushak43Declaration(techPack: TechPackResult, consumption: FabricConsumptionResult) {
    const declarationId = `MUSHAK-4.3-DECL-${techPack.styleCode}-${Date.now().toString(36).toUpperCase()}`;
    const fabricCostPerDozen = Math.round(consumption.grossConsumptionKgPerDozen * 550); // ৳550/kg standard combed cotton
    const accessoriesCostPerDozen = 180; // Trims, thread, polybag, cartons
    const totalDirectCostPerDozen = fabricCostPerDozen + accessoriesCostPerDozen + techPack.cmCostPerDozenBdt;
    const suggestedFobPerDozenUsd = Math.round((totalDirectCostPerDozen / 120) * 1.25 * 100) / 100; // 25% margin at 120 BDT/USD

    return {
      declarationId,
      styleCode: techPack.styleCode,
      garmentType: techPack.garmentType,
      statutoryAct: "Value Added Tax & Supplementary Duty Act 2012 (Section 46/NBR SRO 186/2019)",
      unitOfMeasurement: "Dozen (12 Pcs)",
      fabricConsumptionPerDozenKg: consumption.grossConsumptionKgPerDozen,
      yarnInputCoefficientPerDozenKg: consumption.yarnRequirementKg / consumption.orderQuantityDozens,
      costBreakdownBdt: {
        rawFabricCost: fabricCostPerDozen,
        accessoriesTrimsCost: accessoriesCostPerDozen,
        costOfMakingCm: techPack.cmCostPerDozenBdt,
        totalCostPerDozenBdt: totalDirectCostPerDozen,
        unitCostPerPieceBdt: Math.round((totalDirectCostPerDozen / 12) * 100) / 100,
      },
      exportPricing: {
        exchangeRateBdtPerUsd: 120,
        suggestedFobPerDozenUsd,
        suggestedFobPerPieceUsd: Math.round((suggestedFobPerDozenUsd / 12) * 100) / 100,
      },
      verifiedAt: new Date().toISOString(),
      nbrDigitalSeal: crypto.createHash("sha256").update(`${declarationId}|${totalDirectCostPerDozen}`).digest("hex"),
    };
  }
}

export const rmgMerchandisingEngine = new RmgMerchandisingEngine();
