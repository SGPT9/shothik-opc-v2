import crypto from "crypto";
import { logger } from "../logger.js";

export interface CreateUploadSessionParams {
  bucket: "manuscripts" | "audio-assets" | "temp-sandboxes" | string;
  filename: string;
  userId: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface ResumableUploadSession {
  uploadUrl: string;
  tusEndpoint: string;
  bucket: string;
  path: string;
  token: string;
  expiresAt: string;
  headers: Record<string, string>;
}

export class SupabaseStorageService {
  private readonly supabaseUrl: string;
  private readonly serviceKey: string;

  constructor() {
    this.supabaseUrl = (
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_INSFORGE_URL ||
      "https://xgnzsikvguswhtozvokx.supabase.co"
    ).replace(/\/$/, "");

    this.serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "sb_publishable_pa1rLrMH8sLguAUhbTHfmw_wAcIY9hY";
  }

  /**
   * Generates a signed Resumable (TUS) upload session ticket with user isolation
   * and TTL rules for ephemeral temp assets.
   */
  async createUploadSession(params: CreateUploadSessionParams): Promise<ResumableUploadSession> {
    const { bucket, filename, userId, contentType = "application/octet-stream", metadata = {} } = params;

    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const isTemp = bucket === "temp-sandboxes";

    // 24-hour TTL for temp sandboxes or 24-hour upload session lifetime
    const ttlMs = 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + ttlMs).toISOString();

    const path = isTemp
      ? `temp/${userId}/${Date.now()}-${sanitizedFilename}`
      : `${userId}/${sanitizedFilename}`;

    const tusEndpoint = `${this.supabaseUrl}/storage/v1/upload/resumable`;

    // Encode TUS standard Upload-Metadata header
    const metadataEntries: Record<string, string> = {
      bucketName: bucket,
      objectName: path,
      contentType,
      userId,
      expiresAt,
      ...metadata,
    };

    const encodedMetadata = Object.entries(metadataEntries)
      .map(([k, v]) => `${k} ${Buffer.from(String(v)).toString("base64")}`)
      .join(",");

    const sessionToken = crypto
      .createHmac("sha256", this.serviceKey)
      .update(`${bucket}:${path}:${expiresAt}`)
      .digest("hex");

    logger.info(
      { bucket, path, userId, isTemp },
      "[supabase-storage] Generated TUS resumable upload session ticket"
    );

    return {
      uploadUrl: tusEndpoint,
      tusEndpoint,
      bucket,
      path,
      token: sessionToken,
      expiresAt,
      headers: {
        "Tus-Resumable": "1.0.0",
        "Upload-Metadata": encodedMetadata,
        Authorization: `Bearer ${this.serviceKey}`,
      },
    };
  }

  /**
   * Constructs signed or public download URL for a storage object
   */
  getPublicUrl(bucket: string, path: string): string {
    return `${this.supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
  }
}

export const supabaseStorageService = new SupabaseStorageService();
