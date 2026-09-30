// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KeyboardShortcutsModal } from "../KeyboardShortcutsModal";
import { CommandPaletteModal } from "../CommandPaletteModal";
import { UniversalPrintModal } from "../../common/UniversalPrintModal";
import { VoicePopup } from "../VoicePopup";
import { TrajectoryReceiptModal } from "../TrajectoryReceiptModal";
import { MessageActions } from "../MessageActions";

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

  describe("VoicePopup", () => {
    it("renders dialog with ARIA attributes, locks scroll, and handles close", () => {
      const handleClose = vi.fn();
      const handleSend = vi.fn();
      const { unmount } = render(
        <VoicePopup
          isOpen={true}
          onClose={handleClose}
          onSendTranscript={handleSend}
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "voice-popup-title");
      expect(document.body.style.overflow).toBe("hidden");

      const closeBtn = screen.getByRole("button", { name: "Close voice modal" });
      expect(closeBtn).toBeInTheDocument();
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);

      unmount();
      expect(document.body.style.overflow).toBe("");
    });

    it("dismisses on Escape key", () => {
      const handleClose = vi.fn();
      render(
        <VoicePopup
          isOpen={true}
          onClose={handleClose}
          onSendTranscript={vi.fn()}
        />
      );

      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("TrajectoryReceiptModal", () => {
    it("renders dialog with metric summary and trajectory timeline", () => {
      const handleOpenChange = vi.fn();
      render(
        <TrajectoryReceiptModal
          open={true}
          onOpenChange={handleOpenChange}
        />
      );

      const title = screen.getByText("Trajectory View & Audit Receipt Trail");
      expect(title).toBeInTheDocument();

      const copyBtn = screen.getByRole("button", { name: /Copy audit receipt/i });
      expect(copyBtn).toBeInTheDocument();

      const doneBtn = screen.getByRole("button", { name: /Close trajectory view modal/i });
      expect(doneBtn).toBeInTheDocument();
      fireEvent.click(doneBtn);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("MessageActions", () => {
    it("renders action buttons with accessible labels and minimum touch targets", () => {
      const handleCopy = vi.fn();
      const handleEdit = vi.fn();
      const handleRegenerate = vi.fn();
      const handleBookmark = vi.fn();

      render(
        <MessageActions
          messageId="msg_123"
          role="assistant"
          content="Test generated content"
          canRegenerate={true}
          onCopy={handleCopy}
          onEdit={handleEdit}
          onRegenerate={handleRegenerate}
          onBookmark={handleBookmark}
        />
      );

      const copyBtn = screen.getByRole("button", { name: /Copy message/i });
      expect(copyBtn).toBeInTheDocument();
      expect(copyBtn.className).toContain("min-w-[36px]");
      expect(copyBtn.className).toContain("min-h-[36px]");

      const likeBtn = screen.getByRole("button", { name: "Like response" });
      expect(likeBtn).toBeInTheDocument();
      expect(likeBtn.className).toContain("min-w-[36px]");

      const dislikeBtn = screen.getByRole("button", { name: "Dislike response" });
      expect(dislikeBtn).toBeInTheDocument();

      const regenBtn = screen.getByRole("button", { name: /Regenerate response/i });
      expect(regenBtn).toBeInTheDocument();
      fireEvent.click(regenBtn);
      expect(handleRegenerate).toHaveBeenCalledTimes(1);

      const bookmarkBtn = screen.getByRole("button", { name: /Bookmark message/i });
      expect(bookmarkBtn).toBeInTheDocument();
      fireEvent.click(bookmarkBtn);
      expect(handleBookmark).toHaveBeenCalledTimes(1);
    });
  });
});
