// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { FreelancerTaxRemittanceModal } from "../FreelancerTaxRemittanceModal";

describe("FreelancerTaxRemittanceModal UI Component", () => {
  it("renders Freelancer Form C & NBR Tax Remittance Portal header and controls", () => {
    render(<FreelancerTaxRemittanceModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Freelancer Form C & NBR Tax Remittance Portal/i)).toBeDefined();
    expect(screen.getByText(/Remittance Calculator/i)).toBeDefined();
    expect(screen.getAllByText(/Form C Certificate/i)[0]).toBeDefined();
    expect(screen.getByText(/Client .docx Invoice/i)).toBeDefined();
  });
});
