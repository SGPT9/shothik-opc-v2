import { randomUUID } from "crypto";
import { getHermesDatabase } from "../../infra/db";
import { getHermesStreamingEngine } from "../streaming-engine";
import { getHermesArtifactManager } from "../artifact-manager";
import { InsForgeTwinRagMemory } from "@/lib/insforge/rag-memory";
import { VpsFallbackEngine } from "@/lib/infrastructure/vps-fallback-engine";
import logger from "@/lib/logger";
import type { RunId, WorkspaceId, UserId, HermesArtifact } from "../../contracts/core";

export interface GenerateResearchCommand {
  workspaceId: WorkspaceId;
  userId: UserId;
  query: string;
  depth?: "quick" | "standard" | "deep";
  metadata?: Record<string, unknown>;
}

export interface ResearchOrchestrator {
  generateResearch: (command: GenerateResearchCommand) => Promise<{ runId: RunId; artifactId: string }>;
}

export function getHermesResearchOrchestrator(): ResearchOrchestrator {
  const db = getHermesDatabase();
  const streaming = getHermesStreamingEngine();
  const artifacts = getHermesArtifactManager();

  return {
    generateResearch: async (command: GenerateResearchCommand): Promise<{ runId: RunId; artifactId: string }> => {
      const runId = `run_${randomUUID()}` as RunId;
      const depth = command.depth || "standard";

      logger.info("[hermes-research] Starting deep web research run", {
        runId,
        workspaceId: command.workspaceId,
        userId: command.userId,
        query: command.query,
      });

      // 1. Register Run in Hermes Database
      await db.createRun({
        id: runId,
        workspaceId: command.workspaceId,
        userId: command.userId,
        domain: "research",
        status: "active",
        metadata: { query: command.query, depth, ...command.metadata },
      });

      // Emit initial run event
      await streaming.emitRunEvent({
        eventId: randomUUID(),
        runId,
        workspaceId: command.workspaceId,
        domain: "research",
        eventType: "run_created",
        sequence: 1,
        timestamp: new Date().toISOString(),
        payload: { intent: command.query, depth },
      });

      // 2. Query Historical Workspace RAG Context
      await streaming.emitRunEvent({
        eventId: randomUUID(),
        runId,
        workspaceId: command.workspaceId,
        domain: "research",
        eventType: "progress_update",
        sequence: 2,
        timestamp: new Date().toISOString(),
        payload: { progressPercent: 25, statusMessage: "Searching historical workspace vector memory" },
      });

      const ragContext = await InsForgeTwinRagMemory.searchWorkspaceContext(command.workspaceId, command.query, 4);

      // 3. Perform Deep Web Research & Synthesis using VpsFallbackEngine
      await streaming.emitRunEvent({
        eventId: randomUUID(),
        runId,
        workspaceId: command.workspaceId,
        domain: "research",
        eventType: "progress_update",
        sequence: 3,
        timestamp: new Date().toISOString(),
        payload: { progressPercent: 60, statusMessage: "Executing deep web research & source aggregation" },
      });

      const researchPrompt = `
Synthesize an executive deep research report for the following query.

User Query: ${command.query}
Research Depth: ${depth}

Historical Workspace Vector Context:
${ragContext}

Instructions:
1. Provide a comprehensive, executive-grade Markdown research report.
2. Structure into sections: Executive Summary, Key Findings, Market / Technical Analysis, Strategic Recommendations, and Sources.
3. Keep tone objective, authoritative, and data-backed.
`;

      const llmResult = await VpsFallbackEngine.executeWithZeroFailure({
        prompt: researchPrompt,
        systemPrompt: "You are the Lead Deep Research Analyst for Shothik Engine.",
      });

      const reportMarkdown = llmResult.content;

      // 4. Index Research Report into InsForge RAG Memory
      await InsForgeTwinRagMemory.saveMemoryChunk({
        twinId: command.workspaceId,
        documentId: `doc_${randomUUID()}`,
        chunkId: `rag_res_${randomUUID()}`,
        title: `Research Report: ${command.query.slice(0, 40)}`,
        snippet: reportMarkdown.slice(0, 300),
        content: reportMarkdown,
        contentType: "research_report",
        tags: ["research", "deep-web", depth],
        metadata: { runId, query: command.query },
      });

      // 5. Register Hermes Artifact
      const artifact = await artifacts.createArtifact({
        workspaceId: command.workspaceId,
        runId,
        userId: command.userId,
        domain: "research",
        title: `Deep Research: ${command.query.slice(0, 40)}`,
        description: `Synthesized research report (${depth} depth)`,
        content: { markdown: reportMarkdown, modelUsed: llmResult.modelUsed, tierUsed: llmResult.tierUsed },
        metadata: { query: command.query, depth, ragContextUsed: !!ragContext },
      });

      // 6. Complete Run
      await db.updateRun(runId, { status: "completed" });

      await streaming.emitRunEvent({
        eventId: randomUUID(),
        runId,
        workspaceId: command.workspaceId,
        domain: "research",
        eventType: "run_completed",
        sequence: 4,
        timestamp: new Date().toISOString(),
        payload: { artifactId: artifact.id, progressPercent: 100 },
      });

      logger.info("[hermes-research] Deep research run completed successfully", {
        runId,
        artifactId: artifact.id,
      });

      return { runId, artifactId: artifact.id };
    },
  };
}
