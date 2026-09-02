/**
 * Cryptographic Financial Audit Ledger Engine
 * Immutably records bKash transactions, creator revenue splits, and referral payouts using SHA-256 hash-chaining.
 */

import { createHash } from "crypto";

export interface FinancialAuditEntry {
  entryId: string;
  transactionId: string;
  amountBdt: number;
  type: "bkash_pgw" | "creator_split_80" | "creator_split_20" | "ambassador_commission_15";
  merchantId: string;
  previousHash: string;
  currentHash: string;
  timestamp: string;
}

export class FinancialAuditLedger {
  private ledgerChain: FinancialAuditEntry[] = [];
  private genesisHash = "0000000000000000000000000000000000000000000000000000000000000000";

  /**
   * Append new immutable transaction entry to the cryptographic hash chain
   */
  public appendEntry(
    transactionId: string,
    amountBdt: number,
    type: FinancialAuditEntry["type"],
    merchantId: string
  ): FinancialAuditEntry {
    const previousHash = this.ledgerChain.length > 0 ? this.ledgerChain[this.ledgerChain.length - 1].currentHash : this.genesisHash;
    const timestamp = new Date().toISOString();
    const entryId = `led_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    const hashInput = `${entryId}|${transactionId}|${amountBdt}|${type}|${merchantId}|${previousHash}|${timestamp}`;
    const currentHash = createHash("sha256").update(hashInput).digest("hex");

    const entry: FinancialAuditEntry = {
      entryId,
      transactionId,
      amountBdt,
      type,
      merchantId,
      previousHash,
      currentHash,
      timestamp,
    };

    this.ledgerChain.push(entry);
    return entry;
  }

  /**
   * Verify integrity of the entire cryptographic ledger chain
   */
  public verifyLedgerIntegrity(): { isValid: boolean; totalEntries: number; tamperedEntryId?: string } {
    for (let i = 0; i < this.ledgerChain.length; i++) {
      const entry = this.ledgerChain[i];
      const expectedPrevHash = i === 0 ? this.genesisHash : this.ledgerChain[i - 1].currentHash;

      if (entry.previousHash !== expectedPrevHash) {
        return { isValid: false, totalEntries: this.ledgerChain.length, tamperedEntryId: entry.entryId };
      }

      const hashInput = `${entry.entryId}|${entry.transactionId}|${entry.amountBdt}|${entry.type}|${entry.merchantId}|${entry.previousHash}|${entry.timestamp}`;
      const recalculatedHash = createHash("sha256").update(hashInput).digest("hex");

      if (entry.currentHash !== recalculatedHash) {
        return { isValid: false, totalEntries: this.ledgerChain.length, tamperedEntryId: entry.entryId };
      }
    }

    return { isValid: true, totalEntries: this.ledgerChain.length };
  }
}

export const financialAuditLedger = new FinancialAuditLedger();
