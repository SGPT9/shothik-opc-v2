// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { PerplexitySourcesGrid } from "../PerplexitySourcesGrid";
import { PerplexityFocusSelector } from "../PerplexityFocusSelector";
import { PerplexityRelatedQueries } from "../PerplexityRelatedQueries";

describe("Perplexity UI Components", () => {
  it("renders Perplexity Sources Grid with domain cards", () => {
    render(<PerplexitySourcesGrid />);

    expect(screen.getByText(/Sources/i)).toBeDefined();
    expect(screen.getByText(/chaldal.com/i)).toBeDefined();
    expect(screen.getByText(/shopup.com.bd/i)).toBeDefined();
  });

  it("renders Perplexity Focus Mode Selector options", () => {
    render(<PerplexityFocusSelector currentFocus="all" onSelectFocus={vi.fn()} />);

    expect(screen.getByText(/All Web/i)).toBeDefined();
    expect(screen.getByText(/Pro Search/i)).toBeDefined();
    expect(screen.getByText(/Academic/i)).toBeDefined();
  });

  it("renders Perplexity Related Questions pills", () => {
    render(
      <PerplexityRelatedQueries
        queries={["How to verify a bKash TrxID instantly?", "What are the Steadfast delivery zones?"]}
        onSelectQuery={vi.fn()}
      />
    );

    expect(screen.getByText(/Suggested Next Questions/i)).toBeDefined();
    expect(screen.getByText(/bKash TrxID/i)).toBeDefined();
  });
});
