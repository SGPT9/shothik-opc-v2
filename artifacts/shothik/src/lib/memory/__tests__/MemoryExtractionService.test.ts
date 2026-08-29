import { describe, expect, it, beforeEach } from "vitest";
import { MemoryExtractionService } from "../MemoryExtractionService";

describe("MemoryExtractionService Real-time Decision & Memory Stream", () => {
  let service: MemoryExtractionService;

  beforeEach(() => {
    service = new MemoryExtractionService();
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  });

  it("extracts business & pricing rules from agent outputs", () => {
    const prompt = "What are the courier delivery charges for Dhaka?";
    const response = "Inside Dhaka COD delivery charge is ৳70 (Steadfast/Pathao), Outside Dhaka ৳130. Advance courier fee required for high-value orders.";

    const extracted = service.extractDecisions({
      prompt,
      response,
      source: "chat",
    });

    expect(extracted.length).toBeGreaterThan(0);
    const businessRule = extracted.find((m) => m.category === "business_rules");
    expect(businessRule).toBeDefined();
    expect(businessRule?.title).toContain("Courier & Delivery");
    expect(businessRule?.autoLearned).toBe(true);
    expect(businessRule?.confidence).toBeGreaterThan(0.9);
  });

  it("extracts brand voice and tone preferences", () => {
    const prompt = "How should we talk to enterprise customers?";
    const response = "Speak in a formal tone and use Bangla-English hybrid phrasing for greetings.";

    const extracted = service.extractDecisions({
      prompt,
      response,
      source: "chat",
    });

    expect(extracted.length).toBeGreaterThan(0);
    const voiceTrait = extracted.find((m) => m.category === "brand_voice");
    expect(voiceTrait).toBeDefined();
    expect(voiceTrait?.tags).toContain("voice");
  });

  it("extracts founder directives and operational boundaries", () => {
    const prompt = "Can the AI issue refunds?";
    const response = "Founder preference: Twin can autonomously issue replacement vouchers up to ৳200 without manual approval.";

    const extracted = service.extractDecisions({
      prompt,
      response,
      source: "task",
    });

    expect(extracted.length).toBeGreaterThan(0);
    const directive = extracted.find((m) => m.category === "founder_preference");
    expect(directive).toBeDefined();
    expect(directive?.title).toContain("Executive Operational Directive");
  });

  it("enforces zero secret persistence by stripping sensitive tokens", () => {
    const raw = "The API key is sk-123456789012345678901234567890123456789012345678 and GitHub ghp_123456789012345678901234567890123456";
    const sanitized = service.sanitizeSecrets(raw);

    expect(sanitized).not.toContain("sk-123456789012345678901234567890123456789012345678");
    expect(sanitized).not.toContain("ghp_123456789012345678901234567890123456");
    expect(sanitized).toContain("••••••••");
  });

  it("deduplicates memories during commit", () => {
    const candidate1 = {
      id: "mem-test-1",
      category: "business_rules" as const,
      title: "Delivery Fee Policy",
      detail: "Inside Dhaka delivery fee is 70 taka",
      confidence: 0.95,
      source: "chat" as const,
      tags: ["delivery"],
      createdAt: new Date().toISOString(),
      lastUpdated: "Just now",
    };

    const addedFirst = service.commitMemories([candidate1]);
    expect(addedFirst.length).toBe(1);

    // Second commit with identical title should be de-duplicated
    const addedSecond = service.commitMemories([candidate1]);
    expect(addedSecond.length).toBe(0);
  });
});
