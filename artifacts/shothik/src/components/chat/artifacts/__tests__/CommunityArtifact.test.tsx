import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommunityArtifact } from "../CommunityArtifact";

describe("CommunityArtifact Component", () => {
  it("renders community showcase items and category filters", () => {
    render(<CommunityArtifact />);

    expect(screen.getByText(/Community Showcase & Public Artifacts/i)).toBeInTheDocument();
    expect(screen.getByText("10-Slide Investor Pitch Deck (South Asian F-Commerce)", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("ALL")).toBeInTheDocument();
    expect(screen.getByText("Slide Deck")).toBeInTheDocument();
    expect(screen.getByText("Financial Model")).toBeInTheDocument();
    expect(screen.getByText("Book Plan")).toBeInTheDocument();
  });

  it("filters items by category when category pill is clicked", () => {
    render(<CommunityArtifact />);

    // Click "Slide Deck"
    fireEvent.click(screen.getByText("Slide Deck"));

    expect(screen.getByText(/10-Slide Investor Pitch Deck/i)).toBeInTheDocument();
    expect(screen.queryByText(/Section 78 Rebate Calculator/i)).not.toBeInTheDocument();

    // Switch back to "ALL"
    fireEvent.click(screen.getByText("ALL"));
    expect(screen.getByText(/Section 78 Rebate Calculator/i)).toBeInTheDocument();
  });

  it("toggles like count when heart button is clicked", () => {
    render(<CommunityArtifact />);

    // Find like button for first post (142 likes)
    const likeButtons = screen.getAllByRole("button", { name: /142/i });
    expect(likeButtons.length).toBeGreaterThan(0);

    fireEvent.click(likeButtons[0]);
    expect(screen.getByText("143")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /143/i }));
    expect(screen.getByText("142")).toBeInTheDocument();
  });

  it("triggers onForkArtifact callback when fork button is clicked", () => {
    const handleFork = vi.fn();
    render(<CommunityArtifact onForkArtifact={handleFork} />);

    const forkButtons = screen.getAllByRole("button", { name: /Fork/i });
    expect(forkButtons.length).toBeGreaterThan(0);

    fireEvent.click(forkButtons[0]);
    expect(handleFork).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "comm-01",
        title: expect.stringContaining("Investor Pitch Deck"),
      })
    );
  });
});
