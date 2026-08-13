// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { StartupValidationFunnelModal } from "../StartupValidationFunnelModal";

describe("StartupValidationFunnelModal UI Component", () => {
  it("renders 3-Step Startup Validation Funnel Engine header and controls", () => {
    render(<StartupValidationFunnelModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/3-Step Startup Validation Funnel Engine/i)).toBeDefined();
    expect(screen.getByText(/Execute Full 3-Step Validation Funnel/i)).toBeDefined();
  });
});
