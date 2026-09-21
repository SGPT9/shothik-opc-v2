import { Router, Request, Response } from 'express';
import { darkHubEngine } from '../lib/fulfillment/dark-hub-engine.js';

const router = Router();

/**
 * GET /api/v1/fulfillment/hubs
 * Retrieve all active dark fulfillment hubs and their inventory statistics.
 */
router.get('/v1/fulfillment/hubs', (_req: Request, res: Response): void => {
  try {
    const hubs = darkHubEngine.getAllHubs();
    const inventory = darkHubEngine.getInventory();
    
    const enrichedHubs = hubs.map(hub => {
      const hubInventory = inventory.filter(i => i.hubId === hub.hubId);
      const totalSkuCount = new Set(hubInventory.map(i => i.sku)).size;
      const totalStockUnits = hubInventory.reduce((acc, curr) => acc + curr.quantity, 0);

      return {
        ...hub,
        metrics: {
          totalSkuCount,
          totalStockUnits,
          utilizationPercent: Math.round((hub.utilizedUnits / hub.capacityUnits) * 100)
        }
      };
    });

    res.json({
      success: true,
      hubs: enrichedHubs,
      totalHubs: enrichedHubs.length
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/fulfillment/inventory
 * Retrieve inventory items across all hubs or filtered by hubId.
 */
router.get('/v1/fulfillment/inventory', (req: Request, res: Response): void => {
  try {
    const hubId = req.query.hubId as string | undefined;
    const items = darkHubEngine.getInventory(hubId);
    res.json({
      success: true,
      inventory: items,
      count: items.length
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/fulfillment/route-order
 * Route an incoming customer order to the nearest dark store with FEFO lot allocation.
 */
router.post('/v1/fulfillment/route-order', (req: Request, res: Response): void => {
  try {
    const { customerThana, items, orderId } = req.body;

    if (!customerThana || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameters: customerThana and items array.'
      });
      return;
    }

    const routeResult = darkHubEngine.routeOrder(customerThana, items, orderId);

    res.json({
      success: true,
      routing: routeResult
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/fulfillment/pick-list
 * Generate optimized S-curve serpentine pick list for warehouse operators.
 */
router.post('/v1/fulfillment/pick-list', (req: Request, res: Response): void => {
  try {
    const { hubId, items } = req.body;

    if (!hubId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameters: hubId and items array.'
      });
      return;
    }

    const pickList = darkHubEngine.generatePickList(hubId, items);

    res.json({
      success: true,
      pickList
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/fulfillment/expiry-alerts
 * Retrieve inventory batches nearing expiration with recommended markdown percentages.
 */
router.get('/v1/fulfillment/expiry-alerts', (req: Request, res: Response): void => {
  try {
    const referenceDate = req.query.referenceDate as string | undefined;
    const alerts = darkHubEngine.getExpiryAlerts(referenceDate);

    res.json({
      success: true,
      alerts,
      count: alerts.length
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/fulfillment/rebalance-plan
 * Compute inter-hub inventory rebalancing and replenishment recommendations.
 */
router.post('/v1/fulfillment/rebalance-plan', (_req: Request, res: Response): void => {
  try {
    const plan = darkHubEngine.generateRebalancePlan();

    res.json({
      success: true,
      rebalancePlan: plan
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/fulfillment/batch-register
 * Ingest a new lot/batch into hub inventory.
 */
router.post('/v1/fulfillment/batch-register', (req: Request, res: Response): void => {
  try {
    const {
      sku,
      name,
      category,
      hubId,
      quantity,
      binLocation,
      batchNumber,
      mfgDate,
      expiryDate,
      unitCostBDT,
      sellingPriceBDT,
      dailyVelocity
    } = req.body;

    if (!sku || !name || !hubId || !quantity || !binLocation || !batchNumber || !expiryDate) {
      res.status(400).json({
        success: false,
        error: 'Missing required batch fields: sku, name, hubId, quantity, binLocation, batchNumber, expiryDate.'
      });
      return;
    }

    const registered = darkHubEngine.registerBatch({
      sku,
      name,
      category: category || 'Groceries',
      hubId,
      quantity: Number(quantity),
      binLocation,
      batchNumber,
      mfgDate: mfgDate || new Date().toISOString().split('T')[0],
      expiryDate,
      unitCostBDT: Number(unitCostBDT || 0),
      sellingPriceBDT: Number(sellingPriceBDT || 0),
      dailyVelocity: Number(dailyVelocity || 5)
    });

    res.status(201).json({
      success: true,
      item: registered
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as fulfillmentRouter };
export default router;
