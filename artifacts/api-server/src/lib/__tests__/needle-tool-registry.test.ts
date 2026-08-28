import { describe, it, expect } from "vitest";
import { NeedleToolRegistry } from "../needle-tool-registry";
import { LiveWebKnowledgeEngine } from "../live-web-knowledge";

describe("NeedleToolRegistry Suite", () => {
  it("resolves 2026 Bangladesh Prime Minister correctly", () => {
    const res = NeedleToolRegistry.matchAndExecute("who is the prime minister of bangladesh?");
    expect(res).not.toBeNull();
    expect(res?.toolName).toBe("bangladesh_governance_info");
    expect(res?.output).toContain("Tarique Rahman");
    expect(res?.output).toContain("February 17, 2026");
  });

  it("handles compound query: Tarique Rahman + Democracy", () => {
    const res = NeedleToolRegistry.matchAndExecute("who is tareq rahman and explain me what democracy is");
    expect(res).not.toBeNull();
    expect(res?.output).toContain("Tarique Rahman");
    expect(res?.output).toContain("What is Democracy?");
    expect(res?.output).toContain("Core Pillars of a Functional Democracy");
  });

  it("resolves standalone democracy inquiry", () => {
    const res = NeedleToolRegistry.matchAndExecute("what is democracy");
    expect(res).not.toBeNull();
    expect(res?.toolName).toBe("explain_democracy");
    expect(res?.output).toContain("Rule of Law");
    expect(res?.output).toContain("Separation of Powers");
  });

  it("calculates live currency exchange rates", () => {
    const res = NeedleToolRegistry.matchAndExecute("what is dollar rate today");
    expect(res).not.toBeNull();
    expect(res?.toolName).toBe("get_currency_rate");
    expect(res?.output).toContain("USD / BDT");
    expect(res?.output).toContain("121.50");
  });

  it("handles incremental slide addition without resetting state", () => {
    const res = NeedleToolRegistry.matchAndExecute("Add a slide on ESG and Compliance");
    expect(res).not.toBeNull();
    expect(res?.toolName).toBe("mutate_slides");
    expect(res?.output).toContain("Incremental Slide Added");
    expect(res?.output).toContain("Esg and compliance");
  });

  it("resolves multi-turn pronouns in LiveWebKnowledgeEngine", () => {
    const history = [
      { role: "user", content: "Who is Elon Musk?" },
      { role: "assistant", content: "### 🚀 Elon Musk is the CEO of Tesla and SpaceX." }
    ];
    const resolved = LiveWebKnowledgeEngine.resolveMultiTurnQuery("How old is he?", history);
    expect(resolved).toContain("Elon Musk");
  });
});
