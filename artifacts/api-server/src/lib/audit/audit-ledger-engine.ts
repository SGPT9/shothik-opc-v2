import { createHash } from "node:crypto";

/**
 * Shothik NBR Statutory Audit Dossier & Double-Entry Ledger Reconciler (Slice 34)
 * Mathematical double-entry general ledger, Trial Balance generator,
 * and cryptographically sealed NBR Statutory Audit Dossier compiler.
 */

export type AccountCategory = "asset" | "liability" | "equity" | "revenue" | "cogs" | "expense";

export interface ChartOfAccount {
  accountCode: string;
  accountName: string;
  category: AccountCategory;
  normalBalance: "debit" | "credit";
  currentBalanceBdt: number;
}

export interface JournalEntryLine {
  accountCode: string;
  accountName: string;
  debitBdt: number;
  creditBdt: number;
  description: string;
}

export type InitiatorKind = "person" | "routine" | "responsibility" | "handoff" | "meeting";

export interface JournalEntry {
  entryId: string;
  transactionRef: string;
  transactionType:
    | "sale_cod"
    | "sale_bkash"
    | "mfs_fee"
    | "vat_mushak_6_3"
    | "customs_duty"
    | "franchise_royalty"
    | "courier_payout"
    | "mfs_payout";
  postedAt: string;
  memo: string;
  lines: JournalEntryLine[];
  totalDebitBdt: number;
  totalCreditBdt: number;
  isBalanced: boolean;
  auditHash: string;
  initiatorKind?: InitiatorKind;
  initiatorId?: string;
}

export interface NbrAuditDossier {
  dossierId: string;
  merchantId: string;
  merchantName: string;
  binNumber: string;
  taxYear: string;
  reportingPeriod: string;
  generatedAt: string;
  trialBalance: {
    totalDebitsBdt: number;
    totalCreditsBdt: number;
    accounts: { code: string; name: string; debitBdt: number; creditBdt: number }[];
  };
  financialSummary: {
    grossRevenueBdt: number;
    cogsBdt: number;
    grossProfitBdt: number;
    operatingExpensesBdt: number;
    netProfitBdt: number;
    vatCollectedBdt: number;
    tdsWithheldBdt: number;
  };
  complianceStatus: "fully_compliant" | "minor_discrepancy" | "action_required";
  verificationSeal: {
    signature: string;
    verifiedRecordsCount: number;
  };
}

const DEFAULT_CHART_OF_ACCOUNTS: ChartOfAccount[] = [
  // 1000 - Assets
  { accountCode: "1010", accountName: "Cash at Bank (BRAC / City Bank)", category: "asset", normalBalance: "debit", currentBalanceBdt: 450000 },
  { accountCode: "1020", accountName: "bKash / Nagad Merchant Settlement Wallet", category: "asset", normalBalance: "debit", currentBalanceBdt: 215000 },
  { accountCode: "1030", accountName: "COD Receivables (Steadfast / Pathao)", category: "asset", normalBalance: "debit", currentBalanceBdt: 180000 },
  { accountCode: "1040", accountName: "Merchandise Inventory at Landed Cost", category: "asset", normalBalance: "debit", currentBalanceBdt: 320000 },

  // 2000 - Liabilities
  { accountCode: "2010", accountName: "NBR Statutory Mushak-6.3 VAT Output Payable", category: "liability", normalBalance: "credit", currentBalanceBdt: 58500 },
  { accountCode: "2020", accountName: "NBR Statutory TDS Withholding Tax Payable", category: "liability", normalBalance: "credit", currentBalanceBdt: 18400 },
  { accountCode: "2030", accountName: "Trade Accounts Payable (Suppliers / 1688 C&F)", category: "liability", normalBalance: "credit", currentBalanceBdt: 140000 },

  // 3000 - Equity
  { accountCode: "3010", accountName: "Founder Capital Contribution", category: "equity", normalBalance: "credit", currentBalanceBdt: 500000 },
  { accountCode: "3020", accountName: "Retained Earnings", category: "equity", normalBalance: "credit", currentBalanceBdt: 208100 },

  // 4000 - Revenue
  { accountCode: "4010", accountName: "Gross E-Commerce & F-Commerce Sales Revenue", category: "revenue", normalBalance: "credit", currentBalanceBdt: 480000 },
  { accountCode: "4020", accountName: "Franchise Branch Master Royalty Income", category: "revenue", normalBalance: "credit", currentBalanceBdt: 45000 },

  // 5000 - COGS
  { accountCode: "5010", accountName: "Cost of Goods Sold (Inventory Consumption)", category: "cogs", normalBalance: "debit", currentBalanceBdt: 210000 },
  { accountCode: "5020", accountName: "Customs Import Tariffs & Port Assessment Fees", category: "cogs", normalBalance: "debit", currentBalanceBdt: 48000 },

  // 6000 - Operating Expenses
  { accountCode: "6010", accountName: "Steadfast / Courier Delivery Fees", category: "expense", normalBalance: "debit", currentBalanceBdt: 18500 },
  { accountCode: "6020", accountName: "bKash & MFS Gateway Processing Fees (1.85%)", category: "expense", normalBalance: "debit", currentBalanceBdt: 8500 },
];

export class AuditLedgerEngine {
  private static accounts: Map<string, ChartOfAccount> = new Map(
    DEFAULT_CHART_OF_ACCOUNTS.map((a) => [a.accountCode, { ...a }])
  );
  private static journals: Map<string, JournalEntry> = new Map();

  static {
    // Seed initial historical journal entry
    const entry1: JournalEntry = {
      entryId: "JRN_2026_001",
      transactionRef: "INV-MUSHAK-9011",
      transactionType: "sale_bkash",
      postedAt: new Date(Date.now() - 86400000).toISOString(),
      memo: "F-Commerce live sale collection with 1.85% bKash fee & Mushak-6.3 VAT",
      lines: [
        { accountCode: "1020", accountName: "bKash / Nagad Merchant Settlement Wallet", debitBdt: 9815, creditBdt: 0, description: "Net cash received" },
        { accountCode: "6020", accountName: "bKash & MFS Gateway Processing Fees (1.85%)", debitBdt: 185, creditBdt: 0, description: "1.85% PGW fee" },
        { accountCode: "4010", accountName: "Gross E-Commerce & F-Commerce Sales Revenue", debitBdt: 0, creditBdt: 8696, description: "Gross sale amount" },
        { accountCode: "2010", accountName: "NBR Statutory Mushak-6.3 VAT Output Payable", debitBdt: 0, creditBdt: 1304, description: "15% Statutory VAT" },
      ],
      totalDebitBdt: 10000,
      totalCreditBdt: 10000,
      isBalanced: true,
      auditHash: "8f4a1e9b2c3d5e7f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f",
      initiatorKind: "person",
      initiatorId: "usr_founder_01",
    };
    this.journals.set(entry1.entryId, entry1);

    const entry2: JournalEntry = {
      entryId: "JRN_2026_002",
      transactionRef: "AUTO-VAT-SETTLE-04",
      transactionType: "vat_mushak_6_3",
      postedAt: new Date(Date.now() - 43200000).toISOString(),
      memo: "Autonomous VatAuditTwin standing reconciliation (Nobody Watching)",
      lines: [
        { accountCode: "2010", accountName: "NBR Statutory Mushak-6.3 VAT Output Payable", debitBdt: 1304, creditBdt: 0, description: "Monthly statutory settlement" },
        { accountCode: "1010", accountName: "Cash at Bank (BRAC / City Bank)", debitBdt: 0, creditBdt: 1304, description: "Direct treasury tax transfer" },
      ],
      totalDebitBdt: 1304,
      totalCreditBdt: 1304,
      isBalanced: true,
      auditHash: "3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
      initiatorKind: "responsibility",
      initiatorId: "twin_finance_vat_01",
    };
    this.journals.set(entry2.entryId, entry2);
  }

  /**
   * Post a balanced double-entry transaction to the General Ledger
   */
  static postJournalEntry(params: {
    transactionRef: string;
    transactionType: JournalEntry["transactionType"];
    memo: string;
    initiatorKind?: InitiatorKind;
    initiatorId?: string;
    lines: {
      accountCode: string;
      debitBdt: number;
      creditBdt: number;
      description?: string;
    }[];
  }): { success: boolean; entry?: JournalEntry; error?: string } {
    let totalDebit = 0;
    let totalCredit = 0;

    const validatedLines: JournalEntryLine[] = [];

    for (const line of params.lines) {
      const acc = this.accounts.get(line.accountCode);
      if (!acc) {
        return { success: false, error: `Account code ${line.accountCode} not found in Chart of Accounts` };
      }

      totalDebit += line.debitBdt;
      totalCredit += line.creditBdt;

      validatedLines.push({
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        debitBdt: Math.round(line.debitBdt * 100) / 100,
        creditBdt: Math.round(line.creditBdt * 100) / 100,
        description: line.description || params.memo,
      });
    }

    // Mathematical Double-Entry Balancing Invariant
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return {
        success: false,
        error: `Double-entry invariant violation: Total Debits (৳${totalDebit}) must equal Total Credits (৳${totalCredit})`,
      };
    }

    // Update account balances
    for (const line of validatedLines) {
      const acc = this.accounts.get(line.accountCode)!;
      if (acc.normalBalance === "debit") {
        acc.currentBalanceBdt += line.debitBdt - line.creditBdt;
      } else {
        acc.currentBalanceBdt += line.creditBdt - line.debitBdt;
      }
    }

    const entryId = `JRN_${Date.now().toString(36).toUpperCase()}_${Math.floor(Math.random() * 1000)}`;
    const hashPayload = `${entryId}:${params.transactionRef}:${totalDebit}:${totalCredit}:${Date.now()}`;
    const auditHash = createHash("sha256").update(hashPayload).digest("hex");

    const entry: JournalEntry = {
      entryId,
      transactionRef: params.transactionRef,
      transactionType: params.transactionType,
      postedAt: new Date().toISOString(),
      memo: params.memo,
      lines: validatedLines,
      totalDebitBdt: Math.round(totalDebit * 100) / 100,
      totalCreditBdt: Math.round(totalCredit * 100) / 100,
      isBalanced: true,
      auditHash,
      initiatorKind: params.initiatorKind || "person",
      initiatorId: params.initiatorId,
    };

    this.journals.set(entry.entryId, entry);
    return { success: true, entry };
  }

  /**
   * Generate Real-Time Trial Balance
   */
  static getTrialBalance(): {
    totalDebitsBdt: number;
    totalCreditsBdt: number;
    isBalanced: boolean;
    accounts: { code: string; name: string; category: AccountCategory; debitBdt: number; creditBdt: number }[];
  } {
    let totalDebits = 0;
    let totalCredits = 0;

    const rows = Array.from(this.accounts.values()).map((acc) => {
      let debit = 0;
      let credit = 0;

      if (acc.normalBalance === "debit") {
        if (acc.currentBalanceBdt >= 0) debit = acc.currentBalanceBdt;
        else credit = Math.abs(acc.currentBalanceBdt);
      } else {
        if (acc.currentBalanceBdt >= 0) credit = acc.currentBalanceBdt;
        else debit = Math.abs(acc.currentBalanceBdt);
      }

      totalDebits += debit;
      totalCredits += credit;

      return {
        code: acc.accountCode,
        name: acc.accountName,
        category: acc.category,
        debitBdt: Math.round(debit * 100) / 100,
        creditBdt: Math.round(credit * 100) / 100,
      };
    });

    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.05;

    return {
      totalDebitsBdt: Math.round(totalDebits * 100) / 100,
      totalCreditsBdt: Math.round(totalCredits * 100) / 100,
      isBalanced,
      accounts: rows,
    };
  }

  /**
   * Compile and seal NBR Statutory Audit Dossier
   */
  static generateNbrDossier(params: {
    merchantId: string;
    merchantName: string;
    binNumber: string;
    taxYear?: string;
  }): NbrAuditDossier {
    const tb = this.getTrialBalance();

    const revenue = (this.accounts.get("4010")?.currentBalanceBdt || 0) + (this.accounts.get("4020")?.currentBalanceBdt || 0);
    const cogs = (this.accounts.get("5010")?.currentBalanceBdt || 0) + (this.accounts.get("5020")?.currentBalanceBdt || 0);
    const expenses = (this.accounts.get("6010")?.currentBalanceBdt || 0) + (this.accounts.get("6020")?.currentBalanceBdt || 0);
    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - expenses;

    const vatCollected = this.accounts.get("2010")?.currentBalanceBdt || 0;
    const tdsWithheld = this.accounts.get("2020")?.currentBalanceBdt || 0;

    const dossierId = `NBR_DOSSIER_${Date.now().toString(36).toUpperCase()}`;
    const hashData = `${dossierId}:${params.binNumber}:${revenue}:${vatCollected}:${tb.isBalanced}`;
    const signature = createHash("sha256").update(hashData).digest("hex");

    return {
      dossierId,
      merchantId: params.merchantId,
      merchantName: params.merchantName,
      binNumber: params.binNumber,
      taxYear: params.taxYear || "2026-2027",
      reportingPeriod: "July 2026 - June 2027 (Quarter 1)",
      generatedAt: new Date().toISOString(),
      trialBalance: {
        totalDebitsBdt: tb.totalDebitsBdt,
        totalCreditsBdt: tb.totalCreditsBdt,
        accounts: tb.accounts.map((a) => ({ code: a.code, name: a.name, debitBdt: a.debitBdt, creditBdt: a.creditBdt })),
      },
      financialSummary: {
        grossRevenueBdt: revenue,
        cogsBdt: cogs,
        grossProfitBdt: grossProfit,
        operatingExpensesBdt: expenses,
        netProfitBdt: netProfit,
        vatCollectedBdt: vatCollected,
        tdsWithheldBdt: tdsWithheld,
      },
      complianceStatus: tb.isBalanced ? "fully_compliant" : "minor_discrepancy",
      verificationSeal: {
        signature,
        verifiedRecordsCount: this.journals.size,
      },
    };
  }

  /**
   * List all Chart of Accounts
   */
  static listAccounts(): ChartOfAccount[] {
    return Array.from(this.accounts.values());
  }

  /**
   * List all Journal Entries with optional Nobody Watching and initiatorKind filtering
   */
  static listJournals(filter?: { nobodyWatching?: boolean; initiatorKind?: InitiatorKind }): JournalEntry[] {
    let list = Array.from(this.journals.values()).reverse();
    if (filter?.nobodyWatching) {
      list = list.filter((j) => (j.initiatorKind || "person") !== "person");
    }
    if (filter?.initiatorKind) {
      list = list.filter((j) => (j.initiatorKind || "person") === filter.initiatorKind);
    }
    return list;
  }

  /**
   * Reset store (for testing)
   */
  static _reset(): void {
    this.accounts = new Map(DEFAULT_CHART_OF_ACCOUNTS.map((a) => [a.accountCode, { ...a }]));
    this.journals.clear();
  }
}
