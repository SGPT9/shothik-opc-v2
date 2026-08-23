import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("MCP Gateway Routes (/api/mcp)", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it("GET /api/mcp/capabilities returns available skills catalog", async () => {
    const res = await fetch(`${baseUrl}/api/mcp/capabilities`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(Array.isArray(json.capabilities)).toBe(true);
    expect(json.count).toBeGreaterThan(0);

    const hasPortAudit = json.capabilities.some((c: any) => c.id === "server-node-port-audit");
    expect(hasPortAudit).toBe(true);
  });

  it("GET /api/mcp/capabilities/:id returns specific capability metadata", async () => {
    const res = await fetch(`${baseUrl}/api/mcp/capabilities/server-node-port-audit`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.capability.id).toBe("server-node-port-audit");
    expect(json.capability.category).toBe("operations");
  });

  it("GET /api/mcp/capabilities/:id/source retrieves SKILL.md content", async () => {
    const res = await fetch(`${baseUrl}/api/mcp/capabilities/server-node-port-audit/source`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.id).toBe("server-node-port-audit");
    expect(json.content).toContain("Server node and port audit");
  });

  it("GET /api/mcp/capabilities/:id returns 404 for unknown capability", async () => {
    const res = await fetch(`${baseUrl}/api/mcp/capabilities/non-existent-skill-999`);
    expect(res.status).toBe(404);
    const json = (await res.json()) as any;
    expect(json.success).toBe(false);
  });
});
