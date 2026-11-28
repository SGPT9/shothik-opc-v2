import { describe, it, expect } from "vitest";
import { AGENT_SUB_ITEMS } from "@/components/partials/top-tool-tab-bar";

describe("TopToolTabBar Agent Links Audit", () => {
  it("routes AI Chat to root universal canvas", () => {
    const chat = AGENT_SUB_ITEMS.find((item) => item.id === "chat");
    expect(chat).toBeDefined();
    expect(chat?.path).toBe("/");
  });

  it("preserves ?tab=slides query param for AI Slides", () => {
    const slides = AGENT_SUB_ITEMS.find((item) => item.id === "slides");
    expect(slides).toBeDefined();
    expect(slides?.path).toBe("/?tab=slides");
  });

  it("preserves ?tab=sheet query param for AI Sheets", () => {
    const sheets = AGENT_SUB_ITEMS.find((item) => item.id === "sheets");
    expect(sheets).toBeDefined();
    expect(sheets?.path).toBe("/?tab=sheet");
  });

  it("routes Deep Research to dedicated /research page", () => {
    const research = AGENT_SUB_ITEMS.find((item) => item.id === "research");
    expect(research).toBeDefined();
    expect(research?.path).toBe("/research");
  });
});
