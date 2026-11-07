import { createHash } from "node:crypto";
import { db, mushak63ChallansTable } from "@workspace/db";

export interface MushakItem {
  itemDescription: string;
  hsCode: string;
  quantity: number;
  unitPriceBDT: number;
  supplementaryDutyRatePercent?: number;
  vatRatePercent: number; // typically 15%, 7.5%, or 5%
}

export interface Mushak63Input {
  challanNumber?: string;
  sellerName: string;
  sellerBIN: string;
  sellerAddress: string;
  buyerName: string;
  buyerBIN?: string;
  buyerAddress: string;
  items: MushakItem[];
  vehicleNumber?: string;
  destinationAddress?: string;
}

export interface Mushak63Output {
  challanNumber: string;
  issueDateTime: string;
  sellerName: string;
  sellerBIN: string;
  sellerAddress: string;
  buyerName: string;
  buyerBIN: string;
  buyerAddress: string;
  itemizedSummary: Array<{
    itemDescription: string;
    hsCode: string;
    quantity: number;
    unitPriceBDT: number;
    totalValueExcludingVatBDT: number;
    sdAmountBDT: number;
    vatAmountBDT: number;
    totalValueIncludingVatBDT: number;
  }>;
  totalValueExcludingVatBDT: number;
  totalSDAmountBDT: number;
  totalVATAmountBDT: number;
  grandTotalBDT: number;
  vdsWithholdingTaxBDT: number; // VAT Deducted at Source (if applicable)
  qrCodePayload: string;
  nbrVerificationHashSha256: string;
}

export class Mushak63Engine {
  public static validateBIN(bin: string): boolean {
    const clean = bin.replace(/[\s\-]/g, "");
    // Bangladesh NBR BIN is 9 or 13 digits
    return /^\d{9}(\d{4})?$/.test(clean);
  }

  public static generateChallan(input: Mushak63Input): Mushak63Output {
    if (!this.validateBIN(input.sellerBIN)) {
      throw new Error(`Invalid NBR Seller BIN format: ${input.sellerBIN}. Must be 9 or 13 digits.`);
    }

    for (const item of input.items || []) {
      if (item.quantity <= 0) {
        throw new Error(`Invalid item quantity: ${item.quantity}. Must be greater than 0.`);
      }
      if (item.unitPriceBDT < 0) {
        throw new Error(`Invalid item unit price: ${item.unitPriceBDT}. Cannot be negative.`);
      }
      if (item.vatRatePercent < 0) {
        throw new Error(`Invalid VAT rate: ${item.vatRatePercent}%. Cannot be negative.`);
      }
    }

    const challanNumber = input.challanNumber || `MUSHAK-6.3-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const issueDateTime = new Date().toISOString();

    let totalExVat = 0;
    let totalSD = 0;
    let totalVAT = 0;

    const itemized = input.items.map(item => {
      const lineExVat = Math.round(item.quantity * item.unitPriceBDT);
      const sdRate = item.supplementaryDutyRatePercent || 0;
      const sdAmount = Math.round(lineExVat * (sdRate / 100));
      const taxableBase = lineExVat + sdAmount;
      const vatAmount = Math.round(taxableBase * (item.vatRatePercent / 100));
      const lineIncVat = taxableBase + vatAmount;

      totalExVat += lineExVat;
      totalSD += sdAmount;
      totalVAT += vatAmount;

      return {
        itemDescription: item.itemDescription,
        hsCode: item.hsCode || "0000.00.00",
        quantity: item.quantity,
        unitPriceBDT: item.unitPriceBDT,
        totalValueExcludingVatBDT: lineExVat,
        sdAmountBDT: sdAmount,
        vatAmountBDT: vatAmount,
        totalValueIncludingVatBDT: lineIncVat,
      };
    });

    const grandTotal = totalExVat + totalSD + totalVAT;
    // Standard VDS withholding rate (usually 1/3 or full VAT for government/corporate buyers)
    const vdsWithholding = input.buyerBIN ? Math.round(totalVAT * 0.33) : 0;

    // NBR Standard QR Payload: BIN|ChallanNo|TotalVAT|GrandTotal|IssueDate
    const qrCodePayload = `NBR-VAT|BIN:${input.sellerBIN}|CHALLAN:${challanNumber}|VAT:${totalVAT}|TOTAL:${grandTotal}|DATE:${issueDateTime.split("T")[0]}`;
    const nbrVerificationHashSha256 = createHash("sha256").update(qrCodePayload).digest("hex");

    try {
      db.insert(mushak63ChallansTable)
        .values({
          challanNumber,
          sellerBin: input.sellerBIN,
          buyerBin: input.buyerBIN || null,
          buyerName: input.buyerName,
          totalTaxableAmountBDT: String(totalExVat + totalSD),
          totalVatBDT: String(totalVAT),
          totalPayableBDT: String(grandTotal),
          verificationSealSha256: nbrVerificationHashSha256,
        })
        .onConflictDoNothing()
        .catch(() => {});
    } catch {
      // non-blocking
    }

    return {
      challanNumber,
      issueDateTime,
      sellerName: input.sellerName,
      sellerBIN: input.sellerBIN,
      sellerAddress: input.sellerAddress,
      buyerName: input.buyerName,
      buyerBIN: input.buyerBIN || "UNREGISTERED",
      buyerAddress: input.buyerAddress,
      itemizedSummary: itemized,
      totalValueExcludingVatBDT: totalExVat,
      totalSDAmountBDT: totalSD,
      totalVATAmountBDT: totalVAT,
      grandTotalBDT: grandTotal,
      vdsWithholdingTaxBDT: vdsWithholding,
      qrCodePayload,
      nbrVerificationHashSha256,
    };
  }
}
