import { describe, it, expect } from "vitest";
import {
  detectVariables,
  extractTemplateVariables,
  interpolateVariables,
} from "../prompt-variables";

describe("prompt-variables", () => {
  it("detects template variables in text", () => {
    expect(detectVariables("Tell me a story about {{hero}}")).toBe(true);
    expect(detectVariables("Today is {{date}}")).toBe(false); // special variable only
    expect(detectVariables("Plain text without variables")).toBe(false);
  });

  it("extracts unique user variables", () => {
    const text = "Write a {{tone}} essay on {{topic}} for {{audience}}. Be {{tone}}.";
    const vars = extractTemplateVariables(text);
    expect(vars).toEqual(["tone", "topic", "audience"]);
  });

  it("interpolates variables correctly", () => {
    const text = "Hello {{name}}, welcome to {{place}}! Today is {{date}}.";
    const result = interpolateVariables(text, { name: "Alice", place: "Dhaka" });
    expect(result).toContain("Hello Alice, welcome to Dhaka! Today is ");
  });
});
