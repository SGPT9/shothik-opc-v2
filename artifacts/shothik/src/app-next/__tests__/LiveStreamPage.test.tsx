import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LiveStreamPage from "../(primary-layout)/live/page";

describe("Polsia Live Stream Cockpit (/live)", () => {
  it("renders live stream header, global metrics, and active stream events", () => {
    render(<LiveStreamPage />);

    expect(screen.getByText(/Polsia Live Execution Stream/i)).toBeInTheDocument();
    expect(screen.getByText(/14 Startups/i)).toBeInTheDocument();
    expect(screen.getByText(/1,842 Shipped/i)).toBeInTheDocument();
    expect(screen.getByText(/140 Agents/i)).toBeInTheDocument();
    expect(screen.getByText(/Refactored bKash MFS webhook signature verification/i)).toBeInTheDocument();
  });

  it("filters stream events by category chip", () => {
    render(<LiveStreamPage />);

    const testChip = screen.getByRole("button", { name: "TEST" });
    fireEvent.click(testChip);

    expect(screen.getByText(/Executed vitest regression suite/i)).toBeInTheDocument();
    expect(screen.queryByText(/Refactored bKash MFS webhook signature/i)).not.toBeInTheDocument();
  });
});
