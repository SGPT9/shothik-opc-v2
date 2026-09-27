import { Router } from "express";
import { CommodityLCEngine } from "../lib/wholesale/commodity-lc-engine";

export const commodityLCRouter = Router();

commodityLCRouter.get("/wholesale/commodities/tickers", (_req, res) => {
  const tickers = CommodityLCEngine.listCommodityTickers();
  res.json({ success: true, count: tickers.length, tickers });
});

commodityLCRouter.post("/wholesale/inland-lc/issue", (req, res) => {
  try {
    const { buyerName, buyerPhone, sellerName, sellerPhone, commodityName, quantity, unitPriceBDT } = req.body;
    if (!buyerPhone || !sellerPhone || !commodityName || !quantity || !unitPriceBDT) {
      res.status(400).json({ success: false, error: "Missing required Inland LC fields" });
      return;
    }

    const lc = CommodityLCEngine.issueInlandLC({
      buyerName: buyerName || "Buyer Entity",
      buyerPhone,
      sellerName: sellerName || "Seller Entity",
      sellerPhone,
      commodityName,
      quantity: Number(quantity),
      unitPriceBDT: Number(unitPriceBDT),
    });

    res.json({ success: true, inlandLC: lc });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
