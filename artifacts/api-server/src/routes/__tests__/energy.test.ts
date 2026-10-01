import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { energyRouter } from "../energy.js";

const app = express();
app.use(express.json());
app.use("/api", energyRouter);

describe("Autonomous Micro-Grid Solar Telemetry & Net-Metering Engine (Slice 86)", () => {
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

  describe("GET /api/v1/energy/solar-microgrid/tariffs", () => {
    it("returns pre-seeded Palli Bidyut Samity (PBS) tariff schedules", async () => {
      const res = await fetch(`${baseUrl}/api/v1/energy/solar-microgrid/tariffs`);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.count).toBe(5);

      const savar = json.tariffs.find((t: any) => t.zoneId === "dhaka_pbs_1");
      expect(savar).toBeDefined();
      expect(savar.zoneNameBangla).toContain("সাভার");
      expect(savar.flatRateBdtPerKwh).toBe(11.5);
      expect(savar.demandChargeMonthlyBdt).toBe(450);
    });
  });

  describe("POST /api/v1/energy/solar-microgrid/telemetry", () => {
    it("ingests smart meter telemetry, evaluates net power flow, and verifies battery status", async () => {
      const payload = {
        facilityId: "FAC-NILKHET-PRESS-01",
        facilityName: "Nilkhet Offset Press Rooftop Solar",
        zoneId: "dhaka_pbs_1",
        solarGenerationKwh: 35.5,
        facilityLoadKwh: 22.0,
        gridImportKwh: 0,
        gridExportKwh: 13.5, // Surplus generation!
        batterySocPercent: 88,
        inverterTempCelsius: 48.2,
      };

      const res = await fetch(`${baseUrl}/api/v1/energy/solar-microgrid/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result.netPowerFlowKwh).toBe(13.5);
      expect(json.result.thermalWarning).toBe(false);
      expect(json.result.batteryStatus).toBe("OPTIMAL");
      expect(json.result.telemetrySealSha256).toMatch(/^[a-f0-9]{64}$/);
    });

    it("triggers low reserve alarm when battery SOC drops below 25%", async () => {
      const payload = {
        facilityId: "FAC-SAVAR-AGRO-02",
        facilityName: "Savar Cold Storage Hub",
        zoneId: "dhaka_pbs_1",
        solarGenerationKwh: 5.0,
        facilityLoadKwh: 40.0,
        gridImportKwh: 35.0,
        gridExportKwh: 0,
        batterySocPercent: 18.5, // Low battery!
        inverterTempCelsius: 52.0,
      };

      const res = await fetch(`${baseUrl}/api/v1/energy/solar-microgrid/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result.batteryStatus).toBe("LOW_RESERVE_ALARM");
    });
  });

  describe("POST /api/v1/energy/solar-microgrid/net-metering/settle", () => {
    it("computes net billable units with demand charge and 5% statutory VAT", async () => {
      const payload = {
        facilityId: "FAC-GAZIPUR-RMG-03",
        zoneId: "gazipur_pbs_1",
        billingMonth: "October 2026",
        totalImportKwh: 12000,
        totalExportKwh: 8500, // Net = 3,500 kWh @ ৳12 = ৳42,000 + ৳500 demand = ৳42,500 + 5% VAT = ৳44,625
        carriedOverUnitsKwh: 0,
      };

      const res = await fetch(`${baseUrl}/api/v1/energy/solar-microgrid/net-metering/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result.netBilledUnitsKwh).toBe(3500);
      expect(json.result.energyChargeBdt).toBe(42000);
      expect(json.result.demandChargeBdt).toBe(500);
      expect(json.result.statutoryVatBdt).toBe(2125);
      expect(json.result.totalPayableBillBdt).toBe(44625);
      expect(json.result.billSlipNumber).toContain("PBS-BILL-FAC-GAZIPUR-RMG-03");
      expect(json.result.auditSealSha256).toMatch(/^[a-f0-9]{64}$/);
    });

    it("banks surplus solar export units when export exceeds facility import", async () => {
      const payload = {
        facilityId: "FAC-RAJSHAHI-AGRI-04",
        zoneId: "rajshahi_pbs",
        billingMonth: "October 2026",
        totalImportKwh: 4000,
        totalExportKwh: 6500, // Surplus = 2,500 banked units!
        carriedOverUnitsKwh: 0,
      };

      const res = await fetch(`${baseUrl}/api/v1/energy/solar-microgrid/net-metering/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result.netBilledUnitsKwh).toBe(0);
      expect(json.result.surplusUnitsBankedKwh).toBe(2500);
    });
  });

  describe("POST /api/v1/energy/solar-microgrid/genset/arbitrage", () => {
    it("optimizes battery storage vs diesel genset during load-shedding outages", async () => {
      const payload = {
        facilityId: "FAC-NARAYANGANJ-05",
        outageDurationHours: 4,
        averageLoadKw: 25, // Total 100 kWh
        availableBatteryStorageKwh: 60, // 60 kWh battery, 40 kWh diesel
      };

      const res = await fetch(`${baseUrl}/api/v1/energy/solar-microgrid/genset/arbitrage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result.totalEnergyRequiredKwh).toBe(100);
      expect(json.result.energySuppliedByBatteryKwh).toBe(60);
      expect(json.result.energySuppliedByGensetKwh).toBe(40);
      expect(json.result.netSavingsBdt).toBeGreaterThan(1500);
      expect(json.result.dieselFuelSavedLiters).toBeGreaterThan(15);
      expect(json.result.evaluationSeal).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("POST /api/v1/energy/solar-microgrid/carbon/certificate", () => {
    it("generates SREDA statutory greenhouse gas offset certificate", async () => {
      const payload = {
        facilityId: "FAC-DHAKA-PRESS-01",
        totalCleanGenerationKwh: 10000,
      };

      const res = await fetch(`${baseUrl}/api/v1/energy/solar-microgrid/carbon/certificate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result.co2AvoidedKg).toBe(6200); // 10000 * 0.62
      expect(json.result.treesEquivalentCount).toBe(Math.round(6200 / 21));
      expect(json.result.certificateSealSha256).toMatch(/^[a-f0-9]{64}$/);
    });
  });
});
