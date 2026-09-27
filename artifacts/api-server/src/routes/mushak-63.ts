import { Router } from "express";
import { Mushak63Engine } from "../lib/tax/mushak-63-engine";

export const mushak63Router = Router();

mushak63Router.post("/tax/mushak-63/generate", (req, res) => {
  try {
    const input = req.body;
    if (!input.sellerName || !input.sellerBIN || !input.buyerName || !input.items || !input.items.length) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: sellerName, sellerBIN, buyerName, items",
      });
      return;
    }

    const challan = Mushak63Engine.generateChallan(input);
    res.json({ success: true, challan });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

mushak63Router.post("/tax/mushak-63/validate-bin", (req, res) => {
  try {
    const { bin } = req.body;
    if (!bin) {
      res.status(400).json({ success: false, error: "BIN is required" });
      return;
    }

    const isValid = Mushak63Engine.validateBIN(bin);
    res.json({ success: true, bin, isValid });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
