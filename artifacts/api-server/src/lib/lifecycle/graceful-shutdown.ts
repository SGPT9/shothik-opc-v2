/**
 * Production Graceful Shutdown & In-Flight Connection Drain Supervisor
 * Manages zero-downtime container rollouts, TCP socket draining, cleanup hooks,
 * and Kubernetes/Dokploy readiness probe state transitions.
 */

import type { Server } from "http";
import type { Request, Response, NextFunction } from "express";
import { logger } from "../logger";

export interface CleanupHook {
  name: string;
  fn: () => Promise<void> | void;
}

export interface ShutdownResult {
  success: boolean;
  drainedRequests: number;
  executedHooks: string[];
  durationMs: number;
  forced: boolean;
}

export class GracefulShutdownSupervisor {
  private isDraining: boolean = false;
  private activeRequests: number = 0;
  private cleanupHooks: CleanupHook[] = [];
  private shutdownPromise: Promise<ShutdownResult> | null = null;

  /**
   * Returns true if shutdown sequence has been initiated
   */
  public isShuttingDown(): boolean {
    return this.isDraining;
  }

  /**
   * Current number of in-flight HTTP requests being processed
   */
  public getActiveRequests(): number {
    return this.activeRequests;
  }

  /**
   * Register a teardown hook (e.g. database pool, Redis client, queue workers)
   */
  public registerCleanupHook(name: string, fn: () => Promise<void> | void): void {
    this.cleanupHooks.push({ name, fn });
  }

  /**
   * Express middleware to track in-flight requests and inject Connection: close during drain
   */
  public trackRequestMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (this.isDraining) {
        res.setHeader("Connection", "close");
        // If it's a non-health request during active drain, gracefully reject with 503
        if (!req.path.includes("health")) {
          res.status(503).json({
            success: false,
            error: {
              code: "SERVER_DRAINING",
              message: "Server is shutting down; please retry on an active instance.",
            },
          });
          return;
        }
      }

      this.activeRequests++;
      let decremented = false;

      const onFinish = () => {
        if (!decremented) {
          decremented = true;
          this.activeRequests = Math.max(0, this.activeRequests - 1);
        }
      };

      res.once("finish", onFinish);
      res.once("close", onFinish);

      next();
    };
  }

  /**
   * Execute orderly shutdown: stop accepting new connections, drain in-flight, run hooks
   */
  public async shutdown(server?: Server, timeoutMs: number = 10000): Promise<ShutdownResult> {
    if (this.shutdownPromise) {
      return this.shutdownPromise;
    }

    this.isDraining = true;
    const startTime = Date.now();
    logger.info({ activeRequests: this.activeRequests }, "[Shutdown] Initiating graceful drain");

    this.shutdownPromise = (async () => {
      // 1. Stop HTTP server from accepting new TCP connections
      if (server && server.listening) {
        await new Promise<void>((resolve) => {
          server.close((err) => {
            if (err) {
              logger.warn({ error: err.message }, "[Shutdown] Error closing HTTP server");
            } else {
              logger.info("[Shutdown] HTTP server closed for new connections");
            }
            resolve();
          });
        });
      }

      // 2. Wait for in-flight requests to complete or timeout
      let forced = false;
      const initialActive = this.activeRequests;
      const pollInterval = 50;
      let waited = 0;

      while (this.activeRequests > 0 && waited < timeoutMs) {
        await new Promise((r) => setTimeout(r, pollInterval));
        waited += pollInterval;
      }

      if (this.activeRequests > 0) {
        forced = true;
        logger.warn(
          { remainingRequests: this.activeRequests, timeoutMs },
          "[Shutdown] Timeout reached with pending in-flight requests"
        );
      } else {
        logger.info({ drainedRequests: initialActive, waitedMs: waited }, "[Shutdown] All in-flight requests drained cleanly");
      }

      // 3. Execute all cleanup hooks
      const executedHooks: string[] = [];
      for (const hook of this.cleanupHooks) {
        try {
          logger.info({ hook: hook.name }, "[Shutdown] Executing cleanup hook");
          await hook.fn();
          executedHooks.push(hook.name);
        } catch (hookErr: any) {
          logger.error({ hook: hook.name, error: hookErr.message }, "[Shutdown] Error in cleanup hook");
        }
      }

      const durationMs = Date.now() - startTime;
      logger.info({ durationMs, executedHooks, forced }, "[Shutdown] Graceful shutdown completed");

      return {
        success: !forced,
        drainedRequests: initialActive - this.activeRequests,
        executedHooks,
        durationMs,
        forced,
      };
    })();

    return this.shutdownPromise;
  }

  /**
   * Attach process signal handlers for SIGTERM and SIGINT
   */
  public attachProcessSignals(server: Server, timeoutMs: number = 10000): void {
    const handleSignal = async (signal: string) => {
      logger.info({ signal }, `[Shutdown] Received ${signal} signal`);
      try {
        const result = await this.shutdown(server, timeoutMs);
        process.exit(result.forced ? 1 : 0);
      } catch (err: any) {
        logger.error({ error: err.message }, "[Shutdown] Fatal error during shutdown sequence");
        process.exit(1);
      }
    };

    process.once("SIGTERM", () => handleSignal("SIGTERM"));
    process.once("SIGINT", () => handleSignal("SIGINT"));
  }

  /**
   * Reset supervisor state (primarily for unit test isolation)
   */
  public resetForTesting(): void {
    this.isDraining = false;
    this.activeRequests = 0;
    this.cleanupHooks = [];
    this.shutdownPromise = null;
  }
}

export const gracefulShutdownSupervisor = new GracefulShutdownSupervisor();
