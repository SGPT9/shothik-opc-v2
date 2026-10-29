import { Request, Response, NextFunction } from "express";
import { verifyAuthRequest } from "../routes/auth.js";

export interface AuthenticatedUser {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Express middleware that mandates a valid, signed JWT Bearer or Cookie token.
 * Rejects unauthenticated requests with HTTP 401 Unauthorized.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const verified = verifyAuthRequest(req);
  if (!verified) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "Valid authentication token required. Please sign in.",
    });
    return;
  }
  (req as AuthenticatedRequest).user = verified;
  next();
}

/**
 * Optional authentication middleware: populates req.user if a valid token is present,
 * but does not block unauthenticated requests.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const verified = verifyAuthRequest(req);
  if (verified) {
    (req as AuthenticatedRequest).user = verified;
  }
  next();
}

/**
 * Safely resolves the active user ID for the current request.
 * In production: strictly uses the verified token's userId; never trusts unauthenticated headers/params.
 * In development / test: falls back to x-user-id or query.userId for testing convenience.
 */
export function resolveUserId(req: Request, fallbackDefault = "guest"): string {
  const verified = (req as AuthenticatedRequest).user || verifyAuthRequest(req);
  if (verified?.userId) {
    return verified.userId;
  }

  // Only allow header/query spoofing in non-production environments
  if (process.env.NODE_ENV !== "production") {
    const raw = (req.headers["x-user-id"] as string) || (req.query?.userId as string) || (req.body?.userId as string);
    if (raw && typeof raw === "string" && raw.trim()) {
      return raw.trim();
    }
  }

  return fallbackDefault;
}
