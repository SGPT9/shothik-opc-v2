import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import { edgeReplicationMeshEngine } from "../../lib/edge-replication-mesh.js";

describe("Autonomous Multi-Region Edge Replication Mesh (/api/v1/edge/mesh)", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    edgeReplicationMeshEngine.resetToBaseline();
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

  it("1. GET /api/v1/edge/mesh/topology returns Dhaka, Singapore, and Frankfurt nodes with vector clocks", async () => {
    const res = await fetch(`${baseUrl}/api/v1/edge/mesh/topology`);
    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.nodes).toHaveLength(3);

    const dhkNode = json.nodes.find((n: any) => n.id === "dhk-edge-01");
    const sinNode = json.nodes.find((n: any) => n.id === "sin-edge-01");
    const fraNode = json.nodes.find((n: any) => n.id === "fra-core-01");

    expect(dhkNode).toBeDefined();
    expect(dhkNode.region).toBe("DHK");
    expect(dhkNode.localReadLatencyMs).toBeLessThan(10); // Sub-10ms requirement
    expect(dhkNode.vectorClock["dhk-edge-01"]).toBe(10);

    expect(sinNode).toBeDefined();
    expect(sinNode.region).toBe("SIN");

    expect(fraNode).toBeDefined();
    expect(fraNode.region).toBe("FRA");

    expect(json.convergence.converged).toBe(true);
  });

  it("2. GET /api/v1/edge/mesh/latency-matrix returns inter-region RTT, jitter, and health status", async () => {
    const res = await fetch(`${baseUrl}/api/v1/edge/mesh/latency-matrix`);
    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.count).toBe(6); // 3 * 2 pairs

    const dhkToSin = json.matrix.find((m: any) => m.fromRegion === "DHK" && m.toRegion === "SIN");
    expect(dhkToSin).toBeDefined();
    expect(dhkToSin.rttMs).toBeGreaterThan(25);
    expect(dhkToSin.rttMs).toBeLessThan(45);
    expect(dhkToSin.status).toBe("optimal");

    const dhkToFra = json.matrix.find((m: any) => m.fromRegion === "DHK" && m.toRegion === "FRA");
    expect(dhkToFra).toBeDefined();
    expect(dhkToFra.rttMs).toBeGreaterThan(120);
    expect(dhkToFra.status).toBe("healthy");
  });

  it("3. POST /api/v1/edge/mesh/mutate creates local WAL frame in Dhaka and replicates to peers", async () => {
    const mutationPayload = {
      originNodeId: "dhk-edge-01",
      table: "storefront_inventory",
      rowId: "sku_jamdani_saree_04",
      operation: "UPDATE",
      payload: { stockCount: 42, unitPriceBdt: 12500, warehouse: "Tejgaon Hub" },
    };

    const res = await fetch(`${baseUrl}/api/v1/edge/mesh/mutate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mutationPayload),
    });

    expect(res.status).toBe(201);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.frame).toBeDefined();
    expect(json.frame.originNodeId).toBe("dhk-edge-01");
    expect(json.frame.sequence).toBe(11);
    expect(json.frame.checksum).toHaveLength(64); // SHA-256 hex
    expect(json.frame.vectorClock["dhk-edge-01"]).toBe(11);

    // Verify replication to peer nodes
    expect(json.replicationResults).toHaveLength(2);
    expect(json.replicationResults.every((r: any) => r.success === true)).toBe(true);

    // Verify topology vector clocks have converged
    const topoRes = await fetch(`${baseUrl}/api/v1/edge/mesh/topology`);
    const topoJson = (await topoRes.json()) as any;
    const sinNode = topoJson.nodes.find((n: any) => n.id === "sin-edge-01");
    expect(sinNode.vectorClock["dhk-edge-01"]).toBe(11);
  });

  it("4. POST /api/v1/edge/mesh/replicate resolves concurrent writes deterministically via LWW", async () => {
    // 1st write
    const write1 = {
      originNodeId: "dhk-edge-01",
      table: "user_sessions",
      rowId: "sess_twin_demo_01",
      operation: "INSERT",
      payload: { activeTab: "dashboard", version: 1 },
    };
    await fetch(`${baseUrl}/api/v1/edge/mesh/mutate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(write1),
    });

    // 2nd write from Singapore on the same entity
    const write2 = {
      originNodeId: "sin-edge-01",
      table: "user_sessions",
      rowId: "sess_twin_demo_01",
      operation: "UPDATE",
      payload: { activeTab: "analytics", version: 2 },
    };
    const res2 = await fetch(`${baseUrl}/api/v1/edge/mesh/mutate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(write2),
    });

    expect(res2.status).toBe(201);
    const json2 = (await res2.json()) as any;
    expect(json2.success).toBe(true);
    // Peer replication to dhk-edge-01 should trigger conflict LWW resolution
    const dhkReplication = json2.replicationResults.find((r: any) => r.targetNodeId === "dhk-edge-01");
    expect(dhkReplication.conflictDetected).toBe(true);
    expect(dhkReplication.resolution).toBe("conflict_lww_accepted");
  });

  it("5. Partition tolerance: queues frames when a node is isolated, and recovers cleanly on force-sync", async () => {
    // Partition Singapore
    const partRes = await fetch(`${baseUrl}/api/v1/edge/mesh/simulate-partition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeId: "sin-edge-01", isPartitioned: true }),
    });
    expect(partRes.status).toBe(200);

    // Mutation in Dhaka while Singapore is partitioned
    const writeWhilePartitioned = {
      originNodeId: "dhk-edge-01",
      table: "orders",
      rowId: "ord_dhk_9921",
      operation: "INSERT",
      payload: { totalAmountBdt: 7400, courier: "Steadfast" },
    };
    const writeRes = await fetch(`${baseUrl}/api/v1/edge/mesh/mutate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(writeWhilePartitioned),
    });
    const writeJson = (await writeRes.json()) as any;
    const sinResult = writeJson.replicationResults.find((r: any) => r.targetNodeId === "sin-edge-01");
    expect(sinResult.resolution).toBe("queued_in_partition_buffer");

    // Heal partition
    await fetch(`${baseUrl}/api/v1/edge/mesh/simulate-partition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeId: "sin-edge-01", isPartitioned: false }),
    });

    // Trigger force-sync
    const syncRes = await fetch(`${baseUrl}/api/v1/edge/mesh/force-sync`, { method: "POST" });
    expect(syncRes.status).toBe(200);
    const syncJson = (await syncRes.json()) as any;
    expect(syncJson.success).toBe(true);
    expect(syncJson.convergence.converged).toBe(true);
  });

  it("6. GET /api/v1/edge/mesh/frames returns immutable distributed WAL audit trail", async () => {
    await fetch(`${baseUrl}/api/v1/edge/mesh/mutate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originNodeId: "fra-core-01",
        table: "system_config",
        rowId: "cfg_global_tax",
        operation: "UPDATE",
        payload: { vatRate: 0.15, mushakRequired: true },
      }),
    });

    const res = await fetch(`${baseUrl}/api/v1/edge/mesh/frames?limit=10`);
    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.frames.length).toBeGreaterThanOrEqual(1);
    expect(json.frames[0].originNodeId).toBe("fra-core-01");
    expect(json.frames[0].table).toBe("system_config");
  });
});
