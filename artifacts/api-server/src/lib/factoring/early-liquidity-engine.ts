import { createHash } from "node:crypto";

export type CreditTier = "AAA" | "AA" | "A" | "BBB" | "HIGH_RISK";

export interface B2BBuyer {
  buyerId: string;
  name: string;
  industry: "FMCG" | "Pharmaceuticals" | "Textile & RMG" | "Retail & Superstore" | "Conglomerate";
  creditTier: CreditTier;
  avgPaymentDays: number;
  maxFactoringLimitBDT: number;
  defaultRiskRate: number; // 0.01 = 1%
}

export interface ReceivableInvoice {
  invoiceId: string;
  buyerId: string;
  buyerName: string;
  invoiceAmountBDT: number;
  issueDate: string;
  dueDate: string;
  status: "unfactored" | "factored" | "settled" | "overdue";
}

export interface AgingAnalysis {
  totalReceivablesBDT: number;
  bucket0to30BDT: number;
  bucket31to60BDT: number;
  bucket61to90BDT: number;
  bucket90PlusBDT: number;
  weightedDSO: number; // Days Sales Outstanding
  expected30DayRecoveryBDT: number;
}

export interface FactoringOffer {
  offerId: string;
  invoiceId: string;
  buyerName: string;
  invoiceFaceValueBDT: number;
  advanceRatePercent: number; // e.g. 85%
  grossAdvanceAmountBDT: number;
  factoringDiscountFeeBDT: number;
  netMerchantPayoutBDT: number;
  annualizedAprPercent: number;
  tenureDays: number;
  disbursementChannel: "bkash_enterprise" | "nagad_enterprise" | "beftn_bank";
  legalContractText: string;
  verificationSealSha256: string;
  createdAt: string;
}

export class EarlyLiquidityEngine {
  private buyers: Map<string, B2BBuyer> = new Map();
  private invoices: Map<string, ReceivableInvoice> = new Map();

  constructor() {
    this.seedDefaultBuyers();
    this.seedDefaultInvoices();
  }

  private seedDefaultBuyers() {
    const defaultBuyers: B2BBuyer[] = [
      {
        buyerId: "BUYER-PRAN",
        name: "PRAN-RFL Group Ltd",
        industry: "FMCG",
        creditTier: "AAA",
        avgPaymentDays: 45,
        maxFactoringLimitBDT: 5000000,
        defaultRiskRate: 0.005,
      },
      {
        buyerId: "BUYER-SQUARE",
        name: "Square Pharmaceuticals Ltd",
        industry: "Pharmaceuticals",
        creditTier: "AAA",
        avgPaymentDays: 30,
        maxFactoringLimitBDT: 10000000,
        defaultRiskRate: 0.003,
      },
      {
        buyerId: "BUYER-SHWAPNO",
        name: "Shwapno Superstores (ACI Logistics)",
        industry: "Retail & Superstore",
        creditTier: "AA",
        avgPaymentDays: 60,
        maxFactoringLimitBDT: 3000000,
        defaultRiskRate: 0.015,
      },
      {
        buyerId: "BUYER-BEXIMCO",
        name: "Beximco Textiles Ltd",
        industry: "Textile & RMG",
        creditTier: "A",
        avgPaymentDays: 75,
        maxFactoringLimitBDT: 4000000,
        defaultRiskRate: 0.035,
      },
      {
        buyerId: "BUYER-LOCAL-WHOLESALER",
        name: "Chawkbazar Trading Syndicate",
        industry: "Retail & Superstore",
        creditTier: "BBB",
        avgPaymentDays: 90,
        maxFactoringLimitBDT: 1000000,
        defaultRiskRate: 0.08,
      },
    ];

    for (const b of defaultBuyers) {
      this.buyers.set(b.buyerId, b);
    }
  }

  private seedDefaultInvoices() {
    const today = new Date();
    const invoices: ReceivableInvoice[] = [
      {
        invoiceId: "INV-2026-081",
        buyerId: "BUYER-PRAN",
        buyerName: "PRAN-RFL Group Ltd",
        invoiceAmountBDT: 450000,
        issueDate: new Date(today.getTime() - 15 * 86400000).toISOString().split("T")[0],
        dueDate: new Date(today.getTime() + 30 * 86400000).toISOString().split("T")[0],
        status: "unfactored",
      },
      {
        invoiceId: "INV-2026-082",
        buyerId: "BUYER-SQUARE",
        buyerName: "Square Pharmaceuticals Ltd",
        invoiceAmountBDT: 780000,
        issueDate: new Date(today.getTime() - 25 * 86400000).toISOString().split("T")[0],
        dueDate: new Date(today.getTime() + 20 * 86400000).toISOString().split("T")[0],
        status: "unfactored",
      },
      {
        invoiceId: "INV-2026-083",
        buyerId: "BUYER-SHWAPNO",
        buyerName: "Shwapno Superstores (ACI Logistics)",
        invoiceAmountBDT: 320000,
        issueDate: new Date(today.getTime() - 45 * 86400000).toISOString().split("T")[0],
        dueDate: new Date(today.getTime() + 15 * 86400000).toISOString().split("T")[0],
        status: "unfactored",
      },
      {
        invoiceId: "INV-2026-084",
        buyerId: "BUYER-BEXIMCO",
        buyerName: "Beximco Textiles Ltd",
        invoiceAmountBDT: 600000,
        issueDate: new Date(today.getTime() - 70 * 86400000).toISOString().split("T")[0],
        dueDate: new Date(today.getTime() - 10 * 86400000).toISOString().split("T")[0],
        status: "overdue",
      },
    ];

    for (const inv of invoices) {
      this.invoices.set(inv.invoiceId, inv);
    }
  }

  public listBuyers(): B2BBuyer[] {
    return Array.from(this.buyers.values());
  }

  public listInvoices(): ReceivableInvoice[] {
    return Array.from(this.invoices.values());
  }

  public getInvoice(invoiceId: string): ReceivableInvoice | undefined {
    return this.invoices.get(invoiceId);
  }

  /**
   * AC-1: B2B Corporate Credit Scoring & Buyer Risk Engine
   */
  public evaluateBuyerCredit(buyerId: string): { buyer: B2BBuyer; maxAdvanceRate: number; apr: number } {
    const buyer = this.buyers.get(buyerId);
    if (!buyer) {
      throw new Error(`Buyer not found: ${buyerId}`);
    }

    let maxAdvanceRate = 0.85;
    let apr = 14.0; // Base 14% p.a.

    switch (buyer.creditTier) {
      case "AAA":
        maxAdvanceRate = 0.90;
        apr = 12.0;
        break;
      case "AA":
        maxAdvanceRate = 0.85;
        apr = 14.0;
        break;
      case "A":
        maxAdvanceRate = 0.80;
        apr = 16.5;
        break;
      case "BBB":
        maxAdvanceRate = 0.75;
        apr = 19.5;
        break;
      case "HIGH_RISK":
        maxAdvanceRate = 0.60;
        apr = 24.0;
        break;
    }

    return { buyer, maxAdvanceRate, apr };
  }

  /**
   * AC-2: Accounts Receivable Aging Radar & Cashflow Forecaster
   */
  public analyzeAgingRadar(): AgingAnalysis {
    const now = new Date().getTime();
    let totalReceivables = 0;
    let bucket0to30 = 0;
    let bucket31to60 = 0;
    let bucket61to90 = 0;
    let bucket90Plus = 0;
    let weightedDaysSum = 0;

    for (const inv of this.invoices.values()) {
      if (inv.status === "settled") continue;

      const issueTime = new Date(inv.issueDate).getTime();
      const daysOld = Math.max(0, Math.floor((now - issueTime) / (86400000)));

      totalReceivables += inv.invoiceAmountBDT;
      weightedDaysSum += daysOld * inv.invoiceAmountBDT;

      if (daysOld <= 30) {
        bucket0to30 += inv.invoiceAmountBDT;
      } else if (daysOld <= 60) {
        bucket31to60 += inv.invoiceAmountBDT;
      } else if (daysOld <= 90) {
        bucket61to90 += inv.invoiceAmountBDT;
      } else {
        bucket90Plus += inv.invoiceAmountBDT;
      }
    }

    const weightedDSO = totalReceivables > 0 ? Math.round(weightedDaysSum / totalReceivables) : 0;
    // Expected recovery: 95% of (0-30), 85% of (31-60), 65% of (61-90), 30% of 90+
    const expected30DayRecovery = Math.round(
      bucket0to30 * 0.95 + bucket31to60 * 0.85 + bucket61to90 * 0.40
    );

    return {
      totalReceivablesBDT: totalReceivables,
      bucket0to30BDT: bucket0to30,
      bucket31to60BDT: bucket31to60,
      bucket61to90BDT: bucket61to90,
      bucket90PlusBDT: bucket90Plus,
      weightedDSO,
      expected30DayRecoveryBDT: expected30DayRecovery,
    };
  }

  /**
   * AC-3 & AC-4: Dynamic Early Liquidity Factoring Calculator & Legal Promissory Lien
   */
  public calculateFactoringOffer(
    invoiceId: string,
    requestedAdvanceRatePercent: number = 85,
    channel: "bkash_enterprise" | "nagad_enterprise" | "beftn_bank" = "bkash_enterprise"
  ): FactoringOffer {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error(`Invoice not found: ${invoiceId}`);
    }

    const { buyer, maxAdvanceRate, apr } = this.evaluateBuyerCredit(invoice.buyerId);
    const effectiveAdvanceRate = Math.min(requestedAdvanceRatePercent / 100, maxAdvanceRate);

    // Tenure days until due date (minimum 15 days)
    const dueDate = new Date(invoice.dueDate).getTime();
    const now = new Date().getTime();
    const tenureDays = Math.max(15, Math.ceil((dueDate - now) / 86400000));

    const grossAdvanceAmountBDT = Math.round(invoice.invoiceAmountBDT * effectiveAdvanceRate);

    // Factoring Discount Fee = Gross Advance * (APR / 365) * TenureDays
    const factoringDiscountFeeBDT = Math.round(grossAdvanceAmountBDT * (apr / 100 / 365) * tenureDays);
    const netMerchantPayoutBDT = grossAdvanceAmountBDT - factoringDiscountFeeBDT;

    const offerId = `FACT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // AC-4: Legal Promissory Note Text under Bangladesh Contract Act 1872
    const legalContractText = `IRREVOCABLE ACCOUNTS RECEIVABLE ASSIGNMENT & LIEN AGREEMENT
Under Bangladesh Contract Act 1872 & Negotiable Instruments Act 1881.
Invoice ID: ${invoice.invoiceId} | Face Value: BDT ৳${invoice.invoiceAmountBDT.toLocaleString()}
Buyer: ${buyer.name} (Credit Tier: ${buyer.creditTier})
Assignor (Merchant) hereby assigns all rights, title, and receivables to Shothik Factoring Protocol.
Net Advance Disbursed: BDT ৳${netMerchantPayoutBDT.toLocaleString()} via ${channel.toUpperCase()}.
Discount APR: ${apr}% per annum for ${tenureDays} days tenure.`;

    const sealPayload = JSON.stringify({
      offerId,
      invoiceId: invoice.invoiceId,
      buyerId: buyer.buyerId,
      netMerchantPayoutBDT,
      apr,
      tenureDays,
      channel,
      timestamp: new Date().toISOString(),
    });

    const verificationSealSha256 = createHash("sha256").update(sealPayload).digest("hex");

    return {
      offerId,
      invoiceId: invoice.invoiceId,
      buyerName: buyer.name,
      invoiceFaceValueBDT: invoice.invoiceAmountBDT,
      advanceRatePercent: Math.round(effectiveAdvanceRate * 100),
      grossAdvanceAmountBDT,
      factoringDiscountFeeBDT,
      netMerchantPayoutBDT,
      annualizedAprPercent: apr,
      tenureDays,
      disbursementChannel: channel,
      legalContractText,
      verificationSealSha256,
      createdAt: new Date().toISOString(),
    };
  }
}

export const globalFactoringEngine = new EarlyLiquidityEngine();
