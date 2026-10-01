import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import publishingRouter from "../publishing.js";
import { NilkhetPodEngine } from "../../lib/publishing/nilkhet-pod-engine.js";

const app = express();
app.use(express.json());
app.use("/api", publishingRouter);

describe("Nilkhet POD Press Network & Preflight Engine Suite (Slice 80)", () => {
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = (server.address() as any).port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe("GET /api/v1/publishing/nilkhet-pod/press-hubs", () => {
    it("returns list of verified Nilkhet & Katabon commercial printing hubs", async () => {
      const res = await fetch(`${baseUrl}/api/v1/publishing/nilkhet-pod/press-hubs`);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.count).toBeGreaterThanOrEqual(3);
      expect(Array.isArray(json.data)).toBe(true);

      const bakushah = json.data.find((h: any) => h.id === "hub_bakushah_press_01");
      expect(bakushah).toBeDefined();
      expect(bakushah.name).toContain("Bakushah Market");
      expect(bakushah.machines).toContain("Heidelberg Speedmaster 4-Color Offset");
      expect(bakushah.status).toBe("active");
    });
  });

  describe("POST /api/v1/publishing/nilkhet-pod/quote", () => {
    it("calculates live itemized BDT quoting, signature imposition, and parcel weight", async () => {
      const payload = {
        pageCount: 192,
        copyCount: 100,
        paperType: "80gsm_cream",
        bindingType: "paperback_glue",
        trimSize: "6x9",
        lamination: "matte",
        hubId: "hub_bakushah_press_01",
      };

      const res = await fetch(`${baseUrl}/api/v1/publishing/nilkhet-pod/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      const q = json.data;
      expect(q.pageCount).toBe(192);
      expect(q.copyCount).toBe(100);

      // Imposition verification
      expect(q.imposition.totalSignatures).toBe(12); // 192 / 16 = 12 signatures
      expect(q.imposition.platesRequired).toBe(384); // 12 * 4 sheets * 8 plates = 384 CTP plates
      expect(q.imposition.reamsRequired).toBeGreaterThan(0);

      // Spine & 300 DPI Canvas
      expect(q.spineGeometry.dpi).toBe(300);
      expect(q.spineGeometry.spineWidthMm).toBeGreaterThan(10);
      expect(q.spineGeometry.pixelDimensions.widthPx).toBeGreaterThan(3000);

      // Costing in BDT
      expect(q.costBreakdownBdt.platesCostBdt).toBeGreaterThan(0);
      expect(q.costBreakdownBdt.paperStockCostBdt).toBeGreaterThan(0);
      expect(q.costBreakdownBdt.subtotalProductionBdt).toBeGreaterThan(1000);
      expect(q.costBreakdownBdt.unitProductionCostBdt).toBeGreaterThan(10);
      expect(q.costBreakdownBdt.estimatedDeliveryFeeBdt).toBeGreaterThanOrEqual(60);

      // Weight
      expect(q.weightMetrics.singleBookWeightGrams).toBeGreaterThan(100);
      expect(q.weightMetrics.steadfastWeightKg).toBeGreaterThanOrEqual(1);
    });
  });

  describe("POST /api/v1/publishing/nilkhet-pod/preflight", () => {
    it("passes preflight check when CMYK FOGRA39, 300 DPI, 3mm bleed, and Bengali fonts exist", async () => {
      const payload = {
        pdfFileName: "bangla_manuscript_verified.pdf",
        colorSpace: "CMYK (FOGRA39)",
        dpi: 300,
        hasBleed3mm: true,
        fontsEmbedded: ["SolaimanLipi", "Kalpurush", "NikoshBAN"],
        bengaliSampleText: "বঙ্গবন্ধু শেখ মুজিবুর রহমান ডিজিটাল বিশ্ববিদ্যালয় ও গবেষণা কেন্দ্র",
      };

      const res = await fetch(`${baseUrl}/api/v1/publishing/nilkhet-pod/preflight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.passed).toBe(true);
      expect(json.data.score).toBe(100);
      expect(json.data.issues).toHaveLength(0);
      expect(json.data.checks.bengaliUnicodeIntegrity.detectedConjuncts.length).toBeGreaterThan(0);
    });

    it("flags preflight issues when RGB color space or low DPI is submitted", async () => {
      const payload = {
        pdfFileName: "unprepared_draft.pdf",
        colorSpace: "sRGB IEC61966-2.1",
        dpi: 72,
        hasBleed3mm: false,
        fontsEmbedded: ["Arial", "TimesNewRoman"],
      };

      const res = await fetch(`${baseUrl}/api/v1/publishing/nilkhet-pod/preflight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.passed).toBe(false);
      expect(json.data.score).toBeLessThan(60);
      expect(json.data.issues.length).toBeGreaterThanOrEqual(2);
      expect(json.data.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/v1/publishing/nilkhet-pod/dispatch", () => {
    it("books automated press production and Steadfast courier pickup consignment", async () => {
      const payload = {
        orderId: `POD_TEST_${Date.now()}`,
        bookTitle: "The Frontiers of Bengali Machine Learning",
        authorName: "Dr. Anisur Rahman",
        pageCount: 160,
        copyCount: 50,
        paperType: "80gsm_cream",
        bindingType: "hardcover_jacket",
        trimSize: "Royal_Demy",
        hubId: "hub_bakushah_press_01",
        recipientName: "Library Director",
        recipientPhone: "+8801711223344",
        deliveryAddress: "Central Library, Dhaka University, Nilkhet Road, Dhaka-1000",
        codAmountBdt: 35000,
      };

      const res = await fetch(`${baseUrl}/api/v1/publishing/nilkhet-pod/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);

      const d = json.data;
      expect(d.status).toBe("dispatched_to_press");
      expect(d.ticketId).toMatch(/^JDF_/);
      expect(d.hub.name).toContain("Bakushah Market");

      // Steadfast Courier Consignment
      expect(d.courierConsignment.partner).toBe("Steadfast Courier Ltd");
      expect(d.courierConsignment.trackingCode).toMatch(/^ST_POD_/);
      expect(d.courierConsignment.recipientName).toBe("Library Director");
      expect(d.courierConsignment.codAmountBdt).toBe(35000);
      expect(d.courierConsignment.parcelWeightKg).toBeGreaterThanOrEqual(1);

      // Cryptographic SHA-256 Audit Seal
      expect(d.auditTrail.sha256Seal).toHaveLength(64);
      expect(d.auditTrail.mushak63Ref).toMatch(/^M63-POD-/);
    });
  });

  describe("Direct Engine Unit Verification", () => {
    it("NilkhetPodEngine.listPressHubs returns complete operational hubs", () => {
      const hubs = NilkhetPodEngine.listPressHubs();
      expect(hubs.length).toBeGreaterThanOrEqual(3);
      for (const hub of hubs) {
        expect(hub.id).toBeDefined();
        expect(hub.machines.length).toBeGreaterThan(0);
        expect(hub.contactPhone).toMatch(/^\+8801/);
      }
    });
  });
});
