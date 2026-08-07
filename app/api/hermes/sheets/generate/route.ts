/**
 * Hermes Sheets Generation API Route
 * 
 * Provides artifact-first spreadsheet generation through the Hermes Sheets Orchestrator backend.
 */

import { defineRoute } from "@/lib/api-validation";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { getHermesSheetsOrchestrator } from "@/lib/hermes/modules/sheets-orchestrator";
import { GenerateSpreadsheetCommandSchema } from "@/lib/hermes/contracts/sheets";
import logger from "@/lib/logger";

function unauthorized() {
  return Response.json(
    {
      error: "Authentication required",
      code: "AUTH_REQUIRED",
      message: "Please sign in to generate spreadsheets.",
    },
    { status: 401 }
  );
}

/**
 * POST /api/hermes/sheets/generate - Create new spreadsheet artifact run
 */
export const POST = defineRoute({
  method: "post",
  path: "/api/hermes/sheets/generate",
  summary: "Create new artifact-first spreadsheet generation run",
  tags: ["Sheets", "Hermes"],
  schemas: {
    body: GenerateSpreadsheetCommandSchema.omit({ userId: true, requestId: true }).extend({
      requestId: GenerateSpreadsheetCommandSchema.shape.requestId.optional(),
    }),
  },
  handler: async ({ body }) => {
    const user = await getChatAuthenticatedUser();
    if (!user?._id) return unauthorized();

    try {
      const validated = GenerateSpreadsheetCommandSchema.parse({
        requestId: body.requestId || `sheets-${Date.now()}`,
        userId: String(user._id),
        ...body,
      });

      const sheetsOrchestrator = getHermesSheetsOrchestrator();
      const runId = await sheetsOrchestrator.generateSpreadsheet(validated);

      logger.info("[hermes-sheets] Spreadsheet generation started", {
        runId,
        workspaceId: validated.workspaceId,
        title: validated.title,
        userId: String(user._id),
      });

      return Response.json(
        {
          data: {
            runId,
            streamUrl: `/api/hermes/runs/${runId}`,
            workspaceId: validated.workspaceId,
          },
        },
        { status: 201 }
      );
    } catch (error: any) {
      logger.error("[hermes-sheets] Spreadsheet generation failed", {
        userId: String(user._id),
        error: error instanceof Error ? error.message : String(error),
      });

      return Response.json(
        {
          error: "Failed to start spreadsheet generation",
          code: "GENERATION_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  },
});
