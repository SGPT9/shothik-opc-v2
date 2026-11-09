// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

import { FloatingSelectionToolbar } from "../FloatingSelectionToolbar";

describe("FloatingSelectionToolbar", () => {
  it("renders null when there is no text selection", () => {
    const containerRef = { current: document.createElement("div") };
    const { container } = render(
      <FloatingSelectionToolbar
        containerRef={containerRef}
        onTransform={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("triggers onTransform when an action is clicked", async () => {
    const containerRef = { current: document.createElement("div") };
    const handleTransform = vi.fn();

    // Mock window.getSelection
    const mockRange = {
      getBoundingClientRect: () => ({
        top: 200,
        left: 150,
        width: 100,
        height: 20,
      }),
    };

    const mockSelection = {
      isCollapsed: false,
      toString: () => "The quick brown fox",
      getRangeAt: () => mockRange,
    };

    vi.spyOn(window, "getSelection").mockReturnValue(mockSelection as any);

    render(
      <FloatingSelectionToolbar
        containerRef={containerRef}
        onTransform={handleTransform}
      />
    );

    // Trigger selection change event
    fireEvent(document, new Event("selectionchange"));

    // Verify action buttons appear
    const polishBtn = screen.getByRole("button", { name: /Polish phrasing/i });
    expect(polishBtn).toBeInTheDocument();

    fireEvent.click(polishBtn);
    expect(handleTransform).toHaveBeenCalledWith("polish", "The quick brown fox", "");
  });
});
