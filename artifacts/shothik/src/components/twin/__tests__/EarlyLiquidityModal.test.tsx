import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EarlyLiquidityModal } from "../EarlyLiquidityModal";

describe("Frontend AG-UI Component: EarlyLiquidityModal", () => {
  it("renders EarlyLiquidityModal with Aging Radar, Micro-Factoring, Corporate Buyers, and Legal Lien tabs", () => {
    render(<EarlyLiquidityModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/Autonomous B2B Micro-Factoring & Early Liquidity Radar/i)).toBeDefined();
    expect(screen.getAllByText(/Receivables Aging Radar/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Instant Micro-Factoring/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Corporate Buyer Ledger/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Legal Lien & SHA-256 Seal/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/⌘L/i)).toBeDefined();
  });
});
