import { Router, Request, Response } from "express";
import { debtRecoveryEngine } from "../lib/recovery/debt-recovery-engine.js";

export const debtRecoveryRouter = Router();

// GET /api/v1/recovery/summary
debtRecoveryRouter.get("/v1/recovery/summary", (_req: Request, res: Response) => {
  try {
    const summary = debtRecoveryEngine.getSummaryMetrics();
    return res.json({ ok: true, data: summary });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/v1/recovery/policies
debtRecoveryRouter.get("/v1/recovery/policies", (_req: Request, res: Response) => {
  try {
    const policies = debtRecoveryEngine.getPolicies();
    return res.json({ ok: true, data: policies });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/recovery/policies/issue
debtRecoveryRouter.post("/v1/recovery/policies/issue", (req: Request, res: Response) => {
  try {
    const {
      invoiceId,
      mushak63No,
      sellerCompanyName,
      buyerName,
      buyerTier,
      insuredInvoiceAmountBdt,
    } = req.body;

    if (!mushak63No || !buyerName || !insuredInvoiceAmountBdt) {
      return res.status(400).json({
        ok: false,
        error: "Missing required policy fields: mushak63No, buyerName, insuredInvoiceAmountBdt",
      });
    }

    const policy = debtRecoveryEngine.issuePolicy({
      invoiceId: invoiceId || `INV-${Date.now().toString(36)}`,
      mushak63No,
      sellerCompanyName: sellerCompanyName || "My Enterprise",
      buyerName,
      buyerTier: buyerTier || "tier_2_aplus",
      insuredInvoiceAmountBdt: Number(insuredInvoiceAmountBdt),
    });

    return res.status(201).json({ ok: true, data: policy });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/v1/recovery/cheques
debtRecoveryRouter.get("/v1/recovery/cheques", (_req: Request, res: Response) => {
  try {
    const cheques = debtRecoveryEngine.getCheques();
    return res.json({ ok: true, data: cheques });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/recovery/cheques/dishonor
debtRecoveryRouter.post("/v1/recovery/cheques/dishonor", (req: Request, res: Response) => {
  try {
    const {
      policyId,
      chequeNumber,
      bankName,
      branchName,
      routingNumber,
      chequeAmountBdt,
      chequeDate,
      dishonorMemoDate,
      dishonorReason,
      debtorCompanyName,
      debtorSignatoryName,
      creditorCompanyName,
    } = req.body;

    if (!chequeNumber || !bankName || !chequeAmountBdt || !dishonorMemoDate || !debtorCompanyName) {
      return res.status(400).json({
        ok: false,
        error: "Missing required cheque dishonor parameters",
      });
    }

    const record = debtRecoveryEngine.logDishonoredCheque({
      policyId,
      chequeNumber,
      bankName,
      branchName: branchName || "Main Branch",
      routingNumber: routingNumber || "000000000",
      chequeAmountBdt: Number(chequeAmountBdt),
      chequeDate: chequeDate || new Date().toISOString().split("T")[0],
      dishonorMemoDate,
      dishonorReason: dishonorReason || "insufficient_funds",
      debtorCompanyName,
      debtorSignatoryName: debtorSignatoryName || "Authorized Signatory",
      creditorCompanyName: creditorCompanyName || "Shothik Technologies Bangladesh Ltd.",
    });

    return res.status(201).json({ ok: true, data: record });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/recovery/claims/submit
debtRecoveryRouter.post("/v1/recovery/claims/submit", (req: Request, res: Response) => {
  try {
    const { policyId, chequeId, disbursementChannel, accountOrMfsNumber } = req.body;

    if (!policyId || !accountOrMfsNumber) {
      return res.status(400).json({
        ok: false,
        error: "policyId and accountOrMfsNumber are required",
      });
    }

    const claim = debtRecoveryEngine.submitClaim({
      policyId,
      chequeId,
      disbursementChannel: disbursementChannel || "bkash_merchant",
      accountOrMfsNumber,
    });

    return res.status(201).json({ ok: true, data: claim });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/recovery/export-court-dossier
debtRecoveryRouter.post("/v1/recovery/export-court-dossier", (req: Request, res: Response) => {
  try {
    const { chequeId } = req.body;
    if (!chequeId) {
      return res.status(400).json({ ok: false, error: "chequeId is required" });
    }

    const dossier = debtRecoveryEngine.exportCourtDossier(chequeId);
    return res.json({ ok: true, data: dossier });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});
