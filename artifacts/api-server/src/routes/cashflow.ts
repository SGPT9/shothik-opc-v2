import { Router, Request, Response } from 'express';
import { cashflowReconcilerEngine } from '../lib/cashflow/cashflow-reconciler-engine.js';

const router = Router();

/**
 * GET /api/v1/cashflow/summary
 * Retrieve unified liquid cash position across bKash, Nagad, Bank, and in-transit COD.
 */
router.get('/v1/cashflow/summary', (_req: Request, res: Response): void => {
  try {
    const summary = cashflowReconcilerEngine.getLiquiditySummary();
    res.json({
      success: true,
      liquidity: summary
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/cashflow/reconcile-batch
 * Ingest and reconcile carrier settlement payment batch manifest.
 */
router.post('/v1/cashflow/reconcile-batch', (req: Request, res: Response): void => {
  try {
    const { carrier, consignments, settlementDate } = req.body;

    if (!carrier || !consignments || !Array.isArray(consignments) || consignments.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameters: carrier and non-empty consignments array.'
      });
      return;
    }

    const batch = cashflowReconcilerEngine.reconcileSettlementBatch(carrier, consignments, settlementDate);

    res.status(201).json({
      success: true,
      settlementBatch: batch
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/cashflow/daily-pnl
 * Retrieve real-time daily unit economics and PnL waterfall with RTO return loss.
 */
router.get('/v1/cashflow/daily-pnl', (req: Request, res: Response): void => {
  try {
    const date = req.query.date as string | undefined;
    const pnl = cashflowReconcilerEngine.calculateDailyPnL(date);

    res.json({
      success: true,
      dailyPnL: pnl
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/cashflow/discrepancies
 * Retrieve carrier underpayment flags and claim dispute briefs.
 */
router.get('/v1/cashflow/discrepancies', (_req: Request, res: Response): void => {
  try {
    const discrepancies = cashflowReconcilerEngine.getDiscrepancies();
    res.json({
      success: true,
      discrepancies,
      count: discrepancies.length
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/cashflow/runway-forecast
 * Retrieve 30-day working capital runway and liquidity burn trajectory.
 */
router.get('/v1/cashflow/runway-forecast', (_req: Request, res: Response): void => {
  try {
    const forecast = cashflowReconcilerEngine.generateRunwayForecast();
    res.json({
      success: true,
      forecast
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as cashflowRouter };
export default router;
