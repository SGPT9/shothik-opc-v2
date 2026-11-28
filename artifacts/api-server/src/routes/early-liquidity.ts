import { Router } from "express";
import { verifyAuthRequest } from "./auth.js";
import { globalFactoringEngine } from "../lib/factoring/early-liquidity-engine";

export const earlyLiquidityRouter = Router();

earlyLiquidityRouter.get("/factoring/buyers", (_req, res) => {
  const buyers = globalFactoringEngine.listBuyers();
  res.json({ success: true, count: buyers.length, buyers });
});

earlyLiquidityRouter.get("/factoring/invoices", (req, res) => {
  const verified = verifyAuthRequest(req);
  const requestedBuyerId = req.query.buyerId as string | undefined;
  const requestedStatus = req.query.status as string | undefined;

  let invoices = globalFactoringEngine.listInvoices();
  if (requestedBuyerId) {
    invoices = invoices.filter((inv) => inv.buyerId === requestedBuyerId);
  }
  if (requestedStatus) {
    invoices = invoices.filter((inv) => inv.status === requestedStatus);
  }

  // In production, unauthenticated callers receive anonymized buyer records
  if (!verified && process.env.NODE_ENV === "production") {
    const anonymized = invoices.map((inv) => ({
      invoiceId: inv.invoiceId,
      buyerName: "Enterprise Client",
      invoiceAmountBDT: inv.invoiceAmountBDT,
      status: inv.status,
      dueDate: inv.dueDate,
    }));
    res.json({ success: true, count: anonymized.length, invoices: anonymized });
    return;
  }

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
