// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { StudentAssignmentSlideModal } from "../StudentAssignmentSlideModal";

describe("StudentAssignmentSlideModal UI Component", () => {
  it("renders Student Assignment Slide & VTuber Presenter header and controls", () => {
    render(<StudentAssignmentSlideModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Student Assignment Slide & VTuber Presenter/i)).toBeDefined();
    expect(screen.getByText(/Generate Multi-Slide Deck & 3D VTuber Narration/i)).toBeDefined();
  });
});
