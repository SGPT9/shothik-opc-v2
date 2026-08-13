// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MerchantOnboardingWizard } from "../MerchantOnboardingWizard";

describe("MerchantOnboardingWizard UI Component", () => {
  it("renders Step 1 Facebook Page URL input and scrape button", () => {
    render(<MerchantOnboardingWizard isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/1-Click F-Commerce Store Onboarding Wizard/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/https:\/\/facebook.com\/yourpage/i)).toBeDefined();
    expect(screen.getByText(/Parse Catalog with ScrapeGraphAI/i)).toBeDefined();
  });
});
