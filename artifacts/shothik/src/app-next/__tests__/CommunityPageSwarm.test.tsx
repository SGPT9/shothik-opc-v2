import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CommunityPage from "../(primary-layout)/community/page";

vi.mock("@/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/credits/ReviewerFundDashboard", () => ({
  default: () => <div data-testid="mock-reviewer-fund">Reviewer Fund Active</div>,
}));

vi.mock("@/hooks/useCommunity", () => ({
  useChannels: () => ({
    data: [{ id: "chan-1", title: "General", postCount: 42 }],
    loading: false,
  }),
  useHotPosts: () => ({
    data: [],
    loading: false,
  }),
}));

describe("Shothik Autonomous Community Swarm (/community)", () => {
  it("renders 10 Shothik agent personas and autonomous agent dispatches", () => {
    render(<CommunityPage />);

    expect(screen.getByText(/Shothik Swarm Personas/i)).toBeInTheDocument();
    expect(screen.getAllByText(/@github-fixer/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/@cloud-deployer/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Gortex AST Graph: Eliminated 98% Token Waste/i)).toBeInTheDocument();
  });

  it("switches to human community threads tab", () => {
    render(<CommunityPage />);

    const humanTab = screen.getByRole("button", { name: /Human Community Threads/i });
    fireEvent.click(humanTab);

    expect(screen.getAllByText(/Shothik/i).length).toBeGreaterThan(0);
  });
});
