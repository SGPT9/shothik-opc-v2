import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { landPortRouter } from "../land-port.js";

const app = express();
app.use(express.json());
app.use("/api", landPortRouter);

describe("Autonomous Cross-Border Land Port Clearing & ECTS Engine (Slice 84)", () => {
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

  describe("GET /api/v1/trade/land-port/stations", () => {
    it("returns pre-seeded major land ports (Benapole, Bhomra, Tamabil, Burimari, Akhaura)", async () => {
      const res = await fetch(`${baseUrl}/api/v1/trade/land-port/stations`);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.count).toBe(5);

      const benapole = json.stations.find((s: any) => s.id === "benapole");
      expect(benapole).toBeDefined();
      expect(benapole.nameBangla).toContain("বেনাপোল");
      expect(benapole.counterpartPort).toBe("Petrapole, India");
      expect(benapole.basePortFeeBdt).toBe(2500);
      expect(benapole.freeHours).toBe(72);
    });
  });

  describe("POST /api/v1/trade/land-port/weighbridge/audit", () => {
    it("successfully passes a weighbridge check within 1.5% tolerance", async () => {
      const payload = {
        consignmentId: "CONSIGN-BEN-001",
        stationId: "benapole",
        truckRegistration: "WB-11-A-4567",
        grossWeightKg: 28000,
        tareWeightKg: 8000, // Net = 20,000 kg
        declaredWeightKg: 20100, // Discrepancy = -100 kg (0.5% - within 1.5%)
      };

      const res = await fetch(`${baseUrl}/api/v1/trade/land-port/weighbridge/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result.status).toBe("PASSED");
      expect(json.result.netWeightKg).toBe(20000);
      expect(json.result.isOverweight).toBe(false);
      expect(json.result.overloadSurchargeBdt).toBe(0);
      expect(json.result.auditSlipNumber).toContain("BSLPA-WB-BENAPOLE");
    });

    it("detects overweight violation exceeding tolerance and calculates surcharge", async () => {
      const payload = {
        consignmentId: "CONSIGN-BHM-002",
        stationId: "bhomra",
        truckRegistration: "WB-24-B-8910",
        grossWeightKg: 35000,
        tareWeightKg: 9000, // Net = 26,000 kg
        declaredWeightKg: 20000, // Discrepancy = +6,000 kg (30% overweight!)
      };

      const res = await fetch(`${baseUrl}/api/v1/trade/land-port/weighbridge/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result.status).toBe("OVERWEIGHT_PENALTY");
      expect(json.result.isOverweight).toBe(true);
      expect(json.result.overloadSurchargeBdt).toBeGreaterThan(0);
    });

    it("rejects invalid weighbridge request with missing fields", async () => {
      const res = await fetch(`${baseUrl}/api/v1/trade/land-port/weighbridge/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ truckRegistration: "WB-01" }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });
  });

  describe("POST /api/v1/trade/land-port/quarantine/inspect", () => {
    it("clears pest-free perishable cargo with SHA-256 certificate seal", async () => {
      const payload = {
        consignmentId: "AGRO-TAM-9021",
        commodityName: "Fresh Assam Ginger",
        isPerishable: true,
        pestDetected: false,
        moisturePercent: 12.5,
        maxMoistureAllowed: 14.0,
      };

      const res = await fetch(`${baseUrl}/api/v1/trade/land-port/quarantine/inspect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result.decision).toBe("CLEARED_GREEN");
      expect(json.result.phytosanitaryCertificateId).toContain("PQ-CERT");
      expect(json.result.certificateSealSha256).toMatch(/^[a-f0-9]{64}$/);
    });

    it("flags cargo for fumigation treatment when pests detected", async () => {
      const payload = {
        consignmentId: "AGRO-BHM-7788",
        commodityName: "Nasik Red Onions",
        isPerishable: true,
        pestDetected: true,
        moisturePercent: 11.0,
        maxMoistureAllowed: 13.0,
        treatmentCompleted: false,
      };

      const res = await fetch(`${baseUrl}/api/v1/trade/land-port/quarantine/inspect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result.decision).toBe("TREATMENT_REQUIRED_ORANGE");
      expect(json.result.inspectionNotes).toContain("fumigation required");
    });
  });

  describe("POST /api/v1/trade/land-port/ects/telemetry", () => {
    it("confirms cargo is secured in transit along expected corridor", async () => {
      const payload = {
        lockId: "ECTS-LOCK-5501",
        consignmentId: "CONSIGN-BEN-001",
        stationId: "benapole",
        truckRegistration: "WB-11-A-4567",
        destinationIcd: "ICD Kamalapur, Dhaka",
        currentLat: 23.045,
        currentLng: 88.895,
        corridorLat: 23.046,
        corridorLng: 88.896,
        tamperDetected: false,
        batteryPercent: 88,
      };

      const res = await fetch(`${baseUrl}/api/v1/trade/land-port/ects/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result.status).toBe("SECURED_IN_TRANSIT");
      expect(json.result.alarmTriggered).toBe(false);
      expect(json.result.telemetrySeal).toMatch(/^[a-f0-9]{64}$/);
    });

    it("triggers tamper alarm when physical seal breach is signaled", async () => {
      const payload = {
        lockId: "ECTS-LOCK-5502",
        consignmentId: "CONSIGN-BEN-002",
        stationId: "benapole",
        truckRegistration: "WB-11-A-9999",
        destinationIcd: "DEPZ Savar",
        currentLat: 23.1,
        currentLng: 89.2,
        corridorLat: 23.1,
        corridorLng: 89.2,
        tamperDetected: true,
        batteryPercent: 75,
      };

      const res = await fetch(`${baseUrl}/api/v1/trade/land-port/ects/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result.status).toBe("TAMPER_ALARM");
      expect(json.result.alarmTriggered).toBe(true);
    });
  });

  describe("POST /api/v1/trade/land-port/bbin/permit", () => {
    it("issues BBIN-MVA cross-border permit and calculates demurrage fees", async () => {
      const payload = {
        truckRegistration: "NL-01-AB-1234",
        driverName: "Gurpreet Singh",
        passportOrNid: "Z4499112",
        countryOfOrigin: "IN",
        entryPortId: "benapole",
        cargoDescription: "Cotton Textile Machinery Parts",
        declaredTransitDays: 5,
        actualStayDays: 5, // Benapole freeDays = 3 (72 hrs). 5 days -> 2 days demurrage @ ৳750 = ৳1,500 + base ৳2,500 = ৳4,000
      };

      const res = await fetch(`${baseUrl}/api/v1/trade/land-port/bbin/permit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result.basePermitFeeBdt).toBe(2500);
      expect(json.result.demurrageDays).toBe(2);
      expect(json.result.demurrageTotalBdt).toBe(1500);
      expect(json.result.totalPayableBdt).toBe(4000);
      expect(json.result.securityHash).toMatch(/^[a-f0-9]{64}$/);
    });
  });
});
