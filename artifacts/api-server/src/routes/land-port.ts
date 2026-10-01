import { Router } from "express";
import { z } from "zod";
import {
  landPortClearingEngine,
  type LandPortStationId,
} from "../lib/customs/land-port-clearing-engine.js";

export const landPortRouter = Router();

const weighbridgeSchema = z.object({
  consignmentId: z.string().min(2, "Consignment ID is required"),
  stationId: z.enum(["benapole", "bhomra", "tamabil", "burimari", "akhaura"]),
  truckRegistration: z.string().min(3, "Truck registration plate is required"),
  grossWeightKg: z.number().positive("Gross weight must be positive"),
  tareWeightKg: z.number().nonnegative("Tare weight must be non-negative"),
  declaredWeightKg: z.number().positive("Declared manifest weight must be positive"),
});

const quarantineSchema = z.object({
  consignmentId: z.string().min(2, "Consignment ID is required"),
  commodityName: z.string().min(2, "Commodity name is required"),
  isPerishable: z.boolean(),
  pestDetected: z.boolean(),
  moisturePercent: z.number().min(0).max(100),
  maxMoistureAllowed: z.number().min(0).max(100),
  treatmentCompleted: z.boolean().optional(),
});

const ectsSchema = z.object({
  lockId: z.string().min(2, "Lock ID is required"),
  consignmentId: z.string().min(2, "Consignment ID is required"),
  stationId: z.enum(["benapole", "bhomra", "tamabil", "burimari", "akhaura"]),
  truckRegistration: z.string().min(3, "Truck registration plate is required"),
  destinationIcd: z.string().min(2, "Destination ICD is required"),
  currentLat: z.number(),
  currentLng: z.number(),
  corridorLat: z.number(),
  corridorLng: z.number(),
  tamperDetected: z.boolean(),
  batteryPercent: z.number().min(0).max(100),
});

const bbinPermitSchema = z.object({
  truckRegistration: z.string().min(3, "Truck registration plate is required"),
  driverName: z.string().min(2, "Driver name is required"),
  passportOrNid: z.string().min(3, "Passport or NID number is required"),
  countryOfOrigin: z.enum(["IN", "BT", "NP"]),
  entryPortId: z.enum(["benapole", "bhomra", "tamabil", "burimari", "akhaura"]),
  cargoDescription: z.string().min(2, "Cargo description is required"),
  declaredTransitDays: z.number().int().positive("Declared transit days must be positive"),
  actualStayDays: z.number().int().nonnegative().optional(),
});

// 1. List land port stations
landPortRouter.get(
  ["/trade/land-port/stations", "/v1/trade/land-port/stations", "/api/v1/trade/land-port/stations"],
  (req, res) => {
    const stations = landPortClearingEngine.getStations();
    res.json({ success: true, count: stations.length, stations });
  },
);

// 2. Weighbridge audit
landPortRouter.post(
  ["/trade/land-port/weighbridge/audit", "/v1/trade/land-port/weighbridge/audit", "/api/v1/trade/land-port/weighbridge/audit"],
  (req, res) => {
    const parsed = weighbridgeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || "Invalid weighbridge request" });
      return;
    }

    try {
      const result = landPortClearingEngine.auditWeighbridge(parsed.data);
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

// 3. Quarantine & port health inspection
landPortRouter.post(
  ["/trade/land-port/quarantine/inspect", "/v1/trade/land-port/quarantine/inspect", "/api/v1/trade/land-port/quarantine/inspect"],
  (req, res) => {
    const parsed = quarantineSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || "Invalid quarantine request" });
      return;
    }

    try {
      const result = landPortClearingEngine.inspectQuarantine(parsed.data);
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

// 4. ECTS transit lock telemetry evaluation
landPortRouter.post(
  ["/trade/land-port/ects/telemetry", "/v1/trade/land-port/ects/telemetry", "/api/v1/trade/land-port/ects/telemetry"],
  (req, res) => {
    const parsed = ectsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || "Invalid ECTS request" });
      return;
    }

    try {
      const result = landPortClearingEngine.evaluateEctsTelemetry(parsed.data);
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

// 5. Issue BBIN-MVA permit and demurrage calculation
landPortRouter.post(
  ["/trade/land-port/bbin/permit", "/v1/trade/land-port/bbin/permit", "/api/v1/trade/land-port/bbin/permit"],
  (req, res) => {
    const parsed = bbinPermitSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || "Invalid BBIN permit request" });
      return;
    }

    try {
      const result = landPortClearingEngine.issueBbinPermit(parsed.data);
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
);
