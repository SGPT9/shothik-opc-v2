import { describe, expect, it } from "vitest";
import { parseAgentDefinition } from "../definition";
import { AgentBuilder } from "../builder";

describe("Hermes Agent Definition & Builder", () => {
  it("parses raw markdown with YAML frontmatter correctly", () => {
    const rawMarkdown = `---
name: "Research Agent"
description: "Specialized in academic literature review"
type: "research"
model: "gemini-2.5-flash"
tools: ["literature-search", "citation-generator"]
temperature: 0.2
---

# System Prompt
You are an expert academic research assistant.
`;

    const parsed = parseAgentDefinition(rawMarkdown);

    expect(parsed.frontmatter.name).toBe("Research Agent");
    expect(parsed.frontmatter.type).toBe("research");
    expect(parsed.frontmatter.tools).toEqual(["literature-search", "citation-generator"]);
    expect(parsed.frontmatter.temperature).toBe(0.2);
    expect(parsed.systemPrompt).toContain("You are an expert academic research assistant.");
  });

  it("handles fallback parsing when YAML frontmatter is absent", () => {
    const rawContent = "Just a raw system prompt string.";
    const parsed = parseAgentDefinition(rawContent);

    expect(parsed.frontmatter.name).toBe("General Agent");
    expect(parsed.frontmatter.type).toBe("chat");
    expect(parsed.systemPrompt).toBe(rawContent);
  });

  it("builds an Agent instance using AgentBuilder", async () => {
    const rawMarkdown = `---
name: "Writing Studio Assistant"
description: "Assists with manuscript editing"
type: "writing"
tools: ["grammar-check"]
---

Edit manuscript with precision.
`;

    const agent = AgentBuilder.create()
      .fromMarkdown(rawMarkdown)
      .withSessionContext({
        sessionId: "sess_123",
        workspaceId: "ws_123",
        userId: "user_123",
      })
      .withTools(["style-transfer"])
      .build();

    expect(agent.name).toBe("Writing Studio Assistant");
    expect(agent.type).toBe("writing");
    expect(agent.tools).toEqual(["grammar-check", "style-transfer"]);

    const result = await agent.execute({
      messages: [{ role: "user", content: "Check this paragraph." }],
    });

    expect(result.runId).toBeDefined();
    expect(result.output).toContain("Writing Studio Assistant");
  });
});
