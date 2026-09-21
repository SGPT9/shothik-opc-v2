# 0034 — NBR Statutory Audit Dossier & Double-Entry Ledger Reconciler

## Status
- **Phase**: Implementation / Slice 34
- **Author**: Shothik Core Architecture Team
- **Date**: September 2026

---

## 1. Problem Statement & Bangladesh Statutory Context
In Bangladesh, solopreneurs and micro-enterprises (OPCs) operating under the Companies Act and National Board of Revenue (NBR) Value Added Tax and Supplementary Duty Act 2012 face immense audit friction. When audited by NBR VAT circles or Deputy Commissioners of Taxes (DCT), merchants must provide complete transactional lineage connecting:
1. Cash on Delivery (COD) dispatches and Steadfast/Pathao courier tracking numbers.
2. bKash / Nagad Mobile Financial Services (MFS) payout statements and 1.85% PGW transaction fees.
3. NBR Mushak-6.3 VAT tax invoices and Mushak-9.1 monthly return line items.
4. Import duty payments, Customs Assessment Notices, and C&F Bills of Entry (B/E).
5. Multi-branch franchise royalty waterfall commissions and sub-merchant mobile ledger splits.

Without automated double-entry ledgering, reconciling hundreds of micro-transactions into statutory Trial Balances and Audit Dossiers requires expensive external accountants and results in severe non-compliance penalties.

---

## 2. Architectural Solution
Slice 34 delivers the **NBR Statutory Audit Dossier & Double-Entry Ledger Reconciler**:
1. **Automated Double-Entry General Ledger Journalizer**:
   - Every transaction across the OPC automatically posts balanced Debit & Credit entries across 8 standard chart-of-accounts groups:
     - `1000 Assets`: Cash at Bank, bKash Merchant Wallet, COD Receivables (Courier In-Transit), Inventory at Cost.
     - `2000 Liabilities`: NBR Mushak-6.3 VAT Payable, NBR TDS Withholding Payable, Supplier Payables.
     - `3000 Equity`: Owner Capital, Retained Earnings.
     - `4000 Revenue`: Gross E-Commerce Sales, Franchise Royalty Income.
     - `5000 Cost of Goods Sold (COGS)`: Inventory Acquisition, Customs Import Duties & Tariffs.
     - `6000 Operating Expenses`: Courier Logistics Fees, MFS 1.85% Gateway Fees, Software & Cloud Compute.
2. **Real-Time Financial Statement Generator**:
   - Generates instant, mathematically balanced **Trial Balance**, **Profit & Loss (P&L)**, and **Balance Sheet** statements.
3. **NBR Statutory Audit Dossier Compilation Engine**:
   - Generates a cryptographically signed, complete NBR Audit Dossier package with 13-digit BIN validation, transaction hashes, Mushak-6.3 cross-references, and Customs B/E linkages.
   - Outputs compliance reports ready for NBR VAT Circle Inspectors and Income Tax filing.

---

## 3. Data Structures & Interfaces

```typescript
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

export interface JournalEntry {
  entryId: string;
  transactionRef: string;
  transactionType: "sale_cod" | "sale_bkash" | "mfs_fee" | "vat_mushak_6_3" | "customs_duty" | "franchise_royalty" | "courier_payout";
  postedAt: string;
  memo: string;
  lines: JournalEntryLine[];
  totalDebitBdt: number;
  totalCreditBdt: number;
  isBalanced: boolean;
  auditHash: string;
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
```

---

## 4. API Endpoints (`/api/v1/audit/*`)
- `GET /api/v1/audit/chart-of-accounts`: Retrieve all active ledger accounts and balances.
- `GET /api/v1/audit/journal-entries`: Retrieve posted double-entry journal logs with transaction hashes.
- `POST /api/v1/audit/journal-entries/post`: Post a new balanced double-entry transaction.
- `GET /api/v1/audit/trial-balance`: Generate real-time balanced Trial Balance statement.
- `POST /api/v1/audit/dossier/generate`: Compile and seal complete NBR Statutory Audit Dossier.

---

## 5. Acceptance Criteria
- [x] **AC-1**: Strict double-entry invariant enforcement ($\sum \text{Debits} \equiv \sum \text{Credits}$ on every posted journal).
- [x] **AC-2**: Automated mapping of sales, MFS fees, Mushak-6.3 VAT, and Customs tariffs to standard Bangladesh chart of accounts.
- [x] **AC-3**: 1-click NBR Statutory Audit Dossier generation with compliance verification seal.
- [x] **AC-4**: Frontend Twin Audit Ledger Studio (`AuditLedgerStudioModal.tsx`) with keyboard shortcut **`⌘D`**.
- [x] **AC-5**: 100% test coverage with automated unit tests for journal posting, ledger balancing, and dossier compilation.
