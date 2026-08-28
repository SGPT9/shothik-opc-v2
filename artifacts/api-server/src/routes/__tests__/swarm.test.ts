import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("Swarm Multi-Agent Deliberation Suite (/api/v1/swarm)", () => {
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

  it("GET /api/v1/swarm/agents returns the active subagents catalog", async () => {
    const res = await fetch(`${baseUrl}/api/v1/swarm/agents`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.agents.length).toBe(10);

    const commander = json.agents.find((a: any) => a.id === "commander");
    expect(commander).toBeDefined();
    expect(commander.name).toBe("Commander Agent");

    const architect = json.agents.find((a: any) => a.id === "architect");
    expect(architect).toBeDefined();

    const security = json.agents.find((a: any) => a.id === "security_sentinel");
    expect(security).toBeDefined();

    const taxAuditor = json.agents.find((a: any) => a.id === "tax_auditor");
    expect(taxAuditor).toBeDefined();

    const devops = json.agents.find((a: any) => a.id === "devops_deployer");
    expect(devops).toBeDefined();
  });

  it("POST /api/v1/swarm/deliberate executes multi-agent DAG plan and creates DSH trace", async () => {
    const res = await fetch(`${baseUrl}/api/v1/swarm/deliberate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goal: "Deploy high-throughput payment webhook with bKash and PostgreSQL",
        topic: "Payment Webhook Architecture",
        userId: "usr_swarm_test_1",
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.sessionId).toMatch(/^dsh_/);
    expect(json.summary.totalNodes).toBe(10);
    expect(json.perspectives.length).toBe(10);
  });

});
