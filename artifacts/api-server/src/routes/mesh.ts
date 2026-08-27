import { Router, type Request, type Response } from "express";
import { SwitchyardRouteRequestSchema } from "@workspace/hermes/contracts";
import { GortexInferenceMesh } from "../../../../packages/gortex/src/index.js";

const router = Router();
const gortexMesh = new GortexInferenceMesh();

/**
 * POST /api/v1/mesh/dispatch
 * Routes requests dynamically across Cactus Needle, Colibri VPS, or cloud frontier
 */
router.post("/v1/mesh/dispatch", async (req: Request, res: Response) => {
  try {
    const parseResult = SwitchyardRouteRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid model mesh dispatch payload",
        details: parseResult.error.format(),
      });
    }

    const { prompt, deviceMemoryGb, isOffline, targetBackend } = parseResult.data;

    let selectedTier: string;
    let engine: string;
    let costUsd = 0.0;

    if (isOffline || deviceMemoryGb <= 2) {
      selectedTier = "tier0_needle_edge";
      engine = "Cactus Needle 2 (45M / 14MB)";
      costUsd = 0.0;
    } else if (targetBackend === "colibri_vps") {
      selectedTier = "tier2_colibri_vps";
      engine = "Colibri C Engine (Hostinger VPS)";
      costUsd = 0.0;
    } else {
      selectedTier = "tier4_cloud_frontier";
      engine = "Gemini 3.7 / DeepSeek V3";
      costUsd = 0.0004;
    }

    return res.status(200).json({
      success: true,
      selectedTier,
      engine,
      targetBackend,
      costUsd,
      routedAt: new Date().toISOString(),
      simulatedOutput: `[${engine}] Processed: "${prompt.slice(0, 60)}..."`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Model mesh dispatch error",
      message: error?.message || String(error),
    });
  }
});

/**
 * POST /api/v1/mesh/speculative-benchmark
 * Benchmarks local speculative decoding draft acceptance rate, TTFT, and tokens/sec speedup
 */
router.post("/v1/mesh/speculative-benchmark", (req: Request, res: Response) => {
  try {
    const { prompt = "Generate a fast React component with memoization", draftTokens = 5 } = req.body;
    const benchmark = gortexMesh.benchmarkSpeculativeDrafting(prompt, draftTokens);

    return res.status(200).json({
      success: true,
      benchmark,
      hardwareTarget: {
        gpuWorkerPort: 11434,
        targetModel: benchmark.targetModel,
        draftModel: benchmark.draftModel,
        speedupFactor: benchmark.speedupFactor,
        tokensPerSecond: benchmark.tokensPerSecond,
        acceptanceRatePercent: benchmark.acceptanceRatePercent,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/mesh/saturation-test
 * Simulates GPU memory saturation / worker timeout to test circuit breaker failover to cloud
 */
router.post("/v1/mesh/saturation-test", async (req: Request, res: Response) => {
  try {
    const { simulateSaturated = true, prompt = "Analyze financial reports" } = req.body;
    
    // Simulate primary GPU saturation by tripping the circuit breaker
    if (simulateSaturated) {
      const primaryBreaker = gortexMesh.getCircuitBreaker("local-qwen");
      primaryBreaker?.recordFailure();
      primaryBreaker?.recordFailure();
    }

    const decision = await gortexMesh.routeInference(prompt, true);

    return res.status(200).json({
      success: true,
      saturationSimulated: simulateSaturated,
      routingDecision: decision,
      activeNode: decision.selectedNode.name,
      failoverEngaged: decision.status === "FAILOVER_ENGAGED",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
