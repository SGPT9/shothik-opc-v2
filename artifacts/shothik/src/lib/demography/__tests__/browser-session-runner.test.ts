import { describe, it, expect } from "vitest";
import { BrowserSessionRunner } from "../browser-session-runner";

describe("🖥️ BrowserOS Local Profile Session Runner TDD Suite", () => {
  it("should initialize with encrypted session cookies for Steadfast merchant portal", () => {
    const runner = new BrowserSessionRunner();
    const session = runner.getPortalSession("steadfast_merchant");

    expect(session).toBeDefined();
    expect(session?.merchantId).toBe("MERCH-DHK-9921");
    expect(session?.isCloudflareTurnstileBypassed).toBe(true);
    expect(session?.cookies[0].name).toBe("steadfast_session_token");
  });

  it("should execute authenticated bulk parcel creation without plain text passwords", async () => {
    const runner = new BrowserSessionRunner();
    const result = await runner.executeAuthenticatedMerchantAction(
      "steadfast_merchant",
      "BULK_PARCEL_CREATE",
      {
        parcels: [
          { recipientPhone: "01711223344" },
          { recipientPhone: "01899887766" },
        ],
      }
    );

    expect(result.success).toBe(true);
    expect(result.authMethod).toBe("LOCAL_PROFILE_COOKIES");
    expect(result.transactionTraceId).toMatch(/^AUTH_EXEC_\d+_[A-Z0-9]+$/);
    expect(result.result.consignmentCount).toBe(2);
    expect(result.result.consignments[0].consignmentId).toMatch(/^ST_AUTH_\d{6}$/);
  });

  it("should execute authenticated COD payout request", async () => {
    const runner = new BrowserSessionRunner();
    const result = await runner.executeAuthenticatedMerchantAction(
      "steadfast_merchant",
      "REQUEST_COD_PAYOUT",
      { amount: 64500, mfsNumber: "01712345678" }
    );

    expect(result.success).toBe(true);
    expect(result.result.payoutRequested).toBe(64500);
    expect(result.result.status).toBe("PAYOUT_QUEUED");
  });
});
