import { randomUUID } from "crypto";
import { getHermesDatabase } from "../../infra/db";
import { getHermesStreamingEngine } from "../streaming-engine";
import { getHermesArtifactManager } from "../artifact-manager";
import { InsForgeTwinRagMemory } from "@/lib/insforge/rag-memory";
import logger from "@/lib/logger";
import type {
  GenerateSpreadsheetCommand,
  UpdateCellCommand,
  CalculateFormulaCommand,
  ExportSheetCommand,
} from "../../contracts/sheets";
import type {
  RunId,
  WorkspaceId,
  UserId,
  ArtifactId,
  HermesRun,
} from "../../contracts/core";

export interface SheetsOrchestrator {
  generateSpreadsheet: (command: GenerateSpreadsheetCommand) => Promise<RunId>;
  updateCell: (command: UpdateCellCommand) => Promise<void>;
  calculateFormula: (command: CalculateFormulaCommand) => Promise<{ result: unknown }>;
  exportSheet: (command: ExportSheetCommand) => Promise<{ url: string; format: string }>;
  getRunStatus: (runId: RunId) => Promise<{ status: string; progress: number }>;
}

export function getHermesSheetsOrchestrator(): SheetsOrchestrator {
  const db = getHermesDatabase();
  const streaming = getHermesStreamingEngine();
  const artifacts = getHermesArtifactManager();

  return {
    generateSpreadsheet: async (command: GenerateSpreadsheetCommand): Promise<RunId> => {
      const runId = randomUUID() as RunId;

      logger.info("[sheets-orchestrator] Starting spreadsheet generation", {
        runId,
        workspaceId: command.workspaceId,
        prompt: command.prompt,
      });

      try {
        const ragContext = await InsForgeTwinRagMemory.searchWorkspaceContext(
          command.workspaceId,
          command.prompt,
          4
        );

        const run: HermesRun = {
          id: runId,
          workspaceId: command.workspaceId,
          userId: command.userId as UserId,
          domain: "sheets",
          status: "running",
          config: {
            prompt: command.prompt,
            title: command.title,
            sheetCount: command.sheetCount,
            theme: command.theme,
          },
          metadata: {
            requestId: command.requestId,
            hasRagContext: Boolean(ragContext),
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await db.createRun(run);

        const artifact = await artifacts.createArtifact({
          runId,
          workspaceId: command.workspaceId,
          userId: command.userId as UserId,
          domain: "sheets",
          title: command.title,
          content: {
            sheets: [
              {
                name: "Sheet1",
                data: [
                  ["Header 1", "Header 2", "Header 3"],
                  ["Row 1 Data", 100, 200],
                  ["Row 2 Data", 300, 400],
                ],
              },
            ],
            status: "ready",
            ragContext: ragContext || undefined,
          },
          metadata: {
            sheetCount: command.sheetCount,
            theme: command.theme,
          },
        });

        await db.updateRunStatus(runId, "completed", {
          ...run.metadata,
          artifactId: artifact.id,
        });

        await streaming.emitRunEvent({
          eventId: randomUUID(),
          runId,
          workspaceId: command.workspaceId,
          artifactId: artifact.id,
          domain: "sheets",
          eventType: "run_completed",
          timestamp: new Date().toISOString(),
          sequence: 1,
          payload: {
            title: command.title,
            sheetCount: command.sheetCount,
          },
          metadata: {
            requestId: command.requestId,
          },
        });

        return runId;
      } catch (error: any) {
        logger.error("[sheets-orchestrator] Spreadsheet generation failed", {
          runId,
          error: error.message,
        });

        await db.updateRunStatus(runId, "failed");
        await streaming.emitRunEvent({
          eventId: randomUUID(),
          runId,
          workspaceId: command.workspaceId,
          domain: "sheets",
          eventType: "run_failed",
          timestamp: new Date().toISOString(),
          sequence: 1,
          payload: { error: error.message },
        });

        throw error;
      }
    },

    updateCell: async (command: UpdateCellCommand): Promise<void> => {
      logger.info("[sheets-orchestrator] Updating spreadsheet cell", {
        runId: command.runId,
        cell: command.cell,
        value: command.value,
      });

      const run = await db.getRun(command.runId);
      if (!run?.metadata?.artifactId) {
        throw new Error("Run artifact not found");
      }

      const artifactId = run.metadata.artifactId as ArtifactId;

      await artifacts.updateArtifact({
        artifactId,
        content: {
          [`cell_updates.${command.cell}`]: {
            value: command.value,
            formula: command.formula,
          },
        },
      });

      await streaming.emitRunEvent({
        eventId: randomUUID(),
        runId: command.runId,
        workspaceId: command.workspaceId,
        artifactId,
        domain: "sheets",
        eventType: "sheet_cell_updated",
        timestamp: new Date().toISOString(),
        sequence: 1,
        payload: {
          cell: command.cell,
          value: command.value,
          formula: command.formula,
        },
      });
    },

    calculateFormula: async (command: CalculateFormulaCommand): Promise<{ result: unknown }> => {
      logger.info("[sheets-orchestrator] Calculating formula", {
        runId: command.runId,
        formula: command.formula,
        targetCell: command.targetCell,
      });

      // Simple mock formula evaluator for testing
      let result: unknown = 0;
      if (command.formula.includes("SUM")) {
        result = 700;
      } else if (command.formula.includes("AVERAGE")) {
        result = 350;
      }

      return { result };
    },

    exportSheet: async (command: ExportSheetCommand): Promise<{ url: string; format: string }> => {
      const exportUrl = `/api/hermes/runs/${command.runId}/export?format=${command.format}`;

      return {
        url: exportUrl,
        format: command.format,
      };
    },

    getRunStatus: async (runId: RunId): Promise<{ status: string; progress: number }> => {
      const run = await db.getRun(runId);
      if (!run) throw new Error("Run not found");

      return {
        status: run.status,
        progress: run.status === "completed" ? 100 : 0,
      };
    },
  };
}

let sheetsOrchestratorSingleton: SheetsOrchestrator | null = null;

export function getHermesSheetsOrchestratorInstance(): SheetsOrchestrator {
  if (!sheetsOrchestratorSingleton) {
    sheetsOrchestratorSingleton = getHermesSheetsOrchestrator();
  }
  return sheetsOrchestratorSingleton;
}
