import crypto from "crypto";

export type TenderType = "egp_government_cptu" | "corporate_enterprise_rfp" | "ngo_donor_procurement";
export type StdDocumentType = "PG1_MICRO" | "PG2_SMALL" | "PG3_OPEN_NATIONAL" | "PW2_WORKS_SMALL" | "PW3_WORKS_LARGE";
export type BidStatus = "draft" | "submitted" | "technically_responsive" | "awarded_contract" | "rejected";

export interface BoqItem {
  itemNo: string;
  description: string;
  unit: string;
  quantity: number;
  materialCostPerUnitBdt: number;
  laborCostPerUnitBdt: number;
  equipmentOverheadPerUnitBdt: number;
  baseUnitCostBdt: number;
  totalBaseCostBdt: number;
  vatRatePercent: number; // typically 7.5% or 15%
  aitRatePercent: number; // typically 5%
  quotedUnitRateBdt: number;
  totalQuotedAmountBdt: number;
}

export interface TenderBidRecord {
  id: string;
  tenderId: string;
  tenderTitle: string;
  procuringEntity: string; // e.g., "Roads and Highways Department (RHD)", "BPDB", "Grameenphone"
  tenderType: TenderType;
  stdDocumentType: StdDocumentType;
  estimatedValueBdt: number;
  quotedTotalValueBdt: number;
  tenderSecurityAmountBdt: number; // 2%-3% of tender value
  performanceSecurityAmountBdt: number; // 5%-10% of contract value
  submissionDeadlineIso: string;
  boqItems: BoqItem[];
  status: BidStatus;
  eligibilityScorePercent: number;
  contractorName: string;
  contractorBin: string;
  digitalSealHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface EligibilityScreenParams {
  requiredAnnualTurnoverBdt: number;
  contractorAnnualTurnoverBdt: number;
  requiredLiquidAssetsBdt: number;
  contractorLiquidAssetsBdt: number;
  requiredSimilarExperienceYears: number;
  contractorExperienceYears: number;
  hasValidTaxClearance: boolean;
  hasValidTradeLicense: boolean;
  hasValidMushakBin: boolean;
}

export interface EligibilityScreenResult {
  isEligible: boolean;
  overallScorePercent: number;
  turnoverPassed: boolean;
  liquidAssetsPassed: boolean;
  experiencePassed: boolean;
  complianceChecklist: {
    taxClearance: boolean;
    tradeLicense: boolean;
    mushakBin: boolean;
  };
  discrepancies: string[];
  recommendedMitigations: string[];
}

export interface BoqCalculationParams {
  items: Array<{
    itemNo: string;
    description: string;
    unit: string;
    quantity: number;
    materialCost: number;
    laborCost: number;
    overheadCost: number;
    profitMarginPercent: number;
    vatRatePercent?: number;
    aitRatePercent?: number;
  }>;
}

export interface BoqCalculationResult {
  totalBaseCostBdt: number;
  totalVatBdt: number;
  totalAitBdt: number;
  totalNetProfitBdt: number;
  totalQuotedBidAmountBdt: number;
  calculatedItems: BoqItem[];
}

export interface TenderSummaryMetrics {
  totalBidsTracked: number;
  totalBidPortfolioValueBdt: number;
  awardedContractsCount: number;
  totalAwardedValueBdt: number;
  averageWinRatePercent: number;
}

export class TenderBidEngine {
  private bids: Map<string, TenderBidRecord> = new Map();

  constructor() {
    this.seedInitialBids();
  }

  public screenEligibility(params: EligibilityScreenParams): EligibilityScreenResult {
    const turnoverPassed = params.contractorAnnualTurnoverBdt >= params.requiredAnnualTurnoverBdt;
    const liquidAssetsPassed = params.contractorLiquidAssetsBdt >= params.requiredLiquidAssetsBdt;
    const experiencePassed = params.contractorExperienceYears >= params.requiredSimilarExperienceYears;
    const docsPassed = params.hasValidTaxClearance && params.hasValidTradeLicense && params.hasValidMushakBin;

    const discrepancies: string[] = [];
    const recommendedMitigations: string[] = [];

    if (!turnoverPassed) {
      discrepancies.push(`Annual turnover of ৳${(params.contractorAnnualTurnoverBdt / 100000).toFixed(1)} Lakh is below required ৳${(params.requiredAnnualTurnoverBdt / 100000).toFixed(1)} Lakh`);
      recommendedMitigations.push("Form a Joint Venture (JVCA) with a senior contractor under PPR 2008 Rule 54");
    }
    if (!liquidAssetsPassed) {
      discrepancies.push(`Liquid asset commitment of ৳${(params.contractorLiquidAssetsBdt / 100000).toFixed(1)} Lakh is below required ৳${(params.requiredLiquidAssetsBdt / 100000).toFixed(1)} Lakh`);
      recommendedMitigations.push("Obtain an unconditional line of credit commitment (CPTU Form PG3-5) from an authorized commercial bank");
    }
    if (!experiencePassed) {
      discrepancies.push(`Specific contract experience of ${params.contractorExperienceYears} years is below required ${params.requiredSimilarExperienceYears} years`);
      recommendedMitigations.push("Submit verified work completion certificates with sub-contracting approval from government employer");
    }

    let score = 100;
    if (!turnoverPassed) score -= 25;
    if (!liquidAssetsPassed) score -= 25;
    if (!experiencePassed) score -= 20;
    if (!docsPassed) score -= 30;

    const isEligible = turnoverPassed && liquidAssetsPassed && experiencePassed && docsPassed;

    return {
      isEligible,
      overallScorePercent: Math.max(0, score),
      turnoverPassed,
      liquidAssetsPassed,
      experiencePassed,
      complianceChecklist: {
        taxClearance: params.hasValidTaxClearance,
        tradeLicense: params.hasValidTradeLicense,
        mushakBin: params.hasValidMushakBin,
      },
      discrepancies,
      recommendedMitigations,
    };
  }

  public calculateBoq(params: BoqCalculationParams): BoqCalculationResult {
    let totalBase = 0;
    let totalVat = 0;
    let totalAit = 0;
    let totalProfit = 0;
    let totalQuoted = 0;

    const calculatedItems: BoqItem[] = params.items.map((it) => {
      const baseUnit = it.materialCost + it.laborCost + it.overheadCost;
      const profitUnit = (baseUnit * it.profitMarginPercent) / 100;
      const vatRate = it.vatRatePercent ?? 7.5;
      const aitRate = it.aitRatePercent ?? 5.0;

      const quotedUnitRate = Math.round(baseUnit + profitUnit + (baseUnit * vatRate) / 100 + (baseUnit * aitRate) / 100);
      const totalBaseCost = baseUnit * it.quantity;
      const totalItemQuoted = quotedUnitRate * it.quantity;

      const itemVat = ((baseUnit * vatRate) / 100) * it.quantity;
      const itemAit = ((baseUnit * aitRate) / 100) * it.quantity;
      const itemProfit = profitUnit * it.quantity;

      totalBase += totalBaseCost;
      totalVat += itemVat;
      totalAit += itemAit;
      totalProfit += itemProfit;
      totalQuoted += totalItemQuoted;

      return {
        itemNo: it.itemNo,
        description: it.description,
        unit: it.unit,
        quantity: it.quantity,
        materialCostPerUnitBdt: it.materialCost,
        laborCostPerUnitBdt: it.laborCost,
        equipmentOverheadPerUnitBdt: it.overheadCost,
        baseUnitCostBdt: baseUnit,
        totalBaseCostBdt: totalBaseCost,
        vatRatePercent: vatRate,
        aitRatePercent: aitRate,
        quotedUnitRateBdt: quotedUnitRate,
        totalQuotedAmountBdt: totalItemQuoted,
      };
    });

    return {
      totalBaseCostBdt: Math.round(totalBase),
      totalVatBdt: Math.round(totalVat),
      totalAitBdt: Math.round(totalAit),
      totalNetProfitBdt: Math.round(totalProfit),
      totalQuotedBidAmountBdt: Math.round(totalQuoted),
      calculatedItems,
    };
  }

  public generateBid(data: {
    tenderId: string;
    tenderTitle: string;
    procuringEntity: string;
    tenderType: TenderType;
    stdDocumentType: StdDocumentType;
    estimatedValueBdt: number;
    quotedTotalValueBdt: number;
    contractorName: string;
    contractorBin: string;
    boqItems?: BoqItem[];
  }): TenderBidRecord {
    const newId = `BID-2026-${Math.floor(100 + Math.random() * 900)}`;
    const tenderSecurity = Math.round(data.quotedTotalValueBdt * 0.025); // 2.5% standard
    const performanceSecurity = Math.round(data.quotedTotalValueBdt * 0.10); // 10% standard

    const sealPayload = JSON.stringify({
      id: newId,
      tenderId: data.tenderId,
      title: data.tenderTitle,
      entity: data.procuringEntity,
      quotedValue: data.quotedTotalValueBdt,
      timestamp: new Date().toISOString(),
    });
    const digitalSealHash = crypto.createHash("sha256").update(sealPayload).digest("hex");

    const record: TenderBidRecord = {
      id: newId,
      tenderId: data.tenderId,
      tenderTitle: data.tenderTitle,
      procuringEntity: data.procuringEntity,
      tenderType: data.tenderType,
      stdDocumentType: data.stdDocumentType,
      estimatedValueBdt: data.estimatedValueBdt,
      quotedTotalValueBdt: data.quotedTotalValueBdt,
      tenderSecurityAmountBdt: tenderSecurity,
      performanceSecurityAmountBdt: performanceSecurity,
      submissionDeadlineIso: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
      boqItems: data.boqItems || [],
      status: "submitted",
      eligibilityScorePercent: 95,
      contractorName: data.contractorName,
      contractorBin: data.contractorBin,
      digitalSealHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.bids.set(newId, record);
    return record;
  }

  public getBids(): TenderBidRecord[] {
    return Array.from(this.bids.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getBidById(id: string): TenderBidRecord | undefined {
    return this.bids.get(id);
  }

  public getSummaryMetrics(): TenderSummaryMetrics {
    const all = Array.from(this.bids.values());
    const totalPortfolio = all.reduce((sum, b) => sum + b.quotedTotalValueBdt, 0);
    const awarded = all.filter((b) => b.status === "awarded_contract");
    const awardedValue = awarded.reduce((sum, b) => sum + b.quotedTotalValueBdt, 0);

    return {
      totalBidsTracked: all.length,
      totalBidPortfolioValueBdt: totalPortfolio,
      awardedContractsCount: awarded.length,
      totalAwardedValueBdt: awardedValue,
      averageWinRatePercent: 42.8,
    };
  }

  private seedInitialBids(): void {
    const bid1: TenderBidRecord = {
      id: "BID-2026-001",
      tenderId: "eGP-CPTU-2026-981023",
      tenderTitle: "Supply & Installation of High-Capacity Enterprise Networking Equipment",
      procuringEntity: "Bangladesh Power Development Board (BPDB)",
      tenderType: "egp_government_cptu",
      stdDocumentType: "PG3_OPEN_NATIONAL",
      estimatedValueBdt: 8500000,
      quotedTotalValueBdt: 7950000,
      tenderSecurityAmountBdt: 200000,
      performanceSecurityAmountBdt: 795000,
      submissionDeadlineIso: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
      boqItems: [
        {
          itemNo: "01",
          description: "Enterprise Core Layer-3 48-Port Switch",
          unit: "Pcs",
          quantity: 12,
          materialCostPerUnitBdt: 280000,
          laborCostPerUnitBdt: 15000,
          equipmentOverheadPerUnitBdt: 10000,
          baseUnitCostBdt: 305000,
          totalBaseCostBdt: 3660000,
          vatRatePercent: 7.5,
          aitRatePercent: 5.0,
          quotedUnitRateBdt: 345000,
          totalQuotedAmountBdt: 4140000,
        },
      ],
      status: "technically_responsive",
      eligibilityScorePercent: 98,
      contractorName: "NextGen Cloud Technologies Ltd.",
      contractorBin: "0019283746192",
      digitalSealHash: "c810294bc091284bc51908efa123bc0914a821eef00192837bc991a288410212",
      createdAt: "2026-08-01T10:00:00.000Z",
      updatedAt: "2026-08-10T14:30:00.000Z",
    };

    const bid2: TenderBidRecord = {
      id: "BID-2026-002",
      tenderId: "RFP-GP-2026-44102",
      tenderTitle: "Corporate Uniforms & Eco-Friendly Merchandising Kit",
      procuringEntity: "Grameenphone PLC (Corporate HQ)",
      tenderType: "corporate_enterprise_rfp",
      stdDocumentType: "PG2_SMALL",
      estimatedValueBdt: 3500000,
      quotedTotalValueBdt: 3200000,
      tenderSecurityAmountBdt: 80000,
      performanceSecurityAmountBdt: 320000,
      submissionDeadlineIso: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      boqItems: [],
      status: "awarded_contract",
      eligibilityScorePercent: 100,
      contractorName: "Bengal Garment Solutions Ltd.",
      contractorBin: "0028193847102",
      digitalSealHash: "d910294bc091284bc51908efa123bc0914a821eef00192837bc991a288410992",
      createdAt: "2026-07-15T09:00:00.000Z",
      updatedAt: "2026-07-28T16:00:00.000Z",
    };

    this.bids.set(bid1.id, bid1);
    this.bids.set(bid2.id, bid2);
  }
}

export const tenderBidEngine = new TenderBidEngine();
