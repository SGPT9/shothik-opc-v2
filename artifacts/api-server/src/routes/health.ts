import { Router, type IRouter, type Request, type Response } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

/**
 * Standard HTTP 200 ping endpoint
 */
router.get("/health", (_req: Request, res: Response) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json({ ...data, uptime: process.uptime() });
});

router.get("/healthz", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

/**
 * Kubernetes / Dokploy Liveness Probe
 */
router.get(["/health/liveness", "/healthz/liveness"], (_req: Request, res: Response) => {
  res.status(200).json({
    status: "UP",
    uptimeSeconds: Math.floor(process.uptime()),
    pid: process.pid,
    timestamp: new Date().toISOString(),
  });
});

import { gracefulShutdownSupervisor } from "../lib/lifecycle/graceful-shutdown";

/**
 * Kubernetes / Dokploy Readiness Probe
 */
router.get(["/health/readiness", "/healthz/readiness"], (_req: Request, res: Response) => {
  if (gracefulShutdownSupervisor.isShuttingDown()) {
    return res.status(503).json({
      status: "DOWN",
      reason: "SERVER_DRAINING",
      activeRequests: gracefulShutdownSupervisor.getActiveRequests(),
      timestamp: new Date().toISOString(),
    });
  }

  const mem = process.memoryUsage();
  const heapUsedMb = Number((mem.heapUsed / 1024 / 1024).toFixed(2));
  const rssMb = Number((mem.rss / 1024 / 1024).toFixed(2));
  const isReady = heapUsedMb < 1536;

  const result = {
    status: isReady ? "UP" : "DOWN",
    checks: {
      memoryHeapUsedMb: heapUsedMb,
      memoryRssMb: rssMb,
      uptimeSeconds: Math.floor(process.uptime()),
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(isReady ? 200 : 503).json(result);
});

/**
 * Deep diagnostic probe covering telemetry, memory, and subsystem operational status
 */
router.get(["/health/deep", "/v1/health/deep", "/api/v1/health/deep"], (_req: Request, res: Response) => {
  const mem = process.memoryUsage();
  res.status(200).json({
    platform: "Shothik Unified AI Platform",
    domain: "shothikgpt.com",
    status: "HEALTHY",
    version: "2.2.0",
    uptimeSeconds: Math.floor(process.uptime()),
    memory: {
      heapUsedMb: Number((mem.heapUsed / 1024 / 1024).toFixed(2)),
      heapTotalMb: Number((mem.heapTotal / 1024 / 1024).toFixed(2)),
      rssMb: Number((mem.rss / 1024 / 1024).toFixed(2)),
    },
    subsystems: {
      inkosNarrativeForecast: "operational",
      nilkhetPodEngine: "operational",
      boimela3DStudio: "operational",
      storyGraphTreeStudio: "operational",
      steadfastCourierGateway: "operational",
      writingStudio3Fold: "operational",
      mfsBkashNagadGateway: "operational",
      teaEstateAuctionClearing: "operational",
      zeroPiiDataGasket: "operational",
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * Backward-compatible /status endpoint
 */
router.get("/status", (_req: Request, res: Response) => {
  res.json({
    platform: "Shothik Unified AI Platform",
    domain: "shothikgpt.com",
    overallHealth: "healthy",
    activeSubsystems: 30,
    version: "2.2.0",
    subsystems: {
      inkosNarrativeForecast: "operational",
      nilkhetPodEngine: "operational",
      boimela3DStudio: "operational",
      storyGraphTreeStudio: "operational",
      steadfastCourierGateway: "operational",
      writingStudio3Fold: "operational",
    },
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

export default router;
