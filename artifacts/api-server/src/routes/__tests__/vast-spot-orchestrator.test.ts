import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("Vast.ai Dynamic Spot GPU Orchestration Layer (/api/v1/compute/vast)", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("1. GET /api/v1/compute/vast/offers returns verified spot GPU market offers and supports filtering", async () => {
    const res = await fetch(`${baseUrl}/api/v1/compute/vast/offers`);
    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.count).toBeGreaterThanOrEqual(4);
    expect(json.offers.some((o: any) => o.gpuName.includes("RTX 4090"))).toBe(true);
    expect(json.offers.some((o: any) => o.gpuName.includes("A100"))).toBe(true);
    expect(json.offers.some((o: any) => o.gpuName.includes("H100"))).toBe(true);

    // Test filtering by minVramGb
    const filteredRes = await fetch(`${baseUrl}/api/v1/compute/vast/offers?minVramGb=80`);
    const filteredJson = (await filteredRes.json()) as any;
    expect(filteredJson.success).toBe(true);
    expect(filteredJson.offers.every((o: any) => o.totalVramGb >= 80)).toBe(true);
  });

  it("2. POST /api/v1/compute/vast/evaluate-fallback decides whether local WebGPU is capable or bursting is required", async () => {
    // 2a. Small prompt: WebGPU should handle locally
    const localRes = await fetch(`${baseUrl}/api/v1/compute/vast/evaluate-fallback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        promptTokens: 2048,
        batchSize: 1,
      }),
    });
    expect(localRes.status).toBe(200);
    const localJson = (await localRes.json()) as any;
    expect(localJson.success).toBe(true);
    expect(localJson.evaluation.shouldFallback).toBe(false);
    expect(localJson.evaluation.localWebGpuCapable).toBe(true);
    expect(localJson.evaluation.estimatedCostUsd).toBe(0);

    // 2b. Massive context exceeding 16k buffer: Must fallback to Vast.ai spot GPU
    const burstRes = await fetch(`${baseUrl}/api/v1/compute/vast/evaluate-fallback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        promptTokens: 32768,
        batchSize: 4,
      }),
    });
    expect(burstRes.status).toBe(200);
    const burstJson = (await burstRes.json()) as any;
    expect(burstJson.success).toBe(true);
    expect(burstJson.evaluation.shouldFallback).toBe(true);
    expect(burstJson.evaluation.localWebGpuCapable).toBe(false);
    expect(burstJson.evaluation.recommendedGpu).toBeDefined();
    expect(burstJson.evaluation.estimatedCostUsd).toBeGreaterThan(0);
    expect(burstJson.evaluation.estimatedCostBdt).toBeGreaterThan(0);
  });

  it("3. POST /api/v1/compute/vast/bid-and-launch allocates a dynamic spot GPU container", async () => {
    const res = await fetch(`${baseUrl}/api/v1/compute/vast/bid-and-launch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offerId: "vast_offer_4090_single",
        dockerImage: "vllm/vllm-openai:latest",
        workloadDescription: "Nilkhet POD Manuscript OCR & Imposition Job",
      }),
    });

    expect(res.status).toBe(201);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.instanceId).toBeDefined();
    expect(json.instance.gpuName).toContain("RTX 4090");
    expect(json.instance.status).toBe("running");
    expect(json.instance.endpointUrl).toContain(json.instanceId);
    expect(json.instance.sshPort).toBeGreaterThan(0);
    expect(json.instance.hourlyRateBdt).toBeGreaterThan(0);
  });

  it("4. GET /api/v1/compute/vast/instances and /:instanceId retrieves active instance telemetry", async () => {
    const listRes = await fetch(`${baseUrl}/api/v1/compute/vast/instances`);
    expect(listRes.status).toBe(200);

    const listJson = (await listRes.json()) as any;
    expect(listJson.success).toBe(true);
    expect(listJson.instances.length).toBeGreaterThanOrEqual(1);

    const firstInstance = listJson.instances[0];
    const getRes = await fetch(`${baseUrl}/api/v1/compute/vast/instances/${firstInstance.id}`);
    expect(getRes.status).toBe(200);
    const getJson = (await getRes.json()) as any;
    expect(getJson.success).toBe(true);
    expect(getJson.instance.id).toBe(firstInstance.id);
  });

  it("5. POST /api/v1/compute/vast/instances/:instanceId/destroy terminates spot worker and finalizes spend", async () => {
    // Launch temporary worker
    const launchRes = await fetch(`${baseUrl}/api/v1/compute/vast/bid-and-launch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offerId: "vast_offer_3090_dual",
      }),
    });
    const { instanceId } = (await launchRes.json()) as any;

    // Destroy worker
    const destroyRes = await fetch(`${baseUrl}/api/v1/compute/vast/instances/${instanceId}/destroy`, {
      method: "POST",
    });
    expect(destroyRes.status).toBe(200);

    const destroyJson = (await destroyRes.json()) as any;
    expect(destroyJson.success).toBe(true);
    expect(destroyJson.instanceId).toBe(instanceId);
    expect(destroyJson.status).toBe("destroyed");
    expect(destroyJson.instance.stoppedAt).toBeDefined();
  });
});
