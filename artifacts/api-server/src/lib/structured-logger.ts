/**
 * Structured JSON Logger & Distributed Tracing Engine
 * Propagates x-trace-id context across Express routes, DB queries, and MCP tool invocations.
 */

import type { Request, Response, NextFunction } from "express";

export interface LogEntry {
  level: "info" | "warn" | "error" | "debug";
  message: string;
  traceId: string;
  userId?: string;
  path?: string;
  meta?: Record<string, any>;
  timestamp: string;
}

import { redactPiiText, redactPiiObject } from "./security/pii-redactor";

export class StructuredLogger {
  /**
   * Output structured JSON log line with Zero-PII gasket protection
   */
  public log(level: LogEntry["level"], message: string, traceId: string = "trc_root", meta?: Record<string, any>): LogEntry {
    const entry: LogEntry = {
      level,
      message: redactPiiText(message),
      traceId,
      meta: meta ? redactPiiObject(meta) : undefined,
      timestamp: new Date().toISOString(),
    };
    return entry;
  }
}

export const structuredLogger = new StructuredLogger();

export function traceContextMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const traceId = (req.headers["x-trace-id"] as string) || `trc_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    (req as any).traceId = traceId;
    res.setHeader("X-Trace-Id", traceId);
    next();
  };
}
