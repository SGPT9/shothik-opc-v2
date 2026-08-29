/**
 * Shothik Multi-Agent Skill Composition & Claimed-Action Guard
 * Adapted from GenOffice (Apache-2.0)
 * Allows dynamically composable skills with hallucinatory claim detection & correction.
 */

export interface AgentToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface AgentToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolExecution {
  output: string;
  isError?: boolean;
  mutated?: boolean;
  summary: string;
  display?: {
    kind: 'images' | 'links' | 'text';
    items?: Array<{ url: string; title?: string; thumb?: string }>;
    text?: string;
  };
}

export interface ExecutedToolCall {
  name: string;
  ok: boolean;
}

export interface AgentSkill {
  id: string;
  systemPrompt: string;
  tools: AgentToolDef[];
  buildContext?(): string;
  executeTool(call: AgentToolCall, signal?: AbortSignal): ToolExecution | Promise<ToolExecution>;
  verifyResponse?(finalText: string, executed: readonly ExecutedToolCall[]): string | null;
}

/**
 * Composes multiple skills into one unified agent persona.
 */
export function composeSkills(id: string, intro: string, skills: AgentSkill[]): AgentSkill {
  const ownerOf = (name: string): AgentSkill | undefined =>
    skills.find((skill) => skill.tools.some((tool) => tool.name === name));

  return {
    id,
    get systemPrompt() {
      return [intro, ...skills.map((s) => s.systemPrompt)].filter(Boolean).join('\n\n');
    },
    get tools() {
      const all = skills.flatMap((s) => s.tools);
      const seen = new Set<string>();
      for (const tool of all) {
        if (seen.has(tool.name)) throw new Error(`Duplicate tool name in skill composition: ${tool.name}`);
        seen.add(tool.name);
      }
      return all;
    },
    buildContext: () =>
      skills
        .map((s) => s.buildContext?.() ?? '')
        .filter(Boolean)
        .join('\n\n'),
    executeTool: (call, signal) => {
      const skill = ownerOf(call.name);
      if (!skill) {
        return { output: `Unknown tool: ${call.name}`, isError: true, summary: call.name };
      }
      return skill.executeTool(call, signal);
    },
    verifyResponse: (finalText, executed) => {
      for (const skill of skills) {
        const correction = skill.verifyResponse?.(finalText, executed);
        if (correction) return correction;
      }
      return null;
    },
  };
}

/**
 * Standard Claimed-Action Guard:
 * Detects phrases claiming action was performed when no corresponding mutation tool was executed.
 */
export function createClaimActionGuard(
  mutationKeywords: string[],
  requiredTools: string[]
): (finalText: string, executed: readonly ExecutedToolCall[]) => string | null {
  return (finalText: string, executed: readonly ExecutedToolCall[]) => {
    const lower = finalText.toLowerCase();
    const claimsAction = mutationKeywords.some((keyword) => lower.includes(keyword.toLowerCase()));
    const executedRequired = executed.some((tool) => tool.ok && requiredTools.includes(tool.name));

    if (claimsAction && !executedRequired) {
      return `SYSTEM CORRECTION: Your response claimed you performed an update/action, but you did not execute any of the required tools ([${requiredTools.join(', ')}]). Please call the appropriate tool now to actually apply the changes.`;
    }
    return null;
  };
}
