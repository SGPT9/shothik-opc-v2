import { Router, type Request, type Response } from "express";
import { Mushak66Engine } from "../lib/tax/mushak-66-engine.js";

export const mushak66Router = Router();

/**
 * POST /api/tax/mushak-66/generate
 * Generates an official NBR Mushak-6.6 Certificate of Tax Deduction at Source (VDS)
 */
mushak66Router.post("/tax/mushak-66/generate", (req: Request, res: Response) => {
  try {
    const certificate = Mushak66Engine.generateCertificate(req.body);
    res.json({ success: true, certificate });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
