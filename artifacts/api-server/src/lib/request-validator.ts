/**
 * Express Request Sanitizer & Security Guard Middleware
 * Sanitizes input payloads against XSS injection scripts, SQL injection syntax, and malicious HTML tags.
 */

import type { Request, Response, NextFunction } from "express";

export class RequestValidatorService {
  /**
   * Recursively sanitize strings/objects against XSS and SQL injection
   */
  public sanitizeInput(input: any): any {
    if (typeof input === "string") {
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "[REMOVED_SCRIPT]")
        .replace(/javascript:/gi, "[REMOVED_JS]")
        .replace(/'\s*OR\s*'1'\s*=\s*'1/gi, "[REMOVED_SQL_INJECTION]")
        .replace(/;\s*DROP\s+TABLE/gi, "[REMOVED_SQL_DROP]");
    }

    if (Array.isArray(input)) {
      return input.map((item) => this.sanitizeInput(item));
    }

    if (input !== null && typeof input === "object") {
      const sanitizedObj: Record<string, any> = {};
      for (const [key, value] of Object.entries(input)) {
        sanitizedObj[key] = this.sanitizeInput(value);
      }
      return sanitizedObj;
    }

    return input;
  }
}

export const requestValidatorService = new RequestValidatorService();

export function requestSanitizerMiddleware() {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.body) {
      req.body = requestValidatorService.sanitizeInput(req.body);
    }
    if (req.query) {
      req.query = requestValidatorService.sanitizeInput(req.query);
    }
    next();
  };
}
