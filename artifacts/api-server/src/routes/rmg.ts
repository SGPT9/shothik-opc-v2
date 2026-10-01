import { Router } from "express";
import { z } from "zod";
import {
  rmgMerchandisingEngine,
  type GarmentType,
} from "../lib/apparel/rmg-merchandising-engine.js";

export const rmgRouter = Router();

const consumptionSchema = z.object({
  garmentType: z.enum([
    "basic_tshirt",
    "polo_shirt",
    "hoodie",
    "denim_jeans",
    "twill_chino",
    "woven_shirt",
  ]),
  orderQuantityPcs: z.number().int().positive("Order quantity must be positive"),
  fabricGsm: z.number().positive("Fabric GSM must be positive"),
  bodyLengthCm: z.number().positive("Body length must be positive"),
  halfChestCm: z.number().positive("Half chest must be positive"),
  sleeveLengthCm: z.number().positive("Sleeve length must be positive"),
  markerEfficiencyPercent: z.number().min(50).max(100).optional(),
  wastageAllowancePercent: z.number().min(0).max(50).optional(),
});

const techPackSchema = z.object({
  styleCode: z.string().min(2, "Style code is required"),
  styleName: z.string().min(2, "Style name is required"),
  garmentType: z.enum([
    "basic_tshirt",
    "polo_shirt",
    "hoodie",
    "denim_jeans",
    "twill_chino",
    "woven_shirt",
  ]),
  fabricComposition: z.string().min(3, "Fabric composition is required"),
  fabricGsm: z.number().positive("Fabric GSM must be positive"),
  yarnCount: z.string().min(2, "Yarn count is required"),
  orderQuantityPcs: z.number().int().positive("Order quantity must be positive"),
  cmCostPerDozenBdt: z.number().positive("Cost of making (CM) must be positive"),
  factoryName: z.string().min(2, "Factory name is required"),
});

const contractSchema = z.object({
  techPack: z.any(),
  subcontractorName: z.string().min(2, "Subcontractor name is required"),
});

const mushak43Schema = z.object({
  techPack: z.any(),
  consumption: z.any(),
});

// 1. Calculate Fabric Consumption & Yield
rmgRouter.post(
  ["/apparel/rmg/consumption", "/v1/apparel/rmg/consumption", "/api/v1/apparel/rmg/consumption"],
  (req, res) => {
    const parsed = consumptionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || "Invalid consumption request" });
      return;
    }

    try {
      const result = rmgMerchandisingEngine.calculateFabricConsumption(parsed.data);
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

// 2. Generate Technical Pack & BOM
rmgRouter.post(
  ["/apparel/rmg/tech-pack", "/v1/apparel/rmg/tech-pack", "/api/v1/apparel/rmg/tech-pack"],
  (req, res) => {
    const parsed = techPackSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.issues[0]?.message || "Invalid tech pack request" });
      return;
    }

    try {
      const result = rmgMerchandisingEngine.generateTechPack(parsed.data);
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

// 3. Create Subcontracting 4-Tier Milestone Escrow Contract
rmgRouter.post(
  ["/apparel/rmg/contracts/milestone-escrow", "/v1/apparel/rmg/contracts/milestone-escrow", "/api/v1/apparel/rmg/contracts/milestone-escrow"],
  (req, res) => {
    const parsed = contractSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "Invalid subcontracting request" });
      return;
    }

    try {
      const result = rmgMerchandisingEngine.createSubcontractContract(parsed.data.techPack, parsed.data.subcontractorName);
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
);

// 4. Compile Statutory Mushak-4.3 Input-Output Declaration
rmgRouter.post(
  ["/apparel/rmg/mushak-43/declaration", "/v1/apparel/rmg/mushak-43/declaration", "/api/v1/apparel/rmg/mushak-43/declaration"],
  (req, res) => {
    const parsed = mushak43Schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "Invalid Mushak-4.3 declaration request" });
      return;
    }

    try {
      const result = rmgMerchandisingEngine.compileMushak43Declaration(parsed.data.techPack, parsed.data.consumption);
      res.json({ success: true, result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
);
