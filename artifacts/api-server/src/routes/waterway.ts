import { Router } from "express";
import { z } from "zod";
import {
  BIWTA_RIVER_CORRIDORS,
  analyzeVesselTelemetry,
  auditCargoLaytime,
  generateBiwtaStatutoryReceipt,
  type RiverCorridorId,
} from "../lib/logistics/waterway-cargo-engine.js";

export const waterwayRouter = Router();

const telemetrySchema = z.object({
  vesselId: z.string().min(2, "Vessel ID is required"),
  corridorId: z.enum([
    "chittagong_dhaka_meghna",
    "mongla_khulna_barisal",
    "paturia_daulatdia_padma",
    "narayanganj_ashuganj_surma",
    "chattogram_chandpur",
  ]),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speedKnots: z.number().nonnegative("Speed must be non-negative"),
  headingDegrees: z.number().min(0).max(360),
  riverKilometerMarker: z.number().nonnegative(),
  currentWaterDepthMeters: z.number().positive("Water depth must be greater than zero"),
  currentDraftMeters: z.number().positive("Vessel draft must be greater than zero"),
  timestamp: z.string().optional(),
});

const laytimeSchema = z.object({
  consignmentId: z.string().min(2, "Consignment ID is required"),
  vesselId: z.string().min(2, "Vessel ID is required"),
  cargoType: z.string().min(2, "Cargo type is required"),
  cargoQuantityMt: z.number().positive("Cargo quantity must be positive MT"),
  dischargePortGhat: z.string().min(2, "Discharge ghat is required"),
  norAcceptedAt: z.string().min(5, "Notice of readiness timestamp is required"),
  dischargeCompletedAt: z.string().min(5, "Discharge completed timestamp is required"),
  customFreeLaytimeHours: z.number().positive().optional(),
  weatherExceptionHours: z.number().nonnegative().optional(),
  demurrageDailyRateBdt: z.number().positive().optional(),
  despatchDailyRateBdt: z.number().positive().optional(),
});

const biwtaReceiptSchema = z.object({
  vesselId: z.string().min(2, "Vessel ID is required"),
  vesselName: z.string().min(2, "Vessel name is required"),
  registrationNo: z.string().min(2, "Registration number is required"),
  deadweightTonnage: z.number().positive("Deadweight tonnage must be positive"),
  corridorId: z.enum([
    "chittagong_dhaka_meghna",
    "mongla_khulna_barisal",
    "paturia_daulatdia_padma",
    "narayanganj_ashuganj_surma",
    "chattogram_chandpur",
  ]),
  berthingDays: z.number().int().min(1, "Berthing days must be at least 1"),
  requiresPilotage: z.boolean(),
});

// 1. List BIWTA Navigable River Corridors
waterwayRouter.get(
  [
    "/logistics/waterway/corridors",
    "/v1/logistics/waterway/corridors",
    "/api/v1/logistics/waterway/corridors",
  ],
  (req, res) => {
    const corridors = Object.values(BIWTA_RIVER_CORRIDORS);
    res.json({ success: true, count: corridors.length, corridors });
  }
);

// 2. Ingest Live Vessel AIS Telemetry & Check Draught Clearance
waterwayRouter.post(
  [
    "/logistics/waterway/telemetry",
    "/v1/logistics/waterway/telemetry",
    "/api/v1/logistics/waterway/telemetry",
  ],
  (req, res) => {
    const parseResult = telemetrySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: "Invalid telemetry payload",
        details: parseResult.error.flatten(),
      });
      return;
    }

    try {
      const output = analyzeVesselTelemetry(parseResult.data);
      res.json({ success: true, telemetry: output });
    } catch (err: any) {
      res.status(422).json({ success: false, error: err.message });
    }
  }
);

// 3. Audit Bulk Cargo Laytime, Demurrage & Despatch Rebate
waterwayRouter.post(
  [
    "/logistics/waterway/laytime/audit",
    "/v1/logistics/waterway/laytime/audit",
    "/api/v1/logistics/waterway/laytime/audit",
  ],
  (req, res) => {
    const parseResult = laytimeSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: "Invalid laytime audit payload",
        details: parseResult.error.flatten(),
      });
      return;
    }

    try {
      const output = auditCargoLaytime(parseResult.data);
      res.json({ success: true, laytimeAudit: output });
    } catch (err: any) {
      res.status(422).json({ success: false, error: err.message });
    }
  }
);

// 4. Generate Statutory BIWTA River Conservation & Port Dues Receipt
waterwayRouter.post(
  [
    "/logistics/waterway/biwta/receipt",
    "/v1/logistics/waterway/biwta/receipt",
    "/api/v1/logistics/waterway/biwta/receipt",
  ],
  (req, res) => {
    const parseResult = biwtaReceiptSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: "Invalid BIWTA receipt payload",
        details: parseResult.error.flatten(),
      });
      return;
    }

    try {
      const output = generateBiwtaStatutoryReceipt(parseResult.data);
      res.json({ success: true, receipt: output });
    } catch (err: any) {
      res.status(422).json({ success: false, error: err.message });
    }
  }
);
