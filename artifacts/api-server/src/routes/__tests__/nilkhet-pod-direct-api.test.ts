import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";
import { NilkhetImpositionEngine, VERIFIED_NILKHET_HUBS } from "../../lib/nilkhet-imposition-engine";

describe("Nilkhet POD Direct API — Imposition, Spine Geometry & Print Hub Dispatch", { timeout: 25000 }, () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    if (server) {
      server.closeAllConnections?.();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }, 15000);

  async function request(path: string, options: { method?: string; body?: unknown; headers?: Record<string, string> } = {}) {
    const { method = "GET", body, headers = {} } = options;
    const reqHeaders: Record<string, string> = { ...headers };
    if (body) {
      reqHeaders["Content-Type"] = "application/json";
    }

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    let json: any = null;
    try {
      json = await res.json();
    } catch {
      // ignore
    }

    return {
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      body: json,
    };
  }

  // --- 1. Engine Direct Unit Logic ---
  describe("NilkhetImpositionEngine Core Logic", () => {
    it("calculates accurate spine geometry across different paper types and trims", () => {
      // 160 pages 70gsm offset: 80 sheets * 0.09 = 7.2mm + 1.2mm = 8.4mm
      const geom70 = NilkhetImpositionEngine.calculateSpineGeometry(160, "70gsm_offset", "6x9", 3.0);
      expect(geom70.spineWidthMm).toBe(8.4);
      expect(geom70.trimWidthMm).toBe(152.4);
      expect(geom70.trimHeightMm).toBe(228.6);
      expect(geom70.fullCoverWidthMm).toBe(Math.round((152.4 * 2 + 8.4 + 6) * 10) / 10);
      expect(geom70.fullCoverHeightMm).toBe(Math.round((228.6 + 6) * 10) / 10);
      expect(geom70.pixelDimensions.widthPx).toBeGreaterThan(0);
      expect(geom70.pixelDimensions.heightPx).toBeGreaterThan(0);

      // 160 pages 80gsm cream: 80 sheets * 0.11 = 8.8mm + 1.2mm = 10.0mm
      const geom80 = NilkhetImpositionEngine.calculateSpineGeometry(160, "80gsm_cream", "A5", 3.0);
      expect(geom80.spineWidthMm).toBe(10.0);
      expect(geom80.trimWidthMm).toBe(148.0);
      expect(geom80.trimHeightMm).toBe(210.0);

      // Royal Demy check
      const geomRoyal = NilkhetImpositionEngine.calculateSpineGeometry(200, "100gsm_art", "Royal_Demy");
      expect(geomRoyal.trimWidthMm).toBe(156.0);
      expect(geomRoyal.trimHeightMm).toBe(234.0);
      expect(geomRoyal.sheetThicknessMm).toBe(0.13);
    });

    it("generates correct signature imposition pagination and sheet allocation", () => {
      // 18 pages padded to 32 pages for 16-up signature
      const imp16 = NilkhetImpositionEngine.generateSignatureImposition(18, 16);
      expect(imp16.originalPageCount).toBe(18);
      expect(imp16.paddedPageCount).toBe(32);
      expect(imp16.totalSignatures).toBe(2);
      expect(imp16.totalSheets).toBe(8); // 2 signatures * (16 / 4) sheets
      expect(imp16.platesRequired).toBe(64); // 8 sheets * 8 plates (CMYK both sides)
      expect(imp16.sheets.length).toBe(8);

      // First sheet front should have [p4, p1] = [16, 1], back [p2, p3] = [2, 15]
      const firstSheet = imp16.sheets[0];
      expect(firstSheet.signatureNumber).toBe(1);
      expect(firstSheet.frontPages).toEqual([16, 1]);
      expect(firstSheet.backPages).toEqual([2, 15]);

      // 8-page signatures
      const imp8 = NilkhetImpositionEngine.generateSignatureImposition(12, 8);
      expect(imp8.paddedPageCount).toBe(16);
      expect(imp8.totalSignatures).toBe(2);
      expect(imp8.totalSheets).toBe(4);
    });
  });

  // --- 2. REST Endpoint: Imposition Calculation ---
  describe("POST /api/v1/publishing/nilkhet/imposition/calculate", () => {
    it("returns spine and imposition calculations for valid book payload", async () => {
      const res = await request("/api/v1/publishing/nilkhet/imposition/calculate", {
        method: "POST",
        body: {
          pageCount: 192,
          paperType: "80gsm_cream",
          trimSize: "6x9",
          signatureSize: 16,
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.spineGeometry.pageCount).toBe(192);
      expect(res.body.data.spineGeometry.spineWidthMm).toBeGreaterThan(0);
      expect(res.body.data.imposition.signatureSize).toBe(16);
      expect(res.body.data.imposition.totalSheets).toBe(192 / 4);
    });

    it("rejects request if pageCount is missing or less than 4", async () => {
      const res = await request("/api/v1/publishing/nilkhet/imposition/calculate", {
        method: "POST",
        body: {
          pageCount: 2,
        },
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("Valid pageCount");
    });
  });

  // --- 3. REST Endpoint: Print Hubs List ---
  describe("GET /api/v1/publishing/nilkhet/hubs", () => {
    it("returns the directory of verified Nilkhet and Katabon commercial press hubs", async () => {
      const res = await request("/api/v1/publishing/nilkhet/hubs");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.total).toBe(VERIFIED_NILKHET_HUBS.length);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0]).toHaveProperty("marketCluster");
      expect(res.body.data[0]).toHaveProperty("machines");
      expect(res.body.data[0]).toHaveProperty("supportedBindings");
    });
  });

  // --- 4. REST Endpoint: Dispatch Hub & Job Ticket Retrieval ---
  describe("POST /api/v1/publishing/nilkhet/dispatch-hub & Job Ticket", () => {
    it("validates mandatory fields for press dispatch", async () => {
      const res = await request("/api/v1/publishing/nilkhet/dispatch-hub", {
        method: "POST",
        body: {
          bookTitle: "Incomplete Order",
        },
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("required");
    });

    it("successfully dispatches an order and produces a machine-readable JDF job ticket", async () => {
      const orderId = `test_pod_${Date.now()}`;
      const dispatchRes = await request("/api/v1/publishing/nilkhet/dispatch-hub", {
        method: "POST",
        body: {
          orderId,
          bookTitle: "Quantum Epistemic Graphs",
          authorName: "Anisur Rahman",
          pageCount: 220,
          copyCount: 50,
          paperType: "80gsm_cream",
          bindingType: "hardcover_jacket",
          trimSize: "Royal_Demy",
          hubId: "hub_bakushah_press_01",
          deliveryAddress: "House 42, Road 9/A, Dhanmondi, Dhaka",
          recipientName: "Dr. Rafiqul Islam",
          recipientPhone: "+8801812345678",
          codAmountBdt: 12500,
        },
      });

      expect(dispatchRes.status).toBe(201);
      expect(dispatchRes.body.success).toBe(true);
      expect(dispatchRes.body.message).toContain("Bakushah Market");

      const ticket = dispatchRes.body.data;
      expect(ticket.orderId).toBe(orderId);
      expect(ticket.bookTitle).toBe("Quantum Epistemic Graphs");
      expect(ticket.copyCount).toBe(50);
      expect(ticket.bindingType).toBe("hardcover_jacket");
      expect(ticket.status).toBe("dispatched_to_press");
      expect(ticket.courierConsignment).toBeDefined();
      expect(ticket.courierConsignment.recipientName).toBe("Dr. Rafiqul Islam");
      expect(ticket.courierConsignment.codAmountBdt).toBe(12500);

      // Verify retrieval by orderId
      const ticketRes = await request(`/api/v1/publishing/nilkhet/orders/${orderId}/job-ticket`);
      expect(ticketRes.status).toBe(200);
      expect(ticketRes.body.success).toBe(true);
      expect(ticketRes.body.data.ticketId).toBe(ticket.ticketId);
      expect(ticketRes.body.data.orderId).toBe(orderId);
    });

    it("returns 404 for non-existent job ticket", async () => {
      const res = await request("/api/v1/publishing/nilkhet/orders/non_existent_order_999/job-ticket");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("Job ticket not found");
    });
  });
});
