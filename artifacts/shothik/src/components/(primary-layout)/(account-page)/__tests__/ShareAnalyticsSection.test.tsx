import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ShareAnalyticsSection from "../ShareAnalyticsSection";

describe("ShareAnalyticsSection Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the Papermark Trackable Links header and KPI summary cards", () => {
    render(<ShareAnalyticsSection userId="usr_test" />);

    expect(screen.getByText(/Papermark Trackable Links & Investor Analytics/i)).toBeDefined();
    expect(screen.getByText(/Total Views/i)).toBeDefined();
    expect(screen.getByText(/Unique Investors/i)).toBeDefined();
    expect(screen.getByText(/Avg Read Time/i)).toBeDefined();
    expect(screen.getByText(/Investor Attention/i)).toBeDefined();
  });

  it("renders default active trackable presentation links", () => {
    render(<ShareAnalyticsSection userId="usr_test" />);

    expect(screen.getByText(/Shothik AI Series A Pitch Deck/i)).toBeDefined();
    expect(screen.getByText(/ScenarioLab 30-Failure Financial Resilience Model/i)).toBeDefined();
  });

  it("opens the slide attention heatmap modal when clicking Heatmap button", async () => {
    render(<ShareAnalyticsSection userId="usr_test" />);

    const heatmapButtons = screen.getAllByRole("button", { name: /heatmap/i });
    expect(heatmapButtons.length).toBeGreaterThan(0);

    fireEvent.click(heatmapButtons[0]);

    expect(screen.getByText(/Slide-by-Slide Attention Heatmap/i)).toBeDefined();
    expect(screen.getByText(/Device Split/i)).toBeDefined();
  });

  it("opens the create trackable link modal when clicking Create Trackable Link button", () => {
    render(<ShareAnalyticsSection userId="usr_test" />);

    const createBtn = screen.getByTestId("create-trackable-link-btn");
    fireEvent.click(createBtn);

    expect(screen.getByText(/Create Trackable Share Link/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/e.g. Seedstars Pitch Deck 2026/i)).toBeDefined();
  });
});
