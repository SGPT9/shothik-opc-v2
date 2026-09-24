import { Router, Request, Response } from "express";
import { dutyDrawbackEngine, ClaimMode } from "../lib/customs/duty-drawback-engine.js";

export const dutyDrawbackRouter = Router();

// GET /api/v1/duty-drawback/summary
dutyDrawbackRouter.get("/v1/duty-drawback/summary", (_req: Request, res: Response) => {
  try {
    const summary = dutyDrawbackEngine.getSummaryMetrics();
    return res.json({ ok: true, data: summary });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/v1/duty-drawback/claims
dutyDrawbackRouter.get("/v1/duty-drawback/claims", (_req: Request, res: Response) => {
  try {
    const claims = dutyDrawbackEngine.getClaims();
    return res.json({ ok: true, data: claims });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/v1/duty-drawback/claims/:id
dutyDrawbackRouter.get("/v1/duty-drawback/claims/:id", (req: Request, res: Response) => {
  try {
    const claimId = String(req.params.id);
    const claim = dutyDrawbackEngine.getClaimById(claimId);
    if (!claim) {
      return res.status(404).json({ ok: false, error: "Drawback claim not found" });
    }
    return res.json({ ok: true, data: claim });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/duty-drawback/calculate
dutyDrawbackRouter.post("/v1/duty-drawback/calculate", (req: Request, res: Response) => {
  try {
    const { claimMode, fobValueBdt, flatRatePercent, importedInputs } = req.body;
    if (!claimMode || typeof fobValueBdt !== "number") {
      return res.status(400).json({ ok: false, error: "claimMode and fobValueBdt are required" });
    }
    const calculation = dutyDrawbackEngine.calculateDrawback({
      claimMode: claimMode as ClaimMode,
      fobValueBdt,
      flatRatePercent,
      importedInputs,
    });
    return res.json({ ok: true, data: calculation });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/duty-drawback/reconcile-bills
dutyDrawbackRouter.post("/v1/duty-drawback/reconcile-bills", (req: Request, res: Response) => {
  try {
    const { importBeNumber, billOfExportNumber, formExpNumber } = req.body;
    if (!importBeNumber || !billOfExportNumber || !formExpNumber) {
      return res.status(400).json({
        ok: false,
        error: "importBeNumber, billOfExportNumber, and formExpNumber are required",
      });
    }
    const result = dutyDrawbackEngine.reconcileBills(
      importBeNumber,
      billOfExportNumber,
      formExpNumber
    );
    return res.json({ ok: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/duty-drawback/claims/generate
dutyDrawbackRouter.post("/v1/duty-drawback/claims/generate", (req: Request, res: Response) => {
  try {
    const {
      exporterName,
      exporterBin,
      exporterErc,
      claimMode,
      exportProduct,
      importedInputs,
      flatRatePercent,
    } = req.body;

    if (!exporterName || !exporterBin || !exportProduct || !claimMode) {
      return res.status(400).json({
        ok: false,
        error: "exporterName, exporterBin, exportProduct, and claimMode are required",
      });
    }

    const record = dutyDrawbackEngine.generateClaim({
      exporterName,
      exporterBin,
      exporterErc: exporterErc || "ERC-EXP-PENDING",
      claimMode: claimMode as ClaimMode,
      exportProduct,
      importedInputs: importedInputs || [],
      flatRatePercent,
    });

    return res.status(201).json({ ok: true, data: record });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default dutyDrawbackRouter;
