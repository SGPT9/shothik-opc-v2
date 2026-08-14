import { describe, it, expect } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

describe("CRO Statistical Evaluation Route (POST /api/twin/cro/evaluate)", () => {
  it("evaluates telemetry and returns statistically significant winning variant", async () => {
    const request = new NextRequest("http://localhost:3000/api/twin/cro/evaluate", {
      method: "POST",
      body: JSON.stringify({
        companyName: "VerifiQ AI",
        variants: [
          { id: "var-a", conversions: 48, impressions: 1420 },
          { id: "var-b", conversions: 79, impressions: 1380 },
        ],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.isStatisticallySignificant).toBe(true);
    expect(data.evaluatedWinner.variantId).toBe("var-b");
    expect(data.evaluatedWinner.conversionLiftPercentage).toBe(69.2);
  });
});
