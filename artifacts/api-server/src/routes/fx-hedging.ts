import { Router, Request, Response } from 'express';
import {
  fxHedgingEngine,
  ForwardContractStatus,
  ForwardContractRecord,
} from '../lib/hedging/fx-hedging-engine.js';

export const fxHedgingRouter = Router();

/**
 * POST /api/v1/fx-hedging/quote
 * Calculates real-time CIRP forward rate quotes for 30/60/90/180 days
 */
fxHedgingRouter.post('/v1/fx-hedging/quote', (req: Request, res: Response) => {
  try {
    const { spotRate, bdtRate, usdRate } = req.body || {};
    const quotes = fxHedgingEngine.calculateForwardQuotes(spotRate, bdtRate, usdRate);

    return res.status(200).json({
      ok: true,
      data: quotes,
      message: 'Real-time CIRP forward rate curve computed successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to calculate forward rate quotes.',
    });
  }
});

/**
 * POST /api/v1/fx-hedging/contract/book
 * Books an export forward exchange hedge contract with Authorized Dealer bank
 */
fxHedgingRouter.post('/v1/fx-hedging/contract/book', (req: Request, res: Response) => {
  try {
    const input: Partial<ForwardContractRecord> = req.body || {};
    const contract = fxHedgingEngine.bookForwardContract(input);

    return res.status(200).json({
      ok: true,
      data: contract,
      message: `Forward contract #${contract.contractNumber} booked successfully with ${contract.adBankName}.`,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to book forward exchange contract.',
    });
  }
});

/**
 * GET /api/v1/fx-hedging/contract/list
 * Lists active and settled forward contracts
 */
fxHedgingRouter.get('/v1/fx-hedging/contract/list', (req: Request, res: Response) => {
  try {
    const status = req.query.status as ForwardContractStatus | undefined;
    const contracts = fxHedgingEngine.listContracts({ status });

    return res.status(200).json({
      ok: true,
      data: contracts,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to retrieve forward contract list.',
    });
  }
});

/**
 * GET /api/v1/fx-hedging/contract/:contractNumber
 * Retrieves individual forward contract by identifier
 */
fxHedgingRouter.get('/v1/fx-hedging/contract/:contractNumber', (req: Request, res: Response) => {
  try {
    const contractNumber = String(req.params.contractNumber);
    const contract = fxHedgingEngine.getContractByNumber(contractNumber);

    if (!contract) {
      return res.status(404).json({
        ok: false,
        error: `Forward contract #${contractNumber} not found.`,
      });
    }

    return res.status(200).json({
      ok: true,
      data: contract,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to retrieve forward contract.',
    });
  }
});

/**
 * POST /api/v1/fx-hedging/contract/settle
 * Settles forward contract against inward remittance realization
 */
fxHedgingRouter.post('/v1/fx-hedging/contract/settle', (req: Request, res: Response) => {
  try {
    const { contractNumber, settlementSpotRate } = req.body || {};

    if (!contractNumber) {
      return res.status(400).json({
        ok: false,
        error: 'contractNumber is a required field.',
      });
    }

    const settled = fxHedgingEngine.settleForwardContract(contractNumber, settlementSpotRate);

    return res.status(200).json({
      ok: true,
      data: settled,
      message: `Forward contract #${contractNumber} settled successfully. Margin lien released.`,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to settle forward contract.',
    });
  }
});

/**
 * POST /api/v1/fx-hedging/revalue-mtm
 * Triggers portfolio Mark-to-Market revaluation under new spot price
 */
fxHedgingRouter.post('/v1/fx-hedging/revalue-mtm', (req: Request, res: Response) => {
  try {
    const { spotRate = 121.5 } = req.body || {};
    fxHedgingEngine.revalueMtm(Number(spotRate));

    return res.status(200).json({
      ok: true,
      message: `Portfolio MTM revaluation completed at spot rate ৳${spotRate}.`,
      summary: fxHedgingEngine.getSummaryMetrics(Number(spotRate)),
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to revalue MTM portfolio.',
    });
  }
});

/**
 * GET /api/v1/fx-hedging/summary
 * Retrieves overall portfolio hedge volume, MTM gain/loss, and collateral lien status
 */
fxHedgingRouter.get('/v1/fx-hedging/summary', (req: Request, res: Response) => {
  try {
    const spotRate = req.query.spotRate ? Number(req.query.spotRate) : undefined;
    const summary = fxHedgingEngine.getSummaryMetrics(spotRate);

    return res.status(200).json({
      ok: true,
      data: summary,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to calculate FX hedging summary.',
    });
  }
});
