import { Request, Response, NextFunction } from "express";
import { createHmac, createHash } from "node:crypto";
import { logger } from "../lib/logger";

const PROCESSED_WEBHOOK_HASHES = new Set<string>();

export interface WebhookSecurityOptions {
  headerName: string;
  secretEnvVar: string;
  defaultSecret?: string;
  providerName: "steadfast" | "pathao" | "bkash" | "nagad";
}

export function createWebhookSignatureGuard(options: WebhookSecurityOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const rawSecret = process.env[options.secretEnvVar] || options.defaultSecret || "shothik_default_dev_secret_2026";
    const signature = req.header(options.headerName);

    if (!signature) {
      logger.warn({ provider: options.providerName }, "[webhook-security] Missing signature header");
      res.status(401).json({ success: false, error: `Missing required signature header: ${options.headerName}` });
      return;
    }

    const payloadString = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    const expectedSignature = createHmac("sha256", rawSecret).update(payloadString).digest("hex");

    if (signature !== expectedSignature) {
      logger.error({ provider: options.providerName }, "[webhook-security] Signature mismatch");
      res.status(401).json({ success: false, error: "Invalid webhook HMAC signature" });
      return;
    }

    // Idempotency Deduplication Check
    const payloadHash = createHash("sha256").update(payloadString).digest("hex");
    if (PROCESSED_WEBHOOK_HASHES.has(payloadHash)) {
      logger.info({ provider: options.providerName, payloadHash }, "[webhook-security] Duplicate webhook event ignored");
      res.status(200).json({ success: true, message: "Duplicate webhook event already processed" });
      return;
    }

    PROCESSED_WEBHOOK_HASHES.add(payloadHash);
    // Limit memory set size
    if (PROCESSED_WEBHOOK_HASHES.size > 5000) {
      const firstKey = PROCESSED_WEBHOOK_HASHES.values().next().value;
      if (firstKey) PROCESSED_WEBHOOK_HASHES.delete(firstKey);
    }

    next();
  };
}

export const steadfastWebhookGuard = createWebhookSignatureGuard({
  headerName: "x-steadfast-signature",
  secretEnvVar: "STEADFAST_WEBHOOK_SECRET",
  defaultSecret: "dev_steadfast_token_mock",
  providerName: "steadfast",
});

export const pathaoWebhookGuard = createWebhookSignatureGuard({
  headerName: "x-pathao-signature",
  secretEnvVar: "PATHAO_WEBHOOK_SECRET",
  defaultSecret: "dev_pathao_token_mock",
  providerName: "pathao",
});

export const bkashWebhookGuard = createWebhookSignatureGuard({
  headerName: "x-bkash-signature",
  secretEnvVar: "BKASH_WEBHOOK_SECRET",
  defaultSecret: "dev_bkash_token_mock",
  providerName: "bkash",
});
