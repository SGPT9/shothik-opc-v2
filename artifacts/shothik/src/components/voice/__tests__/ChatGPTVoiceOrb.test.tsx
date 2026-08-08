import { describe, it, expect } from "vitest";
import React from "react";
import ChatGPTVoiceOrb from "../ChatGPTVoiceOrb";

describe("ChatGPTVoiceOrb Component", () => {
  it("should define ChatGPTVoiceOrb component function with LiveKit voice controls", () => {
    expect(ChatGPTVoiceOrb).toBeDefined();
    expect(typeof ChatGPTVoiceOrb).toBe("function");
  });
});
