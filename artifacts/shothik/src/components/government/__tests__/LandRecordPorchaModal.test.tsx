// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { LandRecordPorchaModal } from "../LandRecordPorchaModal";

describe("LandRecordPorchaModal UI Component", () => {
  it("renders Land Ministry CS/SA/RS/BS Porcha & Khajna Portal header and survey controls", () => {
    render(<LandRecordPorchaModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Land Ministry CS\/SA\/RS\/BS Porcha & Khajna Portal/i)).toBeDefined();
    expect(screen.getByText(/Parse Porcha OCR & Calculate Khajna/i)).toBeDefined();
  });
});
