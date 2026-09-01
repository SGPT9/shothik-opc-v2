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
