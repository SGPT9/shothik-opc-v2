import { Router } from "express";
import { z } from "zod";
import {
  globalColdChainEngine,
  type CommodityType,
  type ShipmentStatus,
} from "../lib/agri/cold-chain-engine.js";

export const coldChainRouter = Router();

const registerShipmentSchema = z.object({
  commodity: z.enum(["mango", "potato", "tomato", "strawberry", "fish_hilsa"]),
  originFarm: z.string().min(3, "Origin farm description is required"),
  destinationMandi: z.string().min(3, "Destination mandi is required"),
  quantityKg: z.number().positive("Quantity in kg must be positive"),
  totalValueBdt: z.number().positive("Total value in BDT must be positive"),
  farmerPhone: z.string().regex(/^(\+?88)?01[3-9]\d{8}$/, "Valid Bangladesh phone number is required"),
  carrierName: z.string().min(2, "Carrier name is required"),
  vehiclePlate: z.string().min(3, "Vehicle registration plate is required"),
});

const telemetryReadingSchema = z.object({
  temperatureCelsius: z.number().min(-30).max(60),
  humidityPercent: z.number().min(0).max(100),
  locationName: z.string().optional(),
  timestamp: z.string().optional(),
});

// 1. List shipments
coldChainRouter.get(
  ["/agri/cold-chain/shipments", "/v1/agri/cold-chain/shipments", "/api/v1/agri/cold-chain/shipments"],
  (req, res) => {
    const status = req.query.status as ShipmentStatus | undefined;
    const shipments = globalColdChainEngine.listShipments(status);
    res.json({ success: true, count: shipments.length, shipments });
  },
);

// 2. Get single shipment
coldChainRouter.get(
  ["/agri/cold-chain/shipments/:id", "/v1/agri/cold-chain/shipments/:id", "/api/v1/agri/cold-chain/shipments/:id"],
  (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const shipment = globalColdChainEngine.getShipment(id);
    if (!shipment) {
      res.status(404).json({ success: false, error: "Cold chain shipment not found" });
      return;
    }
    res.json({ success: true, shipment });
  },
);

// 3. Register shipment with 30% advance escrow
coldChainRouter.post(
  ["/agri/cold-chain/shipments", "/v1/agri/cold-chain/shipments", "/api/v1/agri/cold-chain/shipments"],
  (req, res) => {
    const parsed = registerShipmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || "Invalid registration payload" });
      return;
    }

    try {
      const shipment = globalColdChainEngine.registerShipment(parsed.data);
      res.status(201).json({ success: true, shipment });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

// 4. Ingest IoT / RFID telemetry reading
coldChainRouter.post(
  ["/agri/cold-chain/shipments/:id/telemetry", "/v1/agri/cold-chain/shipments/:id/telemetry", "/api/v1/agri/cold-chain/shipments/:id/telemetry"],
  (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = telemetryReadingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || "Invalid telemetry payload" });
      return;
    }

    try {
      const reading = {
        ...parsed.data,
        timestamp: parsed.data.timestamp || new Date().toISOString(),
      };
      const shipment = globalColdChainEngine.ingestTelemetry(id, reading);
      res.json({ success: true, shipment });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  },
);

// 5. Settle arrival and disburse milestone
coldChainRouter.post(
  ["/agri/cold-chain/shipments/:id/settle", "/v1/agri/cold-chain/shipments/:id/settle", "/api/v1/agri/cold-chain/shipments/:id/settle"],
  (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
      const result = globalColdChainEngine.settleMandiArrival(id);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  },
);

// 6. Generate NBR Section 26 VAT exemption certificate
coldChainRouter.get(
  ["/agri/cold-chain/shipments/:id/vat-exemption", "/v1/agri/cold-chain/shipments/:id/vat-exemption", "/api/v1/agri/cold-chain/shipments/:id/vat-exemption"],
  (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
      const certificate = globalColdChainEngine.generateVatExemptionCertificate(id);
      res.json({ success: true, certificate });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  },
);

export default coldChainRouter;
