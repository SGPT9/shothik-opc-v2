import { describe, expect, it, vi } from "vitest";
import { ToolBridge, getToolBridge } from "../bridge";
import { z } from "zod";

vi.mock("@/lib/hermes/infra/db", () => ({
  getHermesDatabase: () => ({
    recordToolCall: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe("ToolBridge Persistence & Invocation", () => {
  it("registers tools and executes them with parameter validation", async () => {
    const bridge = new ToolBridge();
    bridge.registerTool({
      name: "calculator",
      description: "Adds numbers",
      paramSchema: z.object({ a: z.number(), b: z.number() }),
      execute: async (params) => ({
        success: true,
        data: { result: params.a + params.b },
        executionTimeMs: 10,
      }),
    });

    const res = await bridge.invokeTool("calculator", { a: 5, b: 10 }, {
      runId: "run_test_123",
      workspaceId: "ws_123",
      userId: "user_123",
    });

    expect(res.success).toBe(true);
    expect((res.data as any).result).toBe(15);
  });

  it("handles unregistered tool errors gracefully", async () => {
    const bridge = new ToolBridge();
    const res = await bridge.invokeTool("missing_tool", {}, {
      runId: "run_test_123",
      workspaceId: "ws_123",
      userId: "user_123",
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("is not registered");
  });

  it("returns singleton global ToolBridge instance", () => {
    const instance1 = getToolBridge();
    const instance2 = getToolBridge();
    expect(instance1).toBe(instance2);
  });
});
