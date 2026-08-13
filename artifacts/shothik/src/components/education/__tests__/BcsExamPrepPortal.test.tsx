// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { BcsExamPrepPortal } from "../BcsExamPrepPortal";

describe("BcsExamPrepPortal UI Component", () => {
  it("renders BCS & University AI Exam Prep Portal header and controls", () => {
    render(<BcsExamPrepPortal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/BCS & University AI Exam Prep Portal/i)).toBeDefined();
    expect(screen.getAllByText(/Generate MCQs/i)[0]).toBeDefined();
    expect(screen.getByText(/Start 3D Viva 🎭/i)).toBeDefined();
  });
});
