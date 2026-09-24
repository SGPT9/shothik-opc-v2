import { Router, Request, Response } from 'express';
import {
  FieldAgentPosEngine,
  DEFAULT_POS_CATALOG,
  PosCategory,
  PosTransaction,
  EscPosReceiptOptions
} from '../lib/pos/field-agent-pos-engine.js';

export const posRouter = Router();

// In-memory synced transaction cache for idempotency & metrics
const syncedTransactionStore = new Map<string, PosTransaction>();

/**
 * GET /api/v1/pos/catalog
 * Returns catalog items for field agents with prices, stock, and VAT rates.
 */
posRouter.get('/v1/pos/catalog', (req: Request, res: Response): void => {
  try {
    const { category, search } = req.query;

    let items = [...DEFAULT_POS_CATALOG];

    if (category && typeof category === 'string') {
      items = items.filter((item) => item.category === (category as PosCategory));
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.banglaName.includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.barcode.includes(q)
      );
    }

    res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve POS catalog'
    });
  }
});

/**
 * POST /api/v1/pos/cart/calculate
 * Calculates net subtotal, Mushak VAT, and grand total for selected cart items.
 */
posRouter.post('/v1/pos/cart/calculate', (req: Request, res: Response): void => {
  try {
    const { items, discountBdt = 0 } = req.body;

    if (!Array.isArray(items)) {
      res.status(400).json({
        success: false,
        error: 'items must be an array of { sku: string, quantity: number }'
      });
      return;
    }

    const calculation = FieldAgentPosEngine.calculateCart(items, DEFAULT_POS_CATALOG, Number(discountBdt) || 0);

    res.json({
      success: true,
      calculation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Cart calculation failed'
    });
  }
});

/**
 * POST /api/v1/pos/receipt/escpos
 * Generates raw ESC/POS binary bytecode and formatted receipt string for Bluetooth thermal printing.
 */
posRouter.post('/v1/pos/receipt/escpos', (req: Request, res: Response): void => {
  try {
    const {
      paperWidth = '58mm',
      merchantName = 'Shothik Field Pop-Up Store',
      merchantBin = '001234567-0101',
      branchName = 'Dhanmondi Roadside Hub',
      agentName = 'Agent Rashedul (AG-902)',
      transaction,
      includeQrCode = true,
      cutPaper = true
    } = req.body;

    if (!transaction || !transaction.transactionId || !Array.isArray(transaction.items)) {
      res.status(400).json({
        success: false,
        error: 'Invalid or missing transaction payload'
      });
      return;
    }

    // Ensure seal is present
    if (!transaction.sha256Seal) {
      transaction.sha256Seal = FieldAgentPosEngine.generateTransactionSeal(transaction);
    }

    const options: EscPosReceiptOptions = {
      paperWidth: paperWidth === '80mm' ? '80mm' : '58mm',
      merchantName: String(merchantName),
      merchantBin: String(merchantBin),
      branchName: String(branchName),
      agentName: String(agentName),
      transaction,
      includeQrCode: Boolean(includeQrCode),
      cutPaper: Boolean(cutPaper)
    };

    const printJob = FieldAgentPosEngine.generateEscPosReceipt(options);

    res.json({
      success: true,
      printJob
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate ESC/POS receipt'
    });
  }
});

/**
 * POST /api/v1/pos/qr/dynamic
 * Generates dynamic bKash/Nagad EMVCo QR code payload.
 */
posRouter.post('/v1/pos/qr/dynamic', (req: Request, res: Response): void => {
  try {
    const {
      provider = 'bkash',
      merchantNumber = '01700000000',
      merchantBin = '001234567-0101',
      amountBdt,
      referenceId = `TX-${Date.now().toString(36).toUpperCase()}`
    } = req.body;

    if (!amountBdt || Number(amountBdt) <= 0) {
      res.status(400).json({
        success: false,
        error: 'amountBdt must be greater than 0'
      });
      return;
    }

    if (provider !== 'bkash' && provider !== 'nagad') {
      res.status(400).json({
        success: false,
        error: "provider must be either 'bkash' or 'nagad'"
      });
      return;
    }

    const qrResult = FieldAgentPosEngine.generateDynamicMfsQr(
      provider,
      String(merchantNumber),
      String(merchantBin),
      Number(amountBdt),
      String(referenceId)
    );

    res.json({
      success: true,
      qr: qrResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate dynamic MFS QR'
    });
  }
});

/**
 * POST /api/v1/pos/transactions/sync
 * Batch synchronizes offline queued transactions.
 */
posRouter.post('/v1/pos/transactions/sync', (req: Request, res: Response): void => {
  try {
    const { transactions } = req.body;

    if (!Array.isArray(transactions)) {
      res.status(400).json({
        success: false,
        error: 'transactions must be an array of PosTransaction objects'
      });
      return;
    }

    const existingIds = new Set(syncedTransactionStore.keys());
    const syncResult = FieldAgentPosEngine.batchSyncTransactions(transactions, existingIds);

    // Save newly synced items to memory store
    for (const tx of syncResult.syncedTransactions) {
      syncedTransactionStore.set(tx.transactionId, tx);
    }

    res.json({
      success: true,
      result: syncResult
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Transaction sync failed'
    });
  }
});

/**
 * POST /api/v1/pos/float/reconcile
 * End-of-day cash float reconciliation and discrepancy calculation.
 */
posRouter.post('/v1/pos/float/reconcile', (req: Request, res: Response): void => {
  try {
    const {
      sessionId = `FLOAT-${Date.now().toString(36).toUpperCase()}`,
      agentId = 'AG-902',
      openingFloatBdt = 1000,
      totalCashSalesBdt = 0,
      totalMfsSalesBdt = 0,
      actualCountedCashBdt = 0
    } = req.body;

    const floatSession = FieldAgentPosEngine.reconcileCashFloat(
      String(sessionId),
      String(agentId),
      Number(openingFloatBdt) || 0,
      Number(totalCashSalesBdt) || 0,
      Number(totalMfsSalesBdt) || 0,
      Number(actualCountedCashBdt) || 0
    );

    res.json({
      success: true,
      session: floatSession
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Float reconciliation failed'
    });
  }
});

/**
 * GET /api/v1/pos/metrics
 * Returns aggregate metrics of synced transactions and daily revenue.
 */
posRouter.get('/v1/pos/metrics', (_req: Request, res: Response): void => {
  try {
    const allTransactions = Array.from(syncedTransactionStore.values());
    const totalTransactions = allTransactions.length;
    const totalVolumeBdt = allTransactions.reduce((sum, tx) => sum + tx.grandTotalBdt, 0);
    const cashVolumeBdt = allTransactions
      .filter((tx) => tx.paymentMethod === 'cash')
      .reduce((sum, tx) => sum + tx.grandTotalBdt, 0);
    const mfsVolumeBdt = allTransactions
      .filter((tx) => tx.paymentMethod === 'bkash_dynamic_qr' || tx.paymentMethod === 'nagad_dynamic_qr')
      .reduce((sum, tx) => sum + tx.grandTotalBdt, 0);

    res.json({
      success: true,
      metrics: {
        totalTransactions,
        totalVolumeBdt: Math.round(totalVolumeBdt * 100) / 100,
        cashVolumeBdt: Math.round(cashVolumeBdt * 100) / 100,
        mfsVolumeBdt: Math.round(mfsVolumeBdt * 100) / 100,
        totalCatalogItems: DEFAULT_POS_CATALOG.length,
        activeBranches: ['Dhanmondi Roadside Hub', 'Uttara Micro-Van 03', 'Mirpur Pop-Up 07']
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve POS metrics'
    });
  }
});

export default posRouter;
