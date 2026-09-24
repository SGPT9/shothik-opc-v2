import { Router, Request, Response } from "express";
import {
  tenderBidEngine,
  TenderType,
  StdDocumentType,
} from "../lib/tenders/tender-bid-engine.js";

export const tenderBidsRouter = Router();

// GET /api/v1/tenders/summary
tenderBidsRouter.get("/v1/tenders/summary", (_req: Request, res: Response) => {
  try {
    const summary = tenderBidEngine.getSummaryMetrics();
    return res.json({ ok: true, data: summary });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/v1/tenders/bids
tenderBidsRouter.get("/v1/tenders/bids", (_req: Request, res: Response) => {
  try {
    const bids = tenderBidEngine.getBids();
    return res.json({ ok: true, data: bids });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/v1/tenders/bids/:id
tenderBidsRouter.get("/v1/tenders/bids/:id", (req: Request, res: Response) => {
  try {
    const bidId = String(req.params.id);
    const bid = tenderBidEngine.getBidById(bidId);
    if (!bid) {
      return res.status(404).json({ ok: false, error: "Tender bid not found" });
    }
    return res.json({ ok: true, data: bid });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/tenders/calculate-boq
tenderBidsRouter.post("/v1/tenders/calculate-boq", (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        ok: false,
        error: "items array is required",
      });
    }

    const calculation = tenderBidEngine.calculateBoq({ items });
    return res.json({ ok: true, data: calculation });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/tenders/screen-eligibility
tenderBidsRouter.post("/v1/tenders/screen-eligibility", (req: Request, res: Response) => {
  try {
    const {
      requiredAnnualTurnoverBdt,
      contractorAnnualTurnoverBdt,
      requiredLiquidAssetsBdt,
      contractorLiquidAssetsBdt,
      requiredSimilarExperienceYears,
      contractorExperienceYears,
      hasValidTaxClearance,
      hasValidTradeLicense,
      hasValidMushakBin,
    } = req.body;

    if (
      typeof requiredAnnualTurnoverBdt !== "number" ||
      typeof contractorAnnualTurnoverBdt !== "number" ||
      typeof requiredLiquidAssetsBdt !== "number" ||
      typeof contractorLiquidAssetsBdt !== "number"
    ) {
      return res.status(400).json({
        ok: false,
        error: "Financial turnover and liquid asset amounts are required numeric fields",
      });
    }

    const result = tenderBidEngine.screenEligibility({
      requiredAnnualTurnoverBdt,
      contractorAnnualTurnoverBdt,
      requiredLiquidAssetsBdt,
      contractorLiquidAssetsBdt,
      requiredSimilarExperienceYears: requiredSimilarExperienceYears || 1,
      contractorExperienceYears: contractorExperienceYears || 1,
      hasValidTaxClearance: Boolean(hasValidTaxClearance),
      hasValidTradeLicense: Boolean(hasValidTradeLicense),
      hasValidMushakBin: Boolean(hasValidMushakBin),
    });

    return res.json({ ok: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/tenders/bids/generate
tenderBidsRouter.post("/v1/tenders/bids/generate", (req: Request, res: Response) => {
  try {
    const {
      tenderId,
      tenderTitle,
      procuringEntity,
      tenderType,
      stdDocumentType,
      estimatedValueBdt,
      quotedTotalValueBdt,
      contractorName,
      contractorBin,
      boqItems,
    } = req.body;

    if (
      !tenderId ||
      !tenderTitle ||
      !procuringEntity ||
      !tenderType ||
      !stdDocumentType ||
      typeof quotedTotalValueBdt !== "number" ||
      !contractorName ||
      !contractorBin
    ) {
      return res.status(400).json({
        ok: false,
        error: "tenderId, tenderTitle, procuringEntity, tenderType, stdDocumentType, quotedTotalValueBdt, contractorName, and contractorBin are required",
      });
    }

    const bid = tenderBidEngine.generateBid({
      tenderId,
      tenderTitle,
      procuringEntity,
      tenderType: tenderType as TenderType,
      stdDocumentType: stdDocumentType as StdDocumentType,
      estimatedValueBdt: estimatedValueBdt || quotedTotalValueBdt,
      quotedTotalValueBdt,
      contractorName,
      contractorBin,
      boqItems,
    });

    return res.status(201).json({ ok: true, data: bid });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default tenderBidsRouter;
