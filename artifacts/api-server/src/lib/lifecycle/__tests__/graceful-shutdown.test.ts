import { describe, it, expect, beforeEach, vi } from "vitest";
import express from "express";
import { GracefulShutdownSupervisor } from "../graceful-shutdown";

describe("Production Graceful Shutdown & Drain Supervisor", () => {
  let supervisor: GracefulShutdownSupervisor;

  beforeEach(() => {
    supervisor = new GracefulShutdownSupervisor();
  });

  it("initializes with zero active requests and not draining", () => {
    expect(supervisor.isShuttingDown()).toBe(false);
    expect(supervisor.getActiveRequests()).toBe(0);
  });

  it("accurately tracks in-flight request lifecycles", async () => {
    const app = express();
    app.use(supervisor.trackRequestMiddleware());

    let resolveHandler: () => void = () => {};
    const holdPromise = new Promise<void>((r) => {
      resolveHandler = r;
    });

    app.get("/test-endpoint", async (_req, res) => {
      expect(supervisor.getActiveRequests()).toBe(1);
      await holdPromise;
      res.json({ ok: true });
    });

    const server = app.listen(0);
    const port = (server.address() as any).port;

    const fetchPromise = fetch(`http://127.0.0.1:${port}/test-endpoint`);
    await new Promise((r) => setTimeout(r, 50));

    expect(supervisor.getActiveRequests()).toBe(1);

    resolveHandler();
    const res = await fetchPromise;
    expect(res.status).toBe(200);

    await new Promise((r) => setTimeout(r, 50));
    expect(supervisor.getActiveRequests()).toBe(0);

    server.close();
  });

  it("gracefully rejects new non-health requests with 503 during active drain", async () => {
    const app = express();
    app.use(supervisor.trackRequestMiddleware());
    app.get("/api/data", (_req, res) => res.json({ data: 123 }));
    app.get("/health/readiness", (_req, res) => res.json({ status: "UP" }));

    const server = app.listen(0);
    const port = (server.address() as any).port;

    // Trigger shutdown
    const shutdownPromise = supervisor.shutdown(undefined, 500);
    expect(supervisor.isShuttingDown()).toBe(true);

    const res = await fetch(`http://127.0.0.1:${port}/api/data`);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error.code).toBe("SERVER_DRAINING");

    // Health probes are allowed through to report status
    const healthRes = await fetch(`http://127.0.0.1:${port}/health/readiness`);
    expect(healthRes.status).toBe(200);

    await shutdownPromise;
    server.close();
  });

  it("executes all registered cleanup hooks in sequence", async () => {
    const dbHook = vi.fn().mockResolvedValue(undefined);
    const redisHook = vi.fn().mockResolvedValue(undefined);
    const queueHook = vi.fn().mockImplementation(() => {});

    supervisor.registerCleanupHook("database-pool", dbHook);
    supervisor.registerCleanupHook("redis-client", redisHook);
    supervisor.registerCleanupHook("hermes-queue-drain", queueHook);

    const result = await supervisor.shutdown(undefined, 200);

    expect(result.success).toBe(true);
    expect(result.forced).toBe(false);
    expect(result.executedHooks).toEqual([
      "database-pool",
      "redis-client",
      "hermes-queue-drain",
    ]);
    expect(dbHook).toHaveBeenCalledOnce();
    expect(redisHook).toHaveBeenCalledOnce();
    expect(queueHook).toHaveBeenCalledOnce();
  });
});
