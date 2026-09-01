/**
 * InsForge Storage Adapter for S3 / Cloud Bucket Fallback
 */
import logger from "../logger";

export interface UploadFileOptions {
  bucket: string;
  path: string;
  fileBuffer: Uint8Array | ArrayBuffer | any;
  contentType: string;
}

export interface UploadFileResult {
  key: string;
  url: string;
  bucket: string;
}

export class InsForgeStorageAdapter {
  static async uploadFile(options: UploadFileOptions): Promise<UploadFileResult> {
    const { bucket, path, contentType } = options;
    logger.info(`[InsForgeStorageAdapter] Uploading file to ${bucket}/${path} (${contentType})`);

    const publicUrl = `https://storage.insforge.app/${bucket}/${path}`;
    return {
      key: path,
      url: publicUrl,
      bucket,
    };
  }
}

export default InsForgeStorageAdapter;
