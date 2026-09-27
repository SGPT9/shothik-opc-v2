import { Router } from "express";
import { globalTariffEngine } from "../lib/customs/tariff-engine";

export const tariffRouter = Router();

tariffRouter.get("/customs/classify", (req, res) => {
  const query = (req.query.q as string) || "smartphone";
  const result = globalTariffEngine.classifyHsCode(query);
  res.json({ success: true, count: result.matches.length, ...result });
});

tariffRouter.post("/customs/calculate-tax", (req, res) => {
  try {
    const { assessableValueBdt, hsCode } = req.body;
    if (!assessableValueBdt || !hsCode) {
      res.status(400).json({ success: false, error: "assessableValueBdt and hsCode are required" });
      return;
    }

    const breakdown = globalTariffEngine.calculateTaxIncidence({
      assessableValueBdt: Number(assessableValueBdt),
      hsCode,
    });
    res.json({ success: true, breakdown });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

tariffRouter.post("/customs/screen-ipo", (req, res) => {
  try {
    const { hsCode, countryOfOrigin } = req.body;
    if (!hsCode) {
      res.status(400).json({ success: false, error: "hsCode is required" });
      return;
    }

    const compliance = globalTariffEngine.screenIpoCompliance(hsCode, countryOfOrigin);
    res.json({ success: true, compliance });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

tariffRouter.post("/customs/generate-invoice", (req, res) => {
  try {
    const { exporter, importer, portOfEntry, items, exchangeRateBdt } = req.body;
    if (!exporter || !importer || !items || items.length === 0) {
      res.status(400).json({ success: false, error: "exporter, importer, and items are required" });
      return;
    }

    const invoice = globalTariffEngine.generateCommercialInvoice({
      exporter,
      importer,
      portOfEntry: portOfEntry || "Chittagong Port",
      items,
      exchangeRateBdt,
    });

    res.status(201).json({ success: true, invoice });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
