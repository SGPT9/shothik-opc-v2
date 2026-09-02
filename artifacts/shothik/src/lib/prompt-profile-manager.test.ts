/**
 * PromptProfileManager Unit Test Suite
 */

import { describe, it, expect } from "vitest";
import { promptProfileManager } from "./ai/prompt-profile-manager";

describe("PromptProfileManager (Intent-Aware System Prompt Injection)", () => {
  it("resolves NBR tax advisor profile for tax & VAT queries", () => {
    const profile = promptProfileManager.resolvePromptProfile("I need to calculate my NBR income tax and Mushak 6.3 VAT");
    expect(profile.profileId).toBe("nbr_tax_advisor");
    expect(profile.temperature).toBe(0.1);
  });

  it("resolves code architect profile for software architecture queries", () => {
    const profile = promptProfileManager.resolvePromptProfile("How do I refactor this API route and add unit tests?");
    expect(profile.profileId).toBe("code_architect");
    expect(profile.temperature).toBe(0.2);
  });
});
