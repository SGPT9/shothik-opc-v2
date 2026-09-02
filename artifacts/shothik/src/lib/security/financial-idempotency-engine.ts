/**
 * Cryptographic Financial Idempotency & Audit Ledger Engine (Pillar 11)
 * Inspired by Stripe & Cloudflare fault-tolerant payment standards.
 */

import crypto from "crypto";

export interface IdempotencyCheckInput {
  idempotencyKey: string;
  userId: string;
  actionType: "BKASH_PAYMENT" | "STEADFAST_BOOKING" | "CREDIT_TOPUP";
  payload: Record<string, any>;
}

export interface IdempotencyCheckResult {
  isDuplicate: boolean;
  fingerprintHash: string;
  status: "PROCESSED" | "SKIPPED_DUPLICATE" | "RECORDED";
  timestamp: string;
}

export class FinancialIdempotencyEngine {
  private cache = new Map<string, { fingerprint: string; timestamp: string }>();

  /**
   * Compute SHA-256 fingerprint hash of financial payload
   */
  public computeFingerprint(payload: Record<string, any>): string {
    const serialized = JSON.stringify(payload);
    return crypto.createHash("sha256").update(serialized).digest("hex");
  }

  /**
   * Verify idempotency key and prevent duplicate bKash payments / Steadfast bookings
   */
  public verifyIdempotency(input: IdempotencyCheckInput): IdempotencyCheckResult {
    const fingerprint = this.computeFingerprint(input.payload);
    const key = `${input.userId}:${input.actionType}:${input.idempotencyKey}`;

    if (this.cache.has(key)) {
      return {
        isDuplicate: true,
        fingerprintHash: fingerprint,
        status: "SKIPPED_DUPLICATE",
        timestamp: new Date().toISOString(),
      };
    }

    this.cache.set(key, { fingerprint, timestamp: new Date().toISOString() });

    return {
      isDuplicate: false,
      fingerprintHash: fingerprint,
      status: "PROCESSED",
      timestamp: new Date().toISOString(),
    };
  }
}

export const financialIdempotencyEngine = new FinancialIdempotencyEngine();
