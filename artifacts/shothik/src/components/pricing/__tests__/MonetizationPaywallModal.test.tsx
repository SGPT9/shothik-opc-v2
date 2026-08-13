// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MonetizationPaywallModal } from "../MonetizationPaywallModal";

describe("MonetizationPaywallModal UI Component", () => {
  it("renders Shothik Platform Monetization & Paywall Portal header and controls", () => {
    render(<MonetizationPaywallModal isOpen={true} onClose={vi.fn()} userCredits={45} />);

    expect(screen.getByText(/Shothik Platform Monetization & Paywall Portal/i)).toBeDefined();
    expect(screen.getByText(/Pay-As-You-Go Credit Packages/i)).toBeDefined();
  });
});
