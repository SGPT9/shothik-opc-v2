import { Router, Request, Response } from "express";
import { corporateTaxEngine } from "../lib/corporate-tax/corporate-tax-engine.js";

export const corporateTaxRouter = Router();

// GET /api/v1/corporate-tax/summary
corporateTaxRouter.get("/v1/corporate-tax/summary", (_req: Request, res: Response) => {
  try {
    const summary = corporateTaxEngine.getSummaryMetrics();
    return res.json({ ok: true, data: summary });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/corporate-tax/calculate
corporateTaxRouter.post("/v1/corporate-tax/calculate", (req: Request, res: Response) => {
  try {
    const {
      tinNumber,
      companyName,
      assessmentYear,
      incomeYear,
      entityType,
      isCashlessCompliant,
      grossTurnoverBdt,
      grossRevenueReceiptsBdt,
      allowableBusinessExpensesBdt,
      depreciationAllowanceBdt,
      otherIncomeBdt,
    } = req.body;

    if (!tinNumber || !companyName || !entityType || grossTurnoverBdt === undefined) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: tinNumber, companyName, entityType, grossTurnoverBdt",
      });
    }

    const result = corporateTaxEngine.calculateCorporateTax({
      tinNumber,
      companyName,
      assessmentYear: assessmentYear || "2026-2027",
      incomeYear: incomeYear || "2025-2026",
      entityType,
      isCashlessCompliant: Boolean(isCashlessCompliant),
      grossTurnoverBdt: Number(grossTurnoverBdt),
      grossRevenueReceiptsBdt: Number(grossRevenueReceiptsBdt || grossTurnoverBdt),
      allowableBusinessExpensesBdt: Number(allowableBusinessExpensesBdt || 0),
      depreciationAllowanceBdt: Number(depreciationAllowanceBdt || 0),
      otherIncomeBdt: Number(otherIncomeBdt || 0),
    });

    return res.json({ ok: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/v1/corporate-tax/ait-ledger
corporateTaxRouter.get("/v1/corporate-tax/ait-ledger", (_req: Request, res: Response) => {
  try {
    const ledger = corporateTaxEngine.getAitLedger();
    return res.json({ ok: true, data: ledger });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/corporate-tax/ait-ledger/add
corporateTaxRouter.post("/v1/corporate-tax/ait-ledger/add", (req: Request, res: Response) => {
  try {
    const {
      section,
      challanOrCertificateNo,
      deductingAuthority,
      transactionDate,
      baseTransactionAmountBdt,
      withholdingRatePercent,
      aitDeductedAmountBdt,
      bankDepositChallanNo,
    } = req.body;

    if (!section || !challanOrCertificateNo || !deductingAuthority || !aitDeductedAmountBdt) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields for AIT Certificate",
      });
    }

    const item = corporateTaxEngine.addAitCertificate({
      section,
      challanOrCertificateNo,
      deductingAuthority,
      transactionDate: transactionDate || new Date().toISOString().split("T")[0],
      baseTransactionAmountBdt: Number(baseTransactionAmountBdt || 0),
      withholdingRatePercent: Number(withholdingRatePercent || 0),
      aitDeductedAmountBdt: Number(aitDeductedAmountBdt),
      bankDepositChallanNo: bankDepositChallanNo || "",
    });

    return res.status(201).json({ ok: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/v1/corporate-tax/mushak-9-1
corporateTaxRouter.get("/v1/corporate-tax/mushak-9-1", (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || "2026-09";
    const report = corporateTaxEngine.getMushak91Return(period);
    return res.json({ ok: true, data: report });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/corporate-tax/export-e-return
corporateTaxRouter.post("/v1/corporate-tax/export-e-return", (req: Request, res: Response) => {
  try {
    const payload = corporateTaxEngine.exportEReturnPayload({
      tinNumber: req.body.tinNumber || "789123456789",
      companyName: req.body.companyName || "Shothik Technologies Bangladesh Ltd.",
      assessmentYear: req.body.assessmentYear || "2026-2027",
      incomeYear: req.body.incomeYear || "2025-2026",
      entityType: req.body.entityType || "one_person_company",
      isCashlessCompliant: Boolean(req.body.isCashlessCompliant),
      grossTurnoverBdt: Number(req.body.grossTurnoverBdt || 18500000),
      grossRevenueReceiptsBdt: Number(req.body.grossRevenueReceiptsBdt || 18500000),
      allowableBusinessExpensesBdt: Number(req.body.allowableBusinessExpensesBdt || 13200000),
      depreciationAllowanceBdt: Number(req.body.depreciationAllowanceBdt || 850000),
    });

    return res.json({ ok: true, data: payload });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});
