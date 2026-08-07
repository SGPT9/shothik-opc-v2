import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createTool } from "../definition";
import { ToolBridge } from "../bridge";

describe("Hermes ToolBridge & Tool Definition", () => {
  it("registers and executes a tool with parameter validation", async () => {
    const bridge = new ToolBridge();

    const sampleTool = createTool({
      name: "calculator",
      description: "Performs simple addition",
      category: "system",
      version: "1.0.0",
      paramSchema: z.object({
        a: z.number(),
        b: z.number(),
      }),
      execute: async (params) => {
        return {
          success: true,
          data: { result: params.a + params.b },
          executionTimeMs: 10,
        };
      },
    });

    bridge.registerTool(sampleTool);

    const context = {
      runId: "run_test",
      sessionId: "sess_test",
      workspaceId: "ws_test",
      userId: "user_test",
    };

    const validCall = await bridge.invokeTool<{ result: number }>("calculator", { a: 5, b: 10 }, context);
    expect(validCall.success).toBe(true);
    expect(validCall.data?.result).toBe(15);

    const invalidCall = await bridge.invokeTool("calculator", { a: "invalid" }, context);
    expect(invalidCall.success).toBe(false);
    expect(invalidCall.error).toContain("Invalid parameters");
  });

  it("handles missing tools gracefully", async () => {
    const bridge = new ToolBridge();
    const result = await bridge.invokeTool("non_existent_tool", {}, {
      runId: "run_test",
      sessionId: "sess_test",
      workspaceId: "ws_test",
      userId: "user_test",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("is not registered");
  });
});
