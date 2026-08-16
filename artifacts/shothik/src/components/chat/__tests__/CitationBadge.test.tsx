// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CitationBadge } from "../CitationBadge";

describe("CitationBadge Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders document title and section correctly", () => {
    render(<CitationBadge rawRef="User-seeks-assistance:p1-node-p1" />);

    expect(screen.getByText("User-seeks-assistance")).toBeInTheDocument();
    expect(screen.getByText("P.1-node-p1")).toBeInTheDocument();
  });

  it("fires onClick callback with clean document reference", () => {
    const onClick = vi.fn();
    render(<CitationBadge rawRef="#source:FinancialRoadmap:sec4" onClick={onClick} />);

    const badge = screen.getByRole("button");
    fireEvent.click(badge);

    expect(onClick).toHaveBeenCalledWith("FinancialRoadmap:sec4");
  });
});
