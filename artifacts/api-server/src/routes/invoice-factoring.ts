import { Router, Request, Response } from "express";
import { invoiceFactoringEngine } from "../lib/factoring/invoice-factoring-engine.js";

export const invoiceFactoringRouter = Router();

// GET /api/v1/factoring/summary
invoiceFactoringRouter.get("/v1/factoring/summary", (_req: Request, res: Response) => {
  try {
    const summary = invoiceFactoringEngine.getSummaryMetrics();
    return res.json({ ok: true, data: summary });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/factoring/quote
invoiceFactoringRouter.post("/v1/factoring/quote", (req: Request, res: Response) => {
  try {
    const { invoiceGrossBdt, buyerName, tenorDays, financingMode } = req.body;

    if (!invoiceGrossBdt || !buyerName || !tenorDays || !financingMode) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: invoiceGrossBdt, buyerName, tenorDays, financingMode",
      });
    }

    const quote = invoiceFactoringEngine.generateQuote({
      invoiceGrossBdt: Number(invoiceGrossBdt),
      buyerName,
      tenorDays: Number(tenorDays),
      financingMode,
    });

    return res.json({ ok: true, data: quote });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/v1/factoring/invoices
invoiceFactoringRouter.get("/v1/factoring/invoices", (_req: Request, res: Response) => {
  try {
    const invoices = invoiceFactoringEngine.getInvoices();
    return res.json({ ok: true, data: invoices });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/factoring/apply
invoiceFactoringRouter.post("/v1/factoring/apply", (req: Request, res: Response) => {
  try {
    const {
      mushak63No,
      poNumber,
      sellerCompanyName,
      buyerName,
      invoiceGrossBdt,
      issueDate,
      dueDate,
      tenorDays,
      financingMode,
      disbursementChannel,
      accountOrMfsNumber,
    } = req.body;

    if (!mushak63No || !buyerName || !invoiceGrossBdt || !financingMode || !accountOrMfsNumber) {
      return res.status(400).json({
        ok: false,
        error: "Missing required factoring application fields",
      });
    }

    const item = invoiceFactoringEngine.applyForFactoring({
      mushak63No,
      poNumber: poNumber || "PO-UNSPECIFIED",
      sellerCompanyName: sellerCompanyName || "My Enterprise",
      buyerName,
      invoiceGrossBdt: Number(invoiceGrossBdt),
      issueDate: issueDate || new Date().toISOString().split("T")[0],
      dueDate: dueDate || new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0],
      tenorDays: Number(tenorDays || 60),
      financingMode,
      disbursementChannel: disbursementChannel || "bkash_corporate",
      accountOrMfsNumber,
    });

    return res.status(201).json({ ok: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/factoring/settle
invoiceFactoringRouter.post("/v1/factoring/settle", (req: Request, res: Response) => {
  try {
    const { invoiceId, remittanceAmountBdt } = req.body;

    if (!invoiceId || !remittanceAmountBdt) {
      return res.status(400).json({
        ok: false,
        error: "invoiceId and remittanceAmountBdt are required",
      });
    }

    const settled = invoiceFactoringEngine.settleInvoice(invoiceId, Number(remittanceAmountBdt));
    return res.json({ ok: true, data: settled });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});
