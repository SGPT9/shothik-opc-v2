import { createHash } from "node:crypto";

export interface Mushak66Item {
  itemDescription: string;
  mushak63ChallanNo: string;
  challanIssueDate: string;
  totalInvoiceAmountBDT: number;
  vatAmountBDT: number;
  vdsRatePercent: number; // e.g. 5%, 7.5%, 10%, 15%
  vdsDeductedBDT: number;
  netPaidToSupplierBDT: number;
}

export interface Mushak66CertificateRequest {
  withholdingEntityName: string;
  withholdingEntityBin: string;
  withholdingEntityAddress: string;
  supplierName: string;
  supplierBin: string;
  supplierAddress: string;
  taxPeriodMonthYear: string; // e.g. "September-2026"
  items: Array<{
    itemDescription: string;
    mushak63ChallanNo: string;
    challanIssueDate: string;
    totalInvoiceAmountBDT: number;
    vatAmountBDT: number;
    vdsRatePercent?: number;
  }>;
}

export interface Mushak66CertificateResponse {
  certificateNo: string;
  withholdingEntity: {
    name: string;
    bin: string;
    address: string;
  };
  supplier: {
    name: string;
    bin: string;
    address: string;
  };
  taxPeriod: string;
  items: Mushak66Item[];
  totalInvoiceSumBDT: number;
  totalVatSumBDT: number;
  totalVdsDeductedBDT: number;
  totalNetDisbursedBDT: number;
  nbrTreasuryDepositHint: string;
  verificationSealSha256: string;
  issuedAt: string;
}

export class Mushak66Engine {
  /**
   * Generates official NBR Mushak-6.6 Certificate of Tax Deduction at Source (VDS)
   */
  public static generateCertificate(req: Mushak66CertificateRequest): Mushak66CertificateResponse {
    if (!req.withholdingEntityBin || req.withholdingEntityBin.length < 9) {
      throw new Error("Withholding entity BIN must be a valid 9 or 13-digit number.");
    }
    if (!req.supplierBin || req.supplierBin.length < 9) {
      throw new Error("Supplier BIN must be a valid 9 or 13-digit number.");
    }
    if (!req.items || req.items.length === 0) {
      throw new Error("At least one invoice line item is required for Mushak-6.6.");
    }

    const certificateNo = `MUSHAK66-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    let totalInvoiceSumBDT = 0;
    let totalVatSumBDT = 0;
    let totalVdsDeductedBDT = 0;
    let totalNetDisbursedBDT = 0;

    const processedItems: Mushak66Item[] = req.items.map((it) => {
      const totalAmount = Number(it.totalInvoiceAmountBDT);
      const vat = Number(it.vatAmountBDT);
      const vdsRate = it.vdsRatePercent !== undefined ? Number(it.vdsRatePercent) : 15.0;
      
      const vdsDeducted = Math.round((vat * (vdsRate / 15.0)) * 100) / 100;
      const netPaid = Math.round((totalAmount - vdsDeducted) * 100) / 100;

      totalInvoiceSumBDT += totalAmount;
      totalVatSumBDT += vat;
      totalVdsDeductedBDT += vdsDeducted;
      totalNetDisbursedBDT += netPaid;

      return {
        itemDescription: it.itemDescription,
        mushak63ChallanNo: it.mushak63ChallanNo,
        challanIssueDate: it.challanIssueDate,
        totalInvoiceAmountBDT: totalAmount,
        vatAmountBDT: vat,
        vdsRatePercent: vdsRate,
        vdsDeductedBDT: vdsDeducted,
        netPaidToSupplierBDT: netPaid,
      };
    });

    const payloadToSign = JSON.stringify({
      certificateNo,
      withholder: req.withholdingEntityBin,
      supplier: req.supplierBin,
      totalVds: totalVdsDeductedBDT,
      timestamp: new Date().toISOString(),
    });
    const verificationSealSha256 = createHash("sha256").update(payloadToSign).digest("hex");

    return {
      certificateNo,
      withholdingEntity: {
        name: req.withholdingEntityName,
        bin: req.withholdingEntityBin,
        address: req.withholdingEntityAddress,
      },
      supplier: {
        name: req.supplierName,
        bin: req.supplierBin,
        address: req.supplierAddress,
      },
      taxPeriod: req.taxPeriodMonthYear,
      items: processedItems,
      totalInvoiceSumBDT: Math.round(totalInvoiceSumBDT * 100) / 100,
      totalVatSumBDT: Math.round(totalVatSumBDT * 100) / 100,
      totalVdsDeductedBDT: Math.round(totalVdsDeductedBDT * 100) / 100,
      totalNetDisbursedBDT: Math.round(totalNetDisbursedBDT * 100) / 100,
      nbrTreasuryDepositHint: "Deposit via NBR e-Treasury Challan Code: 1/1133/0010/0311 within 15 days of month end",
      verificationSealSha256,
      issuedAt: new Date().toISOString(),
    };
  }
}
