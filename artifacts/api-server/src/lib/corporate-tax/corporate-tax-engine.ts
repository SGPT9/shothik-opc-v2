import { createHash } from "crypto";

export type CorporateEntityType =
  | "private_limited"
  | "one_person_company"
  | "ites_tax_exempt"
  | "rmg_export"
  | "green_rmg";

export type AitSourceSection =
  | "sec_120_import"
  | "sec_89_supply_goods"
  | "sec_86_services"
  | "sec_123_export_proceeds"
  | "sec_102_bank_interest";

export interface CorporateTaxCalculationRequest {
  tinNumber: string;
  companyName: string;
  assessmentYear: string;
  incomeYear: string;
  entityType: CorporateEntityType;
  isCashlessCompliant?: boolean;
  grossTurnoverBdt: number;
  grossRevenueReceiptsBdt: number;
  allowableBusinessExpensesBdt: number;
  depreciationAllowanceBdt: number;
  otherIncomeBdt?: number;
}

export interface CorporateTaxCalculationResult {
  tinNumber: string;
  companyName: string;
  assessmentYear: string;
  incomeYear: string;
  entityType: CorporateEntityType;
  grossReceiptsBdt: number;
  netTaxableProfitBdt: number;
  applicableTaxRatePercent: number;
  standardTaxOnProfitBdt: number;
  minimumTurnoverTaxRatePercent: number;
  minimumTurnoverTaxFloorBdt: number;
  isMinimumTaxTriggered: boolean;
  grossCorporateTaxLiabilityBdt: number;
  totalAitCreditedBdt: number;
  netTaxPayableToNBRBdt: number;
  excessAitRefundableCarryForwardBdt: number;
  computationHash: string;
  computedAt: string;
}

export interface AitCertificateItem {
  id: string;
  section: AitSourceSection;
  challanOrCertificateNo: string;
  deductingAuthority: string;
  transactionDate: string;
  baseTransactionAmountBdt: number;
  withholdingRatePercent: number;
  aitDeductedAmountBdt: number;
  bankDepositChallanNo: string;
  status: "verified" | "pending_audit";
  createdAt: string;
}

export interface Mushak91MonthlyReturn {
  returnPeriod: string;
  binNumber: string;
  companyName: string;
  grossLocalSalesBdt: number;
  zeroRatedExportSalesBdt: number;
  outputVatStandard15Bdt: number;
  outputVatReducedRateBdt: number;
  totalOutputVatPayableBdt: number;
  rawMaterialPurchasesBdt: number;
  inputTaxCreditGoods15Bdt: number;
  inputTaxCreditServicesBdt: number;
  totalInputTaxCreditBdt: number;
  increasingAdjustmentsVdsBdt: number;
  decreasingAdjustmentsExportRebateBdt: number;
  netVatPayableToTreasuryBdt: number;
  carriedForwardClosingBalanceBdt: number;
  status: "draft" | "submitted";
  verificationHash: string;
  updatedAt: string;
}

export interface CorporateTaxSummaryMetrics {
  currentAssessmentYear: string;
  totalAnnualTurnoverBdt: number;
  estimatedNetProfitBdt: number;
  corporateTaxLiabilityBdt: number;
  totalAitDeductedAtSourceBdt: number;
  netFinalTaxPayableBdt: number;
  monthlyVatPayableAverageBdt: number;
  mushak91Status: "compliant" | "overdue";
}

export class CorporateTaxEngine {
  private aitLedger: AitCertificateItem[] = [];
  private mushakReturns: Map<string, Mushak91MonthlyReturn> = new Map();

  constructor() {
    this.seedDefaultAitLedger();
    this.seedDefaultMushakReturn();
  }

  /**
   * Calculates Corporate Tax Liability under Income Tax Act 2023 with Section 163/82C Minimum Tax.
   */
  public calculateCorporateTax(req: CorporateTaxCalculationRequest): CorporateTaxCalculationResult {
    const grossReceipts = req.grossRevenueReceiptsBdt || req.grossTurnoverBdt;
    const otherIncome = req.otherIncomeBdt ?? 0;
    
    // Net profit = Gross - Allowable Expenses - Depreciation + Other Income
    const rawProfit = grossReceipts - req.allowableBusinessExpensesBdt - req.depreciationAllowanceBdt + otherIncome;
    const netTaxableProfit = Math.max(0, rawProfit);

    // Determine Applicable Corporate Tax Rate
    let applicableTaxRatePercent = 27.5; // Default non-listed private limited

    switch (req.entityType) {
      case "private_limited":
        applicableTaxRatePercent = req.isCashlessCompliant ? 25.0 : 27.5;
        break;
      case "one_person_company":
        applicableTaxRatePercent = req.isCashlessCompliant ? 20.0 : 22.5;
        break;
      case "ites_tax_exempt":
        applicableTaxRatePercent = 0.0;
        break;
      case "rmg_export":
        applicableTaxRatePercent = 12.0;
        break;
      case "green_rmg":
        applicableTaxRatePercent = 10.0;
        break;
    }

    const standardTaxOnProfit = Math.round((netTaxableProfit * applicableTaxRatePercent) / 100);

    // Section 163 / 82C Minimum Turnover Tax: 0.6% on gross receipts
    const minimumTurnoverTaxRatePercent = req.entityType === "ites_tax_exempt" ? 0.0 : 0.6;
    const minimumTurnoverTaxFloor = Math.round((grossReceipts * minimumTurnoverTaxRatePercent) / 100);

    // If profit tax is less than minimum turnover tax, minimum tax applies
    const isMinimumTaxTriggered = req.entityType !== "ites_tax_exempt" && minimumTurnoverTaxFloor > standardTaxOnProfit;
    const grossCorporateTaxLiability = Math.max(standardTaxOnProfit, minimumTurnoverTaxFloor);

    // Total verified AIT credits in ledger
    const totalAitCredited = this.aitLedger
      .filter((it) => it.status === "verified")
      .reduce((sum, it) => sum + it.aitDeductedAmountBdt, 0);

    const netTaxPayableToNBR = Math.max(0, grossCorporateTaxLiability - totalAitCredited);
    const excessAitRefundableCarryForward = Math.max(0, totalAitCredited - grossCorporateTaxLiability);

    const payload = `${req.tinNumber}:${req.assessmentYear}:${grossCorporateTaxLiability}:${netTaxPayableToNBR}`;
    const computationHash = createHash("sha256").update(payload).digest("hex").slice(0, 16);

    return {
      tinNumber: req.tinNumber,
      companyName: req.companyName,
      assessmentYear: req.assessmentYear,
      incomeYear: req.incomeYear,
      entityType: req.entityType,
      grossReceiptsBdt: grossReceipts,
      netTaxableProfitBdt: netTaxableProfit,
      applicableTaxRatePercent,
      standardTaxOnProfitBdt: standardTaxOnProfit,
      minimumTurnoverTaxRatePercent,
      minimumTurnoverTaxFloorBdt: minimumTurnoverTaxFloor,
      isMinimumTaxTriggered,
      grossCorporateTaxLiabilityBdt: grossCorporateTaxLiability,
      totalAitCreditedBdt: totalAitCredited,
      netTaxPayableToNBRBdt: netTaxPayableToNBR,
      excessAitRefundableCarryForwardBdt: excessAitRefundableCarryForward,
      computationHash,
      computedAt: new Date().toISOString(),
    };
  }

  /**
   * Returns all AIT credit items.
   */
  public getAitLedger(): AitCertificateItem[] {
    return [...this.aitLedger];
  }

  /**
   * Adds an AIT credit item to the ledger.
   */
  public addAitCertificate(item: Omit<AitCertificateItem, "id" | "createdAt" | "status">): AitCertificateItem {
    const newItem: AitCertificateItem = {
      id: `AIT-${Date.now().toString(36).toUpperCase()}`,
      ...item,
      status: "verified",
      createdAt: new Date().toISOString(),
    };
    this.aitLedger.push(newItem);
    return newItem;
  }

  /**
   * Computes or retrieves VAT Mushak-9.1 Monthly Return.
   */
  public getMushak91Return(period: string = "2026-09"): Mushak91MonthlyReturn {
    const existing = this.mushakReturns.get(period);
    if (existing) return existing;

    // Construct default monthly return for the period
    const defaultReturn: Mushak91MonthlyReturn = {
      returnPeriod: period,
      binNumber: "001234567-0101",
      companyName: "Shothik Technologies Bangladesh Ltd.",
      grossLocalSalesBdt: 4500000,
      zeroRatedExportSalesBdt: 1200000,
      outputVatStandard15Bdt: 675000, // 15% on 4,500,000
      outputVatReducedRateBdt: 0,
      totalOutputVatPayableBdt: 675000,
      rawMaterialPurchasesBdt: 2800000,
      inputTaxCreditGoods15Bdt: 420000, // 15% on 2,800,000
      inputTaxCreditServicesBdt: 45000,
      totalInputTaxCreditBdt: 465000,
      increasingAdjustmentsVdsBdt: 35000,
      decreasingAdjustmentsExportRebateBdt: 25000,
      netVatPayableToTreasuryBdt: 220000, // 675,000 - 465,000 + 35,000 - 25,000 = 220,000
      carriedForwardClosingBalanceBdt: 0,
      status: "draft",
      verificationHash: createHash("sha256").update(`mushak91:${period}:220000`).digest("hex").slice(0, 16),
      updatedAt: new Date().toISOString(),
    };

    this.mushakReturns.set(period, defaultReturn);
    return defaultReturn;
  }

  /**
   * Compiles statutory e-Return bundle matching NBR e-Return portal XML/JSON schema.
   */
  public exportEReturnPayload(req: CorporateTaxCalculationRequest): Record<string, any> {
    const calc = this.calculateCorporateTax(req);
    const aitItems = this.getAitLedger();
    const mushakReturn = this.getMushak91Return();

    return {
      nbrPortalFormat: "NBR_E_RETURN_V2026",
      header: {
        assessmentYear: calc.assessmentYear,
        incomeYear: calc.incomeYear,
        tin: calc.tinNumber,
        companyName: calc.companyName,
        circle: "Company Circle-14, Taxes Zone-08, Dhaka",
      },
      schedule82C: {
        grossReceipts: calc.grossReceiptsBdt,
        minimumTaxRatePercent: calc.minimumTurnoverTaxRatePercent,
        minimumTaxComputed: calc.minimumTurnoverTaxFloorBdt,
        profitBasedTaxComputed: calc.standardTaxOnProfitBdt,
        finalGrossTaxLiability: calc.grossCorporateTaxLiabilityBdt,
      },
      scheduleAIT: {
        totalCreditsClaimed: calc.totalAitCreditedBdt,
        certificates: aitItems.map((c) => ({
          section: c.section,
          challanNumber: c.bankDepositChallanNo || c.challanOrCertificateNo,
          deductor: c.deductingAuthority,
          amount: c.aitDeductedAmountBdt,
        })),
      },
      vatMushak91Summary: {
        bin: mushakReturn.binNumber,
        period: mushakReturn.returnPeriod,
        netVatDeposited: mushakReturn.netVatPayableToTreasuryBdt,
      },
      reconciliation: {
        netTaxPayableToNBR: calc.netTaxPayableToNBRBdt,
        excessAitCarriedForward: calc.excessAitRefundableCarryForwardBdt,
        sha256Digest: calc.computationHash,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Returns high-level corporate tax dashboard summary metrics.
   */
  public getSummaryMetrics(): CorporateTaxSummaryMetrics {
    const dummyReq: CorporateTaxCalculationRequest = {
      tinNumber: "789123456789",
      companyName: "Shothik Technologies Bangladesh Ltd.",
      assessmentYear: "2026-2027",
      incomeYear: "2025-2026",
      entityType: "one_person_company",
      isCashlessCompliant: true,
      grossTurnoverBdt: 18500000,
      grossRevenueReceiptsBdt: 18500000,
      allowableBusinessExpensesBdt: 13200000,
      depreciationAllowanceBdt: 850000,
    };

    const calc = this.calculateCorporateTax(dummyReq);
    const mushak = this.getMushak91Return();

    return {
      currentAssessmentYear: "2026-2027",
      totalAnnualTurnoverBdt: calc.grossReceiptsBdt,
      estimatedNetProfitBdt: calc.netTaxableProfitBdt,
      corporateTaxLiabilityBdt: calc.grossCorporateTaxLiabilityBdt,
      totalAitDeductedAtSourceBdt: calc.totalAitCreditedBdt,
      netFinalTaxPayableBdt: calc.netTaxPayableToNBRBdt,
      monthlyVatPayableAverageBdt: mushak.netVatPayableToTreasuryBdt,
      mushak91Status: "compliant",
    };
  }

  private seedDefaultAitLedger() {
    this.aitLedger = [
      {
        id: "AIT-001",
        section: "sec_89_supply_goods",
        challanOrCertificateNo: "VDS-CHAL-9921",
        deductingAuthority: "Apex Enterprises Ltd.",
        transactionDate: "2026-08-12",
        baseTransactionAmountBdt: 2400000,
        withholdingRatePercent: 5.0,
        aitDeductedAmountBdt: 120000,
        bankDepositChallanNo: "TR-CH-551029",
        status: "verified",
        createdAt: new Date().toISOString(),
      },
      {
        id: "AIT-002",
        section: "sec_86_services",
        challanOrCertificateNo: "AIT-SRV-4412",
        deductingAuthority: "Grameen Digital PLC",
        transactionDate: "2026-08-25",
        baseTransactionAmountBdt: 1500000,
        withholdingRatePercent: 10.0,
        aitDeductedAmountBdt: 150000,
        bankDepositChallanNo: "TR-CH-883910",
        status: "verified",
        createdAt: new Date().toISOString(),
      },
      {
        id: "AIT-003",
        section: "sec_123_export_proceeds",
        challanOrCertificateNo: "SWIFT-EXP-7721",
        deductingAuthority: "Eastern Bank PLC (Principal Branch)",
        transactionDate: "2026-09-05",
        baseTransactionAmountBdt: 3800000,
        withholdingRatePercent: 1.0,
        aitDeductedAmountBdt: 38000,
        bankDepositChallanNo: "TR-CH-994411",
        status: "verified",
        createdAt: new Date().toISOString(),
      },
    ];
  }

  private seedDefaultMushakReturn() {
    this.getMushak91Return("2026-09");
  }
}

export const corporateTaxEngine = new CorporateTaxEngine();
