import { Router, Request, Response } from 'express';
import {
  AgriCommodityRadarEngine,
  TRACKED_AGRI_COMMODITIES,
  AgriCategory,
  MandiId
} from '../lib/agri/agri-commodity-radar-engine.js';

export const agriRouter = Router();

/**
 * GET /api/v1/agri/commodities
 * Returns tracked agri-commodities across Bangladesh with spot mandi prices and shrinkage rates.
 */
agriRouter.get('/v1/agri/commodities', (req: Request, res: Response): void => {
  try {
    const { category, mandi } = req.query;

    let commodities = [...TRACKED_AGRI_COMMODITIES];

    if (category && typeof category === 'string') {
      commodities = commodities.filter((c) => c.category === (category as AgriCategory));
    }

    if (mandi && typeof mandi === 'string') {
      commodities = commodities.filter((c) => c.primaryMandi === (mandi as MandiId));
    }

    res.json({
      success: true,
      count: commodities.length,
      commodities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list commodities'
    });
  }
});

/**
 * POST /api/v1/agri/arbitrage/evaluate
 * Computes spatial farmgate vs urban mandi price arbitrage with moisture loss buffer.
 */
agriRouter.post('/v1/agri/arbitrage/evaluate', (req: Request, res: Response): void => {
  try {
    const {
      commodityId,
      quantityKg,
      transitHours,
      transportType,
      customFarmgatePriceBdt,
      customMandiPriceBdt
    } = req.body;

    if (!commodityId || typeof commodityId !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Missing required field: commodityId'
      });
      return;
    }

    if (!quantityKg || typeof quantityKg !== 'number' || quantityKg <= 0) {
      res.status(400).json({
        success: false,
        error: 'Field quantityKg must be a positive number'
      });
      return;
    }

    const analysis = AgriCommodityRadarEngine.evaluateArbitrage({
      commodityId,
      quantityKg,
      transitHours: typeof transitHours === 'number' ? transitHours : undefined,
      transportType,
      customFarmgatePriceBdt: typeof customFarmgatePriceBdt === 'number' ? customFarmgatePriceBdt : undefined,
      customMandiPriceBdt: typeof customMandiPriceBdt === 'number' ? customMandiPriceBdt : undefined
    });

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to evaluate arbitrage'
    });
  }
});

/**
 * POST /api/v1/agri/lots/create
 * Creates an agricultural sourcing lot draft and calculates farmer micro-advance.
 */
agriRouter.post('/v1/agri/lots/create', (req: Request, res: Response): void => {
  try {
    const {
      commodityId,
      farmerName,
      farmerPhone,
      farmerMfsNumber,
      mfsProvider,
      farmLocation,
      quantityMaund,
      customFarmgateRateBdt,
      advancePercentage,
      expectedHarvestDate,
      transportType,
      destinationMandi
    } = req.body;

    if (!farmerName || !farmerPhone || !farmerMfsNumber || !mfsProvider || !farmLocation) {
      res.status(400).json({
        success: false,
        error: 'Missing farmer sourcing metadata (farmerName, farmerPhone, farmerMfsNumber, mfsProvider, farmLocation required)'
      });
      return;
    }

    if (!quantityMaund || typeof quantityMaund !== 'number' || quantityMaund <= 0) {
      res.status(400).json({
        success: false,
        error: 'Field quantityMaund must be a positive number'
      });
      return;
    }

    const lot = AgriCommodityRadarEngine.createSourcingLot({
      commodityId: commodityId || 'AGRI_ONION_01',
      farmerName,
      farmerPhone,
      farmerMfsNumber,
      mfsProvider,
      farmLocation,
      quantityMaund,
      customFarmgateRateBdt: typeof customFarmgateRateBdt === 'number' ? customFarmgateRateBdt : undefined,
      advancePercentage: typeof advancePercentage === 'number' ? advancePercentage : undefined,
      expectedHarvestDate,
      transportType,
      destinationMandi
    });

    res.status(201).json({
      success: true,
      lot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create sourcing lot'
    });
  }
});

/**
 * POST /api/v1/agri/lots/disburse-advance
 * Executes digital disbursement of farmer micro-advance via bKash/Nagad MFS gateway.
 */
agriRouter.post('/v1/agri/lots/disburse-advance', (req: Request, res: Response): void => {
  try {
    const { lot } = req.body;

    if (!lot || !lot.lotId || !lot.advanceAmountBdt || !lot.farmerMfsNumber || !lot.mfsProvider) {
      res.status(400).json({
        success: false,
        error: 'Invalid lot payload: lotId, advanceAmountBdt, farmerMfsNumber, and mfsProvider required'
      });
      return;
    }

    const receipt = AgriCommodityRadarEngine.disburseFarmerAdvance(lot);

    res.json({
      success: true,
      receipt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to disburse farmer advance'
    });
  }
});

/**
 * POST /api/v1/agri/logistics/cold-chain-plan
 * Calculates Reefer cold-chain transit economic plan vs open bed cargo.
 */
agriRouter.post('/v1/agri/logistics/cold-chain-plan', (req: Request, res: Response): void => {
  try {
    const { origin, destination, commodityId, quantityKg, distanceKm } = req.body;

    if (!origin || !destination || !commodityId || !quantityKg) {
      res.status(400).json({
        success: false,
        error: 'Fields origin, destination, commodityId, and quantityKg are required'
      });
      return;
    }

    const plan = AgriCommodityRadarEngine.calculateColdChainPlan({
      origin,
      destination,
      commodityId,
      quantityKg: Number(quantityKg),
      distanceKm: typeof distanceKm === 'number' ? distanceKm : undefined
    });

    res.json({
      success: true,
      plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate cold-chain plan'
    });
  }
});

/**
 * GET /api/v1/agri/mandis/overview
 * Returns wholesale mandi trading market hub metadata across Bangladesh.
 */
agriRouter.get('/v1/agri/mandis/overview', (_req: Request, res: Response): void => {
  try {
    const overview = AgriCommodityRadarEngine.getMandisOverview();
    res.json({
      success: true,
      ...overview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch mandis overview'
    });
  }
});

export default agriRouter;

