import { AgentDefinition, parseAgentDefinition } from "./definition";

export interface AgentSessionContext {
  sessionId: string;
  workspaceId: string;
  userId: string;
  metadata?: Record<string, unknown>;
}

export interface AgentExecutionOptions {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  context?: Record<string, unknown>;
  onChunk?: (chunk: string) => void;
}

export interface AgentExecutionResult {
  runId: string;
  output: string;
  toolsUsed: string[];
  metrics: {
    durationMs: number;
    promptTokens?: number;
    completionTokens?: number;
  };
}

export class HermesAgent {
  constructor(
    public readonly definition: AgentDefinition,
    public readonly sessionContext: AgentSessionContext,
    public readonly tools: string[],
  ) {}

  public get name(): string {
    return this.definition.frontmatter.name;
  }

  public get type(): string {
    return this.definition.frontmatter.type;
  }

  public get model(): string {
    return this.definition.frontmatter.model;
  }

  public get systemPrompt(): string {
    return this.definition.systemPrompt;
  }

  /**
   * Executes the agent workflow given message context.
   */
  async execute(options: AgentExecutionOptions): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const runId = `run_${Math.random().toString(36).substring(2, 11)}`;

    // Build effective prompt context
    const fullSystemPrompt = `${this.definition.systemPrompt}\n\n[Session Metadata]: ${JSON.stringify(
      this.sessionContext,
    )}`;

    // Return structured run output (simulated execution bridge)
    const simulatedOutput = `Agent [${this.name}] executed successfully for run ${runId}.`;

    if (options.onChunk) {
      options.onChunk(simulatedOutput);
    }

    return {
      runId,
      output: simulatedOutput,
      toolsUsed: this.tools,
      metrics: {
        durationMs: Date.now() - startTime,
      },
    };
  }
}

export class AgentBuilder {
  private definition?: AgentDefinition;
  private sessionContext?: AgentSessionContext;
  private additionalTools: string[] = [];

  static create(): AgentBuilder {
    return new AgentBuilder();
  }

  fromDefinition(definition: AgentDefinition): this {
    this.definition = definition;
    return this;
  }

  fromMarkdown(rawMarkdown: string): this {
    this.definition = parseAgentDefinition(rawMarkdown);
    return this;
  }

  withSessionContext(context: AgentSessionContext): this {
    this.sessionContext = context;
    return this;
  }

  withTools(tools: string[]): this {
    this.additionalTools.push(...tools);
    return this;
  }

  build(): HermesAgent {
    if (!this.definition) {
      throw new Error("AgentBuilder error: agent definition must be specified.");
    }
    if (!this.sessionContext) {
      throw new Error("AgentBuilder error: sessionContext must be specified.");
    }

    const allTools = Array.from(
      new Set([...(this.definition.frontmatter.tools || []), ...this.additionalTools]),
    );

    return new HermesAgent(this.definition, this.sessionContext, allTools);
  }
}
