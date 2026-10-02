import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import healthRouter from "../health.js";

const app = express();
app.use(express.json());
app.use(healthRouter);

describe("Health, Liveness, Readiness & Diagnostic Probes", () => {
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = (server.address() as any).port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  it("GET /health returns 200 with status ok", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });

  it("GET /health/liveness returns process uptime and UP status", async () => {
    const res = await fetch(`${baseUrl}/health/liveness`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("UP");
    expect(typeof body.uptimeSeconds).toBe("number");
    expect(typeof body.pid).toBe("number");
  });

  it("GET /health/readiness returns 200 when memory limits are within bounds", async () => {
    const res = await fetch(`${baseUrl}/health/readiness`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("UP");
    expect(body.checks.memoryHeapUsedMb).toBeGreaterThan(0);
    expect(body.checks.memoryRssMb).toBeGreaterThan(0);
  });

  it("GET /health/readiness returns 503 DOWN when graceful shutdown is draining", async () => {
    const { gracefulShutdownSupervisor } = await import("../../lib/lifecycle/graceful-shutdown.js");
    // Simulate drain initiation
    await gracefulShutdownSupervisor.shutdown(undefined, 100);

    const res = await fetch(`${baseUrl}/health/readiness`);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.status).toBe("DOWN");
    expect(body.reason).toBe("SERVER_DRAINING");

    // Reset for subsequent tests
    gracefulShutdownSupervisor.resetForTesting();
  });

  it("GET /health/deep returns full operational subsystem inventory", async () => {
    const res = await fetch(`${baseUrl}/health/deep`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.platform).toBe("Shothik Unified AI Platform");
    expect(body.status).toBe("HEALTHY");
    expect(body.subsystems.zeroPiiDataGasket).toBe("operational");
    expect(body.subsystems.teaEstateAuctionClearing).toBe("operational");
    expect(body.subsystems.mfsBkashNagadGateway).toBe("operational");
  });

  it("GET /status returns backward-compatible platform overview", async () => {
    const res = await fetch(`${baseUrl}/status`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.platform).toBe("Shothik Unified AI Platform");
    expect(body.overallHealth).toBe("healthy");
  });
});
