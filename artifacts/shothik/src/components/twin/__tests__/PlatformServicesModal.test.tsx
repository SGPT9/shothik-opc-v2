import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { PlatformServicesModal, PLATFORM_SERVICES } from "../PlatformServicesModal";

describe("PlatformServicesModal Component", () => {
  it("renders all 12 platform services when open", () => {
    render(<PlatformServicesModal open={true} onOpenChange={() => {}} />);

    // Check title and Core Principle
    expect(screen.getByText("ShothikGPT Platform Services")).toBeInTheDocument();
    expect(screen.getByText(/ShothikGPT combines these services into a single/i)).toBeInTheDocument();
    expect(screen.getByText("AI execution platform")).toBeInTheDocument();
    expect(screen.getByText(/where users describe what they want, and AI agents help execute the outcome/i)).toBeInTheDocument();

    // Verify all 12 canonical service names are present
    expect(screen.getByText("AI Execution")).toBeInTheDocument();
    expect(screen.getByText("Academic & Research")).toBeInTheDocument();
    expect(screen.getByText("Writing & Content Creation")).toBeInTheDocument();
    expect(screen.getByText("Creative & Professional Creation")).toBeInTheDocument();
    expect(screen.getByText("Twin — Business Automation")).toBeInTheDocument();
    expect(screen.getByText("Commerce & F-Commerce")).toBeInTheDocument();
    expect(screen.getByText("Logistics & Courier Automation")).toBeInTheDocument();
    expect(screen.getByText("Venture Creation")).toBeInTheDocument();
    expect(screen.getByText("Conversational AI")).toBeInTheDocument();
    expect(screen.getByText("Publishing & Print-on-Demand")).toBeInTheDocument();
    expect(screen.getByText("AI Agent Services")).toBeInTheDocument();
    expect(screen.getByText("Payments & Monetization")).toBeInTheDocument();

    // Verify canonical dataset length
    expect(PLATFORM_SERVICES).toHaveLength(12);
  });

  it("filters services when a triad pill is clicked", () => {
    render(<PlatformServicesModal open={true} onOpenChange={() => {}} />);

    // Click on "Writing Suite" filter
    const writingPill = screen.getByRole("button", { name: /Writing Suite/i });
    fireEvent.click(writingPill);

    // Writing suite services should be visible
    expect(screen.getByText("Academic & Research")).toBeInTheDocument();
    expect(screen.getByText("Writing & Content Creation")).toBeInTheDocument();
    expect(screen.getByText("Conversational AI")).toBeInTheDocument();

    // Twin ops services should not be visible in writing view
    expect(screen.queryByText("Payments & Monetization")).not.toBeInTheDocument();
    expect(screen.queryByText("AI Agent Services")).not.toBeInTheDocument();
  });

  it("filters services through the search input", () => {
    render(<PlatformServicesModal open={true} onOpenChange={() => {}} />);

    const searchInput = screen.getByPlaceholderText(/Search services/i);
    fireEvent.change(searchInput, { target: { value: "Nilkhet" } });

    // Should find Publishing & Print-on-Demand (which mentions Nilkhet in capabilities)
    expect(screen.getByText("Publishing & Print-on-Demand")).toBeInTheDocument();

    // Should not display non-matching service
    expect(screen.queryByText("AI Execution")).not.toBeInTheDocument();
  });

  it("invokes onOpenChange when close button is clicked", () => {
    const onOpenChange = vi.fn();
    render(<PlatformServicesModal open={true} onOpenChange={onOpenChange} />);

    const closeBtn = screen.getByRole("button", { name: /^Close$/i });
    fireEvent.click(closeBtn);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
