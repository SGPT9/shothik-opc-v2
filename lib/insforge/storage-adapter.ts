/**
 * InsForge File Storage Bucket Adapter
 * 
 * Provides file uploads, deletions, and public access URL generation for
 * InsForge BaaS file storage buckets adhering to BaaS SDK guidelines.
 */

import { getInsforgeClient } from "@/lib/insforge/client";
import logger from "@/lib/logger";

export interface StorageUploadOptions {
  bucket: string;
  path: string;
  file: Blob | Buffer | ArrayBuffer | string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface StorageUploadResult {
  url: string;
  key: string;
  bucket: string;
}

export class InsForgeStorageAdapter {
  /**
   * Uploads a file to an InsForge storage bucket and returns both key and public URL.
   */
  static async uploadFile(options: StorageUploadOptions): Promise<StorageUploadResult> {
    logger.info("[insforge-storage] Uploading file to storage bucket", {
      bucket: options.bucket,
      path: options.path,
    });

    try {
      const insforge = getInsforgeClient();
      const { data, error } = await insforge.storage
        .from(options.bucket)
        .upload(options.path, options.file as any);

      if (error || !data) {
        throw new Error(error?.message || "Storage upload failed");
      }

      const key = data.key || options.path;
      const { data: urlData } = insforge.storage.from(options.bucket).getPublicUrl(key);

      const publicUrl = urlData?.publicUrl || `/storage/v1/object/public/${options.bucket}/${key}`;

      logger.info("[insforge-storage] File upload completed successfully", {
        bucket: options.bucket,
        key,
        url: publicUrl,
      });

      return {
        url: publicUrl,
        key,
        bucket: options.bucket,
      };
    } catch (error: any) {
      logger.error("[insforge-storage] Storage upload exception", {
        bucket: options.bucket,
        path: options.path,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Deletes a file from an InsForge storage bucket.
   */
  static async deleteFile(bucket: string, key: string): Promise<boolean> {
    logger.info("[insforge-storage] Deleting file from storage bucket", { bucket, key });

    try {
      const insforge = getInsforgeClient();
      const { error } = await insforge.storage.from(bucket).remove(key);

      if (error) {
        logger.error("[insforge-storage] Delete failed", { bucket, key, error: error.message });
        return false;
      }

      return true;
    } catch (error: any) {
      logger.error("[insforge-storage] Delete exception", { bucket, key, error: error.message });
      return false;
    }
  }

  /**
   * Generates public URL for an uploaded file.
   */
  static getPublicUrl(bucket: string, key: string): string {
    try {
      const insforge = getInsforgeClient();
      const { data } = insforge.storage.from(bucket).getPublicUrl(key);
      return data?.publicUrl || `/storage/v1/object/public/${bucket}/${key}`;
    } catch {
      return `/storage/v1/object/public/${bucket}/${key}`;
    }
  }
}
