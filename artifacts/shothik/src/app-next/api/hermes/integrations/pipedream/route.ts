import { defineRoute, z } from "@/lib/api-validation";
import { PipedreamConnectService } from "@/lib/infrastructure/pipedream-connect";
import logger from "@/lib/logger";

const PipedreamIntegrationBodySchema = z.object({
  mode: z.enum(["run_action", "get_config"]).default("run_action"),
  externalUserId: z.string().default("usr_guest"),
  app: z.string().default("facebook"),
  oauthAppId: z.string().optional(),
  actionId: z.string().default("facebook-post-message"),
  params: z.record(z.string(), z.unknown()).optional(),
});

/**
 * POST /api/hermes/integrations/pipedream - Pipedream Connect action execution & OAuth config generator
 */
export const POST = defineRoute({
  method: "post",
  path: "/api/hermes/integrations/pipedream",
  summary: "Pipedream Connect action execution & OAuth config generator",
  tags: ["Integrations", "Hermes"],
  schemas: {
    body: PipedreamIntegrationBodySchema,
  },
  handler: async ({ body }) => {
    try {
      if (body.mode === "get_config") {
        const config = PipedreamConnectService.getConnectConfig({
          externalUserId: body.externalUserId,
          app: body.app,
          oauthAppId: body.oauthAppId,
        });
        return Response.json({ data: config });
      }

      const actionResult = await PipedreamConnectService.runAction({
        actionId: body.actionId,
        externalUserId: body.externalUserId,
        params: body.params,
      });

      return Response.json({ data: actionResult });
    } catch (error) {
      logger.error("[api] Pipedream Connect integration error", {
        error: error instanceof Error ? error.message : String(error),
      });

      return Response.json(
        {
          error: "Pipedream action failed",
          code: "PIPEDREAM_ACTION_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  },
});
