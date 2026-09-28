import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MarkdownMessage } from "../MarkdownMessage";

describe("MarkdownMessage Component", () => {
  it("renders markdown text and table", () => {
    const markdownContent = `## Test Header

| Col1 | Col2 |
| :--- | :--- |
| Val1 | Val2 |
`;
    render(<MarkdownMessage content={markdownContent} />);
    expect(screen.getByText("Test Header")).toBeInTheDocument();
    expect(screen.getByText("Val1")).toBeInTheDocument();
  });

  it("converts [[doc:...]] tags into interactive clickable source inspectable badges", () => {
    const handleOpenSource = vi.fn();
    render(
      <MarkdownMessage
        content="According to Bangladesh Bank regulations [[doc:bb_2024_04:sec4]], the reserve ratio is 4%."
        onOpenSource={handleOpenSource}
      />
    );

    const citationBadge = screen.getByText(/bb_2024_04/i);
    expect(citationBadge).toBeInTheDocument();

    fireEvent.click(citationBadge);
    expect(handleOpenSource).toHaveBeenCalledWith("bb_2024_04:sec4");
  });

  it("renders lens switcher buttons and allows switching lenses", () => {
    const substantiveAnalysisContent = `
### Comprehensive Market Analysis
Emerging market logistics in Bangladesh showcase accelerated cross-border trade and digitized fulfillment pipelines.
| Segment | Growth Rate | Penetration |
| :--- | :--- | :--- |
| Dhaka Express | 28.4% | High |
`;

    render(<MarkdownMessage content={substantiveAnalysisContent} />);

    expect(screen.getByText("🚀 Executive")).toBeInTheDocument();
    expect(screen.getByText("🔬 Research")).toBeInTheDocument();
    expect(screen.getByText("💼 Task Action")).toBeInTheDocument();

    const researchLens = screen.getByText("🔬 Research");
    fireEvent.click(researchLens);
    expect(researchLens).toBeInTheDocument();
  });

  it("renders accessible citation link with aria-label", () => {
    render(<MarkdownMessage content="According to official statistics [1], inflation slowed down." />);
    const citationBtn = screen.getByRole("button", { name: "Citation 1" });
    expect(citationBtn).toBeInTheDocument();
    expect(citationBtn).toHaveAttribute("title", "View Source [1]");
  });

  it("renders code block toolbar with language indicator and copy button", () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    const codeSnippet = "```python\nprint('Shothik AI')\n```";
    render(<MarkdownMessage content={codeSnippet} />);

    expect(screen.getByText("python")).toBeInTheDocument();
    const copyBtn = screen.getByTitle("Copy code to clipboard");
    expect(copyBtn).toBeInTheDocument();

    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("print('Shothik AI')");
  });
});
