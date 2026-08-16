import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DocArtifact, DocumentPage } from "../DocArtifact";

const MOCK_PAGES: DocumentPage[] = [
  {
    pageNumber: 1,
    title: "Market Analysis 2026",
    content: "South Asian emerging markets demonstrate massive momentum in digital commerce.",
    bbox: [120, 80, 380, 920],
  },
  {
    pageNumber: 2,
    title: "Financial Projections",
    content: "Target Addressable Market (TAM): $2.4B with 75.4% gross margin.",
    bbox: [150, 100, 420, 900],
  },
];

describe("DocArtifact Component", () => {
  it("renders initial document title, page 1 content, and grounding box active status", () => {
    render(
      <DocArtifact
        initialTitle="Test Document Brief"
        pages={MOCK_PAGES}
        targetPage={1}
      />
    );

    expect(screen.getByText("Test Document Brief")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByText(/South Asian emerging markets demonstrate massive momentum/i)).toBeInTheDocument();
    expect(screen.getByText("Grounding Box Active")).toBeInTheDocument();
    expect(screen.getByText("Cited Evidence")).toBeInTheDocument();
  });

  it("navigates to next and previous pages using pagination controls and bottom page strip", () => {
    render(
      <DocArtifact
        initialTitle="Test Document Brief"
        pages={MOCK_PAGES}
        targetPage={1}
      />
    );

    // Click Next Page button
    const nextBtn = screen.getByRole("button", { name: /Next Page/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getByText(/Target Addressable Market \(TAM\): \$2\.4B/i)).toBeInTheDocument();

    // Click Previous Page button
    const prevBtn = screen.getByRole("button", { name: /Previous Page/i });
    fireEvent.click(prevBtn);

    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByText(/South Asian emerging markets demonstrate massive momentum/i)).toBeInTheDocument();

    // Click Page 2 button from bottom strip
    const page2Btn = screen.getAllByRole("button", { name: /Page 2/i })[0];
    fireEvent.click(page2Btn);

    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
  });

  it("handles zoom level changes", () => {
    render(
      <DocArtifact
        initialTitle="Test Document Brief"
        pages={MOCK_PAGES}
      />
    );

    expect(screen.getByText("100%")).toBeInTheDocument();

    const zoomInBtn = screen.getByRole("button", { name: /Zoom in/i });
    fireEvent.click(zoomInBtn);

    expect(screen.getByText("115%")).toBeInTheDocument();

    const zoomOutBtn = screen.getByRole("button", { name: /Zoom out/i });
    fireEvent.click(zoomOutBtn);

    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("handles clipboard export", () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <DocArtifact
        initialTitle="Test Document Brief"
        pages={MOCK_PAGES}
      />
    );

    const exportBtn = screen.getByRole("button", { name: /Export/i });
    fireEvent.click(exportBtn);

    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining("Test Document Brief"));
    expect(screen.getByText("Copied")).toBeInTheDocument();
  });

  it("parses sourceRef coordinate grounding automatically", () => {
    render(
      <DocArtifact
        initialTitle="Test Document Brief"
        pages={MOCK_PAGES}
        sourceRef="Quarterly_Report.pdf:p2:150,220,400,280"
      />
    );

    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getByText("Grounding Box Active")).toBeInTheDocument();
  });
});
