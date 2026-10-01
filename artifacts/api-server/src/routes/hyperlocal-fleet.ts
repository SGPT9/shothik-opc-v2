import { Router } from "express";
import { z } from "zod";
import {
  globalHyperlocalFleetEngine,
  type VehicleType,
  type VehicleStatus,
  type WeatherCondition,
} from "../lib/logistics/hyperlocal-fleet-engine.js";

export const hyperlocalFleetRouter = Router();

const dispatchInputSchema = z.object({
  originHubId: z.string().min(1, "Origin hub ID is required"),
  destinationCorridor: z.string().min(1, "Destination corridor ID is required"),
  destinationAddress: z.string().min(3, "Destination address is required"),
  recipientName: z.string().min(2, "Recipient name is required"),
  recipientPhone: z.string().regex(/^(\+?88)?01[3-9]\d{8}$/, "Valid Bangladesh phone number is required"),
  weightGrams: z.number().int().positive("Weight in grams must be positive").max(50000, "Max weight is 50kg"),
  isUrgent: z.boolean().optional().default(false),
  codAmountBdt: z.number().nonnegative().optional().default(0),
});

const telemetryInputSchema = z.object({
  batteryPercent: z.number().min(0).max(100).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  corridor: z.string().optional(),
  status: z.enum(["available", "in_transit", "charging", "maintenance", "rtb"]).optional(),
});

const corridorConditionsSchema = z.object({
  currentTrafficMultiplier: z.number().min(1.0).max(3.5).optional(),
  weather: z.enum(["clear", "overcast", "rainy", "high_winds"]).optional(),
  droneFlightAllowed: z.boolean().optional(),
});

// 1. List vehicles
hyperlocalFleetRouter.get(
  ["/logistics/hyperlocal-fleet/vehicles", "/v1/logistics/hyperlocal-fleet/vehicles", "/api/v1/logistics/hyperlocal-fleet/vehicles"],
  (req, res) => {
    const type = req.query.type as VehicleType | undefined;
    const status = req.query.status as VehicleStatus | undefined;
    const vehicles = globalHyperlocalFleetEngine.listVehicles(type, status);
    res.json({ success: true, count: vehicles.length, vehicles });
  },
);

// 2. List corridors
hyperlocalFleetRouter.get(
  ["/logistics/hyperlocal-fleet/corridors", "/v1/logistics/hyperlocal-fleet/corridors", "/api/v1/logistics/hyperlocal-fleet/corridors"],
  (_req, res) => {
    const corridors = globalHyperlocalFleetEngine.listCorridors();
    res.json({ success: true, count: corridors.length, corridors });
  },
);

// 3. List hubs
hyperlocalFleetRouter.get(
  ["/logistics/hyperlocal-fleet/hubs", "/v1/logistics/hyperlocal-fleet/hubs", "/api/v1/logistics/hyperlocal-fleet/hubs"],
  (_req, res) => {
    const hubs = globalHyperlocalFleetEngine.listHubs();
    res.json({ success: true, count: hubs.length, hubs });
  },
);

// 4. Dispatch parcel
hyperlocalFleetRouter.post(
  ["/logistics/hyperlocal-fleet/dispatch", "/v1/logistics/hyperlocal-fleet/dispatch", "/api/v1/logistics/hyperlocal-fleet/dispatch"],
  (req, res) => {
    const parsed = dispatchInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || "Invalid dispatch request" });
      return;
    }

    try {
      const result = globalHyperlocalFleetEngine.dispatchParcel(parsed.data);
      res.status(201).json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

// 5. Update vehicle telemetry
hyperlocalFleetRouter.post(
  ["/logistics/hyperlocal-fleet/vehicles/:id/telemetry", "/v1/logistics/hyperlocal-fleet/vehicles/:id/telemetry", "/api/v1/logistics/hyperlocal-fleet/vehicles/:id/telemetry"],
  (req, res) => {
    const vehicleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = telemetryInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || "Invalid telemetry data" });
      return;
    }

    try {
      const vehicle = globalHyperlocalFleetEngine.updateVehicleTelemetry(vehicleId, parsed.data);
      res.json({ success: true, vehicle });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  },
);

// 6. Trigger emergency Return-to-Base (RTB)
hyperlocalFleetRouter.post(
  ["/logistics/hyperlocal-fleet/vehicles/:id/rtb", "/v1/logistics/hyperlocal-fleet/vehicles/:id/rtb", "/api/v1/logistics/hyperlocal-fleet/vehicles/:id/rtb"],
  (req, res) => {
    const vehicleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
      const result = globalHyperlocalFleetEngine.triggerEmergencyRtb(vehicleId);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  },
);

// 7. Update corridor condition
hyperlocalFleetRouter.post(
  ["/logistics/hyperlocal-fleet/corridors/:id/conditions", "/v1/logistics/hyperlocal-fleet/corridors/:id/conditions", "/api/v1/logistics/hyperlocal-fleet/corridors/:id/conditions"],
  (req, res) => {
    const corridorId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = corridorConditionsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || "Invalid corridor condition data" });
      return;
    }

    try {
      const corridor = globalHyperlocalFleetEngine.updateCorridorConditions(corridorId, parsed.data);
      res.json({ success: true, corridor });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  },
);

export default hyperlocalFleetRouter;
