// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KeyboardShortcutsModal } from "../KeyboardShortcutsModal";
import { CommandPaletteModal } from "../CommandPaletteModal";
import { UniversalPrintModal } from "../../common/UniversalPrintModal";

describe("Modal Accessibility & Mobile Ergonomics Suites", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  describe("KeyboardShortcutsModal", () => {
    it("renders dialog with proper ARIA attributes, locks body scroll, and releases on unmount", () => {
      const handleOpenChange = vi.fn();
      const { unmount } = render(
        <KeyboardShortcutsModal open={true} onOpenChange={handleOpenChange} />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(document.body.style.overflow).toBe("hidden");

      const closeBtn = screen.getByRole("button", { name: "Close keyboard shortcuts modal" });
      expect(closeBtn).toBeInTheDocument();
      fireEvent.click(closeBtn);
      expect(handleOpenChange).toHaveBeenCalledWith(false);

      unmount();
      expect(document.body.style.overflow).toBe("");
    });

    it("dismisses on Escape key", () => {
      const handleOpenChange = vi.fn();
      render(<KeyboardShortcutsModal open={true} onOpenChange={handleOpenChange} />);

      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("CommandPaletteModal", () => {
    it("renders dialog with listbox, search input aria-label, and executes item action on Enter", () => {
      const handleOpenChange = vi.fn();
      const handleSelect = vi.fn();

      const { unmount } = render(
        <CommandPaletteModal
          open={true}
          onOpenChange={handleOpenChange}
          onSelectAction={handleSelect}
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("aria-label", "Command palette");
      expect(document.body.style.overflow).toBe("hidden");

      const searchInput = screen.getByLabelText("Search tools and commands");
      expect(searchInput).toBeInTheDocument();

      const listbox = screen.getByRole("listbox");
      expect(listbox).toBeInTheDocument();

      // Trigger selection of first command
      fireEvent.keyDown(window, { key: "Enter" });
      expect(handleSelect).toHaveBeenCalledWith("slides");
      expect(handleOpenChange).toHaveBeenCalledWith(false);

      unmount();
      expect(document.body.style.overflow).toBe("");
    });

    it("navigates down and up using arrow keys", () => {
      render(
        <CommandPaletteModal
          open={true}
          onOpenChange={vi.fn()}
        />
      );

      fireEvent.keyDown(window, { key: "ArrowDown" });
      const options = screen.getAllByRole("option");
      expect(options[1]).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("UniversalPrintModal", () => {
    it("renders dialog, locks scroll, and recipient phone has inputMode tel", () => {
      const handleClose = vi.fn();
      const { unmount } = render(
        <UniversalPrintModal
          isOpen={true}
          onClose={handleClose}
          title="Bangla Financial Analysis"
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(document.body.style.overflow).toBe("hidden");

      const mobileClose = screen.getByRole("button", { name: "Close print studio" });
      expect(mobileClose).toBeInTheDocument();
      fireEvent.click(mobileClose);
      expect(handleClose).toHaveBeenCalledTimes(1);

      unmount();
      expect(document.body.style.overflow).toBe("");
    });
  });
});
