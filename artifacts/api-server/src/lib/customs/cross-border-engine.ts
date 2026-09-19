/**
 * Shothik Cross-Border Sourcing & Bangladesh Customs Declaration Engine
 * Governing Standard: Bangladesh Customs Act 2023 & NBR First Schedule Tariff
 */

export interface HsCodeEntry {
  hsCode: string;
  category: string;
  description: string;
  cdRate: number; // Customs Duty (0 - 0.25)
  rdRate: number; // Regulatory Duty (0 - 0.03)
  sdRate: number; // Supplementary Duty (0 - 1.00)
  vatRate: number; // Value Added Tax (0.15 standard)
  aitRate: number; // Advance Income Tax (0.05 standard)
  atRate: number; // Advance Tax (0.05 standard)
  regulatoryNocRequired?: string;
  minimumTariffValueUsdPerKg?: number;
}

export interface LandedCostInput {
  productTitle: string;
  sourcePlatform?: "1688" | "taobao" | "aliexpress" | "direct_factory" | "other";
  sourceUrl?: string;
  currency: "USD" | "CNY" | "EUR" | "BDT";
  unitPrice: number;
  quantity: number;
  totalWeightKg: number;
  shippingMethod: "air_express" | "air_cargo" | "sea_freight_lcl" | "sea_freight_fcl";
  hsCode: string;
  portOfEntry?: "chittagong_seaport" | "dhaka_airport_cargo" | "benapole_land_port" | "mongla_seaport";
  importerBin?: string;
}

export interface DutyBreakdown {
  fobValueBdt: number;
  freightBdt: number;
  insuranceBdt: number;
  assessableValueBdt: number;
  customsDutyBdt: number;
  regulatoryDutyBdt: number;
  supplementaryDutyBdt: number;
  vatBdt: number;
  aitBdt: number;
  advanceTaxBdt: number;
  totalDutyAndTaxBdt: number;
  portHandlingAndClearingBdt: number;
  totalLandedCostBdt: number;
  unitLandedCostBdt: number;
  effectiveTaxRatePercent: number;
}

export interface LandedCostResult {
  input: LandedCostInput;
  hsCodeDetails: HsCodeEntry;
  exchangeRateUsed: {
    currency: string;
    rateToBdt: number;
  };
  dutyBreakdown: DutyBreakdown;
  regulatoryWarnings: string[];
  suggestedRetailPriceBdt: {
    margin25Percent: number;
    margin40Percent: number;
    margin60Percent: number;
  };
  calculatedAt: string;
}

export interface CfClearingBrief {
  briefId: string;
  importerBin: string;
  portOfEntry: string;
  consigneeName: string;
  hsCode: string;
  goodsDescription: string;
  quantity: number;
  grossWeightKg: number;
  declaredCurrency: string;
  fobValueDeclared: number;
  assessableValueBdt: number;
  estimatedDutyBdt: number;
  requiredDocuments: string[];
  specialInstructions: string[];
  issuedAt: string;
}

export class CrossBorderCustomsEngine {
  private static readonly EXCHANGE_RATES: Record<string, number> = {
    USD: 122.5,
    CNY: 17.2,
    EUR: 133.0,
    BDT: 1.0,
  };

  private static readonly HS_CODE_CATALOG: HsCodeEntry[] = [
    {
      hsCode: "8517.13.00",
      category: "Consumer Electronics",
      description: "Smartphones and cellular network mobile handsets",
      cdRate: 0.25,
      rdRate: 0.03,
      sdRate: 0.0,
      vatRate: 0.15,
      aitRate: 0.05,
      atRate: 0.05,
      regulatoryNocRequired: "BTRC Import Permission & IMEI White-Listing NOC",
    },
    {
      hsCode: "8518.30.00",
      category: "Consumer Electronics",
      description: "TWS Earbuds, Bluetooth Headphones, and Earphones",
      cdRate: 0.25,
      rdRate: 0.03,
      sdRate: 0.2,
      vatRate: 0.15,
      aitRate: 0.05,
      atRate: 0.05,
      regulatoryNocRequired: "BTRC Radio Frequency Equipment Type Approval",
    },
    {
      hsCode: "8504.40.90",
      category: "Mobile Accessories",
      description: "Fast GaN Wall Chargers, Multi-port Adapters and Power Banks",
      cdRate: 0.15,
      rdRate: 0.0,
      sdRate: 0.0,
      vatRate: 0.15,
      aitRate: 0.05,
      atRate: 0.05,
      regulatoryNocRequired: "BSTI Quality Clearance Certificate (BDS IEC Standard)",
    },
    {
      hsCode: "6109.10.00",
      category: "Apparel & Textiles",
      description: "Cotton T-Shirts, Knitted Polos, and Casual Tops",
      cdRate: 0.25,
      rdRate: 0.03,
      sdRate: 0.45,
      vatRate: 0.15,
      aitRate: 0.05,
      atRate: 0.05,
      minimumTariffValueUsdPerKg: 4.5,
    },
    {
      hsCode: "3304.99.00",
      category: "Beauty & Cosmetics",
      description: "Skincare Serums, Facial Creams, and Sunscreen Lotions",
      cdRate: 0.25,
      rdRate: 0.03,
      sdRate: 0.6,
      vatRate: 0.15,
      aitRate: 0.05,
      atRate: 0.05,
      regulatoryNocRequired: "BSTI Mandatory Test Certificate & DGDA Formulation NOC",
    },
    {
      hsCode: "9503.00.90",
      category: "Toys & Kids",
      description: "Educational STEM Kits, Building Blocks, and Electronic Toys",
      cdRate: 0.25,
      rdRate: 0.03,
      sdRate: 0.2,
      vatRate: 0.15,
      aitRate: 0.05,
      atRate: 0.05,
      regulatoryNocRequired: "Non-Toxic Material Declaration & Lead-Free Compliance",
    },
    {
      hsCode: "8471.30.00",
      category: "Computing",
      description: "Laptops, Portable Data Processing Tablets and Sub-Notebooks",
      cdRate: 0.05,
      rdRate: 0.0,
      sdRate: 0.0,
      vatRate: 0.15,
      aitRate: 0.05,
      atRate: 0.05,
      regulatoryNocRequired: "Special ICT Concessionary Duty Tier (No SD/RD)",
    },
    {
      hsCode: "9004.10.00",
      category: "Fashion Accessories",
      description: "Polarized Sunglasses and Optical Spectacle Frames",
      cdRate: 0.25,
      rdRate: 0.03,
      sdRate: 0.2,
      vatRate: 0.15,
      aitRate: 0.05,
      atRate: 0.05,
    },
    {
      hsCode: "3924.10.00",
      category: "Home & Kitchen",
      description: "Plastic Tableware, Kitchen Storage Containers, and Bento Boxes",
      cdRate: 0.25,
      rdRate: 0.03,
      sdRate: 0.2,
      vatRate: 0.15,
      aitRate: 0.05,
      atRate: 0.05,
      minimumTariffValueUsdPerKg: 3.0,
    },
  ];

  public static getExchangeRates(): Record<string, number> {
    return { ...this.EXCHANGE_RATES };
  }

  public static getHsCodeCatalog(query?: string): HsCodeEntry[] {
    if (!query) return [...this.HS_CODE_CATALOG];
    const q = query.toLowerCase().trim();
    return this.HS_CODE_CATALOG.filter(
      (item) =>
        item.hsCode.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }

  public static getHsCode(hsCode: string): HsCodeEntry {
    const found = this.HS_CODE_CATALOG.find((h) => h.hsCode === hsCode);
    if (found) return found;

    // Default fallback general consumer goods tariff
    return {
      hsCode: hsCode || "9999.99.99",
      category: "General Merchandise",
      description: "General Commercial Import Goods (Standard Tariff)",
      cdRate: 0.25,
      rdRate: 0.03,
      sdRate: 0.2,
      vatRate: 0.15,
      aitRate: 0.05,
      atRate: 0.05,
    };
  }

  public static calculateLandedCost(input: LandedCostInput): LandedCostResult {
    const rateToBdt = this.EXCHANGE_RATES[input.currency] || 122.5;
    const hsDetails = this.getHsCode(input.hsCode);

    // 1. Calculate FOB Value in BDT
    const totalFobDeclared = input.unitPrice * input.quantity;
    const fobValueBdt = Math.round(totalFobDeclared * rateToBdt);

    // 2. Calculate Freight in BDT based on shipping method & weight
    let freightUsdPerKg = 8.5; // air express default
    if (input.shippingMethod === "air_cargo") freightUsdPerKg = 5.2;
    if (input.shippingMethod === "sea_freight_lcl") freightUsdPerKg = 1.2;
    if (input.shippingMethod === "sea_freight_fcl") freightUsdPerKg = 0.6;

    const freightBdt = Math.round(input.totalWeightKg * freightUsdPerKg * this.EXCHANGE_RATES.USD);

    // 3. Insurance (Standard 1% of FOB + Freight per NBR statutory rules)
    const insuranceBdt = Math.round((fobValueBdt + freightBdt) * 0.01);

    // 4. Assessable Value (AV) = FOB + Freight + Insurance
    const assessableValueBdt = fobValueBdt + freightBdt + insuranceBdt;

    // 5. Statutory Duty Cascade (Bangladesh Customs Act 2023)
    const cdBdt = Math.round(assessableValueBdt * hsDetails.cdRate);
    const rdBdt = Math.round(assessableValueBdt * hsDetails.rdRate);

    const baseForSd = assessableValueBdt + cdBdt + rdBdt;
    const sdBdt = Math.round(baseForSd * hsDetails.sdRate);

    const baseForVatAndAt = baseForSd + sdBdt;
    const vatBdt = Math.round(baseForVatAndAt * hsDetails.vatRate);
    const aitBdt = Math.round(assessableValueBdt * hsDetails.aitRate);
    const atBdt = Math.round(baseForVatAndAt * hsDetails.atRate);

    const totalDutyAndTaxBdt = cdBdt + rdBdt + sdBdt + vatBdt + aitBdt + atBdt;

    // 6. Port Handling, Demurrage Buffer & C&F Agent Fee
    let portHandlingBdt = 3500; // Baseline C&F documentation
    if (input.portOfEntry === "chittagong_seaport") portHandlingBdt += 4500;
    if (input.totalWeightKg > 50) portHandlingBdt += Math.round(input.totalWeightKg * 15);

    const totalLandedCostBdt = assessableValueBdt + totalDutyAndTaxBdt + portHandlingBdt;
    const unitLandedCostBdt = Math.round((totalLandedCostBdt / Math.max(1, input.quantity)) * 100) / 100;
    const effectiveTaxRatePercent = Math.round((totalDutyAndTaxBdt / assessableValueBdt) * 10000) / 100;

    const warnings: string[] = [];
    if (hsDetails.regulatoryNocRequired) {
      warnings.push(`[Regulatory Requirement]: ${hsDetails.regulatoryNocRequired}`);
    }
    if (hsDetails.minimumTariffValueUsdPerKg) {
      warnings.push(
        `[NBR Tariff Alert]: Minimum Assessable Value floor is $${hsDetails.minimumTariffValueUsdPerKg}/kg. Ensure invoice value meets or exceeds this floor.`
      );
    }
    if (totalLandedCostBdt >= 500000) {
      warnings.push(
        `[High-Value Import]: Total landed cost exceeds ৳5,00,000. Commercial Letter of Credit (LC) or Open Account with Authorized Dealer (AD) Bank is statutory.`
      );
    }

    return {
      input,
      hsCodeDetails: hsDetails,
      exchangeRateUsed: {
        currency: input.currency,
        rateToBdt,
      },
      dutyBreakdown: {
        fobValueBdt,
        freightBdt,
        insuranceBdt,
        assessableValueBdt,
        customsDutyBdt: cdBdt,
        regulatoryDutyBdt: rdBdt,
        supplementaryDutyBdt: sdBdt,
        vatBdt,
        aitBdt,
        advanceTaxBdt: atBdt,
        totalDutyAndTaxBdt,
        portHandlingAndClearingBdt: portHandlingBdt,
        totalLandedCostBdt,
        unitLandedCostBdt,
        effectiveTaxRatePercent,
      },
      regulatoryWarnings: warnings,
      suggestedRetailPriceBdt: {
        margin25Percent: Math.round(unitLandedCostBdt * 1.25),
        margin40Percent: Math.round(unitLandedCostBdt * 1.4),
        margin60Percent: Math.round(unitLandedCostBdt * 1.6),
      },
      calculatedAt: new Date().toISOString(),
    };
  }

  public static generateCfClearingBrief(
    result: LandedCostResult,
    consigneeName: string = "Shothik Merchant Enterprises"
  ): CfClearingBrief {
    const briefId = `CF_BRIEF_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const port = result.input.portOfEntry || "dhaka_airport_cargo";

    const requiredDocs: string[] = [
      "Commercial Invoice (Stamped & Signed by Supplier)",
      "Packing List with Gross & Net Weight Breakdown",
      "Airway Bill (AWB) or Bill of Lading (B/L)",
      "Importer 13-Digit Business Identification Number (BIN) Certificate",
      "NBR e-TIN Certificate",
    ];

    if (result.hsCodeDetails.regulatoryNocRequired) {
      requiredDocs.push(result.hsCodeDetails.regulatoryNocRequired);
    }

    const specialInstructions: string[] = [
      `Submit Bill of Entry (B/E) under HS Code: ${result.hsCodeDetails.hsCode}`,
      `Declare Assessable Value target: ৳${result.dutyBreakdown.assessableValueBdt.toLocaleString()}`,
      `Estimated Statutory Duty & Taxes: ৳${result.dutyBreakdown.totalDutyAndTaxBdt.toLocaleString()}`,
      "Ensure physical tally with packing list before customs physical examination (P/E).",
      "Notify consignee immediately upon customs assessment and payment challan generation.",
    ];

    return {
      briefId,
      importerBin: result.input.importerBin || "001234567-0101",
      portOfEntry: port.replace(/_/g, " ").toUpperCase(),
      consigneeName,
      hsCode: result.hsCodeDetails.hsCode,
      goodsDescription: `${result.input.productTitle} (${result.hsCodeDetails.description})`,
      quantity: result.input.quantity,
      grossWeightKg: result.input.totalWeightKg,
      declaredCurrency: result.input.currency,
      fobValueDeclared: result.input.unitPrice * result.input.quantity,
      assessableValueBdt: result.dutyBreakdown.assessableValueBdt,
      estimatedDutyBdt: result.dutyBreakdown.totalDutyAndTaxBdt,
      requiredDocuments: requiredDocs,
      specialInstructions,
      issuedAt: new Date().toISOString(),
    };
  }
}
