import { Router } from "express";
import { z } from "zod";
import {
  solarMicrogridEngine,
  type PalliBidyutZoneId,
} from "../lib/energy/solar-microgrid-engine.js";

export const energyRouter = Router();

const telemetrySchema = z.object({
  facilityId: z.string().min(2, "Facility ID is required"),
  facilityName: z.string().min(2, "Facility name is required"),
  zoneId: z.enum([
    "dhaka_pbs_1",
    "gazipur_pbs_1",
    "narayanganj_pbs",
    "chittagong_pbs_1",
    "rajshahi_pbs",
  ]),
  solarGenerationKwh: z.number().nonnegative("Solar generation must be non-negative"),
  facilityLoadKwh: z.number().nonnegative("Facility load must be non-negative"),
  gridImportKwh: z.number().nonnegative("Grid import must be non-negative"),
  gridExportKwh: z.number().nonnegative("Grid export must be non-negative"),
  batterySocPercent: z.number().min(0).max(100),
  inverterTempCelsius: z.number(),
});

const settlementSchema = z.object({
  facilityId: z.string().min(2, "Facility ID is required"),
  zoneId: z.enum([
    "dhaka_pbs_1",
    "gazipur_pbs_1",
    "narayanganj_pbs",
    "chittagong_pbs_1",
    "rajshahi_pbs",
  ]),
  billingMonth: z.string().min(3, "Billing month is required"),
  totalImportKwh: z.number().nonnegative("Total import must be non-negative"),
  totalExportKwh: z.number().nonnegative("Total export must be non-negative"),
  carriedOverUnitsKwh: z.number().nonnegative().optional(),
});

const gensetArbitrageSchema = z.object({
  facilityId: z.string().min(2, "Facility ID is required"),
  outageDurationHours: z.number().positive("Outage duration must be positive"),
  averageLoadKw: z.number().positive("Average load must be positive"),
  availableBatteryStorageKwh: z.number().nonnegative("Available battery storage must be non-negative"),
});

const carbonCertSchema = z.object({
  facilityId: z.string().min(2, "Facility ID is required"),
  totalCleanGenerationKwh: z.number().positive("Clean generation must be positive"),
});

// 1. List Palli Bidyut tariff zones
energyRouter.get(
  ["/energy/solar-microgrid/tariffs", "/v1/energy/solar-microgrid/tariffs", "/api/v1/energy/solar-microgrid/tariffs"],
  (req, res) => {
    const tariffs = solarMicrogridEngine.getTariffs();
    res.json({ success: true, count: tariffs.length, tariffs });
  },
);

// 2. Ingest Smart Meter Telemetry
energyRouter.post(
  ["/energy/solar-microgrid/telemetry", "/v1/energy/solar-microgrid/telemetry", "/api/v1/energy/solar-microgrid/telemetry"],
  (req, res) => {
    const parsed = telemetrySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || "Invalid telemetry request" });
      return;
    }

    try {
      const result = solarMicrogridEngine.ingestTelemetry(parsed.data);
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

// 3. Compute Net-Metering Settlement
energyRouter.post(
  ["/energy/solar-microgrid/net-metering/settle", "/v1/energy/solar-microgrid/net-metering/settle", "/api/v1/energy/solar-microgrid/net-metering/settle"],
  (req, res) => {
    const parsed = settlementSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || "Invalid settlement request" });
      return;
    }

    try {
      const result = solarMicrogridEngine.calculateNetMeteringSettlement(parsed.data);
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

// 4. Optimize Diesel Genset vs Solar Battery Arbitrage
energyRouter.post(
  ["/energy/solar-microgrid/genset/arbitrage", "/v1/energy/solar-microgrid/genset/arbitrage", "/api/v1/energy/solar-microgrid/genset/arbitrage"],
  (req, res) => {
    const parsed = gensetArbitrageSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || "Invalid arbitrage request" });
      return;
    }

    try {
      const result = solarMicrogridEngine.optimizeGensetArbitrage(parsed.data);
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

// 5. Generate SREDA Carbon Offset Certificate
energyRouter.post(
  ["/energy/solar-microgrid/carbon/certificate", "/v1/energy/solar-microgrid/carbon/certificate", "/api/v1/energy/solar-microgrid/carbon/certificate"],
  (req, res) => {
    const parsed = carbonCertSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || "Invalid certificate request" });
      return;
    }

    try {
      const result = solarMicrogridEngine.generateCarbonOffsetCertificate(parsed.data.facilityId, parsed.data.totalCleanGenerationKwh);
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
);
