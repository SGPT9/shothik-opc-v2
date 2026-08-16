// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { EmptyChatGreeting } from "@/components/chat/EmptyChatGreeting";

describe("EmptyChatGreeting — Ask-First DeepSeek-Close Shell", () => {
  it("renders Ask-First hero title 'What do you want to accomplish today?'", () => {
    render(<EmptyChatGreeting />);

    expect(screen.getByText("What do you want to accomplish today?")).toBeInTheDocument();
    expect(screen.getByText(/Ask a question, research deeply/i)).toBeInTheDocument();
  });

  it("renders 3 intent-first starter prompt cards (Research, Analysis, Create)", () => {
    render(<EmptyChatGreeting />);

    expect(screen.getByText("Research")).toBeInTheDocument();
    expect(screen.getByText("Analysis")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
  });
});
