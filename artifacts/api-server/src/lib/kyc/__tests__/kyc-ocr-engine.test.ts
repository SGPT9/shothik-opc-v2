import { describe, it, expect, beforeEach, afterEach } from "vitest";
import express from "express";
import { KycOcrEngine } from "../kyc-ocr-engine.js";
import { kycOcrRouter } from "../../../routes/kyc-ocr.js";

describe("KycOcrEngine (Slice 76)", () => {
  let engine: KycOcrEngine;

  beforeEach(() => {
    engine = KycOcrEngine.getInstance();
  });

  it("extracts and normalizes 10-digit Smart NID", () => {
    const rawOcr = `
      গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
      Government of the People's Republic of Bangladesh
      NATIONAL ID CARD / জাতীয় পরিচয়পত্র
      নাম: মো: তানভীর আহমেদ
      Name: Md Tanvir Ahmed
      পিতা: রফিকুল ইসলাম
      Date of Birth: 15 Aug 1994
      NID No: 9182736450
      Blood Group: B+
    `;

    const dossier = engine.processNid({ rawOcrText: rawOcr });
    expect(dossier.documentType).toBe("NID_SMART");
    expect(dossier.extractedNid?.nidNumber).toBe("9182736450");
    expect(dossier.extractedNid?.format).toBe("10_DIGIT_SMART");
    expect(dossier.verdict).toBe("VERIFIED");
    expect(dossier.sha256Seal).toBeDefined();
    expect(dossier.sha256Seal.length).toBe(64);
  });

  it("flags mismatched birth year on 17-digit legacy NID", () => {
    const rawOcr = `
      জাতীয় পরিচয়পত্র
      Name: Rafiq Ahmed
      Date of Birth: 1995-04-12
      NID No: 19881234567890123
    `;

    const dossier = engine.processNid({ rawOcrText: rawOcr });
    expect(dossier.documentType).toBe("NID_LEGACY");
    expect(dossier.extractedNid?.nidNumber).toBe("19881234567890123");
    expect(dossier.flags).toContain("MISMATCHED_BIRTH_YEAR_AND_17_DIGIT_PREFIX");
    expect(dossier.verdict).toBe("REJECTED");
  });

  it("processes municipal Trade License and detects active status", () => {
    const rawOcr = `
      ঢাকা উত্তর সিটি কর্পোরেশন
      DHAKA NORTH CITY CORPORATION
      ট্রেড লাইসেন্স / TRADE LICENSE
      লাইসেন্স নং: TRAD/DNCC/084920/2026
      অর্থবছর: 2026-2027
      ব্যবসার নাম: Shothik Enterprise
      ব্যবসার ধরণ: ই-কমার্স ও সফটওয়্যার
    `;

    const dossier = engine.processTradeLicense({
      rawOcrText: rawOcr,
      expectedBusinessName: "Shothik Enterprise",
    });

    expect(dossier.documentType).toBe("TRADE_LICENSE");
    expect(dossier.extractedTradeLicense?.licenseNumber).toContain("TRAD/DNCC");
    expect(dossier.extractedTradeLicense?.status).toBe("ACTIVE");
    expect(dossier.verdict).toBe("VERIFIED");
    expect(dossier.sha256Seal).toBeDefined();
  });

  it("verifies cryptographic SHA-256 seal integrity", () => {
    const dossier = engine.processNid({
      rawOcrText: "Name: Ahsan\nNID No: 1234567890\nDate of Birth: 1990-01-01",
    });

    const check = engine.verifyDossierSeal(dossier.dossierId);
    expect(check.verified).toBe(true);
    expect(check.reason).toContain("Cryptographic SHA-256 integrity match");

    const nonExistent = engine.verifyDossierSeal("invalid_id_9999");
    expect(nonExistent.verified).toBe(false);
  });
});

describe("KycOcr Express Routes (Slice 76)", () => {
  let app: express.Express;
  let server: any;
  let baseUrl: string;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use(kycOcrRouter);

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  afterEach(() => {
    if (server) server.close();
  });

  it("POST /api/v1/kyc/ocr/process-nid returns a valid dossier", async () => {
    const res = await fetch(`${baseUrl}/api/v1/kyc/ocr/process-nid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rawOcrText: "Name: Tanvir Islam\nNID No: 5544332211\nDate of Birth: 1992-03-25",
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.dossier.extractedNid.nidNumber).toBe("5544332211");
  });

  it("POST /api/v1/kyc/ocr/process-trade-license processes trade license", async () => {
    const res = await fetch(`${baseUrl}/api/v1/kyc/ocr/process-trade-license`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rawOcrText: "TRAD/DSCC/998877/2026 অর্থবছর: 2026-2027",
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.dossier.extractedTradeLicense.status).toBe("ACTIVE");
  });

  it("POST /api/v1/kyc/ocr/verify-dossier validates stored seal", async () => {
    // Generate a dossier first
    const genRes = await fetch(`${baseUrl}/api/v1/kyc/ocr/process-nid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rawOcrText: "NID No: 1234567890",
      }),
    });
    const { dossier } = (await genRes.json()) as any;

    const verifyRes = await fetch(`${baseUrl}/api/v1/kyc/ocr/verify-dossier`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dossierId: dossier.dossierId }),
    });

    expect(verifyRes.status).toBe(200);
    const verifyBody = (await verifyRes.json()) as any;
    expect(verifyBody.verified).toBe(true);
  });

  it("GET /api/v1/kyc/ocr/dossiers returns list of dossiers", async () => {
    const res = await fetch(`${baseUrl}/api/v1/kyc/ocr/dossiers`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.dossiers)).toBe(true);
  });
});
