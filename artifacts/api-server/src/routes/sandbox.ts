import { Router, Request, Response } from "express";
import { codeSandbox, SandboxLanguage } from "../lib/code-sandbox.js";
import { verifyAuthRequest } from "./auth.js";
import { logger } from "../lib/logger.js";

export const sandboxRouter = Router();

/**
 * GET /api/v1/sandbox/runtimes
 * Lists supported code sandbox runtimes.
 */
sandboxRouter.get("/v1/sandbox/runtimes", (_req: Request, res: Response): void => {
  const runtimes = codeSandbox.getRuntimes();
  res.json({
    success: true,
    count: runtimes.length,
    runtimes,
  });
});

/**
 * POST /api/v1/sandbox/run
 * Executes code safely inside the isolated sandbox.
 * Requires valid authentication in production environments.
 */
sandboxRouter.post("/v1/sandbox/run", async (req: Request, res: Response): Promise<void> => {
  try {
    if (process.env.NODE_ENV === "production") {
      const authUser = verifyAuthRequest(req);
      if (!authUser) {
        res.status(401).json({
          success: false,
          error: "Authentication required to execute code in production sandbox",
        });
        return;
      }
    }

    const { language = "javascript", code, timeoutMs = 10000, environmentVars } = req.body;

    if (!code || typeof code !== "string") {
      res.status(400).json({ success: false, error: "Missing or invalid 'code' field (string required)" });
      return;
    }

    const validLanguages: SandboxLanguage[] = ["javascript", "typescript", "python", "bash"];
    if (!validLanguages.includes(language)) {
      res.status(400).json({
        success: false,
        error: `Invalid language '${language}'. Must be one of: ${validLanguages.join(", ")}`,
      });
      return;
    }

    logger.info(`[sandbox-route] Executing ${language} snippet (${code.length} chars)`);

    const result = await codeSandbox.execute({
      language,
      code,
      timeoutMs: Number(timeoutMs),
      environmentVars,
    });

    res.json({
      success: result.success,
      result,
    });
  } catch (err: any) {
    logger.error(`[sandbox-route] Execution error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/sandbox/simulate-webhook
 * Simulates real-time inbound webhooks for bKash PGW, Steadfast Courier, and Pathao Logistics.
 */
sandboxRouter.post("/v1/sandbox/simulate-webhook", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      provider = "steadfast",
      event = "delivered",
      invoiceNumber,
      trackingCode,
      amount = 450,
    } = req.body || {};

    const safeAmount = Math.max(1, Math.min(1000000, Number(amount) || 450));
    const safeInvoice = String(invoiceNumber || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || `NLK_INV_${Date.now().toString().slice(-6)}`;
    const safeTracking = String(trackingCode || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || `ST-POD-${Math.floor(100000 + Math.random() * 900000)}`;

    logger.info({ provider, event, invoiceNumber: safeInvoice, trackingCode: safeTracking }, "[sandbox-webhook] Simulating inbound webhook");

    let simulatedPayload: Record<string, any> = {};

    if (provider === "bkash") {
      simulatedPayload = {
        paymentID: `TRX_${Date.now()}`,
        trxID: `BK_${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
        transactionStatus: event === "failed" ? "Failed" : "Completed",
        amount: String(safeAmount),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: safeInvoice,
        customerMsisdn: "01700000000",
        dateTime: new Date().toISOString(),
      };
    } else if (provider === "steadfast") {
      simulatedPayload = {
        tracking_code: safeTracking,
        invoice: safeInvoice,
        status: event,
        updated_at: new Date().toISOString(),
        delivery_charge: 60,
        cod_amount: safeAmount,
        recipient_phone: "01700000000",
      };
    } else if (provider === "pathao") {
      simulatedPayload = {
        consignment_id: `PTH_${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        merchant_order_id: safeInvoice,
        order_status: event === "delivered" ? "Delivered" : "In_Transit",
        collected_amount: safeAmount,
        delivery_fee: 60,
        updated_at: new Date().toISOString(),
      };
    }

    res.json({
      success: true,
      provider,
      event,
      simulatedPayload,
      timestamp: Date.now(),
      statusMessage: `Simulated ${provider.toUpperCase()} [${event.toUpperCase()}] webhook processed successfully.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/sandbox/deerflow-calc
 * Executes verified financial, Mushak 6.3 VAT, or margin computations inside the sandbox.
 */
sandboxRouter.post("/v1/sandbox/deerflow-calc", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      calculationType = "mushak_63_vat",
      baseAmount = 10000,
      vatRatePercent = 15,
      withholdingTaxPercent = 0,
      supplementaryDutyPercent = 0,
    } = req.body || {};

    const safeCalculationType = String(calculationType || "mushak_63_vat").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48);
    const safeBase = Math.max(0, Number(baseAmount) || 0);
    const safeVatRate = Math.max(0, Math.min(100, Number(vatRatePercent) || 15));
    const safeSdRate = Math.max(0, Math.min(100, Number(supplementaryDutyPercent) || 0));
    const safeAitRate = Math.max(0, Math.min(100, Number(withholdingTaxPercent) || 0));

    const code = `
const base = ${safeBase};
const sd = base * (${safeSdRate} / 100);
const vatBase = base + sd;
const vat = vatBase * (${safeVatRate} / 100);
const ait = base * (${safeAitRate} / 100);
const totalPayable = vatBase + vat;
const netReceivable = base - ait;
console.log(JSON.stringify({
  baseAmount: base,
  supplementaryDuty: Math.round(sd * 100) / 100,
  vatAmount: Math.round(vat * 100) / 100,
  withholdingTax: Math.round(ait * 100) / 100,
  totalPayable: Math.round(totalPayable * 100) / 100,
  netReceivable: Math.round(netReceivable * 100) / 100,
  calculationType: ${JSON.stringify(safeCalculationType)},
  engine: "deerflow-sandbox-v2"
}));
`;

    const execResult = await codeSandbox.execute({
      language: "javascript",
      code,
      timeoutMs: 5000,
    });

    if (!execResult.success) {
      res.status(500).json({ success: false, error: execResult.stderr || "Computation failed" });
      return;
    }

    let parsedResult = {};
    try {
      parsedResult = JSON.parse(execResult.stdout.trim());
    } catch {
      parsedResult = { rawOutput: execResult.stdout };
    }

    res.status(200).json({
      success: true,
      calculation: parsedResult,
      executionDurationMs: execResult.durationMs,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
