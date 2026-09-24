import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import {
  legalContractsEngine,
  LegalContractsEngine,
} from "../../lib/contracts/legal-contracts-engine.js";

describe("Slice 51: AI Legal Contract Generator & Stamp Duty Act 1899 Compliance Engine", () => {
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

  describe("LegalContractsEngine Unit Logic", () => {
    it("calculates accurate Stamp Act 1899 non-judicial stamp duty for all agreement categories", () => {
      const engine = new LegalContractsEngine();

      // NDA -> ৳300
      const ndaStamp = engine.calculateStampDuty("nda", 0);
      expect(ndaStamp.stampValueBdt).toBe(300);
      expect(ndaStamp.statutoryArticle).toContain("Article 5");
      expect(ndaStamp.stampCategory).toBe("Non-Judicial Stamp");

      // Founder Vesting -> ৳300
      const founderStamp = engine.calculateStampDuty("founder_vesting", 0);
      expect(founderStamp.stampValueBdt).toBe(300);

      // Supply < 5L -> ৳500
      const smallSupply = engine.calculateStampDuty("vendor_supply", 350000);
      expect(smallSupply.stampValueBdt).toBe(500);

      // Supply >= 5L -> ৳1,000
      const largeSupply = engine.calculateStampDuty("vendor_supply", 1500000);
      expect(largeSupply.stampValueBdt).toBe(1000);

      // Commercial Lease (800k annual rent) -> 1% = 8000
      const leaseStamp = engine.calculateStampDuty("property_lease", 800000);
      expect(leaseStamp.stampValueBdt).toBe(8000);
      expect(leaseStamp.statutoryArticle).toContain("Article 35");
    });

    it("generates bilingual clauses and executes dual-party cryptographic SHA-256 seal", () => {
      const engine = new LegalContractsEngine();

      const contract = engine.generateContract({
        type: "founder_vesting",
        firstParty: {
          name: "Arif Khan (Founder)",
          nidOrTin: "NID-199100223344",
          phone: "+8801711001122",
          address: "Gulshan-1, Dhaka",
        },
        secondParty: {
          name: "Samiul Islam (Co-Founder)",
          nidOrTin: "NID-199200334455",
          phone: "+8801711002233",
          address: "Banani, Dhaka",
        },
        contractValueBdt: 0,
        durationMonths: 48,
      });

      expect(contract.status).toBe("draft");
      expect(contract.clausesEn.length).toBeGreaterThanOrEqual(5);
      expect(contract.clausesBn.length).toBeGreaterThanOrEqual(5);

      // Party 1 signs
      const step1 = engine.signContract({
        contractId: contract.id,
        party: "firstParty",
        signerName: "Arif Khan",
        nidOrTin: "NID-199100223344",
        otpCode: "123456",
      });
      expect(step1.status).toBe("partially_signed");
      expect(step1.digitalSealHash).toBeUndefined();

      // Party 2 signs
      const step2 = engine.signContract({
        contractId: contract.id,
        party: "secondParty",
        signerName: "Samiul Islam",
        nidOrTin: "NID-199200334455",
        otpCode: "654321",
      });
      expect(step2.status).toBe("executed");
      expect(step2.digitalSealHash).toBeDefined();
      expect(step2.digitalSealHash?.length).toBe(64);
    });
  });

  describe("Legal Contracts HTTP Endpoints", () => {
    it("GET /api/v1/contracts/summary returns sovereign legal KPI metrics", async () => {
      const res = await fetch(`${baseUrl}/api/v1/contracts/summary`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.data.totalContracts).toBeGreaterThanOrEqual(3);
      expect(body.data.executedContracts).toBeGreaterThanOrEqual(1);
      expect(body.data.totalContractValueBdt).toBeGreaterThan(0);
    });

    it("POST /api/v1/contracts/calculate-stamp-duty checks stamp duty via API", async () => {
      const res = await fetch(`${baseUrl}/api/v1/contracts/calculate-stamp-duty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "nda" }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.data.stampValueBdt).toBe(300);
    });

    it("GET /api/v1/contracts lists all contracts", async () => {
      const res = await fetch(`${baseUrl}/api/v1/contracts`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(3);
    });

    it("POST /api/v1/contracts/generate creates a new contract and POST /api/v1/contracts/sign signs it", async () => {
      const createRes = await fetch(`${baseUrl}/api/v1/contracts/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "freelancer",
          firstParty: {
            name: "Shothik Tech Ltd",
            nidOrTin: "TIN-1122334455",
            phone: "+8801700000001",
            address: "Mohakhali DOHS, Dhaka",
          },
          secondParty: {
            name: "Mahmud Hasan",
            nidOrTin: "NID-19942839401",
            phone: "+8801800000002",
            address: "Mirpur 2, Dhaka",
          },
          contractValueBdt: 180000,
          durationMonths: 6,
        }),
      });

      expect(createRes.status).toBe(201);
      const created = (await createRes.json()).data;
      expect(created.id).toBeDefined();
      expect(created.status).toBe("draft");

      // Sign party 1
      const signRes = await fetch(`${baseUrl}/api/v1/contracts/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: created.id,
          party: "firstParty",
          signerName: "Director Operations",
          nidOrTin: "NID-1988223344",
          otpCode: "998877",
        }),
      });
      expect(signRes.status).toBe(200);
      const signBody = await signRes.json();
      expect(signBody.data.status).toBe("partially_signed");
    });

    it("GET /api/v1/contracts/:id retrieves contract details and handles 404", async () => {
      const listRes = await fetch(`${baseUrl}/api/v1/contracts`);
      const list = (await listRes.json()).data;
      const validId = list[0].id;

      const res = await fetch(`${baseUrl}/api/v1/contracts/${validId}`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.id).toBe(validId);

      const notFoundRes = await fetch(`${baseUrl}/api/v1/contracts/non_existent_id`);
      expect(notFoundRes.status).toBe(404);
    });
  });
});
