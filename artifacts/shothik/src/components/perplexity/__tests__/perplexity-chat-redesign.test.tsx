// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { EmptyChatGreeting } from "@/components/chat/EmptyChatGreeting";

describe("EmptyChatGreeting — Ask-First DeepSeek-Close Shell", () => {
  it("renders Ask-First hero title 'How can Shothik help you today?'", () => {
    render(<EmptyChatGreeting />);

    expect(screen.getByText("How can Shothik help you today?")).toBeInTheDocument();
    expect(screen.getByText(/Ask questions, research topics, write drafts, or create plans/i)).toBeInTheDocument();
  });

  it("renders 3 intent-first starter prompt categories (Commerce, Academic, Venture)", () => {
    render(<EmptyChatGreeting />);

    expect(screen.getByText("Commerce")).toBeInTheDocument();
    expect(screen.getByText("Academic")).toBeInTheDocument();
    expect(screen.getByText("Venture")).toBeInTheDocument();
  });
});
