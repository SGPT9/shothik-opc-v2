import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CodIvrModal } from "../CodIvrModal";

describe("Frontend AG-UI Component: CodIvrModal", () => {
  it("renders CodIvrModal with Live IVR Simulator, RTO Fraud Radar, Address Normalizer, and Courier Dispatch tabs", () => {
    render(<CodIvrModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/Autonomous Banglish Voice IVR & COD Return Minimizer/i)).toBeDefined();
    expect(screen.getByText(/Live IVR Voice Simulator/i)).toBeDefined();
    expect(screen.getByText(/RTO Fraud Radar/i)).toBeDefined();
    expect(screen.getByText(/Address Normalizer/i)).toBeDefined();
    expect(screen.getByText(/Courier Dispatch Log/i)).toBeDefined();
    expect(screen.getByText(/⌘V/i)).toBeDefined();
  });
});
