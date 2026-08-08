// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ArtifactPane } from "../ArtifactPane";

vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div data-testid="md">{children}</div>,
}));

describe("ArtifactPane", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (URL as any).createObjectURL = vi.fn(() => "blob:mock");
    (URL as any).revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders chat-produced markdown content instead of demo data", () => {
    render(
      <ArtifactPane
        isOpen
        onClose={() => {}}
        artifactType="markdown"
        content="# Real generated output"
        title="Generated Output"
      />,
    );

    expect(screen.getByText(/Real generated output/)).toBeTruthy();
    expect(screen.queryByText(/Waiting for artifact/)).toBeNull();
  });

  it("shows an empty state and no export button when there is no content", () => {
    render(<ArtifactPane isOpen onClose={() => {}} artifactType="sheet" />);

    expect(screen.getByText(/Waiting for artifact/)).toBeTruthy();
    expect(screen.queryByTitle("Export")).toBeNull();
    // No fabricated sheet metrics remain
    expect(screen.queryByText(/Revenue/)).toBeNull();
    expect(screen.queryByText(/Q1 2024/)).toBeNull();
  });

  it("exports the real artifact content as a download", () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(
      <ArtifactPane
        isOpen
        onClose={() => {}}
        artifactType="markdown"
        content="# Export me"
        title="My Report"
      />,
    );

    fireEvent.click(screen.getByTitle("Export"));

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");
    clickSpy.mockRestore();
  });

  it("paginates structured pdf pages from real content", () => {
    render(
      <ArtifactPane
        isOpen
        onClose={() => {}}
        artifactType="pdf"
        content={"Page one\n---\nPage two"}
        pdfPages={[{ content: "Page one" }, { content: "Page two" }]}
      />,
    );

    expect(screen.getByText("Page 1 of 2")).toBeTruthy();
    expect(screen.getByText("Page one")).toBeTruthy();
  });
});
