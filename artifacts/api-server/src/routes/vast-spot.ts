import { Router, type Request, type Response } from "express";
import { vastSpotOrchestrator } from "../lib/vast-spot-orchestrator.js";

export const vastSpotRouter = Router();

/**
 * GET /api/v1/compute/vast/offers
 * Returns verified spot GPU offers on Vast.ai
 */
vastSpotRouter.get("/v1/compute/vast/offers", (req: Request, res: Response) => {
  try {
    const minVramGb = req.query.minVramGb ? Number(req.query.minVramGb) : undefined;
    const maxUsdPerHour = req.query.maxUsdPerHour ? Number(req.query.maxUsdPerHour) : undefined;
    const minReliability = req.query.minReliability ? Number(req.query.minReliability) : undefined;

    const offers = vastSpotOrchestrator.getOffers({
      minVramGb,
      maxUsdPerHour,
      minReliability,
    });

    return res.status(200).json({
      success: true,
      count: offers.length,
      offers,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve spot GPU offers",
      message: error?.message || String(error),
    });
  }
});

/**
 * POST /api/v1/compute/vast/bid-and-launch
 * Allocates and boots a dynamic spot GPU container
 */
vastSpotRouter.post("/v1/compute/vast/bid-and-launch", (req: Request, res: Response) => {
  try {
    const { offerId, dockerImage, workloadDescription } = req.body;

    if (!offerId) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameter 'offerId'",
      });
    }

    const instance = vastSpotOrchestrator.bidAndLaunch({
      offerId,
      dockerImage,
      workloadDescription,
    });

    return res.status(201).json({
      success: true,
      instanceId: instance.id,
      instance,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to launch spot GPU instance",
      message: error?.message || String(error),
    });
  }
});

/**
 * GET /api/v1/compute/vast/instances
 * Lists all active and stopped spot instances
 */
vastSpotRouter.get("/v1/compute/vast/instances", (_req: Request, res: Response) => {
  try {
    const instances = vastSpotOrchestrator.getInstances();
    return res.status(200).json({
      success: true,
      count: instances.length,
      instances,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to list spot instances",
      message: error?.message || String(error),
    });
  }
});

/**
 * GET /api/v1/compute/vast/instances/:instanceId
 * Retrieves specific instance status and spent budget
 */
vastSpotRouter.get("/v1/compute/vast/instances/:instanceId", (req: Request, res: Response) => {
  try {
    const instanceId = String(req.params.instanceId);
    const instance = vastSpotOrchestrator.getInstance(instanceId);

    if (!instance) {
      return res.status(404).json({ success: false, error: `Instance not found: ${instanceId}` });
    }

    return res.status(200).json({
      success: true,
      instance,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve spot instance",
      message: error?.message || String(error),
    });
  }
});

/**
 * POST /api/v1/compute/vast/instances/:instanceId/destroy
 * Terminates a spot instance and finalizes billing
 */
vastSpotRouter.post("/v1/compute/vast/instances/:instanceId/destroy", (req: Request, res: Response) => {
  try {
    const instanceId = String(req.params.instanceId);
    const instance = vastSpotOrchestrator.getInstance(instanceId);

    if (!instance) {
      return res.status(404).json({ success: false, error: `Instance not found: ${instanceId}` });
    }

    const destroyed = vastSpotOrchestrator.destroyInstance(instanceId);

    return res.status(200).json({
      success: true,
      instanceId: destroyed.id,
      status: destroyed.status,
      totalSpentUsd: destroyed.totalSpentUsd,
      totalSpentBdt: destroyed.totalSpentBdt,
      instance: destroyed,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to destroy spot instance",
      message: error?.message || String(error),
    });
  }
});

/**
 * POST /api/v1/compute/vast/evaluate-fallback
 * Evaluates whether a task can run locally via WebGPU or requires bursting to Vast.ai spot GPU
 */
vastSpotRouter.post("/v1/compute/vast/evaluate-fallback", (req: Request, res: Response) => {
  try {
    const { promptTokens, batchSize, requiredVramGb, modelPrecision } = req.body;

    if (typeof promptTokens !== "number") {
      return res.status(400).json({
        success: false,
        error: "Parameter 'promptTokens' (number) is required",
      });
    }

    const evaluation = vastSpotOrchestrator.evaluateFallback({
      promptTokens,
      batchSize,
      requiredVramGb,
      modelPrecision,
    });

    return res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to evaluate compute fallback",
      message: error?.message || String(error),
    });
  }
});

export default vastSpotRouter;
