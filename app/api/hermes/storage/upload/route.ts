/**
 * Hermes File Storage Upload API Route
 * 
 * Provides file uploading capabilities to InsForge BaaS storage buckets
 * for slide assets, exported spreadsheets, research documents, and avatar files.
 */

import { defineRoute, z } from "@/lib/api-validation";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { InsForgeStorageAdapter } from "@/lib/insforge/storage-adapter";
import logger from "@/lib/logger";

const StorageUploadBodySchema = z.object({
  bucket: z.string().default("artifacts"),
  filename: z.string().min(1, "filename is required"),
  fileData: z.string().min(1, "fileData is required"),
  contentType: z.string().optional(),
});

function unauthorized() {
  return Response.json(
    {
      error: "Authentication required",
      code: "AUTH_REQUIRED",
      message: "Please sign in to upload files to storage buckets.",
    },
    { status: 401 }
  );
}

/**
 * POST /api/hermes/storage/upload - Upload file to InsForge storage bucket
 */
export const POST = defineRoute({
  method: "post",
  path: "/api/hermes/storage/upload",
  summary: "Upload file to InsForge BaaS storage bucket",
  tags: ["Storage", "Hermes"],
  schemas: {
    body: StorageUploadBodySchema,
  },
  handler: async ({ body }) => {
    const user = await getChatAuthenticatedUser();
    if (!user?._id) return unauthorized();

    try {
      const sanitizedFilename = body.filename.replace(/[^a-zA-Z0-9_.-]/g, "_");
      const path = `user_${user._id}/${Date.now()}_${sanitizedFilename}`;

      const result = await InsForgeStorageAdapter.uploadFile({
        bucket: body.bucket,
        path,
        file: body.fileData,
        contentType: body.contentType || "application/octet-stream",
      });

      logger.info("[api] Storage upload completed", {
        userId: String(user._id),
        bucket: body.bucket,
        key: result.key,
        url: result.url,
      });

      return Response.json(
        {
          data: {
            url: result.url,
            key: result.key,
            bucket: result.bucket,
          },
        },
        { status: 201 }
      );
    } catch (error: any) {
      logger.error("[api] Storage upload failed", {
        userId: String(user._id),
        error: error.message,
      });

      return Response.json(
        {
          error: "Storage upload failed",
          code: "STORAGE_UPLOAD_ERROR",
          message: error.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  },
});
