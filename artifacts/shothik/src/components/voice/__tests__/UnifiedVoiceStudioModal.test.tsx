// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UnifiedVoiceStudioModal } from "../UnifiedVoiceStudioModal";

describe("UnifiedVoiceStudioModal UI Component", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  it("renders when open and applies body scroll lock", () => {
    const handleClose = vi.fn();
    const { unmount } = render(<UnifiedVoiceStudioModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText(/Shothik 4.5 ⚡ Advanced Voice/i)).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    // Accessible buttons check
    expect(screen.getByRole("button", { name: "End Voice & Vision Session" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mute Microphone/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Turn On Camera Vision/i })).toBeInTheDocument();

    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes cleanly when Escape key is pressed", () => {
    const handleClose = vi.fn();
    render(<UnifiedVoiceStudioModal isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("does not render when isOpen is false", () => {
    render(<UnifiedVoiceStudioModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText(/Shothik 4.5 ⚡ Advanced Voice/i)).not.toBeInTheDocument();
  });
});
