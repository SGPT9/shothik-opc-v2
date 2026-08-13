// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { ChatGPTVoiceOrbModal } from "../ChatGPTVoiceOrbModal";

describe("ChatGPTVoiceOrbModal UI Component", () => {
  it("renders ChatGPT Voice Mode header and 1-tap real-world voice action triggers", () => {
    render(<ChatGPTVoiceOrbModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/ChatGPT Voice Mode — Shothik Execution/i)).toBeDefined();
    expect(screen.getByText(/bKash Verify/i)).toBeDefined();
    expect(screen.getByText(/Courier Book/i)).toBeDefined();
    expect(screen.getByText(/NBR Form 11GA/i)).toBeDefined();
  });
});
