import { z } from "zod";

export const AgentTypeSchema = z.enum([
  "chat",
  "slides",
  "sheets",
  "research",
  "writing",
]);

export type AgentType = z.infer<typeof AgentTypeSchema>;

export const AgentFrontmatterSchema = z.object({
  name: z.string().min(1, "Agent name is required"),
  description: z.string(),
  type: AgentTypeSchema,
  version: z.string().default("1.0.0"),
  model: z.string().default("gemini-2.5-flash"),
  tools: z.array(z.string()).default([]),
  capabilities: z.array(z.string()).default([]),
  maxTokens: z.number().positive().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  metadata: z.record(z.unknown()).optional(),
});

export type AgentFrontmatter = z.infer<typeof AgentFrontmatterSchema>;

export interface AgentDefinition {
  frontmatter: AgentFrontmatter;
  systemPrompt: string;
  rawContent: string;
}

/**
 * Parses raw markdown agent content with optional YAML frontmatter.
 */
export function parseAgentDefinition(rawContent: string): AgentDefinition {
  const frontmatterMatch = rawContent.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/);

  if (!frontmatterMatch) {
    // Default fallback definition when no YAML frontmatter is present
    return {
      frontmatter: {
        name: "General Agent",
        description: "General-purpose Hermes AI Agent",
        type: "chat",
        version: "1.0.0",
        model: "gemini-2.5-flash",
        tools: [],
        capabilities: ["chat"],
        temperature: 0.7,
      },
      systemPrompt: rawContent.trim(),
      rawContent,
    };
  }

  const [, yamlBlock, body] = frontmatterMatch;
  const parsedYaml: Record<string, unknown> = {};

  // Simple key-value YAML parser for agent frontmatter headers
  yamlBlock.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) return;

    const key = trimmed.slice(0, colonIndex).trim();
    let value: unknown = trimmed.slice(colonIndex + 1).trim();

    // Handle JSON arrays or simple string arrays
    if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
      try {
        value = JSON.parse(value);
      } catch {
        value = value.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
      }
    } else if (value === "true") {
      value = true;
    } else if (value === "false") {
      value = false;
    } else if (!isNaN(Number(value)) && value !== "") {
      value = Number(value);
    } else if (typeof value === "string") {
      value = value.replace(/^["']|["']$/g, "");
    }

    parsedYaml[key] = value;
  });

  const frontmatter = AgentFrontmatterSchema.parse(parsedYaml);

  return {
    frontmatter,
    systemPrompt: body.trim(),
    rawContent,
  };
}
