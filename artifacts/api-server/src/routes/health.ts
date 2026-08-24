import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/status", (_req, res) => {
  res.json({
    platform: "Shothik Unified AI Platform",
    domain: "shothikgpt.com",
    overallHealth: "healthy",
    activeSubsystems: 26,
    version: "2.0.0",
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

export default router;
