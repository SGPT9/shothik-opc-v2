import { Router, Request, Response } from "express";
import {
  halalGovernanceEngine,
  E_NUMBER_DATABASE,
  ShariahCertificationType,
  AuditStatus,
} from "../lib/shariah/halal-governance-engine.js";

export const halalGovernanceRouter = Router();

// GET /api/v1/shariah/summary
halalGovernanceRouter.get("/v1/shariah/summary", (_req: Request, res: Response) => {
  try {
    const summary = halalGovernanceEngine.getSummaryMetrics();
    return res.json({ ok: true, data: summary });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/v1/shariah/certifications
halalGovernanceRouter.get("/v1/shariah/certifications", (_req: Request, res: Response) => {
  try {
    const certifications = halalGovernanceEngine.getCertifications();
    return res.json({ ok: true, data: certifications });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/v1/shariah/e-numbers
halalGovernanceRouter.get("/v1/shariah/e-numbers", (_req: Request, res: Response) => {
  try {
    const eNumbers = Object.values(E_NUMBER_DATABASE);
    return res.json({ ok: true, data: eNumbers });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/shariah/screen-ingredients
halalGovernanceRouter.post("/v1/shariah/screen-ingredients", (req: Request, res: Response) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ ok: false, error: "ingredients must be an array of strings" });
    }
    const result = halalGovernanceEngine.screenIngredients(ingredients);
    return res.json({ ok: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/shariah/audit-financials
halalGovernanceRouter.post("/v1/shariah/audit-financials", (req: Request, res: Response) => {
  try {
    const {
      companyName,
      totalAssetsBdt,
      totalInterestBearingDebtBdt,
      interestBearingSecuritiesBdt,
      totalRevenueBdt,
      impermissibleRevenueBdt,
    } = req.body;

    if (!companyName || typeof totalAssetsBdt !== "number" || typeof totalRevenueBdt !== "number") {
      return res.status(400).json({
        ok: false,
        error: "companyName, totalAssetsBdt, and totalRevenueBdt are required numeric fields",
      });
    }

    const result = halalGovernanceEngine.auditFinancials({
      companyName,
      totalAssetsBdt,
      totalInterestBearingDebtBdt: totalInterestBearingDebtBdt || 0,
      interestBearingSecuritiesBdt: interestBearingSecuritiesBdt || 0,
      totalRevenueBdt,
      impermissibleRevenueBdt: impermissibleRevenueBdt || 0,
    });

    return res.json({ ok: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/shariah/certifications/generate
halalGovernanceRouter.post("/v1/shariah/certifications/generate", (req: Request, res: Response) => {
  try {
    const {
      companyName,
      companyBin,
      productName,
      productCategory,
      certificationType,
      standardApplied,
      auditResult,
      shariahBoardSignatory,
    } = req.body;

    if (!companyName || !companyBin || !productName || !certificationType || !standardApplied || !auditResult) {
      return res.status(400).json({
        ok: false,
        error: "companyName, companyBin, productName, certificationType, standardApplied, and auditResult are required",
      });
    }

    const record = halalGovernanceEngine.generateCertificate({
      companyName,
      companyBin,
      productName,
      productCategory: productCategory || "General Food & Consumer Goods",
      certificationType: certificationType as ShariahCertificationType,
      standardApplied,
      auditResult: auditResult as AuditStatus,
      shariahBoardSignatory,
    });

    return res.status(201).json({ ok: true, data: record });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default halalGovernanceRouter;
