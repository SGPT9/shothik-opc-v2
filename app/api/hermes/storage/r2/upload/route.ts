import { defineRoute, z } from "@/lib/api-validation";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { CloudflareR2Adapter } from "@/lib/cloudflare/r2-adapter";
import logger from "@/lib/logger";

const R2UploadCommandSchema = z.object({
  key: z.string().min(1, "Object key is required"),
  contentBase64: z.string().min(1, "Content base64 string is required"),
  contentType: z.string().default("application/octet-stream"),
  workspaceId: z.string().default("ws_r2_default"),
  bucketName: z.string().optional(),
});

/**
 * POST /api/hermes/storage/r2/upload - Upload object to Cloudflare R2 CDN storage
 */
export const POST = defineRoute({
  method: "post",
  path: "/api/hermes/storage/r2/upload",
  summary: "Upload object to Cloudflare R2 CDN storage with InsForge fallback",
  tags: ["Storage", "Cloudflare", "Hermes"],
  schemas: {
    body: R2UploadCommandSchema,
  },
  handler: async ({ body }) => {
    const user = await getChatAuthenticatedUser();
    if (!user?._id) {
      return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    try {
      const fileBuffer = Buffer.from(body.contentBase64, "base64");

      const result = await CloudflareR2Adapter.uploadObject({
        key: body.key,
        fileBuffer,
        contentType: body.contentType,
        workspaceId: body.workspaceId,
        bucketName: body.bucketName,
      });

      logger.info("[api] Cloudflare R2 asset uploaded successfully", {
        key: result.key,
        url: result.url,
        provider: result.provider,
      });

      return Response.json({ data: result }, { status: 201 });
    } catch (error) {
      logger.error("[api] Cloudflare R2 asset upload failed", {
        error: error instanceof Error ? error.message : String(error),
      });

      return Response.json(
        {
          error: "R2 object upload failed",
          code: "R2_UPLOAD_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  },
});
