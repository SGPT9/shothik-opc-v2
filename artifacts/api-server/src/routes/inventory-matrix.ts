import { Router } from "express";
import { globalInventoryEngine } from "../lib/inventory/inventory-matrix-engine";

export const inventoryMatrixRouter = Router();

inventoryMatrixRouter.get("/inventory/items", (_req, res) => {
  const items = globalInventoryEngine.listItems();
  res.json({ success: true, count: items.length, items });
});

inventoryMatrixRouter.get("/inventory/items/:sku", (req, res) => {
  const item = globalInventoryEngine.getItem(req.params.sku);
  if (!item) {
    res.status(404).json({ success: false, error: "SKU not found" });
    return;
  }
  res.json({ success: true, item });
});

inventoryMatrixRouter.post("/inventory/items/:sku/channels", (req, res) => {
  try {
    const { daraz, shopify, woocommerce, whatsapp, darkHubReserve } = req.body;
    if (
      daraz === undefined ||
      shopify === undefined ||
      woocommerce === undefined ||
      whatsapp === undefined ||
      darkHubReserve === undefined
    ) {
      res.status(400).json({ success: false, error: "All channel stock counts are required" });
      return;
    }

    const item = globalInventoryEngine.updateChannelAllocation(req.params.sku, {
      daraz: Number(daraz),
      shopify: Number(shopify),
      woocommerce: Number(woocommerce),
      whatsapp: Number(whatsapp),
      darkHubReserve: Number(darkHubReserve),
    });

    res.json({ success: true, item });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

inventoryMatrixRouter.get("/inventory/items/:sku/prediction", (req, res) => {
  try {
    const pastSales = req.query.pastSales ? Number(req.query.pastSales) : 60;
    const prediction = globalInventoryEngine.predictStockOut(req.params.sku, pastSales);
    res.json({ success: true, prediction });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

inventoryMatrixRouter.get("/inventory/items/:sku/rebalance", (req, res) => {
  try {
    const result = globalInventoryEngine.rebalanceDarkStores(req.params.sku);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

inventoryMatrixRouter.post("/inventory/purchase-orders", (req, res) => {
  try {
    const { sku, quantity, deliveryHub, advancePercent } = req.body;
    if (!sku || !quantity) {
      res.status(400).json({ success: false, error: "sku and quantity are required" });
      return;
    }

    const po = globalInventoryEngine.createPurchaseOrder({
      sku,
      quantity: Number(quantity),
      deliveryHub,
      advancePercent: advancePercent ? Number(advancePercent) : 30,
    });

    res.status(201).json({ success: true, purchaseOrder: po });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
