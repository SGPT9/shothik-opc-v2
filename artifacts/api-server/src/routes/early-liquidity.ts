import { Router } from "express";
import { globalFactoringEngine } from "../lib/factoring/early-liquidity-engine";

export const earlyLiquidityRouter = Router();

earlyLiquidityRouter.get("/factoring/buyers", (_req, res) => {
  const buyers = globalFactoringEngine.listBuyers();
  res.json({ success: true, count: buyers.length, buyers });
});

earlyLiquidityRouter.get("/factoring/invoices", (_req, res) => {
  const invoices = globalFactoringEngine.listInvoices();
  res.json({ success: true, count: invoices.length, invoices });
});

earlyLiquidityRouter.get("/factoring/aging-radar", (_req, res) => {
  try {
    const radar = globalFactoringEngine.analyzeAgingRadar();
    res.json({ success: true, radar });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

earlyLiquidityRouter.post("/factoring/calculate-offer", (req, res) => {
  try {
    const { invoiceId, requestedAdvanceRatePercent, channel } = req.body;
    if (!invoiceId) {
      res.status(400).json({ success: false, error: "invoiceId is required" });
      return;
    }

    const offer = globalFactoringEngine.calculateFactoringOffer(
      invoiceId,
      requestedAdvanceRatePercent ? Number(requestedAdvanceRatePercent) : 85,
      channel || "bkash_enterprise"
    );

    res.json({ success: true, offer });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
