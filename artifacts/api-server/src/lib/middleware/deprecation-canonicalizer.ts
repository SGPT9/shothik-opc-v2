import type { Request, Response, NextFunction } from "express";
import { logger } from "../logger";

export interface RouteMigrationRule {
  legacyPrefixes: string[];
  canonicalPath: string;
  sunsetDate?: string;
}

/**
 * Enterprise Route Canonicalizer & Deprecation Header Generator (RFC 8594 / Stripe Standards)
 * Maps legacy shim endpoints to their canonical /v1/ RESTful equivalents without breaking older clients.
 */
export function createApiCanonicalizer(migrations: RouteMigrationRule[]) {
  const lookupMap = new Map<string, { canonical: string; sunset: string }>();

  for (const m of migrations) {
    const sunset = m.sunsetDate || "Sun, 01 Nov 2026 00:00:00 GMT";
    for (const legacy of m.legacyPrefixes) {
      lookupMap.set(legacy.toLowerCase(), { canonical: m.canonicalPath, sunset });
    }
  }

  return function apiCanonicalizerMiddleware(req: Request, res: Response, next: NextFunction): void {
    const originalPath = (req.baseUrl + req.path).toLowerCase();
    const hit = lookupMap.get(originalPath) || lookupMap.get(req.path.toLowerCase());

    if (hit) {
      // RFC 8594 & RFC 8288 Deprecation Headers
      res.setHeader("Deprecation", "true");
      res.setHeader("Sunset", hit.sunset);
      res.setHeader("Link", `<${hit.canonical}>; rel="successor-version"`);

      logger.debug(
        { legacyPath: originalPath, canonicalPath: hit.canonical },
        "[api-gateway] Legacy route accessed, set RFC 8594 deprecation headers"
      );
    }

    next();
  };
}
