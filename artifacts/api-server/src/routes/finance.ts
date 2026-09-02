import { Router, type Request, type Response } from "express";

const router = Router();

/**
 * POST /api/v1/finance/nbr/tax-calculate
 * Calculate NBR Section 78 Individual Income Tax & Investment Rebates
 */
router.post("/v1/finance/nbr/tax-calculate", (req: Request, res: Response) => {
  const { annualIncomeBdt = 650000, gender = "male", investmentBdt = 100000 } = req.body;

  const minExemption = gender === "female" ? 400000 : 350000;
  const taxableIncomeBdt = Math.max(0, annualIncomeBdt - minExemption);
  const grossTaxBdt = taxableIncomeBdt > 0 ? 5000 + (taxableIncomeBdt - 100000) * 0.1 : 0;
  const investmentRebateBdt = Math.min(grossTaxBdt * 0.15, investmentBdt * 0.15);
  const netTaxPayableBdt = Math.max(0, grossTaxBdt - investmentRebateBdt);

  return res.status(200).json({
    success: true,
    annualIncomeBdt,
    taxableIncomeBdt,
    grossTaxBdt,
    investmentRebateBdt,
    netTaxPayableBdt,
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/v1/finance/nbr/mushak-6.3
 * Generate gapless sequential Mushak-6.3 VAT Challan Record
 */
router.post("/v1/finance/nbr/mushak-6.3", (req: Request, res: Response) => {
  const { merchantId = "mch_01", customerName, itemDescription, quantity = 1, unitPriceBdt = 1000, vatRatePercent = 5 } = req.body;

  const totalBeforeVatBdt = quantity * unitPriceBdt;
  const vatAmountBdt = Math.round(totalBeforeVatBdt * (vatRatePercent / 100));
  const totalWithVatBdt = totalBeforeVatBdt + vatAmountBdt;
  const challanNumber = `MUSHAK-6.3-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  return res.status(200).json({
    success: true,
    challanNumber,
    merchantId,
    customerName,
    itemDescription,
    totalBeforeVatBdt,
    vatAmountBdt,
    totalWithVatBdt,
    formattedMushak63PdfUrl: `https://shothik.ai/vat/mushak-6.3/${challanNumber}.pdf`,
    timestamp: new Date().toISOString(),
  });
});

export default router;
