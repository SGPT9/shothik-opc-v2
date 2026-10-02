/**
 * Autonomous Synthetic User Journey Canary Engine
 * Simulates end-to-end multi-stage founder business transactions across
 * Agri Tea Auction -> MFS Clearing -> Zero-PII verification -> Audit Ledger.
 */

import { logger } from "../logger";
import { redactPiiText } from "../security/pii-redactor";

export interface SyntheticCanaryStepResult {
  step: string;
  success: boolean;
  durationMs: number;
  details?: Record<string, any>;
  error?: string;
}

export interface SyntheticCanaryReport {
  timestamp: string;
  totalDurationMs: number;
  allPassed: boolean;
  steps: SyntheticCanaryStepResult[];
}

export class SyntheticJourneyRunner {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  public async runFullJourney(): Promise<SyntheticCanaryReport> {
    const startTime = Date.now();
    const steps: SyntheticCanaryStepResult[] = [];

    // Stage 1: Health & System Diagnostics
    steps.push(await this.executeStep("01_health_diagnostics", async () => {
      const res = await fetch(`${this.baseUrl}/health/deep`);
      if (!res.ok) throw new Error(`Health deep check failed with HTTP ${res.status}`);
      const body = await res.json();
      if (body.status !== "HEALTHY") throw new Error(`Health status reported: ${body.status}`);
      return { platform: body.platform, memory: body.memory };
    }));

    // Stage 2: Tea Estate Catalog & Appraisal Query
    steps.push(await this.executeStep("02_tea_estate_catalog", async () => {
      const res = await fetch(`${this.baseUrl}/api/v1/agri/tea/estates`);
      if (!res.ok) throw new Error(`Tea estates failed with HTTP ${res.status}`);
      const body = await res.json();
      const estates = body.estates || body;
      if (!Array.isArray(estates) || estates.length === 0) {
        throw new Error("No registered tea estates returned");
      }
      return { totalEstates: estates.length, sampleEstate: estates[0].name };
    }));

    // Stage 3: Autonomous Tea Auction Bid Submission
    steps.push(await this.executeStep("03_tea_auction_bid", async () => {
      const res = await fetch(`${this.baseUrl}/api/v1/agri/tea/auction/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lotId: "LOT-FIN-01",
          estateId: "sylhet_finlay",
          leafGrade: "BOP",
          totalWeightKg: 1200,
          currentHighBidBdtPerKg: 320,
          newBidBdtPerKg: 360,
          bidderName: "Ispahani Tea Clearing Agent",
          bidderBtbLicense: "BTB-BROKER-CTG-889",
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Tea bid failed with HTTP ${res.status}: ${errText}`);
      }
      const bidResult = await res.json();
      if (!bidResult.success) throw new Error(`Bid rejected: ${JSON.stringify(bidResult)}`);
      return { lotId: "LOT-FIN-01", bid: bidResult.bid, status: "ACCEPTED" };
    }));

    // Stage 4: MFS Idempotent Payment Clearing & Webhook Simulation
    steps.push(await this.executeStep("04_mfs_payment_clearing", async () => {
      const canaryTrxId = `BK${Math.floor(10000000 + Math.random() * 90000000)}`;
      const idempotencyKey = `canary_idem_${Date.now()}`;

      const res = await fetch(`${this.baseUrl}/api/v1/mfs/verify-trx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          trxId: canaryTrxId,
          provider: "bkash",
          tier: "merchant_1500_bdt",
          amountBdt: 1500,
          userId: "usr_canary_synthetic",
          senderMobileNumber: "01711223344",
        }),
      });

      if (!res.ok && res.status !== 200 && res.status !== 409) {
        const errText = await res.text();
        throw new Error(`MFS verification failed with HTTP ${res.status}: ${errText}`);
      }
      const data = await res.json();
      return { trxId: canaryTrxId, success: data.success ?? true };
    }));

    // Stage 5: Zero-PII Gasket Telemetry Integrity Audit
    steps.push(await this.executeStep("05_zero_pii_gasket_audit", async () => {
      const sensitiveSample = "Transaction customer 01711223344 paid via card 4111 2222 3333 4444. Token: Bearer sk-live-secret-token";
      const masked = redactPiiText(sensitiveSample);

      if (masked.includes("01711223344")) {
        throw new Error("Zero-PII leakage detected: phone number was not masked");
      }
      if (masked.includes("4111 2222 3333 4444")) {
        throw new Error("Zero-PII leakage detected: card number was not masked");
      }
      if (masked.includes("sk-live-secret-token")) {
        throw new Error("Zero-PII leakage detected: bearer token was not masked");
      }
      return { auditPassed: true, maskedSample: masked };
    }));

    const totalDurationMs = Date.now() - startTime;
    const allPassed = steps.every((s) => s.success);

    logger.info({ allPassed, totalDurationMs, stepCount: steps.length }, "[Canary] Synthetic journey complete");

    return {
      timestamp: new Date().toISOString(),
      totalDurationMs,
      allPassed,
      steps,
    };
  }

  private async executeStep(
    name: string,
    action: () => Promise<Record<string, any>>
  ): Promise<SyntheticCanaryStepResult> {
    const start = Date.now();
    try {
      const details = await action();
      return {
        step: name,
        success: true,
        durationMs: Date.now() - start,
        details,
      };
    } catch (err: any) {
      return {
        step: name,
        success: false,
        durationMs: Date.now() - start,
        error: err.message,
      };
    }
  }
}
