// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { NbrTaxReturnModal } from "../NbrTaxReturnModal";

describe("NbrTaxReturnModal UI Component", () => {
  it("renders NBR Individual e-TIN Tax Return Portal header and controls", () => {
    render(<NbrTaxReturnModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/NBR Individual e-TIN Tax Return Portal \(Form 11GA\)/i)).toBeDefined();
    expect(screen.getByText(/Calculate Income Tax Slabs & 15% Investment Rebate/i)).toBeDefined();
  });
});
