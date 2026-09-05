import { Router, type Request, type Response } from "express";
import { swarmDagScheduler } from "../lib/swarm-dag-scheduler.js";

export const swarmGraphRouter = Router();

/**
 * GET /api/v1/swarm/graph/templates
 * Lists pre-packaged verified multi-agent swarm DAG templates
 */
swarmGraphRouter.get("/v1/swarm/graph/templates", (_req: Request, res: Response) => {
  try {
    const templates = swarmDagScheduler.getTemplates();
    return res.status(200).json({
      success: true,
      count: templates.length,
      templates,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve graph templates",
      message: error?.message || String(error),
    });
  }
});

/**
 * POST /api/v1/swarm/graph/create
 * Instantiates a new DAG graph from a template or custom nodes with cycle detection
 */
swarmGraphRouter.post("/v1/swarm/graph/create", (req: Request, res: Response) => {
  try {
    const { name, description, templateId, nodes } = req.body;

    if (!templateId && (!nodes || !Array.isArray(nodes) || nodes.length === 0)) {
      return res.status(400).json({
        success: false,
        error: "Either 'templateId' or non-empty 'nodes' array must be provided",
      });
    }

    const graph = swarmDagScheduler.createGraph({
      name,
      description,
      templateId,
      nodes,
    });

    return res.status(201).json({
      success: true,
      graphId: graph.id,
      graph,
    });
  } catch (error: any) {
    const isCycle = error?.message?.includes("Circular dependency");
    return res.status(isCycle ? 400 : 500).json({
      success: false,
      error: isCycle ? "Circular dependency detected" : "Failed to create graph",
      message: error?.message || String(error),
    });
  }
});

/**
 * POST /api/v1/swarm/graph/:graphId/execute
 * Executes the DAG wave-by-wave in topological parallel batches
 */
swarmGraphRouter.post("/v1/swarm/graph/:graphId/execute", async (req: Request, res: Response) => {
  try {
    const graphId = String(req.params.graphId);
    const graph = swarmDagScheduler.getGraph(graphId);

    if (!graph) {
      return res.status(404).json({ success: false, error: `Graph not found: ${graphId}` });
    }

    const executed = await swarmDagScheduler.executeGraph(graphId);

    return res.status(200).json({
      success: true,
      graphId: executed.id,
      status: executed.status,
      totalDurationMs: executed.totalDurationMs,
      parallelSpeedupRatio: executed.parallelSpeedupRatio,
      totalWaves: executed.waves.length,
      graph: executed,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to execute swarm graph",
      message: error?.message || String(error),
    });
  }
});

/**
 * GET /api/v1/swarm/graph/:graphId
 * Retrieves current real-time state, wave progress, and node outputs
 */
swarmGraphRouter.get("/v1/swarm/graph/:graphId", (req: Request, res: Response) => {
  try {
    const graphId = String(req.params.graphId);
    const graph = swarmDagScheduler.getGraph(graphId);

    if (!graph) {
      return res.status(404).json({ success: false, error: `Graph not found: ${graphId}` });
    }

    return res.status(200).json({
      success: true,
      graph,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve graph",
      message: error?.message || String(error),
    });
  }
});

/**
 * POST /api/v1/swarm/graph/:graphId/cancel
 * Aborts an in-flight graph execution
 */
swarmGraphRouter.post("/v1/swarm/graph/:graphId/cancel", (req: Request, res: Response) => {
  try {
    const graphId = String(req.params.graphId);
    const graph = swarmDagScheduler.getGraph(graphId);

    if (!graph) {
      return res.status(404).json({ success: false, error: `Graph not found: ${graphId}` });
    }

    const cancelled = swarmDagScheduler.cancelGraph(graphId);

    return res.status(200).json({
      success: true,
      graphId: cancelled.id,
      status: cancelled.status,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to cancel graph",
      message: error?.message || String(error),
    });
  }
});

export default swarmGraphRouter;
