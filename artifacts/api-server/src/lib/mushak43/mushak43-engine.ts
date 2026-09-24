import { createHash } from 'crypto';

export interface RawMaterialInput {
  materialId: string;
  name: string;
  banglaName: string;
  hsCode: string;
  unitOfMeasure: 'kg' | 'liter' | 'yard' | 'meter' | 'piece' | 'gram' | 'ml';
  grossConsumptionPerUnit: number;
  standardWastagePercent: number; // e.g. 5%
  netEffectiveConsumption: number; // gross * (1 - wastage/100)
  unitCostBdt: number;
  totalMaterialCostBdt: number; // gross * unitCostBdt
}

export interface ValueAdditionBreakdown {
  rawMaterialsCostBdt: number;
  directLaborCostBdt: number;
  utilitiesEnergyCostBdt: number;
  packagingMaterialCostBdt: number;
  factoryOverheadCostBdt: number;
  administrativeOverheadCostBdt: number;
  financeCostBdt: number;
  totalCostOfProductionBdt: number;
  profitMarginPercent: number;
  profitMarginBdt: number;
  declaredSellingPriceExVatBdt: number;
  vatRatePercent: number; // 15, 7.5, 5, 0
  vatAmountBdt: number;
  finalSellingPriceIncVatBdt: number;
  valueAdditionPercent: number; // ((SellingPrice - RawMaterialsCost) / SellingPrice) * 100
}

export interface Mushak43Declaration {
  declarationId: string;
  formNumber: 'মূসক-৪.৩';
  finishedProductSku: string;
  finishedProductName: string;
  finishedProductBanglaName: string;
  finishedProductHsCode: string;
  unitOfSupply: string;
  manufacturerBin: string; // 13-digit BIN
  manufacturerName: string;
  factoryAddress: string;
  divisionalVatOffice: string;
  rawMaterials: RawMaterialInput[];
  costingBreakdown: ValueAdditionBreakdown;
  firstSupplyEffectiveDate: string;
  submissionDate: string;
  declaredBy: string;
  designation: string;
  status: 'draft' | 'submitted_to_vat_office' | 'accepted_by_nbr' | 'revision_required';
  revisionReason?: string;
  sha256Seal: string;
  createdAt: string;
}

export interface BatchVarianceAudit {
  auditId: string;
  declarationId: string;
  batchNumber: string;
  actualUnitsProduced: number;
  standardExpectedCostBdt: number;
  actualRecordedCostBdt: number;
  varianceBdt: number; // actual - standard
  variancePercent: number;
  thresholdExceeded: boolean; // > 7.5% fluctuation
  actionRequired: 'none' | 'refile_mushak_4_3_declaration' | 'investigate_wastage_leakage';
  auditedAt: string;
}

export const PREDEFINED_MUSHAK43_TEMPLATES = [
  {
    templateId: 'TPL-BAKERY-01',
    productName: 'Butter Toast Biscuit 250g Family Pack',
    banglaName: 'বাটার টোস্ট বিস্কুট ২৫০গ্রাম',
    hsCode: '1905.31.00',
    unitOfSupply: 'Pack (250g)',
    rawMaterials: [
      {
        materialId: 'MAT-WHEAT-01',
        name: 'Refined Wheat Flour (Maida)',
        banglaName: 'ময়দা',
        hsCode: '1101.00.10',
        unitOfMeasure: 'gram' as const,
        grossConsumptionPerUnit: 200,
        standardWastagePercent: 3.5,
        unitCostBdt: 0.065
      },
      {
        materialId: 'MAT-SUGAR-01',
        name: 'Refined Sugar',
        banglaName: 'চিনি',
        hsCode: '1701.99.00',
        unitOfMeasure: 'gram' as const,
        grossConsumptionPerUnit: 45,
        standardWastagePercent: 2.0,
        unitCostBdt: 0.14
      },
      {
        materialId: 'MAT-BUTTER-01',
        name: 'Bakery Butter & Vegetable Fat',
        banglaName: 'বাটার ও উদ্ভিজ্জ ফ্যাট',
        hsCode: '1517.90.00',
        unitOfMeasure: 'gram' as const,
        grossConsumptionPerUnit: 35,
        standardWastagePercent: 4.0,
        unitCostBdt: 0.38
      }
    ],
    overheads: {
      directLaborCostBdt: 4.5,
      utilitiesEnergyCostBdt: 3.0,
      packagingMaterialCostBdt: 5.5,
      factoryOverheadCostBdt: 2.5,
      administrativeOverheadCostBdt: 1.5,
      financeCostBdt: 1.0,
      profitMarginPercent: 18,
      vatRatePercent: 15
    }
  },
  {
    templateId: 'TPL-GARMENT-01',
    productName: '100% Combed Cotton Knit Polo Shirt',
    banglaName: '১০০% সুতি কটন নিট পোলো শার্ট',
    hsCode: '6105.10.00',
    unitOfSupply: 'Piece',
    rawMaterials: [
      {
        materialId: 'MAT-FABRIC-01',
        name: 'Single Jersey 220 GSM Cotton Fabric',
        banglaName: 'সিংগেল জার্সি কটন ফেব্রিক',
        hsCode: '6006.22.00',
        unitOfMeasure: 'yard' as const,
        grossConsumptionPerUnit: 1.4,
        standardWastagePercent: 8.5,
        unitCostBdt: 180
      },
      {
        materialId: 'MAT-COLLAR-01',
        name: 'Jacquard Rib Collar & Cuff Set',
        banglaName: 'কলার ও কাফ সেট',
        hsCode: '6006.24.00',
        unitOfMeasure: 'piece' as const,
        grossConsumptionPerUnit: 1.0,
        standardWastagePercent: 2.0,
        unitCostBdt: 35
      },
      {
        materialId: 'MAT-BUTTON-01',
        name: 'Engraved Resin Buttons (3 pcs)',
        banglaName: 'রেজিন বোতাম ৩টি',
        hsCode: '9606.29.00',
        unitOfMeasure: 'piece' as const,
        grossConsumptionPerUnit: 3.0,
        standardWastagePercent: 5.0,
        unitCostBdt: 3.0
      }
    ],
    overheads: {
      directLaborCostBdt: 65,
      utilitiesEnergyCostBdt: 18,
      packagingMaterialCostBdt: 22,
      factoryOverheadCostBdt: 25,
      administrativeOverheadCostBdt: 15,
      financeCostBdt: 10,
      profitMarginPercent: 22,
      vatRatePercent: 7.5
    }
  }
];

export class Mushak43Engine {
  /**
   * Calculates BOM raw materials, wastage, overheads, value addition %, and unit selling price.
   */
  public static calculateCosting(
    rawMaterials: {
      materialId: string;
      name: string;
      banglaName: string;
      hsCode: string;
      unitOfMeasure: RawMaterialInput['unitOfMeasure'];
      grossConsumptionPerUnit: number;
      standardWastagePercent: number;
      unitCostBdt: number;
    }[],
    overheads: {
      directLaborCostBdt?: number;
      utilitiesEnergyCostBdt?: number;
      packagingMaterialCostBdt?: number;
      factoryOverheadCostBdt?: number;
      administrativeOverheadCostBdt?: number;
      financeCostBdt?: number;
      profitMarginPercent?: number;
      vatRatePercent?: number;
    } = {}
  ): {
    rawMaterials: RawMaterialInput[];
    costingBreakdown: ValueAdditionBreakdown;
  } {
    const computedMaterials: RawMaterialInput[] = rawMaterials.map((m) => {
      const wastage = Math.max(0, Math.min(50, m.standardWastagePercent));
      const netEffective = Math.round(m.grossConsumptionPerUnit * (1 - wastage / 100) * 1000) / 1000;
      const totalCost = Math.round(m.grossConsumptionPerUnit * m.unitCostBdt * 100) / 100;

      return {
        materialId: m.materialId,
        name: m.name,
        banglaName: m.banglaName,
        hsCode: m.hsCode,
        unitOfMeasure: m.unitOfMeasure,
        grossConsumptionPerUnit: m.grossConsumptionPerUnit,
        standardWastagePercent: wastage,
        netEffectiveConsumption: netEffective,
        unitCostBdt: m.unitCostBdt,
        totalMaterialCostBdt: totalCost
      };
    });

    const totalRawMaterialsCost =
      Math.round(computedMaterials.reduce((sum, m) => sum + m.totalMaterialCostBdt, 0) * 100) / 100;

    const directLabor = Number(overheads.directLaborCostBdt) || 0;
    const utilitiesEnergy = Number(overheads.utilitiesEnergyCostBdt) || 0;
    const packaging = Number(overheads.packagingMaterialCostBdt) || 0;
    const factoryOverhead = Number(overheads.factoryOverheadCostBdt) || 0;
    const adminOverhead = Number(overheads.administrativeOverheadCostBdt) || 0;
    const financeCost = Number(overheads.financeCostBdt) || 0;
    const profitMarginPercent = Number(overheads.profitMarginPercent) || 15;
    const vatRatePercent = Number(overheads.vatRatePercent) !== undefined ? Number(overheads.vatRatePercent) : 15;

    const totalCostOfProduction =
      Math.round(
        (totalRawMaterialsCost + directLabor + utilitiesEnergy + packaging + factoryOverhead + adminOverhead + financeCost) *
          100
      ) / 100;

    const profitMarginBdt = Math.round(((totalCostOfProduction * profitMarginPercent) / 100) * 100) / 100;
    const declaredSellingPriceExVat = Math.round((totalCostOfProduction + profitMarginBdt) * 100) / 100;
    const vatAmountBdt = Math.round(((declaredSellingPriceExVat * vatRatePercent) / 100) * 100) / 100;
    const finalSellingPriceIncVat = Math.round((declaredSellingPriceExVat + vatAmountBdt) * 100) / 100;

    // Statutory NBR Value Addition %: ((SellingPriceExVat - RawMaterialsCost) / SellingPriceExVat) * 100
    const valueAdditionPercent =
      declaredSellingPriceExVat > 0
        ? Math.round((((declaredSellingPriceExVat - totalRawMaterialsCost) / declaredSellingPriceExVat) * 100) * 100) / 100
        : 0;

    const costingBreakdown: ValueAdditionBreakdown = {
      rawMaterialsCostBdt: totalRawMaterialsCost,
      directLaborCostBdt: directLabor,
      utilitiesEnergyCostBdt: utilitiesEnergy,
      packagingMaterialCostBdt: packaging,
      factoryOverheadCostBdt: factoryOverhead,
      administrativeOverheadCostBdt: adminOverhead,
      financeCostBdt: financeCost,
      totalCostOfProductionBdt: totalCostOfProduction,
      profitMarginPercent,
      profitMarginBdt,
      declaredSellingPriceExVatBdt: declaredSellingPriceExVat,
      vatRatePercent,
      vatAmountBdt,
      finalSellingPriceIncVatBdt: finalSellingPriceIncVat,
      valueAdditionPercent
    };

    return {
      rawMaterials: computedMaterials,
      costingBreakdown
    };
  }

  /**
   * Generates a verified SHA-256 seal for the statutory Mushak-4.3 declaration.
   */
  public static generateDeclarationSeal(decl: Omit<Mushak43Declaration, 'sha256Seal'>): string {
    const payload = `${decl.declarationId}|${decl.manufacturerBin}|${decl.finishedProductSku}|${decl.finishedProductHsCode}|${decl.costingBreakdown.declaredSellingPriceExVatBdt}|${decl.costingBreakdown.valueAdditionPercent}|${decl.submissionDate}`;
    return createHash('sha256').update(payload).digest('hex');
  }

  /**
   * Compiles the formal Mushak-4.3 declaration structure with 13-digit BIN validation.
   */
  public static createDeclaration(input: {
    declarationId?: string;
    finishedProductSku: string;
    finishedProductName: string;
    finishedProductBanglaName: string;
    finishedProductHsCode: string;
    unitOfSupply: string;
    manufacturerBin: string;
    manufacturerName: string;
    factoryAddress: string;
    divisionalVatOffice: string;
    rawMaterials: RawMaterialInput[];
    costingBreakdown: ValueAdditionBreakdown;
    firstSupplyEffectiveDate: string;
    submissionDate?: string;
    declaredBy: string;
    designation: string;
  }): Mushak43Declaration {
    const declarationId = input.declarationId || `MUSHAK43-${Date.now().toString(36).toUpperCase()}`;
    const submissionDate = input.submissionDate || new Date().toISOString().split('T')[0];

    // Validate 13-digit BIN format
    const cleanBin = input.manufacturerBin.replace(/[^0-9]/g, '');
    if (cleanBin.length !== 13 && cleanBin.length !== 9) {
      throw new Error(`Invalid Bangladesh NBR BIN: "${input.manufacturerBin}". Must be a valid 13-digit or 9-digit BIN.`);
    }

    const draftDeclaration: Omit<Mushak43Declaration, 'sha256Seal'> = {
      declarationId,
      formNumber: 'মূসক-৪.৩',
      finishedProductSku: input.finishedProductSku,
      finishedProductName: input.finishedProductName,
      finishedProductBanglaName: input.finishedProductBanglaName,
      finishedProductHsCode: input.finishedProductHsCode,
      unitOfSupply: input.unitOfSupply,
      manufacturerBin: input.manufacturerBin,
      manufacturerName: input.manufacturerName,
      factoryAddress: input.factoryAddress,
      divisionalVatOffice: input.divisionalVatOffice,
      rawMaterials: input.rawMaterials,
      costingBreakdown: input.costingBreakdown,
      firstSupplyEffectiveDate: input.firstSupplyEffectiveDate,
      submissionDate,
      declaredBy: input.declaredBy,
      designation: input.designation,
      status: 'submitted_to_vat_office',
      createdAt: new Date().toISOString()
    };

    const sha256Seal = this.generateDeclarationSeal(draftDeclaration);

    return {
      ...draftDeclaration,
      sha256Seal
    };
  }

  /**
   * Audits actual shop-floor production batch consumption against declared Mushak-4.3 standard,
   * enforcing the statutory 7.5% cost fluctuation refiling threshold under VAT Rules 2016.
   */
  public static auditBatchVariance(
    declaration: Mushak43Declaration,
    batchNumber: string,
    actualUnitsProduced: number,
    actualTotalCostRecordedBdt: number
  ): BatchVarianceAudit {
    const standardCostPerUnit = declaration.costingBreakdown.totalCostOfProductionBdt;
    const standardExpectedCost = Math.round(standardCostPerUnit * actualUnitsProduced * 100) / 100;
    const actualRecordedCost = Math.round(actualTotalCostRecordedBdt * 100) / 100;

    const varianceBdt = Math.round((actualRecordedCost - standardExpectedCost) * 100) / 100;
    const variancePercent =
      standardExpectedCost > 0
        ? Math.round(((varianceBdt / standardExpectedCost) * 100) * 100) / 100
        : 0;

    const thresholdExceeded = Math.abs(variancePercent) >= 7.5;

    let actionRequired: BatchVarianceAudit['actionRequired'] = 'none';
    if (thresholdExceeded) {
      actionRequired = 'refile_mushak_4_3_declaration';
    } else if (variancePercent > 4.0) {
      actionRequired = 'investigate_wastage_leakage';
    }

    return {
      auditId: `AUDIT-BCH-${Date.now().toString(36).toUpperCase()}`,
      declarationId: declaration.declarationId,
      batchNumber,
      actualUnitsProduced,
      standardExpectedCostBdt: standardExpectedCost,
      actualRecordedCostBdt: actualRecordedCost,
      varianceBdt,
      variancePercent,
      thresholdExceeded,
      actionRequired,
      auditedAt: new Date().toISOString()
    };
  }
}
