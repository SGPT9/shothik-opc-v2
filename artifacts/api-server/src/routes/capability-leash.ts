import { Router, type Request, type Response } from "express";
import { capabilityLeashEngine, type Caveat } from "../lib/security/capability-leash";
import { logger } from "../lib/logger";

export const capabilityLeashRouter = Router();

/**
 * POST /api/v1/security/leash/mint
 * Issues a new root capability token (Macaroon) with initial spend bounds, scopes, and validity.
 */
capabilityLeashRouter.post("/v1/security/leash/mint", (req: Request, res: Response) => {
  try {
    const { scopes, maxAmountBdt, districts, validUntilEpochMs, delegatee, location } = req.body;

    if (!scopes || !Array.isArray(scopes) || scopes.length === 0) {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_SCOPES", message: "scopes array is required" },
      });
      return;
    }

    if (typeof maxAmountBdt !== "number" || maxAmountBdt <= 0) {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_AMOUNT", message: "maxAmountBdt must be a positive number" },
      });
      return;
    }

    const minted = capabilityLeashEngine.mintRootLeash({
      scopes,
      maxAmountBdt,
      districts,
      validUntilEpochMs,
      delegatee,
      location,
    });

    res.json({
      success: true,
      data: minted,
    });
  } catch (err: any) {
    logger.error({ error: err.message }, "[CapabilityLeashRouter] Mint error");
    res.status(500).json({
      success: false,
      error: { code: "MINT_FAILED", message: err.message || "Failed to mint capability leash" },
    });
  }
});

/**
 * POST /api/v1/security/leash/attenuate
 * Attenuates an existing token by chaining further caveats (e.g. lowering spend limit, narrowing scope/district).
 */
capabilityLeashRouter.post("/v1/security/leash/attenuate", (req: Request, res: Response) => {
  try {
    const { token, addCaveats, newId } = req.body;

    if (!token || typeof token !== "string") {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_TOKEN", message: "token string is required" },
      });
      return;
    }

    if (!addCaveats || !Array.isArray(addCaveats)) {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_CAVEATS", message: "addCaveats must be an array of caveat objects" },
      });
      return;
    }

    const attenuated = capabilityLeashEngine.attenuateLeash({
      token,
      addCaveats: addCaveats as Caveat[],
      newId,
    });

    res.json({
      success: true,
      data: attenuated,
    });
  } catch (err: any) {
    logger.error({ error: err.message }, "[CapabilityLeashRouter] Attenuation error");
    res.status(400).json({
      success: false,
      error: { code: "ATTENUATION_FAILED", message: err.message || "Failed to attenuate token" },
    });
  }
});

/**
 * POST /api/v1/security/leash/verify
 * Validates HMAC signature chain and checks all caveats against the execution context.
 */
capabilityLeashRouter.post("/v1/security/leash/verify", (req: Request, res: Response) => {
  try {
    const { token, actionScope, amountBdt, district, delegatee } = req.body;

    if (!token || typeof token !== "string") {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_TOKEN", message: "token is required" },
      });
      return;
    }

    if (!actionScope || typeof actionScope !== "string") {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_ACTION_SCOPE", message: "actionScope is required" },
      });
      return;
    }

    const result = capabilityLeashEngine.verifyLeash(token, {
      actionScope,
      amountBdt,
      district,
      delegatee,
    });

    res.status(result.valid ? 200 : 403).json({
      success: result.valid,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: "VERIFICATION_ERROR", message: err.message || "Failed to verify capability leash" },
    });
  }
});

/**
 * POST /api/v1/security/leash/spend
 * Debits spend amount from the leash budget.
 */
capabilityLeashRouter.post("/v1/security/leash/spend", (req: Request, res: Response) => {
  try {
    const { token, amountBdt } = req.body;

    if (!token || typeof token !== "string") {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_TOKEN", message: "token is required" },
      });
      return;
    }

    if (typeof amountBdt !== "number" || amountBdt <= 0) {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_AMOUNT", message: "amountBdt must be a positive number" },
      });
      return;
    }

    const result = capabilityLeashEngine.recordSpend(token, amountBdt);
    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { code: "SPEND_RECORD_FAILED", message: err.message || "Failed to record spend" },
    });
  }
});

/**
 * GET /api/v1/security/leash/active
 * Lists all active leashes and remaining balances.
 */
capabilityLeashRouter.get("/v1/security/leash/active", (_req: Request, res: Response) => {
  const leashes = capabilityLeashEngine.getActiveLeashes();
  res.json({
    success: true,
    count: leashes.length,
    data: leashes,
  });
});
