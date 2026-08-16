import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MarkdownMessage } from "../MarkdownMessage";

describe("MarkdownMessage Component", () => {
  it("renders standard markdown text and table", () => {
    const content = `
### Executive Summary
| Metric | Q1 2024 | Q2 2024 |
| :--- | :--- | :--- |
| MRR | $12,000 | $18,500 |
`;

    render(<MarkdownMessage content={content} />);

    expect(screen.getByText("Executive Summary")).toBeInTheDocument();
    expect(screen.getByText("MRR")).toBeInTheDocument();
    expect(screen.getByText("$12,000")).toBeInTheDocument();
  });

  it("converts [[doc:...]] tags into interactive clickable source inspectable badges", () => {
    const handleOpenSource = vi.fn();
    const content = "Based on Section 4.2 [[doc:bb_2024_04:sec4]], the reserve ratio is 15%.";

    render(<MarkdownMessage content={content} onOpenSource={handleOpenSource} />);

    const citationBadge = screen.getByTitle(/bb_2024_04/i);
    expect(citationBadge).toBeInTheDocument();
    expect(citationBadge).toHaveTextContent("bb_2024_04");
    expect(citationBadge).toHaveTextContent("sec4");

    fireEvent.click(citationBadge);
    expect(handleOpenSource).toHaveBeenCalledWith("bb_2024_04:sec4");
  });

  it("renders lens switcher buttons and allows switching lenses", () => {
    render(<MarkdownMessage content="Sample answer content" />);

    expect(screen.getByText("🚀 Executive")).toBeInTheDocument();
    expect(screen.getByText("🔬 Research")).toBeInTheDocument();
    expect(screen.getByText("💼 Task Action")).toBeInTheDocument();

    const researchLens = screen.getByText("🔬 Research");
    fireEvent.click(researchLens);
    expect(researchLens.parentElement).toHaveClass("bg-cyan-500/20");
  });
});
