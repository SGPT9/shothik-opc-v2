// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTwinHandoffDetector } from "../useTwinHandoffDetector";

describe("useTwinHandoffDetector — Multi-Signal Archetype Detection", () => {
  it("returns eligible: false when messages are fewer than 2", () => {
    const { result } = renderHook(() =>
      useTwinHandoffDetector([{ content: "Hello" }])
    );
    expect(result.current.eligible).toBe(false);
    expect(result.current.triggerType).toBe("NONE");
  });

  it("detects COMMERCE_LOGISTICS for courier and parcel queries", () => {
    const messages = [
      { content: "I am running an F-Commerce shop in Dhaka." },
      { content: "Can you help me track our Steadfast courier delivery parcels?" },
    ];
    const { result } = renderHook(() =>
      useTwinHandoffDetector(messages, "conv_123")
    );
    expect(result.current.eligible).toBe(true);
    expect(result.current.triggerType).toBe("COMMERCE_LOGISTICS");
    expect(result.current.title).toContain("Parcel");
    expect(result.current.targetUrl).toContain("track=connect");
    expect(result.current.targetUrl).toContain("channel=courier");
  });

  it("detects COMMERCE_LOGISTICS for Bengali courier terms", () => {
    const messages = [
      { content: "আমার শপে অনেক অর্ডার আসে" },
      { content: "পাঠাও কুরিয়ার এর পার্সেল স্ট্যাটাস কি চেক করা যাবে?" },
    ];
    const { result } = renderHook(() =>
      useTwinHandoffDetector(messages, "conv_bn_1")
    );
    expect(result.current.eligible).toBe(true);
    expect(result.current.triggerType).toBe("COMMERCE_LOGISTICS");
  });

  it("detects ACADEMIC_PUBLISHING for thesis and monograph manuscripts", () => {
    const messages = [
      { content: "I am writing my university dissertation and literature review." },
      { content: "Here is the bibliography and chapter draft for academic publishing." },
    ];
    const { result } = renderHook(() =>
      useTwinHandoffDetector(messages, "conv_thesis")
    );
    expect(result.current.eligible).toBe(true);
    expect(result.current.triggerType).toBe("ACADEMIC_PUBLISHING");
    expect(result.current.actionText).toContain("Book Preview");
  });

  it("detects VENTURE_OPPORTUNITY for market gap and pitch deck prompts", () => {
    const messages = [
      { content: "I discovered an underserved market gap in South Asia." },
      { content: "Help me calculate the TAM SAM SOM and prepare an investor pitch deck." },
    ];
    const { result } = renderHook(() =>
      useTwinHandoffDetector(messages, "conv_startup")
    );
    expect(result.current.eligible).toBe(true);
    expect(result.current.triggerType).toBe("VENTURE_OPPORTUNITY");
    expect(result.current.targetUrl).toContain("track=build");
  });

  it("detects REPETITION_WORKFLOW for scheduled and recurring requests", () => {
    const messages = [
      { content: "I need to run daily report summaries every monday." },
      { content: "Can we automate this recurring workflow with nightshift?" },
    ];
    const { result } = renderHook(() =>
      useTwinHandoffDetector(messages, "conv_sched")
    );
    expect(result.current.eligible).toBe(true);
    expect(result.current.triggerType).toBe("REPETITION_WORKFLOW");
    expect(result.current.targetUrl).toContain("tab=nightshift");
  });

  it("detects SPRINT_EXECUTION when markdown roadmap headings are present", () => {
    const messages = [
      { content: "Can you plan the architecture?" },
      { content: "### Strategic execution roadmap\n1. Setup database\n2. Build API" },
    ];
    const { result } = renderHook(() =>
      useTwinHandoffDetector(messages, "conv_roadmap")
    );
    expect(result.current.eligible).toBe(true);
    expect(result.current.triggerType).toBe("SPRINT_EXECUTION");
  });

  it("detects DEVELOPER_TWIN for self-healing bug and AST refactoring queries", () => {
    const messages = [
      { content: "Our production build failed with a syntax error." },
      { content: "Can you run a self-heal Red-Green-Refactor loop and check AST blast radius?" },
    ];
    const { result } = renderHook(() =>
      useTwinHandoffDetector(messages, "conv_dev_1")
    );
    expect(result.current.eligible).toBe(true);
    expect(result.current.triggerType).toBe("DEVELOPER_TWIN");
    expect(result.current.serviceId).toBe(11);
    expect(result.current.targetUrl).toContain("tab=developer");
  });

  it("detects FINTECH_MFS for bKash and Nagad payment settlement queries", () => {
    const messages = [
      { content: "We received multiple customer orders today." },
      { content: "Need to reconcile bKash and Nagad merchant settlements and cashout fees." },
    ];
    const { result } = renderHook(() =>
      useTwinHandoffDetector(messages, "conv_mfs_1")
    );
    expect(result.current.eligible).toBe(true);
    expect(result.current.triggerType).toBe("FINTECH_MFS");
    expect(result.current.serviceId).toBe(12);
    expect(result.current.targetUrl).toContain("tab=mfs");
  });

  it("detects WRITING_CONTENT for paraphrasing and grammar requests", () => {
    const messages = [
      { content: "Here is an executive proposal." },
      { content: "Can you paraphrase and proofread this with proper grammar and tone?" },
    ];
    const { result } = renderHook(() =>
      useTwinHandoffDetector(messages, "conv_write_1")
    );
    expect(result.current.eligible).toBe(true);
    expect(result.current.triggerType).toBe("WRITING_CONTENT");
    expect(result.current.serviceId).toBe(3);
    expect(result.current.targetUrl).toContain("writing-studio");
  });
});
