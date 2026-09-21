import { describe, it, expect, beforeEach } from "vitest";
import { AuditLedgerEngine } from "./audit-ledger-engine.js";

describe("AuditLedgerEngine (Slice 34: NBR Statutory Audit Dossier & Double-Entry Ledger)", () => {
  beforeEach(() => {
    AuditLedgerEngine._reset();
  });

  it("lists the default chart of accounts across standard categories", () => {
    const accounts = AuditLedgerEngine.listAccounts();
    expect(accounts.length).toBeGreaterThanOrEqual(12);

    const assetAcc = accounts.find((a) => a.accountCode === "1010");
    expect(assetAcc?.accountName).toContain("Cash at Bank");
    expect(assetAcc?.category).toBe("asset");
    expect(assetAcc?.normalBalance).toBe("debit");

    const vatAcc = accounts.find((a) => a.accountCode === "2010");
    expect(vatAcc?.accountName).toContain("Mushak-6.3 VAT");
    expect(vatAcc?.category).toBe("liability");
    expect(vatAcc?.normalBalance).toBe("credit");
  });

  it("posts a balanced double-entry journal transaction and updates account balances", () => {
    const postRes = AuditLedgerEngine.postJournalEntry({
      transactionRef: "INV-COD-9988",
      transactionType: "sale_cod",
      memo: "Steadfast Courier COD delivery realization",
      lines: [
        { accountCode: "1030", debitBdt: 5000, creditBdt: 0, description: "Courier COD receivable realized" },
        { accountCode: "4010", debitBdt: 0, creditBdt: 4347.83, description: "Gross sale" },
        { accountCode: "2010", debitBdt: 0, creditBdt: 652.17, description: "15% NBR VAT" },
      ],
    });

    expect(postRes.success).toBe(true);
    expect(postRes.entry?.isBalanced).toBe(true);
    expect(postRes.entry?.totalDebitBdt).toBe(5000);
    expect(postRes.entry?.totalCreditBdt).toBe(5000);
    expect(postRes.entry?.auditHash).toBeDefined();

    const journals = AuditLedgerEngine.listJournals();
    expect(journals.length).toBe(1);
  });

  it("rejects an unbalanced journal entry violating double-entry invariants", () => {
    const postRes = AuditLedgerEngine.postJournalEntry({
      transactionRef: "ERR-TRX-001",
      transactionType: "sale_bkash",
      memo: "Unbalanced fraudulent transaction test",
      lines: [
        { accountCode: "1010", debitBdt: 5000, creditBdt: 0 },
        { accountCode: "4010", debitBdt: 0, creditBdt: 4000 }, // Discrepancy of 1000 BDT
      ],
    });

    expect(postRes.success).toBe(false);
    expect(postRes.error).toContain("Double-entry invariant violation");
  });

  it("generates a balanced Trial Balance and compiles an NBR Statutory Audit Dossier", () => {
    const tb = AuditLedgerEngine.getTrialBalance();
    expect(tb.isBalanced).toBe(true);
    expect(tb.totalDebitsBdt).toBeGreaterThan(0);
    expect(tb.totalDebitsBdt).toEqual(tb.totalCreditsBdt);

    const dossier = AuditLedgerEngine.generateNbrDossier({
      merchantId: "merch_dhk_power_01",
      merchantName: "Shothik Artisan Commerce Ltd.",
      binNumber: "001928374-0101",
      taxYear: "2026-2027",
    });

    expect(dossier.dossierId).toMatch(/^NBR_DOSSIER_/);
    expect(dossier.binNumber).toBe("001928374-0101");
    expect(dossier.complianceStatus).toBe("fully_compliant");
    expect(dossier.financialSummary.grossRevenueBdt).toBeGreaterThan(0);
    expect(dossier.verificationSeal.signature).toHaveLength(64);
  });
});
