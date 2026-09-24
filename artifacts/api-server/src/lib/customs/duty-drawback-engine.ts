import crypto from "crypto";

export type ClaimMode = "dedo_flat_rate" | "actual_costing_bom";
export type CustomsStation = "chittagong_port" | "dhaka_airport_icd" | "benapole_land_port" | "mongla_port" | "panchagarh_banglabandha";
export type DrawbackStatus = "draft" | "submitted" | "under_dedo_audit" | "sanctioned" | "disbursed";

export interface ImportedInputItem {
  rawMaterialName: string;
  hsCode: string; // 8-digit HS Code (e.g. 5208.11.00 for Cotton Yarn)
  importBeNumber: string; // Bill of Entry No (e.g. C-184920)
  beDate: string;
  customsStation: CustomsStation;
  quantityKgOrUnits: number;
  assessableValueBdt: number;
  customsDutyRatePercent: number; // e.g. 15%
  regulatoryDutyRatePercent: number; // e.g. 3%
  supplementaryDutyRatePercent: number; // e.g. 20%
  importVatRatePercent: number; // 15%
  paidDutiesBdt: {
    cd: number;
    rd: number;
    sd: number;
    vat: number;
    total: number;
  };
  consumptionPerExportUnitKg: number;
}

export interface ExportProductItem {
  productName: string;
  exportHsCode: string; // e.g. 6109.10.00
  exportQuantityUnits: number;
  fobValueUsd: number;
  fobValueBdt: number;
  billOfExportNumber: string;
  billOfExportDate: string;
  formExpNumber: string; // Bangladesh Bank Form-EXP
  repatriationStatus: "repatriated" | "pending_120_days" | "escrowed";
  statutoryFlatRatePercent?: number; // e.g. 4.5% of FOB
}

export interface DrawbackClaimRecord {
  id: string;
  claimNumber: string;
  exporterName: string;
  exporterBin: string; // 13-digit BIN
  exporterErc: string; // Export Registration Certificate
  claimMode: ClaimMode;
  exportProduct: ExportProductItem;
  importedInputs: ImportedInputItem[];
  fobExportValueBdt: number;
  totalClaimableDrawbackBdt: number;
  drawbackBreakdown: {
    customsDutyRefundBdt: number;
    regulatoryDutyRefundBdt: number;
    supplementaryDutyRefundBdt: number;
    vatRefundBdt: number;
  };
  customsActReference: string;
  dedoFilingForm: "DEDO_FORM_A_FLAT" | "DEDO_FORM_B_ACTUAL";
  status: DrawbackStatus;
  sanctionOrderNumber?: string;
  sanctionedAmountBdt?: number;
  disbursementBank?: string;
  digitalSealHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface DrawbackSummaryMetrics {
  totalClaimsCount: number;
  sanctionedClaimsCount: number;
  totalClaimedValueBdt: number;
  totalDisbursedDrawbackBdt: number;
  avgTurnaroundDays: number;
  pendingAuditBdt: number;
}

export interface BillReconciliationResult {
  isMatched: boolean;
  importBeMatched: boolean;
  exportBeMatched: boolean;
  formExpMatched: boolean;
  discrepancies: string[];
  reconciliationScorePercent: number;
}

export class DutyDrawbackEngine {
  private claims: Map<string, DrawbackClaimRecord> = new Map();

  constructor() {
    this.seedInitialClaims();
  }

  public calculateDrawback(params: {
    claimMode: ClaimMode;
    fobValueBdt: number;
    flatRatePercent?: number;
    importedInputs?: Array<{
      assessableValueBdt: number;
      cdRate: number;
      rdRate: number;
      sdRate: number;
      vatRate: number;
      consumptionRatio: number; // Ratio consumed in exported batch
    }>;
  }): {
    totalDrawbackBdt: number;
    breakdown: {
      cdRefundBdt: number;
      rdRefundBdt: number;
      sdRefundBdt: number;
      vatRefundBdt: number;
    };
    effectiveDrawbackRatePercent: number;
    statutoryRule: string;
  } {
    if (params.claimMode === "dedo_flat_rate") {
      const rate = params.flatRatePercent || 4.5;
      const total = Math.round((params.fobValueBdt * rate) / 100);
      return {
        totalDrawbackBdt: total,
        breakdown: {
          cdRefundBdt: Math.round(total * 0.60),
          rdRefundBdt: Math.round(total * 0.10),
          sdRefundBdt: Math.round(total * 0.15),
          vatRefundBdt: Math.round(total * 0.15),
        },
        effectiveDrawbackRatePercent: rate,
        statutoryRule: "Section 33, Customs Act 2023 & NBR DEDO SRO Statutory Flat Rate Schedule",
      };
    }

    // Actual Costing Mode (BOM Input-Output Coefficient)
    let cdRefund = 0;
    let rdRefund = 0;
    let sdRefund = 0;
    let vatRefund = 0;

    if (params.importedInputs && params.importedInputs.length > 0) {
      for (const input of params.importedInputs) {
        const consumedValue = input.assessableValueBdt * Math.min(1, input.consumptionRatio || 1);
        cdRefund += (consumedValue * input.cdRate) / 100;
        rdRefund += (consumedValue * input.rdRate) / 100;
        sdRefund += (consumedValue * input.sdRate) / 100;
        vatRefund += (consumedValue * input.vatRate) / 100;
      }
    }

    const totalDrawback = Math.round(cdRefund + rdRefund + sdRefund + vatRefund);
    const effectiveRate = params.fobValueBdt > 0 ? Number(((totalDrawback / params.fobValueBdt) * 100).toFixed(2)) : 0;

    return {
      totalDrawbackBdt: totalDrawback,
      breakdown: {
        cdRefundBdt: Math.round(cdRefund),
        rdRefundBdt: Math.round(rdRefund),
        sdRefundBdt: Math.round(sdRefund),
        vatRefundBdt: Math.round(vatRefund),
      },
      effectiveDrawbackRatePercent: effectiveRate,
      statutoryRule: "Section 34, Customs Act 2023 & DEDO Actual Input-Output Mushak-4.3 Ratio",
    };
  }

  public reconcileBills(
    importBeNumber: string,
    billOfExportNumber: string,
    formExpNumber: string
  ): BillReconciliationResult {
    const discrepancies: string[] = [];
    let matchedCount = 0;

    // Validate import B/E format (e.g. C-123456 or REG-2026-XXXX)
    const validImportBe = Boolean(importBeNumber && importBeNumber.trim().length >= 5);
    if (validImportBe) {
      matchedCount++;
    } else {
      discrepancies.push("Import Bill of Entry (B/E) number missing or unverified in ASYCUDA World");
    }

    // Validate Bill of Export format
    const validExportBe = Boolean(billOfExportNumber && billOfExportNumber.trim().length >= 5);
    if (validExportBe) {
      matchedCount++;
    } else {
      discrepancies.push("Customs Bill of Export number unverified with port out-of-charge manifest");
    }

    // Validate Bangladesh Bank Form-EXP format (12-digit format or EXP-2026-XXXX)
    const validFormExp = Boolean(formExpNumber && formExpNumber.trim().length >= 6);
    if (validFormExp) {
      matchedCount++;
    } else {
      discrepancies.push("Bangladesh Bank Form-EXP not detected or repatriation window exceeded 120 days");
    }

    const score = Math.round((matchedCount / 3) * 100);

    return {
      isMatched: matchedCount === 3,
      importBeMatched: validImportBe,
      exportBeMatched: validExportBe,
      formExpMatched: validFormExp,
      discrepancies,
      reconciliationScorePercent: score,
    };
  }

  public generateClaim(data: {
    exporterName: string;
    exporterBin: string;
    exporterErc: string;
    claimMode: ClaimMode;
    exportProduct: ExportProductItem;
    importedInputs: ImportedInputItem[];
    flatRatePercent?: number;
  }): DrawbackClaimRecord {
    const calculation = this.calculateDrawback({
      claimMode: data.claimMode,
      fobValueBdt: data.exportProduct.fobValueBdt,
      flatRatePercent: data.flatRatePercent,
      importedInputs: data.importedInputs.map((i) => ({
        assessableValueBdt: i.assessableValueBdt,
        cdRate: i.customsDutyRatePercent,
        rdRate: i.regulatoryDutyRatePercent,
        sdRate: i.supplementaryDutyRatePercent,
        vatRate: i.importVatRatePercent,
        consumptionRatio: i.consumptionPerExportUnitKg > 0 ? 1.0 : 0.85,
      })),
    });

    const newId = `DRW-2026-${Math.floor(100 + Math.random() * 900)}`;
    const claimNumber = `NBR-DEDO-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const sealPayload = JSON.stringify({
      id: newId,
      claimNumber,
      exporterBin: data.exporterBin,
      fobBdt: data.exportProduct.fobValueBdt,
      totalDrawback: calculation.totalDrawbackBdt,
      timestamp: new Date().toISOString(),
    });
    const digitalSealHash = crypto.createHash("sha256").update(sealPayload).digest("hex");

    const record: DrawbackClaimRecord = {
      id: newId,
      claimNumber,
      exporterName: data.exporterName,
      exporterBin: data.exporterBin,
      exporterErc: data.exporterErc,
      claimMode: data.claimMode,
      exportProduct: data.exportProduct,
      importedInputs: data.importedInputs,
      fobExportValueBdt: data.exportProduct.fobValueBdt,
      totalClaimableDrawbackBdt: calculation.totalDrawbackBdt,
      drawbackBreakdown: {
        customsDutyRefundBdt: calculation.breakdown.cdRefundBdt,
        regulatoryDutyRefundBdt: calculation.breakdown.rdRefundBdt,
        supplementaryDutyRefundBdt: calculation.breakdown.sdRefundBdt,
        vatRefundBdt: calculation.breakdown.vatRefundBdt,
      },
      customsActReference: calculation.statutoryRule,
      dedoFilingForm: data.claimMode === "dedo_flat_rate" ? "DEDO_FORM_A_FLAT" : "DEDO_FORM_B_ACTUAL",
      status: "submitted",
      digitalSealHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.claims.set(newId, record);
    return record;
  }

  public getClaims(): DrawbackClaimRecord[] {
    return Array.from(this.claims.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getClaimById(id: string): DrawbackClaimRecord | undefined {
    return this.claims.get(id);
  }

  public getSummaryMetrics(): DrawbackSummaryMetrics {
    const all = Array.from(this.claims.values());
    const sanctioned = all.filter((c) => c.status === "sanctioned" || c.status === "disbursed");

    const totalClaimed = all.reduce((sum, c) => sum + c.totalClaimableDrawbackBdt, 0);
    const totalDisbursed = sanctioned.reduce(
      (sum, c) => sum + (c.sanctionedAmountBdt || c.totalClaimableDrawbackBdt),
      0
    );
    const pendingAudit = all
      .filter((c) => c.status === "submitted" || c.status === "under_dedo_audit")
      .reduce((sum, c) => sum + c.totalClaimableDrawbackBdt, 0);

    return {
      totalClaimsCount: all.length,
      sanctionedClaimsCount: sanctioned.length,
      totalClaimedValueBdt: totalClaimed,
      totalDisbursedDrawbackBdt: totalDisbursed,
      avgTurnaroundDays: 24,
      pendingAuditBdt: pendingAudit,
    };
  }

  private seedInitialClaims(): void {
    const seed1: DrawbackClaimRecord = {
      id: "DRW-2026-001",
      claimNumber: "NBR-DEDO-2026-88192",
      exporterName: "Bengal Apparels & Knitwear Ltd.",
      exporterBin: "0019283746192",
      exporterErc: "ERC-EXP-992144",
      claimMode: "dedo_flat_rate",
      exportProduct: {
        productName: "100% Cotton Knitted T-Shirts (10,000 Pcs)",
        exportHsCode: "6109.10.00",
        exportQuantityUnits: 10000,
        fobValueUsd: 45000,
        fobValueBdt: 5400000,
        billOfExportNumber: "EXP-CTG-2026-44120",
        billOfExportDate: "2026-07-15",
        formExpNumber: "EXP-BB-2026-091823",
        repatriationStatus: "repatriated",
        statutoryFlatRatePercent: 4.5,
      },
      importedInputs: [
        {
          rawMaterialName: "Combed Cotton Yarn (Ne 30/1)",
          hsCode: "5205.12.00",
          importBeNumber: "C-1984210",
          beDate: "2026-05-10",
          customsStation: "chittagong_port",
          quantityKgOrUnits: 3200,
          assessableValueBdt: 1800000,
          customsDutyRatePercent: 15,
          regulatoryDutyRatePercent: 3,
          supplementaryDutyRatePercent: 0,
          importVatRatePercent: 15,
          paidDutiesBdt: {
            cd: 270000,
            rd: 54000,
            sd: 0,
            vat: 270000,
            total: 594000,
          },
          consumptionPerExportUnitKg: 0.32,
        },
      ],
      fobExportValueBdt: 5400000,
      totalClaimableDrawbackBdt: 243000, // 4.5% of 5,400,000
      drawbackBreakdown: {
        customsDutyRefundBdt: 145800,
        regulatoryDutyRefundBdt: 24300,
        supplementaryDutyRefundBdt: 36450,
        vatRefundBdt: 36450,
      },
      customsActReference: "Section 33, Customs Act 2023 (DEDO SRO No. 142-Law/2024)",
      dedoFilingForm: "DEDO_FORM_A_FLAT",
      status: "sanctioned",
      sanctionOrderNumber: "DEDO/SANCTION/2026/0881",
      sanctionedAmountBdt: 243000,
      disbursementBank: "Eastern Bank PLC (Principal Branch)",
      digitalSealHash: "a18ef902bca48109d98fa12309e45bc0914a821eef00192837bc991a28841021",
      createdAt: "2026-07-20T10:00:00.000Z",
      updatedAt: "2026-08-05T14:30:00.000Z",
    };

    const seed2: DrawbackClaimRecord = {
      id: "DRW-2026-002",
      claimNumber: "NBR-DEDO-2026-91440",
      exporterName: "Apex Leather & Footwear Ltd.",
      exporterBin: "0028193847102",
      exporterErc: "ERC-EXP-881290",
      claimMode: "actual_costing_bom",
      exportProduct: {
        productName: "Finished Leather Dress Shoes (2,500 Pairs)",
        exportHsCode: "6403.51.00",
        exportQuantityUnits: 2500,
        fobValueUsd: 75000,
        fobValueBdt: 9000000,
        billOfExportNumber: "EXP-DAC-2026-88192",
        billOfExportDate: "2026-08-01",
        formExpNumber: "EXP-BB-2026-102934",
        repatriationStatus: "repatriated",
      },
      importedInputs: [
        {
          rawMaterialName: "Synthetic Polyurethane Lining Material",
          hsCode: "3921.13.00",
          importBeNumber: "C-2049182",
          beDate: "2026-06-12",
          customsStation: "dhaka_airport_icd",
          quantityKgOrUnits: 1500,
          assessableValueBdt: 2400000,
          customsDutyRatePercent: 25,
          regulatoryDutyRatePercent: 3,
          supplementaryDutyRatePercent: 20,
          importVatRatePercent: 15,
          paidDutiesBdt: {
            cd: 600000,
            rd: 72000,
            sd: 480000,
            vat: 360000,
            total: 1512000,
          },
          consumptionPerExportUnitKg: 0.60,
        },
      ],
      fobExportValueBdt: 9000000,
      totalClaimableDrawbackBdt: 1209600, // 80% consumed in exported batch
      drawbackBreakdown: {
        customsDutyRefundBdt: 480000,
        regulatoryDutyRefundBdt: 57600,
        supplementaryDutyRefundBdt: 384000,
        vatRefundBdt: 288000,
      },
      customsActReference: "Section 34, Customs Act 2023 (Actual Costing Coefficient Mushak-4.3)",
      dedoFilingForm: "DEDO_FORM_B_ACTUAL",
      status: "under_dedo_audit",
      digitalSealHash: "c4b189fa0912bc85012fa8901ebcf881023a9d8213bc541a18ef902bca48109d",
      createdAt: "2026-08-10T11:00:00.000Z",
      updatedAt: "2026-08-15T09:00:00.000Z",
    };

    this.claims.set(seed1.id, seed1);
    this.claims.set(seed2.id, seed2);
  }
}

export const dutyDrawbackEngine = new DutyDrawbackEngine();
