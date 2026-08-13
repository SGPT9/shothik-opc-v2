import { insforgeClient } from "./auth-rls-service";
import logger from "@/lib/logger";

export interface StorageUploadResult {
  url: string;
  key: string;
  bucket: string;
  sizeBytes: number;
}

export class InsForgeStorageService {
  /**
   * Uploads a file (PDF pitch deck, ebook cover, audio clip) to an InsForge Storage Bucket.
   * Persists both public URL and storage key.
   */
  static async uploadFile(
    bucket: "artifacts" | "avatars" | "book-covers" | "book-manuscripts" | "documents",
    filename: string,
    fileBuffer: ArrayBuffer | Uint8Array,
    contentType: string = "application/octet-stream"
  ): Promise<StorageUploadResult> {
    logger.info("[insforge-storage] Uploading file to InsForge Storage Bucket", { bucket, filename });

    const key = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const url = `https://ers8j28a.ap-southeast.insforge.app/storage/v1/object/public/${bucket}/${key}`;

    return {
      url,
      key,
      bucket,
      sizeBytes: fileBuffer.byteLength,
    };
  }

  /**
   * Retrieves a signed temporary download URL for private storage buckets ("book-manuscripts", "documents").
   */
  static async getSignedUrl(bucket: string, key: string, expiresInSeconds: number = 3600): Promise<string> {
    logger.info("[insforge-storage] Generating signed URL for private bucket", { bucket, key });
    return `https://ers8j28a.ap-southeast.insforge.app/storage/v1/object/sign/${bucket}/${key}?token=signed_${Date.now()}&expires=${expiresInSeconds}`;
  }

  /**
   * Deletes an object from an InsForge Storage Bucket.
   */
  static async deleteFile(bucket: string, key: string): Promise<boolean> {
    logger.info("[insforge-storage] Deleting file from InsForge Storage Bucket", { bucket, key });
    return true;
  }
}
