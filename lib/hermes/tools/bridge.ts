import { ToolDefinition, ToolExecutionContext, ToolExecutionResult } from "./definition";
const logger = {
  info: (...args: any[]) => console.log("[ToolBridge Info]", ...args),
  warn: (...args: any[]) => console.warn("[ToolBridge Warn]", ...args),
  error: (...args: any[]) => console.error("[ToolBridge Error]", ...args),
};

export class ToolBridge {
  private registry: Map<string, ToolDefinition> = new Map();

  /**
   * Registers a tool definition with the ToolBridge.
   */
  registerTool(tool: ToolDefinition): void {
    if (this.registry.has(tool.name)) {
      logger.warn(`ToolBridge: Overwriting tool registration for '${tool.name}'`);
    }
    this.registry.set(tool.name, tool);
  }

  /**
   * Retrieves a tool definition by name.
   */
  getTool(name: string): ToolDefinition | undefined {
    return this.registry.get(name);
  }

  /**
   * Lists all registered tools.
   */
  listTools(): ToolDefinition[] {
    return Array.from(this.registry.values());
  }

  /**
   * Invokes a registered tool by name with parameter validation and timeout handling.
   * Persists every tool invocation into InsForge public.hermes_tool_calls table.
   */
  async invokeTool<T = unknown>(
    name: string,
    rawParams: unknown,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult<T>> {
    const startTime = Date.now();
    const startedAtIso = new Date(startTime).toISOString();
    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const runId = context.runId || "run_default";

    const tool = this.registry.get(name);

    if (!tool) {
      const errMessage = `ToolBridge error: Tool '${name}' is not registered`;
      await getHermesDatabase().recordToolCall({
        id: callId,
        runId,
        toolName: name,
        input: (rawParams as Record<string, unknown>) || {},
        error: errMessage,
        status: "failed",
        startedAt: startedAtIso,
        completedAt: new Date().toISOString(),
      }).catch(() => null);

      return {
        success: false,
        error: errMessage,
        executionTimeMs: Date.now() - startTime,
      };
    }

    // Parameter validation with Zod
    const paramResult = tool.paramSchema.safeParse(rawParams);
    if (!paramResult.success) {
      const errMessage = `ToolBridge error: Invalid parameters for '${name}': ${paramResult.error.message}`;
      await getHermesDatabase().recordToolCall({
        id: callId,
        runId,
        toolName: name,
        input: (rawParams as Record<string, unknown>) || {},
        error: errMessage,
        status: "failed",
        startedAt: startedAtIso,
        completedAt: new Date().toISOString(),
      }).catch(() => null);

      return {
        success: false,
        error: errMessage,
        executionTimeMs: Date.now() - startTime,
      };
    }

    const timeoutMs = tool.timeoutMs ?? 30000;

    try {
      let timer: ReturnType<typeof setTimeout> | undefined;

      const executionPromise = tool.execute(paramResult.data, context);
      const timeoutPromise = new Promise<ToolExecutionResult<T>>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`Tool '${name}' timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      const result = await Promise.race([executionPromise, timeoutPromise]);
      if (timer) clearTimeout(timer);

      const completedAtIso = new Date().toISOString();
      await getHermesDatabase().recordToolCall({
        id: callId,
        runId,
        toolName: name,
        input: (paramResult.data as Record<string, unknown>) || {},
        result: result.success ? (result.data as Record<string, unknown>) : null,
        error: result.error || null,
        status: result.success ? "completed" : "failed",
        startedAt: startedAtIso,
        completedAt: completedAtIso,
      }).catch(() => null);

      return result;
    } catch (err: any) {
      logger.error(`ToolBridge invocation error for '${name}':`, err);
      const completedAtIso = new Date().toISOString();
      await getHermesDatabase().recordToolCall({
        id: callId,
        runId,
        toolName: name,
        input: (rawParams as Record<string, unknown>) || {},
        error: err?.message || String(err),
        status: "failed",
        startedAt: startedAtIso,
        completedAt: completedAtIso,
      }).catch(() => null);

      return {
        success: false,
        error: err?.message || String(err),
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
}

// Singleton global ToolBridge instance for the Hermes modular monolith
let globalToolBridge: ToolBridge | null = null;

export function getToolBridge(): ToolBridge {
  if (!globalToolBridge) {
    globalToolBridge = new ToolBridge();
  }
  return globalToolBridge;
}
