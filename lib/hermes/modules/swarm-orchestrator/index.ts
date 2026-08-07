/**
 * Hermes Multi-Agent Swarm Topology Orchestrator
 * 
 * Manages collaborative multi-agent swarms (Researcher, Writer, Coder, Reviewer)
 * with dynamic task handoffs and real-time pub/sub event streaming.
 */

import { randomUUID } from "crypto";
import { getHermesDatabase } from "../../infra/db";
import { getHermesStreamingEngine } from "../streaming-engine";
import logger from "@/lib/logger";
import type { RunId, WorkspaceId, UserId } from "../../contracts/core";

export type SwarmAgentRole = "researcher" | "writer" | "coder" | "reviewer";

export interface SwarmAgentMember {
  id: string;
  role: SwarmAgentRole;
  name: string;
  status: "idle" | "busy" | "completed";
  capabilities: string[];
}

export interface HermesSwarmTopology {
  swarmId: string;
  workspaceId: WorkspaceId;
  runId: RunId;
  activeAgentId: string;
  agents: SwarmAgentMember[];
  status: "active" | "paused" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface SwarmHandoffRequest {
  swarmId: string;
  workspaceId: WorkspaceId;
  runId: RunId;
  fromRole: SwarmAgentRole;
  toRole: SwarmAgentRole;
  taskPayload: Record<string, unknown>;
  userId: UserId;
}

export class HermesSwarmOrchestrator {
  private static swarms = new Map<string, HermesSwarmTopology>();

  /**
   * Initializes a multi-agent swarm topology for a run.
   */
  static async createSwarm(params: {
    workspaceId: WorkspaceId;
    runId: RunId;
    initialRole?: SwarmAgentRole;
  }): Promise<HermesSwarmTopology> {
    const swarmId = `swm_${randomUUID()}`;
    const initialRole = params.initialRole || "researcher";

    const agents: SwarmAgentMember[] = [
      { id: `ag_res_${swarmId}`, role: "researcher", name: "Deep Research Agent", status: initialRole === "researcher" ? "busy" : "idle", capabilities: ["web_search", "rag_lookup"] },
      { id: `ag_wrt_${swarmId}`, role: "writer", name: "Synthesis Writer Agent", status: initialRole === "writer" ? "busy" : "idle", capabilities: ["markdown_synthesis", "formatting"] },
      { id: `ag_cdr_${swarmId}`, role: "coder", name: "Code Execution Agent", status: initialRole === "coder" ? "busy" : "idle", capabilities: ["python_sandbox", "ts_compile"] },
      { id: `ag_rvw_${swarmId}`, role: "reviewer", name: "QA & Verification Agent", status: initialRole === "reviewer" ? "busy" : "idle", capabilities: ["fact_checking", "code_review"] },
    ];

    const activeAgent = agents.find((a) => a.role === initialRole) || agents[0];

    const topology: HermesSwarmTopology = {
      swarmId,
      workspaceId: params.workspaceId,
      runId: params.runId,
      activeAgentId: activeAgent.id,
      agents,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.swarms.set(swarmId, topology);

    const streaming = getHermesStreamingEngine();
    await streaming.emitRunEvent({
      eventId: randomUUID(),
      runId: params.runId,
      workspaceId: params.workspaceId,
      domain: "chat",
      eventType: "swarm_topology_updated",
      timestamp: new Date().toISOString(),
      sequence: 1,
      payload: {
        swarmId,
        activeRole: initialRole,
        agentCount: agents.length,
      },
      metadata: {
        action: "create_swarm",
      },
    });

    logger.info("[swarm-orchestrator] Multi-agent swarm created", {
      swarmId,
      runId: params.runId,
      activeRole: initialRole,
    });

    return topology;
  }

  /**
   * Triggers an autonomous handoff between swarm agents (e.g. Researcher -> Writer).
   */
  static async triggerHandoff(request: SwarmHandoffRequest): Promise<HermesSwarmTopology> {
    const topology = this.swarms.get(request.swarmId);
    if (!topology) {
      throw new Error(`Swarm topology ${request.swarmId} not found`);
    }

    const targetAgent = topology.agents.find((a) => a.role === request.toRole);
    if (!targetAgent) {
      throw new Error(`Target agent role ${request.toRole} not registered in swarm`);
    }

    // Update agent states
    topology.agents.forEach((a) => {
      if (a.role === request.fromRole) a.status = "completed";
      if (a.role === request.toRole) a.status = "busy";
    });

    topology.activeAgentId = targetAgent.id;
    topology.updatedAt = new Date().toISOString();
    this.swarms.set(request.swarmId, topology);

    const streaming = getHermesStreamingEngine();
    await streaming.emitRunEvent({
      eventId: randomUUID(),
      runId: request.runId,
      workspaceId: request.workspaceId,
      domain: "chat",
      eventType: "handoff_requested",
      timestamp: new Date().toISOString(),
      sequence: 1,
      payload: {
        swarmId: request.swarmId,
        fromRole: request.fromRole,
        toRole: request.toRole,
        targetAgentId: targetAgent.id,
        taskPayload: request.taskPayload,
      },
      metadata: {
        action: "swarm_handoff",
      },
    });

    logger.info("[swarm-orchestrator] Agent handoff completed", {
      swarmId: request.swarmId,
      fromRole: request.fromRole,
      toRole: request.toRole,
    });

    return topology;
  }

  /**
   * Fetches current swarm topology by ID.
   */
  static getSwarm(swarmId: string): HermesSwarmTopology | null {
    return this.swarms.get(swarmId) ?? null;
  }

  /**
   * Resets internal swarm store for testing.
   */
  static clearStore(): void {
    this.swarms.clear();
  }
}
