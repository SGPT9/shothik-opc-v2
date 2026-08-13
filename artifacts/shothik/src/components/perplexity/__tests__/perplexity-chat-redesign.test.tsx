// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { EmptyChatGreeting } from "@/components/chat/EmptyChatGreeting";

describe("Perplexity /agents/chat Hero Redesign", () => {
  it("renders Perplexity hero title 'Where knowledge begins.'", () => {
    render(<EmptyChatGreeting />);

    expect(screen.getByText("Where knowledge begins.")).toBeDefined();
    expect(screen.getByText("Shothik Intelligence")).toBeDefined();
  });

  it("renders starter prompt chips with rounded-2xl glassmorphic cards", () => {
    render(<EmptyChatGreeting />);

    expect(screen.getAllByText("Pro Search: TAM Market Sizing")[0]).toBeDefined();
    expect(screen.getAllByText("3-Scenario Financial Model")[0]).toBeDefined();
  });
});
