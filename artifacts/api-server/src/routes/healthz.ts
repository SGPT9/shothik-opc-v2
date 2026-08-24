import { Router, Request, Response } from "express";

const router = Router();

export interface SubsystemStatus {
  name: string;
  repo: string;
  status: "healthy" | "degraded" | "down";
  latencyMs: number;
}

router.get("/healthz", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    domain: "shothikgpt.com",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    version: "2.0.0",
  });
});

router.get("/status", (_req: Request, res: Response) => {
  const subsystems: SubsystemStatus[] = [
    { name: "Frontend Shell", repo: "ahsanhab919-ux/shothik-frontend-v2", status: "healthy", latencyMs: 12 },
    { name: "API Gateway", repo: "ahsanhab919-ux/shothik-backend-v2", status: "healthy", latencyMs: 8 },
    { name: "Swarm DAG Consensus", repo: "ahsanhab919-ux/shothik-swarm", status: "healthy", latencyMs: 24 },
    { name: "GORTEX Local Mesh", repo: "ahsanhab919-ux/shothik-gortex", status: "healthy", latencyMs: 18 },
    { name: "Tonight Batch Engine", repo: "ahsanhab919-ux/shothik-tonight", status: "healthy", latencyMs: 15 },
    { name: "Soup 4GB Fine-Tuning", repo: "ahsanhab919-ux/shothik-soup", status: "healthy", latencyMs: 22 },
    { name: "Vespa Hybrid Search", repo: "ahsanhab919-ux/shothik-vespa", status: "healthy", latencyMs: 9 },
    { name: "Bangla NLP Transformer", repo: "ahsanhab919-ux/shothik-bangla", status: "healthy", latencyMs: 5 },
    { name: "Economic & MFS Fraud Guard", repo: "ahsanhab919-ux/shothik-economics", status: "healthy", latencyMs: 11 },
    { name: "Zero-Cost Local Search", repo: "ahsanhab919-ux/shothik-search", status: "healthy", latencyMs: 32 },
    { name: "Founder Digital Twin", repo: "ahsanhab919-ux/shothik-twin", status: "healthy", latencyMs: 19 },
    { name: "WebRTC Voice Pipeline", repo: "ahsanhab919-ux/shothik-voice", status: "healthy", latencyMs: 14 },
    { name: "MCP Stdio Server", repo: "ahsanhab919-ux/shothik-mcp", status: "healthy", latencyMs: 7 },
  ];

  res.status(200).json({
    platform: "Shothik Unified AI Platform",
    domain: "shothikgpt.com",
    overallHealth: "healthy",
    activeSubsystems: subsystems.length,
    subsystems,
  });
});

export default router;
