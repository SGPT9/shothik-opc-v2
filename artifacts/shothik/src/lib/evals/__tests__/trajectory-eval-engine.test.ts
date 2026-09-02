/**
 * TrajectoryEvalEngine & FinancialIdempotencyEngine Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { trajectoryEvalEngine } from "../trajectory-eval-engine";
import { financialIdempotencyEngine } from "../../security/financial-idempotency-engine";

describe("Deep-Tech Giant Engineering Upgrade Suite", () => {
  describe("TrajectoryEvalEngine (DeepMind / OpenAI Standard)", () => {
    it("evaluates trajectory performance and approves production quality output", () => {
      const score = trajectoryEvalEngine.evaluateTrajectory({
        trajectoryId: "trj_test_01",
        userPrompt: "Generate Mushak-6.3 VAT Challan for bKash merchant",
        agentResponse: "Generated gapless sequential Mushak-6.3 tax challan for ৳35,000 GMV.",
        toolCallsCount: 2,
        retrievedCitationsCount: 3,
        executionDurationMs: 1400,
        policyViolationsCount: 0,
      });

      expect(score.overallQualityScore).toBeGreaterThanOrEqual(0.8);
      expect(score.isApprovedForProduction).toBe(true);
      expect(score.safetyPolicyScore).toBe(1.0);
    });
  });

  describe("FinancialIdempotencyEngine (Stripe Standard)", () => {
    it("computes SHA-256 fingerprint hash of financial payload", () => {
      const hash1 = financialIdempotencyEngine.computeFingerprint({ amount: 1500, phone: "01712345678" });
      const hash2 = financialIdempotencyEngine.computeFingerprint({ amount: 1500, phone: "01712345678" });
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64); // SHA-256 hex string length
    });

    it("prevents duplicate bKash payment requests with same idempotency key", () => {
      const key = "idemp_test_key_99812";
      const payload = { amount: 2500, recipient: "01898765432" };

      const firstCall = financialIdempotencyEngine.verifyIdempotency({
        idempotencyKey: key,
        userId: "usr_01",
        actionType: "BKASH_PAYMENT",
        payload,
      });
      expect(firstCall.isDuplicate).toBe(false);
      expect(firstCall.status).toBe("PROCESSED");

      const duplicateCall = financialIdempotencyEngine.verifyIdempotency({
        idempotencyKey: key,
        userId: "usr_01",
        actionType: "BKASH_PAYMENT",
        payload,
      });
      expect(duplicateCall.isDuplicate).toBe(true);
      expect(duplicateCall.status).toBe("SKIPPED_DUPLICATE");
    });
  });
});
