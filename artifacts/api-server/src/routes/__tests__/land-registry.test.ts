import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("Slice 79: Bengali Land Registry & Title Verification Routes", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("POST /api/v1/land-registry/convert-area converts units properly", async () => {
    const res = await fetch(`${baseUrl}/api/v1/land-registry/convert-area`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        value: 10,
        fromUnit: "shatangsho",
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.conversions.shatangsho).toBe(10);
    expect(data.data.conversions.sqft).toBe(4356);
    expect(data.data.conversions.katha).toBeCloseTo(6.05, 2);
  });

  it("POST /api/land-registry/convert-area supports alias routing", async () => {
    const res = await fetch(`${baseUrl}/api/land-registry/convert-area`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        value: 1,
        fromUnit: "katha",
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.conversions.sqft).toBe(720);
  });

  it("POST /api/v1/land-registry/calculate-fees computes statutory fee breakdown", async () => {
    const res = await fetch(`${baseUrl}/api/v1/land-registry/calculate-fees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        considerationBdt: 5_000_000,
        jurisdiction: "dhaka_city",
        propertyType: "residential",
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.registrationFeeBdt).toBe(50_000);
    expect(data.data.stampDutyBdt).toBe(75_000);
    expect(data.data.localGovtTaxBdt).toBe(150_000);
    expect(data.data.sourceTaxAitBdt).toBe(200_000); // 4% for residential
    expect(data.data.totalGovtFeesBdt).toBe(475_840);
  });

  it("POST /api/v1/land-registry/audit-chain flags anomalies and seals valid chains", async () => {
    const res = await fetch(`${baseUrl}/api/v1/land-registry/audit-chain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transfers: [
          {
            deedNumber: "D-1975-01",
            deedDate: "1975-01-01",
            surveyType: "RS",
            transferor: "Abdul Latif",
            transferee: "Kamal Hossain",
            transactedAreaShatangsho: 12,
            hasOriginalDocument: true,
          },
          {
            deedNumber: "D-2015-99",
            deedDate: "2015-08-20",
            surveyType: "Current_Deed",
            transferor: "Kamal Hossain",
            transferee: "Nasreen Sultana",
            transactedAreaShatangsho: 12,
            hasOriginalDocument: true,
          },
        ],
        parentDaagAreaShatangsho: 15,
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.isValid).toBe(true);
    expect(data.data.riskLevel).toBe("LOW");
    expect(data.data.titleSeal).toBeDefined();
  });

  it("POST /api/v1/land-registry/mutation-readiness assesses e-mutation documents", async () => {
    const res = await fetch(`${baseUrl}/api/v1/land-registry/mutation-readiness`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalDeed: true,
        bayaDeedsComplete: true,
        rsKhatianPorcha: true,
        bsCityKhatianPorcha: true,
        dakhilaPaidCurrentYear: true,
        warishanCertificateIfApplicable: false,
        nidCopiesVerified: true,
        mouzaMapTraceAvailable: false,
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.readinessScorePercent).toBe(90);
    expect(data.data.status).toBe("READY");
  });

  it("POST /api/v1/land-registry/issue-seal generates verifiable cryptographic certificate", async () => {
    const res = await fetch(`${baseUrl}/api/v1/land-registry/issue-seal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mouza: "Badda",
        jlNumber: "12",
        upazila: "Gulshan",
        district: "Dhaka",
        khatianNumber: "3301",
        daagNumber: "554",
        landAreaShatangsho: 8.25,
        currentOwner: "Mohiuddin Ahmed",
        deedNumber: "DEED-2024-4411",
        considerationBdt: 18_000_000,
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.sealHash).toHaveLength(64);
    expect(data.data.certificateNumber).toMatch(/^SHOTHIK_LAND_DHA_/);
    expect(data.data.qrPayload).toContain("https://shothik.ai/verify/land-record/");
  });
});
