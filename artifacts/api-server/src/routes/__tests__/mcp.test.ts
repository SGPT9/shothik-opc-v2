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

  it("GET /api/mcp/capabilities discovers DeerFlow 2.0 research and data skills", async () => {
    const res = await fetch(`${baseUrl}/api/mcp/capabilities`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);

    const hasDeepResearch = json.capabilities.some((c: any) => c.id === "deep-research");
    expect(hasDeepResearch).toBe(true);

    const hasSlr = json.capabilities.some((c: any) => c.id === "systematic-literature-review");
    expect(hasSlr).toBe(true);
  });

  it("GET /api/mcp/capabilities/:id retrieves DeerFlow deep-research metadata and source", async () => {
    const res = await fetch(`${baseUrl}/api/mcp/capabilities/deep-research`);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.capability.id).toBe("deep-research");
    expect(json.capability.category).toBe("research");

    const sourceRes = await fetch(`${baseUrl}/api/mcp/capabilities/deep-research/source`);
    expect(sourceRes.status).toBe(200);
    const sourceJson = (await sourceRes.json()) as any;
    expect(sourceJson.success).toBe(true);
    expect(sourceJson.content).toContain("Deep Research Skill");
  });

  it("GET /api/mcp/capabilities/:id returns 404 for unknown capability", async () => {
    const res = await fetch(`${baseUrl}/api/mcp/capabilities/non-existent-skill-999`);
    expect(res.status).toBe(404);
    const json = (await res.json()) as any;
    expect(json.success).toBe(false);
  });

  describe("JSON-RPC 2.0 Bi-Directional MCP Server (/api/mcp/rpc)", () => {
    it("handles initialize method and returns serverInfo & protocolVersion", async () => {
      const res = await fetch(`${baseUrl}/api/mcp/rpc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "init_1",
          method: "initialize",
          params: {},
        }),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.jsonrpc).toBe("2.0");
      expect(json.id).toBe("init_1");
      expect(json.result.serverInfo.name).toBe("shothik-mcp-server");
      expect(json.result.protocolVersion).toBe("2024-11-05");
      expect(json.result.capabilities.tools).toBeDefined();
    });

    it("handles tools/list method and returns exposed Shothik tools", async () => {
      const res = await fetch(`${baseUrl}/api/mcp/rpc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "list_1",
          method: "tools/list",
          params: {},
        }),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.result.tools.length).toBeGreaterThanOrEqual(5);

      const toolNames = json.result.tools.map((t: any) => t.name);
      expect(toolNames).toContain("shothik_deerflow_slr");
      expect(toolNames).toContain("shothik_mushak_calc");
      expect(toolNames).toContain("shothik_mfs_payout");
      expect(toolNames).toContain("shothik_courier_booking");
      expect(toolNames).toContain("shothik_audit_ledger");
    });

    it("handles tools/call for shothik_mushak_calc with exact VAT calculation", async () => {
      const res = await fetch(`${baseUrl}/api/mcp/rpc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "call_vat_1",
          method: "tools/call",
          params: {
            name: "shothik_mushak_calc",
            arguments: {
              baseAmount: 15000,
              vatRatePercent: 15,
              supplementaryDutyPercent: 0,
              withholdingTaxPercent: 3,
            },
          },
        }),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.result.isError).toBe(false);
      const parsedText = JSON.parse(json.result.content[0].text);
      expect(parsedText.baseAmount).toBe(15000);
      expect(parsedText.vatAmount).toBe(2250);
      expect(parsedText.withholdingTax).toBe(450);
      expect(parsedText.totalPayable).toBe(17250);
      expect(parsedText.nbrChallanType).toBe("Mushak-6.3");
    });

    it("handles tools/call for shothik_deerflow_slr and generates systematic review", async () => {
      const res = await fetch(`${baseUrl}/api/mcp/rpc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "call_slr_1",
          method: "tools/call",
          params: {
            name: "shothik_deerflow_slr",
            arguments: {
              topic: "Speculative Routing and Edge-first Vector Indices",
              scopeCount: 15,
              citationFormat: "IEEE",
            },
          },
        }),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.result.isError).toBe(false);
      const parsedSlr = JSON.parse(json.result.content[0].text);
      expect(parsedSlr.methodology).toBe("DEERFLOW_V2_SLR");
      expect(parsedSlr.themes.length).toBeGreaterThan(0);
      expect(parsedSlr.sha256VerificationHash).toBeDefined();
    });

    it("returns -32601 error for unknown MCP method", async () => {
      const res = await fetch(`${baseUrl}/api/mcp/rpc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "err_1",
          method: "non_existent_method",
          params: {},
        }),
      });

      expect(res.status).toBe(400);
      const json = (await res.json()) as any;
      expect(json.error.code).toBe(-32601);
    });
  });
});
