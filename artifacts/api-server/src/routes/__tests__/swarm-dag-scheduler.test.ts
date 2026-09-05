import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("Autonomous Multi-Agent Task Swarm Graph Execution (/api/v1/swarm/graph)", () => {
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

  it("1. GET /api/v1/swarm/graph/templates retrieves canonical enterprise swarm templates", async () => {
    const res = await fetch(`${baseUrl}/api/v1/swarm/graph/templates`);
    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.count).toBe(3);
    expect(json.templates).toHaveLength(3);

    const eid = json.templates.find((t: any) => t.id === "eid_mega_campaign");
    expect(eid).toBeDefined();
    expect(eid.nodes.length).toBeGreaterThanOrEqual(4);
    expect(eid.nodes.some((n: any) => n.twin === "marketing_twin")).toBe(true);

    const nilkhet = json.templates.find((t: any) => t.id === "nilkhet_pod_direct_publishing");
    expect(nilkhet).toBeDefined();
    expect(nilkhet.nodes.some((n: any) => n.twin === "operations_twin")).toBe(true);

    const b2b = json.templates.find((t: any) => t.id === "b2b_lead_to_cash");
    expect(b2b).toBeDefined();
    expect(b2b.nodes.some((n: any) => n.twin === "crm_twin")).toBe(true);
  });

  it("2. POST /api/v1/swarm/graph/create instantiates DAG from template with waves and topological order", async () => {
    const res = await fetch(`${baseUrl}/api/v1/swarm/graph/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId: "eid_mega_campaign",
      }),
    });

    expect(res.status).toBe(201);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.graphId).toBeDefined();
    expect(json.graph.status).toBe("idle");
    expect(json.graph.waves.length).toBeGreaterThanOrEqual(3);

    // Wave 0 should have nodes with 0 dependencies
    const wave0 = json.graph.waves[0];
    const nodeValues = Object.values(json.graph.nodes) as any[];
    const wave0Nodes = nodeValues.filter((n: any) => wave0.includes(n.id));
    expect(wave0Nodes.every((n: any) => n.dependencies.length === 0)).toBe(true);
  });

  it("3. POST /api/v1/swarm/graph/create detects cycle and rejects circular dependency with 400", async () => {
    const cyclicNodes = [
      {
        id: "task-A",
        label: "Task A",
        twin: "marketing_twin",
        dependencies: ["task-B"],
        inputs: {},
      },
      {
        id: "task-B",
        label: "Task B",
        twin: "content_twin",
        dependencies: ["task-A"],
        inputs: {},
      },
    ];

    const res = await fetch(`${baseUrl}/api/v1/swarm/graph/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Cyclic Test Swarm",
        nodes: cyclicNodes,
      }),
    });

    expect(res.status).toBe(400);
    const json = (await res.json()) as any;
    expect(json.success).toBe(false);
    expect(json.error).toBe("Circular dependency detected");
  });

  it("4. POST /api/v1/swarm/graph/:graphId/execute executes DAG wave-by-wave and populates outputs", async () => {
    // 1. Create graph
    const createRes = await fetch(`${baseUrl}/api/v1/swarm/graph/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId: "b2b_lead_to_cash",
      }),
    });
    const { graphId } = (await createRes.json()) as any;

    // 2. Execute graph
    const execRes = await fetch(`${baseUrl}/api/v1/swarm/graph/${graphId}/execute`, {
      method: "POST",
    });
    expect(execRes.status).toBe(200);

    const execJson = (await execRes.json()) as any;
    expect(execJson.success).toBe(true);
    expect(execJson.status).toBe("completed");
    expect(execJson.parallelSpeedupRatio).toBeGreaterThan(0);
    expect(execJson.totalDurationMs).toBeGreaterThan(0);

    // Verify all nodes completed with output
    const graph = execJson.graph;
    const nodeValues = Object.values(graph.nodes) as any[];
    expect(nodeValues.every((n: any) => n.status === "completed")).toBe(true);
    expect(nodeValues.every((n: any) => n.outputs !== undefined)).toBe(true);

    // Verify downstream node received output in its execution
    const invoiceNode = nodeValues.find((n: any) => n.twin === "finance_twin");
    expect(invoiceNode).toBeDefined();
    expect(invoiceNode.outputs).toHaveProperty("vatInvoiceMushak63");
    expect(invoiceNode.outputs).toHaveProperty("status", "settled");
  });

  it("5. GET /api/v1/swarm/graph/:graphId returns current graph state", async () => {
    const createRes = await fetch(`${baseUrl}/api/v1/swarm/graph/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId: "nilkhet_pod_direct_publishing",
      }),
    });
    const { graphId } = (await createRes.json()) as any;

    const getRes = await fetch(`${baseUrl}/api/v1/swarm/graph/${graphId}`);
    expect(getRes.status).toBe(200);
    const getJson = (await getRes.json()) as any;
    expect(getJson.success).toBe(true);
    expect(getJson.graph.id).toBe(graphId);
    expect(getJson.graph.name).toContain("Nilkhet");
  });

  it("6. POST /api/v1/swarm/graph/:graphId/cancel cancels graph execution", async () => {
    const createRes = await fetch(`${baseUrl}/api/v1/swarm/graph/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId: "eid_mega_campaign",
      }),
    });
    const { graphId } = (await createRes.json()) as any;

    const cancelRes = await fetch(`${baseUrl}/api/v1/swarm/graph/${graphId}/cancel`, {
      method: "POST",
    });
    expect(cancelRes.status).toBe(200);
    const cancelJson = (await cancelRes.json()) as any;
    expect(cancelJson.success).toBe(true);
    expect(cancelJson.status).toBe("cancelled");
  });
});
