import { Router, type IRouter, type Request, type Response } from "express";
import { KycOcrEngine } from "../lib/kyc/kyc-ocr-engine.js";

export const kycOcrRouter: IRouter = Router();
const engine = KycOcrEngine.getInstance();

/**
 * POST /api/v1/kyc/ocr/process-nid
 * Processes Smart or Legacy NID image or OCR text payload
 */
kycOcrRouter.post(["/v1/kyc/ocr/process-nid", "/api/v1/kyc/ocr/process-nid"], (req: Request, res: Response) => {
  try {
    const { imagePayload, rawOcrText, expectedName } = req.body || {};
    const dossier = engine.processNid({
      imagePayload,
      rawOcrText,
      expectedName,
    });
    return res.status(200).json({ success: true, dossier });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Failed to process NID" });
  }
});

/**
 * POST /api/v1/kyc/ocr/process-trade-license
 * Processes Municipal or Union Parishad Trade License
 */
kycOcrRouter.post(["/v1/kyc/ocr/process-trade-license", "/api/v1/kyc/ocr/process-trade-license"], (req: Request, res: Response) => {
  try {
    const { imagePayload, rawOcrText, expectedBusinessName } = req.body || {};
    const dossier = engine.processTradeLicense({
      imagePayload,
      rawOcrText,
      expectedBusinessName,
    });
    return res.status(200).json({ success: true, dossier });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Failed to process Trade License" });
  }
});

/**
 * POST /api/v1/kyc/ocr/verify-dossier
 * Validates cryptographic SHA-256 seal of a stored dossier
 */
kycOcrRouter.post(["/v1/kyc/ocr/verify-dossier", "/api/v1/kyc/ocr/verify-dossier"], (req: Request, res: Response) => {
  try {
    const { dossierId } = req.body || {};
    if (!dossierId) {
      return res.status(400).json({ success: false, error: "dossierId is required" });
    }
    const result = engine.verifyDossierSeal(dossierId);
    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Verification failed" });
  }
});

/**
 * GET /api/v1/kyc/ocr/dossiers
 * Lists all generated KYC dossiers
 */
kycOcrRouter.get(["/v1/kyc/ocr/dossiers", "/api/v1/kyc/ocr/dossiers"], (_req: Request, res: Response) => {
  try {
    const dossiers = engine.listDossiers();
    return res.status(200).json({ success: true, count: dossiers.length, dossiers });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Failed to retrieve dossiers" });
  }
});
