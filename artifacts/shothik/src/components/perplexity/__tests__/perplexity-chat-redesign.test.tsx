// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { EmptyChatGreeting } from "@/components/chat/EmptyChatGreeting";

describe("EmptyChatGreeting — Frontier Workspace Hero Shell", () => {
  it("renders hero title 'What are we building today?'", () => {
    render(<EmptyChatGreeting />);

    expect(screen.getByText("What are we building today?")).toBeInTheDocument();
    expect(screen.getByText(/Create AI-native spreadsheets, pitch decks, book manuscripts/i)).toBeInTheDocument();
  });

  it("renders capability category pills (All Capabilities, GenOffice Sheets, GenOffice Slides)", () => {
    render(<EmptyChatGreeting />);

    expect(screen.getByText(/All Capabilities/i)).toBeInTheDocument();
    expect(screen.getByText(/GenOffice Sheets/i)).toBeInTheDocument();
    expect(screen.getByText(/GenOffice Slides/i)).toBeInTheDocument();
  });
});
