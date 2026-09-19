import { Router, type Request, type Response } from "express";
import { MushakTaxEngine, type MushakLineItem } from "../lib/tax/mushak-tax-engine.js";
import { logger } from "../lib/logger.js";

const router = Router();

/**
 * GET /api/v1/tax/mushak/status
 * Returns current OPC tax profile and monthly stats
 */
router.get("/v1/tax/mushak/status", (_req: Request, res: Response): void => {
  try {
    const summary = MushakTaxEngine.getMushak91Summary();
    const invoices = MushakTaxEngine.listInvoices();
    
    res.json({
      success: true,
      data: {
        opcProfile: {
          registeredName: "Shothik Technologies Limited",
          tradeName: "ShothikGPT AgenticOS",
          bin: "001928374-0101",
          binValid: true,
          tin: "782910482910",
          vatCircle: "Circle-04 (Banani), Dhaka North Commissionerate",
          economicActivityCode: "6201 (IT & Software Services)"
        },
        monthlySummary: summary,
        totalInvoicesIssued: invoices.length,
        recentInvoices: invoices.slice(0, 5)
      }
    });
  } catch (error) {
    logger.error({ err: error }, "[Tax API] Failed to fetch status");
    res.status(500).json({ success: false, error: "Failed to retrieve tax status" });
  }
});

/**
 * POST /api/v1/tax/mushak/calculate
 * Computes line-item breakdown (Base Price, SD, VAT, Gross Total, and TDS Withholding)
 */
router.post("/v1/tax/mushak/calculate", (req: Request, res: Response): void => {
  try {
    const { items, isBuyerWithholdingEntity = false } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: "At least one line item is required" });
      return;
    }

    const calculatedItems = items.map((item: MushakLineItem) => 
      MushakTaxEngine.calculateLineItem(item, Boolean(isBuyerWithholdingEntity))
    );

    const totalRawPriceBdt = Math.round(calculatedItems.reduce((acc, i) => acc + i.rawPriceBdt, 0) * 100) / 100;
    const totalSupplementaryDutyBdt = Math.round(calculatedItems.reduce((acc, i) => acc + i.supplementaryDutyBdt, 0) * 100) / 100;
    const totalVatAmountBdt = Math.round(calculatedItems.reduce((acc, i) => acc + i.vatAmountBdt, 0) * 100) / 100;
    const grossTotalBdt = Math.round(calculatedItems.reduce((acc, i) => acc + i.grossTotalBdt, 0) * 100) / 100;
    const totalTdsWithheldBdt = Math.round(calculatedItems.reduce((acc, i) => acc + i.tdsAmountBdt, 0) * 100) / 100;
    const netPayableBdt = Math.round((grossTotalBdt - totalTdsWithheldBdt) * 100) / 100;

    res.json({
      success: true,
      data: {
        items: calculatedItems,
        totals: {
          totalRawPriceBdt,
          totalSupplementaryDutyBdt,
          totalVatAmountBdt,
          grossTotalBdt,
          totalTdsWithheldBdt,
          netPayableBdt
        },
        isSupervisedAutonomyFlagged: grossTotalBdt > 10000
      }
    });
  } catch (error) {
    logger.error({ err: error }, "[Tax API] Calculation error");
    res.status(500).json({ success: false, error: "Failed to calculate taxes" });
  }
});

/**
 * POST /api/v1/tax/mushak/generate-invoice
 * Issues an authentic NBR Mushak-6.3 statutory tax invoice
 */
router.post("/v1/tax/mushak/generate-invoice", (req: Request, res: Response): void => {
  try {
    const { buyerInfo, items, destinationAddress, vehicleType, vehicleNumber, sellerInfo } = req.body;

    if (!buyerInfo || !buyerInfo.name || !buyerInfo.address) {
      res.status(400).json({ success: false, error: "Buyer name and address are required" });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: "At least one item is required" });
      return;
    }

    if (buyerInfo.bin && !MushakTaxEngine.validateBin(buyerInfo.bin)) {
      res.status(400).json({ success: false, error: "Buyer BIN must be a valid 13-digit number" });
      return;
    }

    const invoice = MushakTaxEngine.generateInvoice({
      buyerInfo,
      items,
      destinationAddress,
      vehicleType,
      vehicleNumber,
      sellerInfo
    });

    res.status(201).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    logger.error({ err: error }, "[Tax API] Failed to generate Mushak-6.3 invoice");
    res.status(500).json({ success: false, error: "Failed to issue tax invoice" });
  }
});

/**
 * GET /api/v1/tax/mushak/invoices
 * Lists all issued Mushak-6.3 tax invoices
 */
router.get("/v1/tax/mushak/invoices", (_req: Request, res: Response): void => {
  try {
    const invoices = MushakTaxEngine.listInvoices();
    res.json({
      success: true,
      data: {
        total: invoices.length,
        invoices
      }
    });
  } catch (error) {
    logger.error({ err: error }, "[Tax API] Failed to list invoices");
    res.status(500).json({ success: false, error: "Failed to list tax invoices" });
  }
});

/**
 * GET /api/v1/tax/mushak/invoices/:invoiceId
 * Retrieves a single invoice by ID
 */
router.get("/v1/tax/mushak/invoices/:invoiceId", (req: Request, res: Response): void => {
  try {
    const invoiceId = String(req.params.invoiceId);
    const invoice = MushakTaxEngine.getInvoice(invoiceId);

    if (!invoice) {
      res.status(404).json({ success: false, error: "Tax invoice not found" });
      return;
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    logger.error({ err: error }, "[Tax API] Failed to fetch invoice");
    res.status(500).json({ success: false, error: "Failed to fetch tax invoice" });
  }
});

/**
 * GET /api/v1/tax/mushak/invoices/:invoiceId/html
 * Renders printable statutory NBR Mushak-6.3 HTML
 */
router.get("/v1/tax/mushak/invoices/:invoiceId/html", (req: Request, res: Response): void => {
  try {
    const invoiceId = String(req.params.invoiceId);
    const invoice = MushakTaxEngine.getInvoice(invoiceId);

    if (!invoice) {
      res.status(404).send("<h1>404 - Tax Invoice Not Found</h1>");
      return;
    }

    const html = MushakTaxEngine.generatePrintableHtml(invoice);
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    logger.error({ err: error }, "[Tax API] Failed to render HTML");
    res.status(500).send("<h1>500 - Failed to render Mushak-6.3</h1>");
  }
});

/**
 * GET /api/v1/tax/mushak/mushak-91-summary
 * Aggregates monthly VAT return metrics
 */
router.get("/v1/tax/mushak/mushak-91-summary", (req: Request, res: Response): void => {
  try {
    const { month } = req.query;
    const summary = MushakTaxEngine.getMushak91Summary(month as string | undefined);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    logger.error({ err: error }, "[Tax API] Failed to get Mushak-9.1 summary");
    res.status(500).json({ success: false, error: "Failed to generate monthly VAT return" });
  }
});

export default router;
