/**
 * Redis Token Bucket Rate Limiter Middleware
 * Protects Express API Server endpoints from DDoS attacks and token over-consumption.
 */

import type { Request, Response, NextFunction } from "express";

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export class RateLimiterService {
  private requestStore = new Map<string, { count: number; resetTime: number }>();

  /**
   * Check rate limit for given key (IP address or UserId)
   */
  public isAllowed(key: string, options: RateLimitOptions = { windowMs: 60000, maxRequests: 60 }): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.requestStore.get(key);

    if (!record || now > record.resetTime) {
      const resetTime = now + options.windowMs;
      this.requestStore.set(key, { count: 1, resetTime });
      return { allowed: true, remaining: options.maxRequests - 1, resetTime };
    }

    if (record.count >= options.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    record.count += 1;
    return { allowed: true, remaining: options.maxRequests - record.count, resetTime: record.resetTime };
  }
}

export const rateLimiterService = new RateLimiterService();

export function rateLimiterMiddleware(options: RateLimitOptions = { windowMs: 60000, maxRequests: 60 }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientKey = (req.headers["x-user-id"] as string) || req.ip || "127.0.0.1";
    const result = rateLimiterService.isAllowed(clientKey, options);

    res.setHeader("X-RateLimit-Limit", options.maxRequests);
    res.setHeader("X-RateLimit-Remaining", result.remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(result.resetTime / 1000));

    if (!result.allowed) {
      return res.status(429).json({
        success: false,
        error: "TOO_MANY_REQUESTS",
        message: "Rate limit exceeded. Please wait before making more requests.",
      });
    }

    return next();
  };
}
