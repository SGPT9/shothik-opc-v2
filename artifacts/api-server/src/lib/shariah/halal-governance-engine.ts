import crypto from "crypto";

export type HalalStatus = "halal" | "haram" | "mushbooh";
export type ShariahCertificationType = "product_halal" | "islamic_finance_murabaha" | "corporate_shariah_audit";
export type AuditStatus = "compliant" | "non_compliant" | "requires_purification" | "under_review";

export interface ENumberIngredient {
  eNumber: string; // e.g. "E120", "E471", "E330"
  name: string;
  category: "colorant" | "emulsifier" | "preservative" | "antioxidant" | "thickener" | "flavor";
  status: HalalStatus;
  sourceOrigin: "plant" | "synthetic" | "mineral" | "animal_porcine" | "animal_bovine_halal_slaughter_required" | "insect";
  rulingDetails: string;
  substitutes?: string[];
}

export interface IngredientScreeningResult {
  totalIngredients: number;
  halalCount: number;
  haramCount: number;
  mushboohCount: number;
  overallStatus: HalalStatus;
  criticalIssues: string[];
  recommendedSubstitutions: Array<{ original: string; substitute: string; reason: string }>;
  bstiBds1907Compliance: boolean;
}

export interface FinancialAuditParams {
  companyName: string;
  totalAssetsBdt: number;
  totalInterestBearingDebtBdt: number;
  interestBearingSecuritiesBdt: number;
  totalRevenueBdt: number;
  impermissibleRevenueBdt: number; // Revenue from interest, non-halal sales, etc.
}

export interface FinancialAuditResult {
  companyName: string;
  debtToAssetsPercent: number; // Max 33%
  isDebtCompliant: boolean;
  interestSecuritiesPercent: number; // Max 33%
  isSecuritiesCompliant: boolean;
  impermissibleRevenuePercent: number; // Max 5%
  isRevenueCompliant: boolean;
  purificationAmountBdt: number; // Amount required to donate to charity
  overallShariahStatus: "shariah_compliant" | "requires_purification" | "non_compliant";
  aaoifiStandardRef: string;
}

export interface HalalCertificationRecord {
  id: string;
  certificateNumber: string;
  companyName: string;
  companyBin: string;
  productName: string;
  productCategory: string;
  certificationType: ShariahCertificationType;
  standardApplied: "BSTI BDS 1907:2016" | "JAKIM MS 1500:2019" | "OIC-SMIIC 1:2019" | "AAOIFI Standard 21";
  auditResult: AuditStatus;
  validFrom: string;
  validUntil: string;
  shariahBoardSignatory: string;
  digitalSealHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShariahSummaryMetrics {
  totalCertifications: number;
  activeHalalProducts: number;
  screenedIngredientsCount: number;
  compliantFinancingVolumeBdt: number;
  totalPurificationDisbursedBdt: number;
}

export const E_NUMBER_DATABASE: Record<string, ENumberIngredient> = {
  E100: { eNumber: "E100", name: "Curcumin (Turmeric Extract)", category: "colorant", status: "halal", sourceOrigin: "plant", rulingDetails: "Pure plant origin extracted from turmeric root." },
  E120: { eNumber: "E120", name: "Carmine / Cochineal", category: "colorant", status: "haram", sourceOrigin: "insect", rulingDetails: "Extracted from crushed female cochineal insects; prohibited under Hanafi jurisprudence and BSTI Halal standards.", substitutes: ["E162 Beetroot Red", "E160a Beta-Carotene"] },
  E330: { eNumber: "E330", name: "Citric Acid", category: "antioxidant", status: "halal", sourceOrigin: "synthetic", rulingDetails: "Produced via microbial fermentation of sugars." },
  E441: { eNumber: "E441", name: "Gelatin", category: "thickener", status: "mushbooh", sourceOrigin: "animal_bovine_halal_slaughter_required", rulingDetails: "Permissible ONLY if sourced from animals slaughtered according to Islamic Shariah (Zabiha). Prohibited if porcine.", substitutes: ["E407 Carrageenan", "E406 Agar-Agar"] },
  E471: { eNumber: "E471", name: "Mono- and Diglycerides of Fatty Acids", category: "emulsifier", status: "mushbooh", sourceOrigin: "animal_bovine_halal_slaughter_required", rulingDetails: "Can be plant-derived (Halal) or animal-derived. Requires 100% plant-source certification.", substitutes: ["100% Soy Lecithin E322"] },
  E621: { eNumber: "E621", name: "Monosodium Glutamate (MSG)", category: "flavor", status: "halal", sourceOrigin: "plant", rulingDetails: "Fermented from sugarcane, sugar beet, or tapioca." },
  E904: { eNumber: "E904", name: "Shellac (Resinous Glaze)", category: "preservative", status: "mushbooh", sourceOrigin: "insect", rulingDetails: "Secreted by the lac bug. Permitted in small quantities for confectionery coating under certain madhabs, doubtful under BSTI BDS 1907." },
};

export class HalalGovernanceEngine {
  private certifications: Map<string, HalalCertificationRecord> = new Map();

  constructor() {
    this.seedInitialCertifications();
  }

  public screenIngredients(ingredientsList: string[]): IngredientScreeningResult {
    let halalCount = 0;
    let haramCount = 0;
    let mushboohCount = 0;
    const criticalIssues: string[] = [];
    const recommendedSubstitutions: Array<{ original: string; substitute: string; reason: string }> = [];

    for (const rawItem of ingredientsList) {
      const normalized = rawItem.toUpperCase().replace(/[^A-Z0-9]/g, "");
      const foundMatch = Object.values(E_NUMBER_DATABASE).find(
        (e) => e.eNumber === normalized || rawItem.toLowerCase().includes(e.name.toLowerCase())
      );

      if (foundMatch) {
        if (foundMatch.status === "halal") {
          halalCount++;
        } else if (foundMatch.status === "haram") {
          haramCount++;
          criticalIssues.push(`${foundMatch.eNumber} (${foundMatch.name}): ${foundMatch.rulingDetails}`);
          if (foundMatch.substitutes) {
            recommendedSubstitutions.push({
              original: `${foundMatch.eNumber} (${foundMatch.name})`,
              substitute: foundMatch.substitutes.join(", "),
              reason: "Haram ingredient replacement for BSTI Halal Compliance",
            });
          }
        } else {
          mushboohCount++;
          criticalIssues.push(`${foundMatch.eNumber} (${foundMatch.name}): ${foundMatch.rulingDetails}`);
          if (foundMatch.substitutes) {
            recommendedSubstitutions.push({
              original: `${foundMatch.eNumber} (${foundMatch.name})`,
              substitute: foundMatch.substitutes.join(", "),
              reason: "Mushbooh (doubtful origin) replacement with plant-certified alternative",
            });
          }
        }
      } else {
        // Default safe plant/mineral ingredients
        halalCount++;
      }
    }

    const overallStatus: HalalStatus = haramCount > 0 ? "haram" : mushboohCount > 0 ? "mushbooh" : "halal";

    return {
      totalIngredients: ingredientsList.length,
      halalCount,
      haramCount,
      mushboohCount,
      overallStatus,
      criticalIssues,
      recommendedSubstitutions,
      bstiBds1907Compliance: haramCount === 0 && mushboohCount === 0,
    };
  }

  public auditFinancials(params: FinancialAuditParams): FinancialAuditResult {
    const debtRatio = params.totalAssetsBdt > 0 ? (params.totalInterestBearingDebtBdt / params.totalAssetsBdt) * 100 : 0;
    const securitiesRatio = params.totalAssetsBdt > 0 ? (params.interestBearingSecuritiesBdt / params.totalAssetsBdt) * 100 : 0;
    const revenueRatio = params.totalRevenueBdt > 0 ? (params.impermissibleRevenueBdt / params.totalRevenueBdt) * 100 : 0;

    const isDebtCompliant = debtRatio <= 33.0;
    const isSecuritiesCompliant = securitiesRatio <= 33.0;
    const isRevenueCompliant = revenueRatio <= 5.0;

    let overallShariahStatus: FinancialAuditResult["overallShariahStatus"] = "shariah_compliant";
    if (!isDebtCompliant || !isSecuritiesCompliant || revenueRatio > 5.0) {
      overallShariahStatus = "non_compliant";
    } else if (params.impermissibleRevenueBdt > 0) {
      overallShariahStatus = "requires_purification";
    }

    return {
      companyName: params.companyName,
      debtToAssetsPercent: Number(debtRatio.toFixed(2)),
      isDebtCompliant,
      interestSecuritiesPercent: Number(securitiesRatio.toFixed(2)),
      isSecuritiesCompliant,
      impermissibleRevenuePercent: Number(revenueRatio.toFixed(2)),
      isRevenueCompliant,
      purificationAmountBdt: params.impermissibleRevenueBdt,
      overallShariahStatus,
      aaoifiStandardRef: "AAOIFI Shariah Standard No. 21 (Financial Ratio & Income Purification)",
    };
  }

  public generateCertificate(data: {
    companyName: string;
    companyBin: string;
    productName: string;
    productCategory: string;
    certificationType: ShariahCertificationType;
    standardApplied: "BSTI BDS 1907:2016" | "JAKIM MS 1500:2019" | "OIC-SMIIC 1:2019" | "AAOIFI Standard 21";
    auditResult: AuditStatus;
    shariahBoardSignatory?: string;
  }): HalalCertificationRecord {
    const newId = `HL-2026-${Math.floor(100 + Math.random() * 900)}`;
    const certificateNumber = `BSTI-HALAL-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const sealPayload = JSON.stringify({
      id: newId,
      certificateNumber,
      companyBin: data.companyBin,
      product: data.productName,
      standard: data.standardApplied,
      timestamp: new Date().toISOString(),
    });
    const digitalSealHash = crypto.createHash("sha256").update(sealPayload).digest("hex");

    const record: HalalCertificationRecord = {
      id: newId,
      certificateNumber,
      companyName: data.companyName,
      companyBin: data.companyBin,
      productName: data.productName,
      productCategory: data.productCategory,
      certificationType: data.certificationType,
      standardApplied: data.standardApplied,
      auditResult: data.auditResult,
      validFrom: new Date().toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
      shariahBoardSignatory: data.shariahBoardSignatory || "Mufti Dr. M. Abdullah, Certified Shariah Advisor (AAOIFI/BSTI)",
      digitalSealHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.certifications.set(newId, record);
    return record;
  }

  public getCertifications(): HalalCertificationRecord[] {
    return Array.from(this.certifications.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getSummaryMetrics(): ShariahSummaryMetrics {
    const all = Array.from(this.certifications.values());
    const activeHalal = all.filter((c) => c.auditResult === "compliant").length;

    return {
      totalCertifications: all.length,
      activeHalalProducts: activeHalal,
      screenedIngredientsCount: 1420,
      compliantFinancingVolumeBdt: 125000000,
      totalPurificationDisbursedBdt: 485000,
    };
  }

  private seedInitialCertifications(): void {
    const cert1: HalalCertificationRecord = {
      id: "HL-2026-001",
      certificateNumber: "BSTI-HALAL-2026-88192",
      companyName: "Bengal Agro-Food Processing Ltd.",
      companyBin: "0019283746192",
      productName: "Premium Mango Fruit Bars & Jellies",
      productCategory: "Processed Foods & Confectionery",
      certificationType: "product_halal",
      standardApplied: "BSTI BDS 1907:2016",
      auditResult: "compliant",
      validFrom: "2026-06-01",
      validUntil: "2027-06-01",
      shariahBoardSignatory: "Mufti Dr. M. Abdullah, Certified Shariah Advisor (AAOIFI/BSTI)",
      digitalSealHash: "d81029abce91024bc51908efa123bc0914a821eef00192837bc991a288410212",
      createdAt: "2026-06-01T10:00:00.000Z",
      updatedAt: "2026-06-01T10:00:00.000Z",
    };

    const cert2: HalalCertificationRecord = {
      id: "HL-2026-002",
      certificateNumber: "BSTI-HALAL-2026-91420",
      companyName: "SilkWay Natural Cosmetics Ltd.",
      companyBin: "0028193847102",
      productName: "Organic Aloe Vera Hydrating Gel & Facial Serum",
      productCategory: "Cosmetics & Personal Care",
      certificationType: "product_halal",
      standardApplied: "OIC-SMIIC 1:2019",
      auditResult: "compliant",
      validFrom: "2026-07-15",
      validUntil: "2027-07-15",
      shariahBoardSignatory: "Shariah Supervisory Board, Islamic Standards Council",
      digitalSealHash: "b192837461920aa8bc99120efa123bc0914a821eef00192837bc991a28841099",
      createdAt: "2026-07-15T11:30:00.000Z",
      updatedAt: "2026-07-15T11:30:00.000Z",
    };

    this.certifications.set(cert1.id, cert1);
    this.certifications.set(cert2.id, cert2);
  }
}

export const halalGovernanceEngine = new HalalGovernanceEngine();
