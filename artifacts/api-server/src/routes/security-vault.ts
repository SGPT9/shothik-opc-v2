import { Router, type Request, type Response } from "express";
import { keyVaultSentinel } from "../security/key-vault-sentinel";

const router = Router();

/**
 * POST /api/v1/security/vault/encrypt
 * Encrypt sensitive secret using AES-256-GCM
 */
router.post("/v1/security/vault/encrypt", (req: Request, res: Response) => {
  const { secretValue } = req.body;

  if (!secretValue) {
    return res.status(400).json({ success: false, error: "secretValue is required" });
  }

  const encryptedPayload = keyVaultSentinel.encryptSecret(secretValue);

  return res.status(200).json({
    success: true,
    encryptedPayload,
  });
});

/**
 * POST /api/v1/security/vault/decrypt
 * Decrypt AES-256-GCM encrypted payload
 */
router.post("/v1/security/vault/decrypt", (req: Request, res: Response) => {
  const { encryptedPayload } = req.body;

  if (!encryptedPayload || !encryptedPayload.ivHex || !encryptedPayload.encryptedContentHex) {
    return res.status(400).json({ success: false, error: "Valid encryptedPayload is required" });
  }

  try {
    const decryptedValue = keyVaultSentinel.decryptSecret(encryptedPayload);
    return res.status(200).json({
      success: true,
      decryptedValue,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: "Decryption failed or payload tampered" });
  }
});

export default router;
