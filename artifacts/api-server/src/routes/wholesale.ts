import { Router, Request, Response } from 'express';
import {
  WholesaleRfqEscrowEngine,
  VERIFIED_WHOLESALE_SUPPLIERS,
  WholesaleHubId,
  WholesaleCategory
} from '../lib/wholesale/wholesale-rfq-escrow-engine.js';

export const wholesaleRouter = Router();

/**
 * GET /api/v1/wholesale/suppliers
 * List verified wholesale suppliers with optional hub and category filters.
 */
wholesaleRouter.get('/v1/wholesale/suppliers', (req: Request, res: Response): void => {
  try {
    const { hub, category } = req.query;

    let suppliers = [...VERIFIED_WHOLESALE_SUPPLIERS];

    if (hub && typeof hub === 'string') {
      suppliers = suppliers.filter((s) => s.hub === (hub as WholesaleHubId));
    }

    if (category && typeof category === 'string') {
      suppliers = suppliers.filter((s) => s.category === (category as WholesaleCategory));
    }

    res.json({
      success: true,
      count: suppliers.length,
      suppliers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list wholesale suppliers'
    });
  }
});

/**
 * POST /api/v1/wholesale/rfq/generate
 * Generates a structured Request for Quotation (RFQ) with volume tiers and SHA-256 seal.
 */
wholesaleRouter.post('/v1/wholesale/rfq/generate', (req: Request, res: Response): void => {
  try {
    const {
      title,
      hub,
      category,
      skuName,
      specifications,
      targetQuantity,
      estimatedBasePriceBdt,
      deliverySlaDays,
      sampleRequired,
      incoterm
    } = req.body;

    if (!title || !hub || !category || !skuName || !targetQuantity || !estimatedBasePriceBdt) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameters (title, hub, category, skuName, targetQuantity, estimatedBasePriceBdt)'
      });
      return;
    }

    const rfq = WholesaleRfqEscrowEngine.generateRfqDraft({
      title,
      hub,
      category,
      skuName,
      specifications: specifications || 'Standard B2B commercial grade specifications',
      targetQuantity: Number(targetQuantity),
      estimatedBasePriceBdt: Number(estimatedBasePriceBdt),
      deliverySlaDays: deliverySlaDays ? Number(deliverySlaDays) : undefined,
      sampleRequired: sampleRequired !== undefined ? Boolean(sampleRequired) : true,
      incoterm
    });

    res.status(201).json({
      success: true,
      rfq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate wholesale RFQ'
    });
  }
});

/**
 * POST /api/v1/wholesale/rfq/evaluate-bids
 * Evaluates competing supplier bids against an RFQ using Supplier Reliability Index (SRI).
 */
wholesaleRouter.post('/v1/wholesale/rfq/evaluate-bids', (req: Request, res: Response): void => {
  try {
    const { rfq, customBids } = req.body;

    if (!rfq || !rfq.rfqId || !rfq.targetQuantity) {
      res.status(400).json({
        success: false,
        error: 'Missing valid RFQ draft in request body'
      });
      return;
    }

    const evaluation = WholesaleRfqEscrowEngine.evaluateSupplierBids(rfq, customBids);

    res.json({
      success: true,
      evaluation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to evaluate supplier bids'
    });
  }
});

/**
 * POST /api/v1/wholesale/escrow/compile-contract
 * Compiles a 3-stage milestone escrow agreement with SHA-256 seal.
 */
wholesaleRouter.post('/v1/wholesale/escrow/compile-contract', (req: Request, res: Response): void => {
  try {
    const { rfq, bid, buyerName, arbitrationJurisdiction, defectLiabilityDays } = req.body;

    if (!rfq || !bid || !buyerName) {
      res.status(400).json({
        success: false,
        error: 'Missing required contract parameters (rfq, bid, buyerName)'
      });
      return;
    }

    const contract = WholesaleRfqEscrowEngine.compileMilestoneEscrowContract({
      rfq,
      bid,
      buyerName,
      arbitrationJurisdiction,
      defectLiabilityDays: defectLiabilityDays ? Number(defectLiabilityDays) : undefined
    });

    res.status(201).json({
      success: true,
      contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to compile milestone escrow contract'
    });
  }
});

/**
 * GET /api/v1/wholesale/hubs/overview
 * Overview of wholesale markets across Bangladesh and cross-border.
 */
wholesaleRouter.get('/v1/wholesale/hubs/overview', (_req: Request, res: Response): void => {
  try {
    const overview = WholesaleRfqEscrowEngine.getWholesaleHubsOverview();
    res.json({
      success: true,
      ...overview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch hubs overview'
    });
  }
});

export default wholesaleRouter;
