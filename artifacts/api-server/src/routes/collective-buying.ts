import { Router, Request, Response } from "express";
import {
  collectiveBuyingEngine,
  SourcingOrigin,
  ShippingMode,
} from "../lib/commerce/collective-buying-engine.js";

export const collectiveBuyingRouter = Router();

// GET /api/v1/collective-buying/summary
collectiveBuyingRouter.get("/v1/collective-buying/summary", (_req: Request, res: Response) => {
  try {
    const summary = collectiveBuyingEngine.getSummaryMetrics();
    return res.json({ ok: true, data: summary });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/v1/collective-buying/pools
collectiveBuyingRouter.get("/v1/collective-buying/pools", (_req: Request, res: Response) => {
  try {
    const pools = collectiveBuyingEngine.getPools();
    return res.json({ ok: true, data: pools });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/v1/collective-buying/pools/:id
collectiveBuyingRouter.get("/v1/collective-buying/pools/:id", (req: Request, res: Response) => {
  try {
    const poolId = String(req.params.id);
    const pool = collectiveBuyingEngine.getPoolById(poolId);
    if (!pool) {
      return res.status(404).json({ ok: false, error: "Collective buying pool not found" });
    }
    return res.json({ ok: true, data: pool });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/collective-buying/calculate-freight
collectiveBuyingRouter.post("/v1/collective-buying/calculate-freight", (req: Request, res: Response) => {
  try {
    const {
      totalPoolUnits,
      totalCbm,
      totalWeightKg,
      fobPriceUsdPerUnit,
      freightRatePerCbmUsd,
      freightRatePerKgUsd,
      dutyRatePercent,
      exchangeRateBdtPerUsd,
      hubHandlingFeePerUnitBdt,
    } = req.body;

    if (
      typeof totalPoolUnits !== "number" ||
      typeof totalCbm !== "number" ||
      typeof fobPriceUsdPerUnit !== "number"
    ) {
      return res.status(400).json({
        ok: false,
        error: "totalPoolUnits, totalCbm, and fobPriceUsdPerUnit are required numbers",
      });
    }

    const calculation = collectiveBuyingEngine.calculateFreightAllocation({
      totalPoolUnits,
      totalCbm,
      totalWeightKg: totalWeightKg || 0,
      fobPriceUsdPerUnit,
      freightRatePerCbmUsd: freightRatePerCbmUsd || 140,
      freightRatePerKgUsd: freightRatePerKgUsd || 1.8,
      dutyRatePercent: dutyRatePercent || 25,
      exchangeRateBdtPerUsd: exchangeRateBdtPerUsd || 120,
      hubHandlingFeePerUnitBdt: hubHandlingFeePerUnitBdt || 15,
    });

    return res.json({ ok: true, data: calculation });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/collective-buying/join-pool
collectiveBuyingRouter.post("/v1/collective-buying/join-pool", (req: Request, res: Response) => {
  try {
    const {
      poolId,
      merchantId,
      merchantName,
      merchantBinOrPhone,
      unitsRequested,
      deliveryAddress,
    } = req.body;

    if (!poolId || !merchantName || typeof unitsRequested !== "number" || !deliveryAddress) {
      return res.status(400).json({
        ok: false,
        error: "poolId, merchantName, unitsRequested, and deliveryAddress are required",
      });
    }

    const result = collectiveBuyingEngine.joinPool({
      poolId,
      merchantId: merchantId || `MERCH-${Date.now().toString().slice(-4)}`,
      merchantName,
      merchantBinOrPhone: merchantBinOrPhone || "01700000000",
      unitsRequested,
      deliveryAddress,
    });

    return res.status(200).json({ ok: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/collective-buying/pools/create
collectiveBuyingRouter.post("/v1/collective-buying/pools/create", (req: Request, res: Response) => {
  try {
    const {
      poolTitle,
      productName,
      productCategory,
      productHsCode,
      sourceOrigin,
      shippingMode,
      targetMoqUnits,
      unitPriceBdt,
      freightRatePerCbmUsd,
      freightRatePerKgUsd,
      customsDutyRatePercent,
      deadlineDays,
      centralHubLocation,
    } = req.body;

    if (
      !poolTitle ||
      !productName ||
      !sourceOrigin ||
      !shippingMode ||
      typeof targetMoqUnits !== "number" ||
      typeof unitPriceBdt !== "number"
    ) {
      return res.status(400).json({
        ok: false,
        error: "poolTitle, productName, sourceOrigin, shippingMode, targetMoqUnits, and unitPriceBdt are required",
      });
    }

    const pool = collectiveBuyingEngine.createPool({
      poolTitle,
      productName,
      productCategory: productCategory || "General Merchandise",
      productHsCode: productHsCode || "0000.00.00",
      sourceOrigin: sourceOrigin as SourcingOrigin,
      shippingMode: shippingMode as ShippingMode,
      targetMoqUnits,
      unitPriceBdt,
      freightRatePerCbmUsd,
      freightRatePerKgUsd,
      customsDutyRatePercent,
      deadlineDays,
      centralHubLocation,
    });

    return res.status(201).json({ ok: true, data: pool });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default collectiveBuyingRouter;
