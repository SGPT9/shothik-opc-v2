import { z } from "zod";

export interface ToolExecutionContext {
  runId: string;
  sessionId: string;
  workspaceId: string;
  userId: string;
  metadata?: Record<string, unknown>;
}

export interface ToolExecutionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  executionTimeMs: number;
}

export interface ToolDefinition<TParams = any, TResult = any> {
  name: string;
  description: string;
  category: "ai" | "search" | "storage" | "database" | "publishing" | "system";
  version: string;
  paramSchema: z.ZodType<TParams>;
  timeoutMs?: number;
  execute: (
    params: TParams,
    context: ToolExecutionContext,
  ) => Promise<ToolExecutionResult<TResult>>;
}

export function createTool<TParams, TResult>(
  definition: ToolDefinition<TParams, TResult>,
): ToolDefinition<TParams, TResult> {
  return definition;
}
