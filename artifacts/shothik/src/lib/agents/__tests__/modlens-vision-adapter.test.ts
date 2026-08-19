import { describe, it, expect } from "vitest";
import { ModLensVisionAdapter } from "../modlens-vision-adapter";

describe("👁️ ModLens Vision Adapter for DeepSeek TDD Suite", () => {
  it("should extract structured bKash receipt evidence from pasted image", () => {
    const evidence = ModLensVisionAdapter.analyzePastedImage("data:image/png;base64,bkash_receipt_mock", "BKASH_RECEIPT");

    expect(evidence.provider).toBe("modlens_gemini_vision");
    expect(evidence.mfsTrxId).toBe("BK99281726X");
    expect(evidence.monetaryAmount).toBe(1850);
    expect(evidence.entities[0].category).toBe("MFS_TRANSACTION");

    const prompt = ModLensVisionAdapter.formatEvidenceForDeepSeek(evidence);
    expect(prompt).toContain("Detected TrxID: BK99281726X");
    expect(prompt).toContain("Detected Amount: ৳1,850");
  });

  it("should extract Steadfast waybill tracking codes from courier slips", () => {
    const evidence = ModLensVisionAdapter.analyzePastedImage("data:image/jpeg;base64,steadfast_slip", "COURIER_SLIP");

    expect(evidence.trackingCode).toBe("ST-582910");
    expect(evidence.monetaryAmount).toBe(1850);
    expect(evidence.entities[0].category).toBe("COURIER_WAYBILL");

    const prompt = ModLensVisionAdapter.formatEvidenceForDeepSeek(evidence);
    expect(prompt).toContain("Detected Tracking: ST-582910");
  });
});
