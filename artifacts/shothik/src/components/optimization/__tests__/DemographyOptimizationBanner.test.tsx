// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { DemographyOptimizationBanner } from "../DemographyOptimizationBanner";

describe("DemographyOptimizationBanner UI Component", () => {
  it("renders Demography-Aware 2GB RAM & MFS Suite header and controls", () => {
    render(<DemographyOptimizationBanner isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Demography-Aware 2GB RAM & MFS Suite/i)).toBeDefined();
    expect(screen.getByText(/Generate bKash Deep Link/i)).toBeDefined();
    expect(screen.getByText(/Generate Nagad Deep Link/i)).toBeDefined();
  });
});
