import { InsForgeTwinRagMemory, type TwinMemoryChunk } from "@/lib/insforge/rag-memory";
import logger from "@/lib/logger";

export interface TonightMemoryPayload {
  runId: string;
  workspaceId: string;
  topic: string;
  reportContent: string;
  leadsCount?: number;
  postsCount?: number;
  metadata?: Record<string, any>;
}

export class TonightMemoryService {
  /**
   * Save synthesized overnight run knowledge into InsForge RAG vector memory.
   */
  static async indexRunMemory(payload: TonightMemoryPayload): Promise<{ success: boolean; memoryId?: string }> {
    const chunk: TwinMemoryChunk = {
      twinId: payload.workspaceId,
      documentId: `tonight-${payload.runId}`,
      contentType: "research_paper",
      title: `Overnight Run: ${payload.topic}`,
      content: payload.reportContent,
      metadata: {
        runId: payload.runId,
        leadsCount: payload.leadsCount || 0,
        postsCount: payload.postsCount || 0,
        ...(payload.metadata || {}),
      },
    };

    try {
      const res = await InsForgeTwinRagMemory.saveMemoryChunk(chunk);
      logger.info("[tonight-memory] Overnight run indexed into RAG memory", {
        runId: payload.runId,
        workspaceId: payload.workspaceId,
        memoryId: res.id,
      });
      return { success: true, memoryId: res.id };
    } catch (err: any) {
      logger.warn("[tonight-memory] Failed to index overnight run memory", {
        runId: payload.runId,
        error: err.message,
      });
      return { success: false };
    }
  }

  /**
   * Retrieve historical overnight run memories matching a query.
   */
  static async searchRunMemory(workspaceId: string, query: string, limit = 5) {
    try {
      const results = await InsForgeTwinRagMemory.searchMemory(workspaceId, query, limit);
      return results.map((r) => ({
        runId: r.chunk.metadata?.runId || r.chunk.documentId,
        title: r.chunk.title,
        snippet: r.chunk.content.slice(0, 300),
        score: r.similarityScore,
        createdAt: r.chunk.createdAt,
      }));
    } catch (err: any) {
      logger.warn("[tonight-memory] Search memory query error", { workspaceId, query, error: err.message });
      return [];
    }
  }
}
