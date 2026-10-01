import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { coldChainRouter } from "../cold-chain.js";

const app = express();
app.use(express.json());
app.use("/api", coldChainRouter);

describe("Decentralized Farm-to-Table Cold Chain Telemetry & Traceability Engine (Slice 83)", () => {
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

  describe("GET /api/v1/agri/cold-chain/shipments", () => {
    it("returns active cold chain consignments with Bengali produce metadata", async () => {
      const res = await fetch(`${baseUrl}/api/v1/agri/cold-chain/shipments`);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.count).toBeGreaterThanOrEqual(1);

      const mangoShipment = json.shipments.find((s: any) => s.commodity === "mango");
      expect(mangoShipment).toBeDefined();
      expect(mangoShipment.commodityNameBangla).toContain("রাজশাহী");
      expect(mangoShipment.readings.length).toBeGreaterThanOrEqual(2);
      expect(mangoShipment.sha256AuditSeal).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("POST /api/v1/agri/cold-chain/shipments", () => {
    let createdShipmentId: string;

    it("registers new cold chain lot with 30% loading advance escrow and SHA-256 seal", async () => {
      const payload = {
        commodity: "potato",
        originFarm: "Shibganj Cold Storage Hub, Bogra",
        destinationMandi: "Karwan Bazar Wholesale Arat, Dhaka",
        quantityKg: 8000,
        totalValueBdt: 240000, // 240,000 BDT
        farmerPhone: "01722334455",
        carrierName: "Karotoa Reefer Express",
        vehiclePlate: "Bogra-Da-11-9082",
      };

      const res = await fetch(`${baseUrl}/api/v1/agri/cold-chain/shipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.shipment.id).toBeDefined();
      expect(json.shipment.status).toBe("loaded");
      expect(json.shipment.advancePayoutBdt).toBe(72000); // 30% of 240,000
      expect(json.shipment.balancePayoutBdt).toBe(168000); // 70% of 240,000
      expect(json.shipment.sha256AuditSeal).toBeDefined();
      createdShipmentId = json.shipment.id;
    });

    it("POST /api/v1/agri/cold-chain/shipments/:id/telemetry logs sensor burst and computes Arrhenius SRI", async () => {
      expect(createdShipmentId).toBeDefined();

      // Normal reading within range (potato optimal: 3 - 7 C)
      const res = await fetch(`${baseUrl}/api/v1/agri/cold-chain/shipments/${createdShipmentId}/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperatureCelsius: 4.8,
          humidityPercent: 88,
          locationName: "Sirajganj Highway Junction",
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.shipment.status).toBe("in_transit");
      expect(json.shipment.readings.length).toBe(1);
      expect(json.shipment.gradeVerdict).toBe("Grade A (Prime)");
    });

    it("accrues excursions and degrades grade verdict when heat spikes occur", async () => {
      // Excursion reading: 18.5 C (potato max is 7 C)
      const res = await fetch(`${baseUrl}/api/v1/agri/cold-chain/shipments/${createdShipmentId}/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperatureCelsius: 18.5,
          humidityPercent: 65,
          locationName: "Chandra Traffic Congestion",
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.shipment.excursionCount).toBe(1);
      expect(json.shipment.spoilageRiskIndex).toBeGreaterThan(0.05);
    });

    it("POST /api/v1/agri/cold-chain/shipments/:id/settle finalizes arrival and releases remaining payout", async () => {
      const res = await fetch(`${baseUrl}/api/v1/agri/cold-chain/shipments/${createdShipmentId}/settle`, {
        method: "POST",
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.shipment.status).toBe("settled");
      expect(json.disbursedBdt).toBeGreaterThan(0);
      expect(json.payoutSummary).toContain("Mandi settlement complete");
    });

    it("GET /api/v1/agri/cold-chain/shipments/:id/vat-exemption generates statutory NBR Section 26 certificate", async () => {
      const res = await fetch(`${baseUrl}/api/v1/agri/cold-chain/shipments/${createdShipmentId}/vat-exemption`);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.certificate.statutoryRule).toContain("Section 26");
      expect(json.certificate.vatRatePercent).toBe(0);
      expect(json.certificate.totalExemptAmountBdt).toBe(240000);
      expect(json.certificate.qrPayload).toBeDefined();
      expect(json.certificate.digitalSeal).toMatch(/^[a-f0-9]{64}$/);
    });

    it("validates registration and rejects invalid phone or negative quantities", async () => {
      const res = await fetch(`${baseUrl}/api/v1/agri/cold-chain/shipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commodity: "mango",
          originFarm: "Rajshahi",
          destinationMandi: "Dhaka",
          quantityKg: -100, // Invalid negative
          totalValueBdt: 50000,
          farmerPhone: "123", // Invalid phone
          carrierName: "Truck",
          vehiclePlate: "123",
        }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });
  });
});
