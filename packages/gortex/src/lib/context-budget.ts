export interface MCPToolDefinition {
  name: string;
  description: string;
  category: "search" | "code" | "database" | "browser" | "finance" | "system";
  schema: Record<string, unknown>;
  estimatedTokenSize: number;
}

export interface ContextPruningOptions {
  maxPromptTokens?: number;
  maxToolDefinitions?: number;
  sessionStartCapChars?: number;
}

export interface PrunedContextResult {
  activeTools: MCPToolDefinition[];
  prunedToolsCount: number;
  estimatedTokensSaved: number;
  contextUsagePercent: number;
}

export class ContextBudgetEngine {
  private static DEFAULT_MAX_TOOLS = 10;
  private static DEFAULT_SESSION_START_CAP = 4000; // Aligns with ECC's ECC_SESSION_START_MAX_CHARS

  public static pruneToolsByIntent(
    allTools: MCPToolDefinition[],
    intentKeywords: string[],
    options: ContextPruningOptions = {}
  ): PrunedContextResult {
    const maxTools = options.maxToolDefinitions || this.DEFAULT_MAX_TOOLS;

    // Rank tools by relevance to intent keywords
    const scoredTools = allTools.map((tool) => {
      let score = 0;
      const combined = `${tool.name} ${tool.description} ${tool.category}`.toLowerCase();
      for (const kw of intentKeywords) {
        if (combined.includes(kw.toLowerCase())) {
          score += 10;
        }
      }
      return { tool, score };
    });

    // Sort descending by score
    scoredTools.sort((a, b) => b.score - a.score);

    const selected = scoredTools.slice(0, maxTools).map((item) => item.tool);
    const prunedCount = allTools.length - selected.length;
    const tokensSaved = allTools
      .filter((t) => !selected.includes(t))
      .reduce((acc, curr) => acc + curr.estimatedTokenSize, 0);

    return {
      activeTools: selected,
      prunedToolsCount: prunedCount,
      estimatedTokensSaved: tokensSaved,
      contextUsagePercent: Math.min(100, (selected.length / maxTools) * 100),
    };
  }

  public static enforceSessionStartCap(
    systemPrompt: string,
    capChars: number = this.DEFAULT_SESSION_START_CAP
  ): string {
    if (systemPrompt.length <= capChars) {
      return systemPrompt;
    }
    return systemPrompt.slice(0, capChars) + "\n\n... [SessionStart context pruned to preserve window]";
  }
}
