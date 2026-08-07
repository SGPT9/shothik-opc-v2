import { ToolDefinition, ToolExecutionContext, ToolExecutionResult } from "./definition";
import logger from "@/lib/logger";

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
   */
  async invokeTool<T = unknown>(
    name: string,
    rawParams: unknown,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult<T>> {
    const startTime = Date.now();
    const tool = this.registry.get(name);

    if (!tool) {
      return {
        success: false,
        error: `ToolBridge error: Tool '${name}' is not registered`,
        executionTimeMs: Date.now() - startTime,
      };
    }

    // Parameter validation with Zod
    const paramResult = tool.paramSchema.safeParse(rawParams);
    if (!paramResult.success) {
      return {
        success: false,
        error: `ToolBridge error: Invalid parameters for '${name}': ${paramResult.error.message}`,
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

      return result;
    } catch (err: any) {
      logger.error(`ToolBridge invocation error for '${name}':`, err);
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
