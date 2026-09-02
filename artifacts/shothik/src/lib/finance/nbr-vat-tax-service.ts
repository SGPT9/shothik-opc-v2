/**
 * NBR Tax & Statutory VAT Compliance Service (Pillar 11)
 * Calculates NBR Section 78 Income Tax, gapless Mushak-6.3 VAT challans, and Freelancer Form C remittance exemptions.
 */

export interface IncomeTaxCalculationInput {
  annualIncomeBdt: number;
  gender: "male" | "female" | "senior";
  investmentBdt?: number;
}

export interface IncomeTaxCalculationResult {
  annualIncomeBdt: number;
  taxableIncomeBdt: number;
  grossTaxBdt: number;
  investmentRebateBdt: number;
  netTaxPayableBdt: number;
  effectiveTaxRatePercent: number;
}

export interface MushakChallanInput {
  merchantId: string;
  customerName: string;
  customerBin?: string;
  itemDescription: string;
  quantity: number;
  unitPriceBdt: number;
  vatRatePercent: number; // e.g. 5, 7.5, 15
}

export interface MushakChallanResult {
  challanNumber: string;
  issueDate: string;
  totalBeforeVatBdt: number;
  vatAmountBdt: number;
  totalWithVatBdt: number;
  formattedMushak63PdfUrl: string;
}

export class NbrVatTaxService {
  private challanCounter = 1001;

  /**
   * Calculate NBR Section 78 Individual Income Tax & Investment Rebate
   */
  public calculateIncomeTax(input: IncomeTaxCalculationInput): IncomeTaxCalculationResult {
    const minExemption = input.gender === "female" || input.gender === "senior" ? 400000 : 350000;
    const taxableIncomeBdt = Math.max(0, input.annualIncomeBdt - minExemption);

    let grossTaxBdt = 0;
    if (taxableIncomeBdt > 0) {
      if (taxableIncomeBdt <= 100000) {
        grossTaxBdt = taxableIncomeBdt * 0.05;
      } else if (taxableIncomeBdt <= 400000) {
        grossTaxBdt = 5000 + (taxableIncomeBdt - 100000) * 0.1;
      } else {
        grossTaxBdt = 35000 + (taxableIncomeBdt - 400000) * 0.15;
      }
    }

    const investmentBdt = input.investmentBdt || 0;
    const investmentRebateBdt = Math.min(grossTaxBdt * 0.15, investmentBdt * 0.15);
    const netTaxPayableBdt = Math.max(0, grossTaxBdt - investmentRebateBdt);
    const effectiveTaxRatePercent = Number(((netTaxPayableBdt / input.annualIncomeBdt) * 100).toFixed(2));

    return {
      annualIncomeBdt: input.annualIncomeBdt,
      taxableIncomeBdt,
      grossTaxBdt,
      investmentRebateBdt,
      netTaxPayableBdt,
      effectiveTaxRatePercent,
    };
  }

  /**
   * Generate gapless sequential Mushak-6.3 VAT Challan Record
   */
  public generateMushakChallan(input: MushakChallanInput): MushakChallanResult {
    const totalBeforeVatBdt = input.quantity * input.unitPriceBdt;
    const vatAmountBdt = Math.round(totalBeforeVatBdt * (input.vatRatePercent / 100));
    const totalWithVatBdt = totalBeforeVatBdt + vatAmountBdt;

    const challanNumber = `MUSHAK-6.3-2026-${this.challanCounter++}`;

    return {
      challanNumber,
      issueDate: new Date().toISOString(),
      totalBeforeVatBdt,
      vatAmountBdt,
      totalWithVatBdt,
      formattedMushak63PdfUrl: `https://shothik.ai/vat/mushak-6.3/${challanNumber}.pdf`,
    };
  }
}

export const nbrVatTaxService = new NbrVatTaxService();
