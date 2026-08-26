import { describe, it, expect, beforeEach } from "vitest";
import { HermesMcpServer } from "../mcp-server";

describe("HermesMcpServer (Model Context Protocol Hub)", () => {
  let server: HermesMcpServer;

  beforeEach(() => {
    server = new HermesMcpServer();
  });

  it("lists all registered default MCP tools on tools/list request", async () => {
    const response = await server.handleRequest({
      jsonrpc: "2.0",
      id: "req-1",
      method: "tools/list",
    });

    expect(response.error).toBeUndefined();
    expect(response.result).toBeDefined();

    const tools = (response.result as any).tools;
    expect(tools).toHaveLength(5);
    const names = tools.map((t: any) => t.name);
    expect(names).toContain("shothik_slides_generate");
    expect(names).toContain("shothik_sheets_generate");
    expect(names).toContain("shothik_research_generate");
    expect(names).toContain("shothik_mfs_verify");
    expect(names).toContain("shothik_steadfast_dispatch");
  });

  it("executes shothik_slides_generate tool via tools/call", async () => {
    const response = await server.handleRequest({
      jsonrpc: "2.0",
      id: "req-2",
      method: "tools/call",
      params: {
        name: "shothik_slides_generate",
        arguments: {
          topic: "Autonomous Emerging Market Logistics",
          slideCount: 6,
        },
      },
    });

    expect(response.error).toBeUndefined();
    const content = (response.result as any).content[0].text;
    const parsed = JSON.parse(content);
    expect(parsed.topic).toBe("Autonomous Emerging Market Logistics");
    expect(parsed.slidesGenerated).toBe(6);
    expect(parsed.status).toBe("ready");
  });

  it("executes shothik_mfs_verify and calculates bKash transaction fee", async () => {
    const response = await server.handleRequest({
      jsonrpc: "2.0",
      id: "req-3",
      method: "tools/call",
      params: {
        name: "shothik_mfs_verify",
        arguments: {
          provider: "bkash",
          trxId: "trx998124",
          amountBdt: 5000,
        },
      },
    });

    expect(response.error).toBeUndefined();
    const parsed = JSON.parse((response.result as any).content[0].text);
    expect(parsed.verified).toBe(true);
    expect(parsed.trxId).toBe("TRX998124");
    expect(parsed.feeBdt).toBe(92.5); // 1.85% of 5000
  });

  it("executes shothik_steadfast_dispatch and generates tracking code", async () => {
    const response = await server.handleRequest({
      jsonrpc: "2.0",
      id: "req-4",
      method: "tools/call",
      params: {
        name: "shothik_steadfast_dispatch",
        arguments: {
          recipientName: "Tanvir Ahmed",
          recipientPhone: "01712345678",
          recipientAddress: "House 12, Road 4, Dhanmondi, Dhaka",
          codAmount: 1850,
        },
      },
    });

    expect(response.error).toBeUndefined();
    const parsed = JSON.parse((response.result as any).content[0].text);
    expect(parsed.trackingCode).toMatch(/^ST-\d{6}$/);
    expect(parsed.status).toBe("in_transit");
  });

  it("returns error for unknown tool", async () => {
    const response = await server.handleRequest({
      jsonrpc: "2.0",
      id: "req-5",
      method: "tools/call",
      params: {
        name: "unknown_nonexistent_tool",
        arguments: {},
      },
    });

    expect(response.error).toBeDefined();
    expect(response.error?.code).toBe(-32601);
  });
});
