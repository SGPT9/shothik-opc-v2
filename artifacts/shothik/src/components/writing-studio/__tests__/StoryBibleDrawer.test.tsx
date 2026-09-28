// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StoryBibleDrawer } from "../StoryBibleDrawer";

describe("StoryBibleDrawer Component Suite", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  it("renders when open, applies scroll lock, and shows lore entries", async () => {
    const handleClose = vi.fn();
    const { unmount } = render(
      <StoryBibleDrawer isOpen={true} onClose={handleClose} projectId="test-proj" />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(document.body.style.overflow).toBe("hidden");

    expect(screen.getByText("Story Bible & Lore Vault")).toBeInTheDocument();
    expect(screen.getByLabelText("Search characters, lore, hooks")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Dr. Elena Vance")).toBeInTheDocument();
    });

    const closeBtn = screen.getByRole("button", { name: "Close story bible drawer" });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("dismisses cleanly on Escape key", () => {
    const handleClose = vi.fn();
    render(<StoryBibleDrawer isOpen={true} onClose={handleClose} projectId="test-proj" />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
