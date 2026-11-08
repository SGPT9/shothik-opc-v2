import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import {
  FileAttachmentBar,
  estimateFileTokens,
  formatFileSize,
  type RichComposerAttachment,
} from "../FileAttachmentBar";

describe("FileAttachmentBar Component", () => {
  it("does not render when attachments list is empty", () => {
    const { container } = render(
      <FileAttachmentBar attachments={[]} onRemoveAttachment={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("calculates token estimates accurately for various file extensions", () => {
    expect(estimateFileTokens("contract.pdf", 32000)).toBeGreaterThan(5000);
    expect(estimateFileTokens("app.ts", 4000)).toBe(1000); // 4000 / 4
    expect(estimateFileTokens("photo.png", 500000)).toBe(258); // image tile pricing
  });

  it("formats file size in readable units", () => {
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(2 * 1024 * 1024)).toBe("2.0 MB");
  });

  it("renders attachment cards and handles remove clicks", () => {
    const handleRemove = vi.fn();
    const mockAttachments: RichComposerAttachment[] = [
      {
        id: "att-1",
        name: "Financial_Report.pdf",
        sizeBytes: 15000,
      },
      {
        id: "att-2",
        name: "engine.py",
        sizeBytes: 800,
      },
    ];

    render(
      <FileAttachmentBar
        attachments={mockAttachments}
        onRemoveAttachment={handleRemove}
        maxContextTokens={128000}
      />
    );

    expect(screen.getByText("Financial_Report.pdf")).toBeInTheDocument();
    expect(screen.getByText("engine.py")).toBeInTheDocument();
    expect(screen.getByText(/2 files • ~/)).toBeInTheDocument();

    const removeBtn = screen.getByRole("button", { name: "Remove Financial_Report.pdf" });
    fireEvent.click(removeBtn);

    expect(handleRemove).toHaveBeenCalledWith("att-1");
  });
});
