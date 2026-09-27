export type PaperWeightGSM = 70 | 80 | 100 | 120 | 150;
export type BindingStyle = "perfect_binding_softcover" | "casebound_hardcover" | "saddle_stitch";

export interface BookSpecInput {
  pageCount: number;
  trimWidthMm: number; // e.g. 140mm for standard Bangla novel (Demmy 1/8) or 210mm (A4)
  trimHeightMm: number; // e.g. 215mm
  paperGSM: PaperWeightGSM;
  coverGSM: number; // e.g. 300 GSM Art Card
  bindingStyle: BindingStyle;
  bleedMarginMm?: number; // default 3mm
}

export interface BookPrintLayoutOutput {
  pageCount: number;
  leafCount: number;
  spineThicknessMm: number;
  totalCoverWidthMm: number; // Left Flap + Back + Spine + Front + Right Flap + Bleeds
  totalCoverHeightMm: number;
  bleedMarginMm: number;
  estimatedWeightGrams: number;
  recommendedSteadfastDeliveryChargeBDT: number;
  pressReadyValidation: {
    minimumPageCountMet: boolean;
    dpiRequirement: number;
    colorSpace: "CMYK";
    recommendedFontFallback: string[];
  };
}

export class NilkhetSpineCalculator {
  // Caliper multiplier per leaf (2 pages per leaf) in mm
  private static readonly CALIPER_FACTORS: Record<PaperWeightGSM, number> = {
    70: 0.09, // 70 GSM newsprint/offset
    80: 0.104, // 80 GSM standard offset (Nilkhet standard)
    100: 0.128, // 100 GSM cream / book paper
    120: 0.145, // 120 GSM heavy matte
    150: 0.175, // 150 GSM art paper
  };

  public static calculate(input: BookSpecInput): BookPrintLayoutOutput {
    if (input.pageCount < 4) {
      throw new Error("Minimum page count for printing is 4 pages.");
    }

    const leafCount = Math.ceil(input.pageCount / 2);
    const caliperFactor = this.CALIPER_FACTORS[input.paperGSM] || 0.104;
    let spineThickness = leafCount * caliperFactor;

    // Additional allowances
    if (input.bindingStyle === "casebound_hardcover") {
      spineThickness += 3.0; // 2mm greyboard wrap + hinge gap
    } else if (input.bindingStyle === "perfect_binding_softcover") {
      spineThickness += 0.5; // Glue line + cover card hinge
    } else if (input.bindingStyle === "saddle_stitch") {
      spineThickness = 0; // Wire stapled, no spine text
    }

    const bleed = input.bleedMarginMm ?? 3.0;
    const roundedSpine = Math.round(spineThickness * 10) / 10;

    // Total Cover Width = Back Cover + Spine + Front Cover + (2 * Bleed)
    const totalCoverWidth = (input.trimWidthMm * 2) + roundedSpine + (bleed * 2);
    const totalCoverHeight = input.trimHeightMm + (bleed * 2);

    // Book Weight Estimation in Grams:
    // Area per page in m2 * (GSM / 1000) * pageCount
    const areaM2 = (input.trimWidthMm / 1000) * (input.trimHeightMm / 1000);
    const innerWeightGrams = areaM2 * (input.paperGSM) * leafCount;
    const coverWeightGrams = (totalCoverWidth / 1000) * (totalCoverHeight / 1000) * input.coverGSM;
    const totalWeight = Math.round(innerWeightGrams + coverWeightGrams + (input.bindingStyle === "casebound_hardcover" ? 120 : 15));

    // Courier delivery charge based on weight in BD
    const courierFee = totalWeight > 1000 ? 110 : 70;

    return {
      pageCount: input.pageCount,
      leafCount,
      spineThicknessMm: roundedSpine,
      totalCoverWidthMm: Math.round(totalCoverWidth * 10) / 10,
      totalCoverHeightMm: Math.round(totalCoverHeight * 10) / 10,
      bleedMarginMm: bleed,
      estimatedWeightGrams: totalWeight,
      recommendedSteadfastDeliveryChargeBDT: courierFee,
      pressReadyValidation: {
        minimumPageCountMet: input.bindingStyle === "perfect_binding_softcover" ? input.pageCount >= 32 : true,
        dpiRequirement: 300,
        colorSpace: "CMYK",
        recommendedFontFallback: ["SolaimanLipi", "Kalpurush", "SutonnyMJ", "Nikosh"],
      },
    };
  }
}
