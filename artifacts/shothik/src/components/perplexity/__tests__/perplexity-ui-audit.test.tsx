// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { PerplexitySourcesGrid } from "../PerplexitySourcesGrid";
import { PerplexityFocusSelector } from "../PerplexityFocusSelector";

describe("Perplexity UI/UX Audit & Consistency Polish", () => {
  it("verifies PerplexitySourcesGrid uses rounded-2xl glassmorphic cards", () => {
    render(<PerplexitySourcesGrid />);

    const link = screen.getByRole("link", { name: /Chaldal/i });
    expect(link.className).toContain("rounded-2xl");
    expect(link.className).toContain("backdrop-blur-md");
  });

  it("verifies PerplexityFocusSelector active tab highlighting", () => {
    render(<PerplexityFocusSelector currentFocus="pro_search" onSelectFocus={() => {}} />);

    const activeBtn = screen.getByRole("button", { name: /Pro Search/i });
    expect(activeBtn.className).toContain("bg-muted/80");
    expect(activeBtn.className).toContain("text-foreground");
  });
});
