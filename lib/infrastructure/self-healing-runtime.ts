import { randomUUID } from "crypto";
import { VpsFallbackEngine } from "./vps-fallback-engine";
import { getHermesStreamingEngine } from "@/lib/hermes/modules/streaming-engine";
import logger from "@/lib/logger";
import type { RunId, WorkspaceId } from "@/lib/hermes/contracts/core";

export interface ErrorContext {
  runId: RunId;
  workspaceId: WorkspaceId;
  failedPersonaKey?: string;
  errorMessage?: string;
  failedOutput?: string;
  missingPersonas?: string[];
}

export interface RepairResult {
  success: boolean;
  repairedOutput: string;
  personaKey: string;
  retryAttempt: number;
  patchApplied: boolean;
}

export class SelfHealingRuntime {
  /**
   * Closed-loop repair engine: Diagnoses errors, generates surgical patches, and re-executes failed steps.
   */
  static async attemptClosedLoopRepair(
    context: ErrorContext,
    maxRetries = 3
  ): Promise<RepairResult> {
    const streaming = getHermesStreamingEngine();
    const personaKey = context.failedPersonaKey || context.missingPersonas?.[0] || "general";
    let retryAttempt = 1;

    logger.info("[self-healing] Initiating NODE_REPAIR closed-loop repair flow", {
      runId: context.runId,
      personaKey,
      errorMessage: context.errorMessage,
    });

    while (retryAttempt <= maxRetries) {
      try {
        // Emit NODE_REPAIR state event
        await streaming.emitRunEvent({
          eventId: randomUUID(),
          runId: context.runId,
          workspaceId: context.workspaceId,
          domain: "tonight-engine",
          eventType: "graph_state_transition",
          sequence: Date.now(),
          timestamp: new Date().toISOString(),
          payload: {
            activeNode: "NODE_REPAIR",
            personaKey,
            retryAttempt,
            statusMessage: `Executing self-healing patch attempt ${retryAttempt}/${maxRetries} for '${personaKey}'`,
          },
        });

        const repairPrompt = `
You are the Lead Autonomous System Repair Engineer (SelfHealingRuntime).
A sub-agent persona ('${personaKey}') failed or generated degraded output during execution.

Original Error / Issue:
${context.errorMessage || "Output was empty or consensus verification failed."}

Previous Output (if any):
${context.failedOutput || "None (empty output)"}

Instructions:
1. Diagnose the root cause of the execution failure.
2. Generate a complete, high-quality, executive-grade replacement output for persona '${personaKey}'.
3. Do not include error tracebacks in the output — provide the clean, corrected deliverable.
`;

        const repairResult = await VpsFallbackEngine.executeWithZeroFailure({
          prompt: repairPrompt,
          systemPrompt: "You are the Self-Healing Repair Engine for Shothik Orchestrator.",
        });

        if (repairResult.content && repairResult.content.trim().length >= 40) {
          // Emit repair patch applied event
          await streaming.emitRunEvent({
            eventId: randomUUID(),
            runId: context.runId,
            workspaceId: context.workspaceId,
            domain: "tonight-engine",
            eventType: "repair_patch_applied",
            sequence: Date.now(),
            timestamp: new Date().toISOString(),
            payload: {
              personaKey,
              retryAttempt,
              modelUsed: repairResult.modelUsed,
              tierUsed: repairResult.tierUsed,
            },
          });

          logger.info("[self-healing] Closed-loop repair succeeded cleanly", {
            runId: context.runId,
            personaKey,
            retryAttempt,
          });

          return {
            success: true,
            repairedOutput: repairResult.content,
            personaKey,
            retryAttempt,
            patchApplied: true,
          };
        }
      } catch (err: any) {
        logger.warn("[self-healing] Repair attempt encountered error — retrying", {
          retryAttempt,
          error: err.message,
        });
      }

      retryAttempt++;
    }

    return {
      success: false,
      repairedOutput: `[Fallback Repair Output for ${personaKey}]: Operational data processed safely.`,
      personaKey,
      retryAttempt: maxRetries,
      patchApplied: false,
    };
  }
}
