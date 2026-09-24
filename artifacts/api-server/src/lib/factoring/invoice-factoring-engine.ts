import { createHash } from "crypto";

export type FinancingMode = "islamic_murabaha" | "conventional_discounting";
export type DebtorTier = "tier_1_aaa" | "tier_2_aplus" | "tier_3_bbb";
export type FactoringStatus = "pending_approval" | "disbursed" | "settled" | "defaulted";

export interface DebtorProfile {
  name: string;
  bin: string;
  tier: DebtorTier;
  maxLtvPercent: number;
  conventionalSpreadPercent: number;
  murabahaMarkupRatePerMonthPercent: number;
  avgPaymentCycleDays: number;
}

export const DEBTOR_PROFILES: Record<string, DebtorProfile> = {
  "PRAN-RFL Group": {
    name: "PRAN-RFL Group (Agricultural Marketing Co.)",
    bin: "000192837-0101",
    tier: "tier_1_aaa",
    maxLtvPercent: 85,
    conventionalSpreadPercent: 2.0,
    murabahaMarkupRatePerMonthPercent: 1.0,
    avgPaymentCycleDays: 60,
  },
  "Square Pharmaceuticals PLC": {
    name: "Square Pharmaceuticals PLC",
    bin: "000456123-0102",
    tier: "tier_1_aaa",
    maxLtvPercent: 85,
    conventionalSpreadPercent: 1.8,
    murabahaMarkupRatePerMonthPercent: 0.95,
    avgPaymentCycleDays: 45,
  },
  "Walton Hi-Tech Industries PLC": {
    name: "Walton Hi-Tech Industries PLC",
    bin: "000789456-0201",
    tier: "tier_2_aplus",
    maxLtvPercent: 80,
    conventionalSpreadPercent: 3.0,
    murabahaMarkupRatePerMonthPercent: 1.4,
    avgPaymentCycleDays: 75,
  },
  "Aarong (BRAC Enterprises)": {
    name: "Aarong (BRAC Enterprises)",
    bin: "000321654-0101",
    tier: "tier_2_aplus",
    maxLtvPercent: 80,
    conventionalSpreadPercent: 2.5,
    murabahaMarkupRatePerMonthPercent: 1.25,
    avgPaymentCycleDays: 60,
  },
  "Apex Footwear Ltd.": {
    name: "Apex Footwear Ltd.",
    bin: "000654987-0301",
    tier: "tier_2_aplus",
    maxLtvPercent: 80,
    conventionalSpreadPercent: 2.8,
    murabahaMarkupRatePerMonthPercent: 1.35,
    avgPaymentCycleDays: 65,
  },
  "Dhaka Superstores Wholesale Ltd.": {
    name: "Dhaka Superstores Wholesale Ltd.",
    bin: "000998877-0402",
    tier: "tier_3_bbb",
    maxLtvPercent: 75,
    conventionalSpreadPercent: 4.5,
    murabahaMarkupRatePerMonthPercent: 2.0,
    avgPaymentCycleDays: 90,
  },
};

export interface QuoteRequest {
  invoiceGrossBdt: number;
  buyerName: string;
  tenorDays: number;
  financingMode: FinancingMode;
}

export interface QuoteResult {
  buyerName: string;
  buyerTier: DebtorTier;
  invoiceGrossBdt: number;
  tenorDays: number;
  financingMode: FinancingMode;
  ltvPercent: number;
  grossAdvanceBdt: number;
  retainedReserveBdt: number;
  financingFeeBdt: number;
  effectiveAnnualRatePercent: number;
  platformFeeBdt: number;
  netDisbursedToSellerBdt: number;
  quoteHash: string;
}

export interface FactoringInvoiceItem {
  id: string;
  mushak63No: string;
  poNumber: string;
  sellerCompanyName: string;
  buyerName: string;
  buyerBin: string;
  buyerTier: DebtorTier;
  invoiceGrossBdt: number;
  issueDate: string;
  dueDate: string;
  tenorDays: number;
  financingMode: FinancingMode;
  advanceLtvPercent: number;
  grossAdvanceBdt: number;
  retainedReserveBdt: number;
  financingFeeBdt: number;
  platformFeeBdt: number;
  netDisbursedBdt: number;
  status: FactoringStatus;
  disbursementChannel: "bkash_corporate" | "nagad_enterprise" | "beftn_bank";
  accountOrMfsNumber: string;
  escrowLienHash: string;
  createdAt: string;
  disbursedAt?: string;
  settledAt?: string;
  settledAmountBdt?: number;
  finalReserveReleasedBdt?: number;
}

export interface FactoringSummaryMetrics {
  totalFactoredReceivablesBdt: number;
  activeOutstandingAdvancesBdt: number;
  totalSettledReceivablesBdt: number;
  totalReserveRetainedInEscrowBdt: number;
  totalFinancingFeesEarnedBdt: number;
  activeFinancedInvoicesCount: number;
  defaultRatePercent: number;
}

export class InvoiceFactoringEngine {
  private invoices: Map<string, FactoringInvoiceItem> = new Map();
  private smartReferenceRatePercent = 11.5; // SMART Bangladesh Bank Reference Rate ~11.5%

  constructor() {
    this.seedDefaultInvoices();
  }

  /**
   * Generates a dynamic advance pricing quote comparing Conventional vs Murabaha.
   */
  public generateQuote(req: QuoteRequest): QuoteResult {
    const profile = DEBTOR_PROFILES[req.buyerName] || {
      name: req.buyerName,
      bin: "000000000-0000",
      tier: "tier_3_bbb" as DebtorTier,
      maxLtvPercent: 75,
      conventionalSpreadPercent: 4.5,
      murabahaMarkupRatePerMonthPercent: 2.0,
      avgPaymentCycleDays: 90,
    };

    const ltvPercent = profile.maxLtvPercent;
    const grossAdvanceBdt = Math.round((req.invoiceGrossBdt * ltvPercent) / 100);
    const retainedReserveBdt = req.invoiceGrossBdt - grossAdvanceBdt;
    const platformFeeBdt = Math.round((req.invoiceGrossBdt * 0.5) / 100); // 0.5% platform fee

    let financingFeeBdt = 0;
    let effectiveAnnualRatePercent = 0;

    if (req.financingMode === "islamic_murabaha") {
      // Fixed cost-plus monthly markup (no compounding)
      const months = Math.max(1, Math.ceil(req.tenorDays / 30));
      const totalMarkupPercent = profile.murabahaMarkupRatePerMonthPercent * months;
      financingFeeBdt = Math.round((grossAdvanceBdt * totalMarkupPercent) / 100);
      effectiveAnnualRatePercent = Number(((totalMarkupPercent / req.tenorDays) * 365).toFixed(2));
    } else {
      // Conventional: (SMART + spread) * (tenor / 365)
      effectiveAnnualRatePercent = Number((this.smartReferenceRatePercent + profile.conventionalSpreadPercent).toFixed(2));
      financingFeeBdt = Math.round((grossAdvanceBdt * effectiveAnnualRatePercent * (req.tenorDays / 365)) / 100);
    }

    const netDisbursedToSellerBdt = grossAdvanceBdt - financingFeeBdt - platformFeeBdt;
    const quotePayload = `${req.buyerName}:${req.invoiceGrossBdt}:${req.tenorDays}:${req.financingMode}:${netDisbursedToSellerBdt}`;
    const quoteHash = createHash("sha256").update(quotePayload).digest("hex").slice(0, 16);

    return {
      buyerName: profile.name,
      buyerTier: profile.tier,
      invoiceGrossBdt: req.invoiceGrossBdt,
      tenorDays: req.tenorDays,
      financingMode: req.financingMode,
      ltvPercent,
      grossAdvanceBdt,
      retainedReserveBdt,
      financingFeeBdt,
      effectiveAnnualRatePercent,
      platformFeeBdt,
      netDisbursedToSellerBdt,
      quoteHash,
    };
  }

  /**
   * Submits a verified Mushak-6.3 invoice for immediate factoring disbursement.
   */
  public applyForFactoring(params: {
    mushak63No: string;
    poNumber: string;
    sellerCompanyName: string;
    buyerName: string;
    invoiceGrossBdt: number;
    issueDate: string;
    dueDate: string;
    tenorDays: number;
    financingMode: FinancingMode;
    disbursementChannel: "bkash_corporate" | "nagad_enterprise" | "beftn_bank";
    accountOrMfsNumber: string;
  }): FactoringInvoiceItem {
    const quote = this.generateQuote({
      invoiceGrossBdt: params.invoiceGrossBdt,
      buyerName: params.buyerName,
      tenorDays: params.tenorDays,
      financingMode: params.financingMode,
    });

    const profile = DEBTOR_PROFILES[params.buyerName];
    const id = `FAC-${Date.now().toString(36).toUpperCase()}`;
    const escrowLienPayload = `LIEN:${id}:${params.mushak63No}:${params.buyerName}:${quote.grossAdvanceBdt}`;
    const escrowLienHash = createHash("sha256").update(escrowLienPayload).digest("hex");

    const item: FactoringInvoiceItem = {
      id,
      mushak63No: params.mushak63No,
      poNumber: params.poNumber,
      sellerCompanyName: params.sellerCompanyName,
      buyerName: params.buyerName,
      buyerBin: profile?.bin || "001122334-0101",
      buyerTier: quote.buyerTier,
      invoiceGrossBdt: params.invoiceGrossBdt,
      issueDate: params.issueDate,
      dueDate: params.dueDate,
      tenorDays: params.tenorDays,
      financingMode: params.financingMode,
      advanceLtvPercent: quote.ltvPercent,
      grossAdvanceBdt: quote.grossAdvanceBdt,
      retainedReserveBdt: quote.retainedReserveBdt,
      financingFeeBdt: quote.financingFeeBdt,
      platformFeeBdt: quote.platformFeeBdt,
      netDisbursedBdt: quote.netDisbursedToSellerBdt,
      status: "disbursed",
      disbursementChannel: params.disbursementChannel,
      accountOrMfsNumber: params.accountOrMfsNumber,
      escrowLienHash,
      createdAt: new Date().toISOString(),
      disbursedAt: new Date().toISOString(),
    };

    this.invoices.set(id, item);
    return item;
  }

  /**
   * Settles an enterprise buyer remittance, releasing retained reserve to the seller.
   */
  public settleInvoice(invoiceId: string, remittanceAmountBdt: number): FactoringInvoiceItem {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error(`Factoring invoice ${invoiceId} not found.`);
    }

    if (invoice.status === "settled") {
      return invoice;
    }

    // Retained reserve is returned to seller upon full settlement
    const finalReserveReleasedBdt = invoice.retainedReserveBdt;
    invoice.status = "settled";
    invoice.settledAt = new Date().toISOString();
    invoice.settledAmountBdt = remittanceAmountBdt;
    invoice.finalReserveReleasedBdt = finalReserveReleasedBdt;

    this.invoices.set(invoiceId, invoice);
    return invoice;
  }

  /**
   * Returns all factoring invoices.
   */
  public getInvoices(): FactoringInvoiceItem[] {
    return Array.from(this.invoices.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Returns factoring summary dashboard metrics.
   */
  public getSummaryMetrics(): FactoringSummaryMetrics {
    const all = this.getInvoices();
    const active = all.filter((it) => it.status === "disbursed");
    const settled = all.filter((it) => it.status === "settled");

    return {
      totalFactoredReceivablesBdt: all.reduce((sum, it) => sum + it.invoiceGrossBdt, 0),
      activeOutstandingAdvancesBdt: active.reduce((sum, it) => sum + it.grossAdvanceBdt, 0),
      totalSettledReceivablesBdt: settled.reduce((sum, it) => sum + it.invoiceGrossBdt, 0),
      totalReserveRetainedInEscrowBdt: active.reduce((sum, it) => sum + it.retainedReserveBdt, 0),
      totalFinancingFeesEarnedBdt: all.reduce((sum, it) => sum + it.financingFeeBdt + it.platformFeeBdt, 0),
      activeFinancedInvoicesCount: active.length,
      defaultRatePercent: 0.0,
    };
  }

  private seedDefaultInvoices() {
    this.applyForFactoring({
      mushak63No: "MUSHAK-6.3-99812",
      poNumber: "PO-PRAN-2026-881",
      sellerCompanyName: "Shothik Agritech Ltd.",
      buyerName: "PRAN-RFL Group",
      invoiceGrossBdt: 1200000,
      issueDate: "2026-08-15",
      dueDate: "2026-10-15",
      tenorDays: 60,
      financingMode: "islamic_murabaha",
      disbursementChannel: "bkash_corporate",
      accountOrMfsNumber: "01712345678",
    });

    this.applyForFactoring({
      mushak63No: "MUSHAK-6.3-44109",
      poNumber: "PO-SQUARE-2026-112",
      sellerCompanyName: "Apex Packaging Ltd.",
      buyerName: "Square Pharmaceuticals PLC",
      invoiceGrossBdt: 2500000,
      issueDate: "2026-09-01",
      dueDate: "2026-10-15",
      tenorDays: 45,
      financingMode: "islamic_murabaha",
      disbursementChannel: "beftn_bank",
      accountOrMfsNumber: "BRAC-150120499120",
    });

    this.applyForFactoring({
      mushak63No: "MUSHAK-6.3-77218",
      poNumber: "PO-AARONG-2026-403",
      sellerCompanyName: "Heritage Handloom Craft OPC",
      buyerName: "Aarong (BRAC Enterprises)",
      invoiceGrossBdt: 750000,
      issueDate: "2026-08-20",
      dueDate: "2026-10-20",
      tenorDays: 60,
      financingMode: "conventional_discounting",
      disbursementChannel: "nagad_enterprise",
      accountOrMfsNumber: "01898765432",
    });
  }
}

export const invoiceFactoringEngine = new InvoiceFactoringEngine();
