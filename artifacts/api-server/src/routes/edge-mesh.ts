import { Router, type Request, type Response } from "express";
import { edgeReplicationMeshEngine, type NodeId } from "../lib/edge-replication-mesh.js";

export const edgeMeshRouter = Router();

/**
 * GET /api/v1/edge/mesh/topology
 * Returns registered regional edge nodes, their health, and active vector clocks
 */
edgeMeshRouter.get("/v1/edge/mesh/topology", (_req: Request, res: Response) => {
  try {
    const nodes = edgeReplicationMeshEngine.getTopology();
    const convergence = edgeReplicationMeshEngine.getConvergenceStatus();

    return res.status(200).json({
      success: true,
      nodes,
      convergence,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve edge mesh topology",
      message: error?.message || String(error),
    });
  }
});

/**
 * GET /api/v1/edge/mesh/latency-matrix
 * Returns inter-region RTT latency and jitter matrix
 */
edgeMeshRouter.get("/v1/edge/mesh/latency-matrix", (_req: Request, res: Response) => {
  try {
    const matrix = edgeReplicationMeshEngine.getLatencyMatrix();

    return res.status(200).json({
      success: true,
      count: matrix.length,
      matrix,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve inter-region latency matrix",
      message: error?.message || String(error),
    });
  }
});

/**
 * POST /api/v1/edge/mesh/mutate
 * Applies write mutation at designated edge node (e.g. Dhaka), generating WAL frame
 */
edgeMeshRouter.post("/v1/edge/mesh/mutate", (req: Request, res: Response) => {
  try {
    const { originNodeId, table, rowId, operation, payload } = req.body;

    if (!originNodeId || !table || !rowId || !operation || !payload) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: originNodeId, table, rowId, operation, payload",
      });
    }

    const { frame, replicationResults } = edgeReplicationMeshEngine.applyLocalMutation({
      originNodeId,
      table,
      rowId,
      operation,
      payload,
    });

    return res.status(201).json({
      success: true,
      frame,
      replicationResults,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to apply local edge mutation",
      message: error?.message || String(error),
    });
  }
});

/**
 * POST /api/v1/edge/mesh/replicate
 * Receives incoming WAL frame at peer node
 */
edgeMeshRouter.post("/v1/edge/mesh/replicate", (req: Request, res: Response) => {
  try {
    const { targetNodeId, frame } = req.body;

    if (!targetNodeId || !frame) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: targetNodeId, frame",
      });
    }

    const result = edgeReplicationMeshEngine.replicateIncomingFrame(targetNodeId, frame);

    return res.status(200).json({
      success: result.success,
      result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to replicate incoming frame",
      message: error?.message || String(error),
    });
  }
});

/**
 * POST /api/v1/edge/mesh/force-sync
 * Forces bi-directional convergence across all nodes and flushes partition replay buffers
 */
edgeMeshRouter.post("/v1/edge/mesh/force-sync", (_req: Request, res: Response) => {
  try {
    const status = edgeReplicationMeshEngine.forceGlobalSync();

    return res.status(200).json({
      success: true,
      message: "Global edge mesh synchronized successfully",
      convergence: status,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to trigger global mesh sync",
      message: error?.message || String(error),
    });
  }
});

/**
 * GET /api/v1/edge/mesh/frames
 * Returns audit log of distributed WAL frames
 */
edgeMeshRouter.get("/v1/edge/mesh/frames", (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const frames = edgeReplicationMeshEngine.getWalFrames(limit);

    return res.status(200).json({
      success: true,
      count: frames.length,
      frames,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve WAL frames",
      message: error?.message || String(error),
    });
  }
});

/**
 * POST /api/v1/edge/mesh/simulate-partition
 * Toggles partition status for a regional node for chaos and offline recovery testing
 */
edgeMeshRouter.post("/v1/edge/mesh/simulate-partition", (req: Request, res: Response) => {
  try {
    const { nodeId, isPartitioned } = req.body;

    if (!nodeId || typeof isPartitioned !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: nodeId, isPartitioned (boolean)",
      });
    }

    const node = edgeReplicationMeshEngine.simulatePartition(nodeId as NodeId, isPartitioned);

    return res.status(200).json({
      success: true,
      node,
      message: `Node ${nodeId} partition state set to ${isPartitioned ? "PARTITIONED" : "RECONNECTED"}`,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to set partition state",
      message: error?.message || String(error),
    });
  }
});

/**
 * GET /api/v1/edge/mesh/convergence
 * Checks global mesh convergence and max clock differential
 */
edgeMeshRouter.get("/v1/edge/mesh/convergence", (_req: Request, res: Response) => {
  try {
    const convergence = edgeReplicationMeshEngine.getConvergenceStatus();

    return res.status(200).json({
      success: true,
      convergence,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to check convergence",
      message: error?.message || String(error),
    });
  }
});
