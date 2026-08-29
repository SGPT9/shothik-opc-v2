// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import CreditPurchaseModal from "../CreditPurchaseModal";

function createMockStore() {
  return configureStore({
    reducer: {
      auth: (state = { user: { id: "usr_test_student" }, accessToken: "mock_jwt" }) => state,
    },
  });
}

describe("CreditPurchaseModal — Outcome-Based Passes & Ledger", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: { subscription: { tier: "free" } } }),
        })
      )
    );
  });

  it("renders Outcome Micro-Passes tab by default with 49 BDT Thesis and 299 BDT Project passes", () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CreditPurchaseModal open={true} onOpenChange={() => {}} />
      </Provider>
    );

    expect(screen.getByText("Outcome Passes & Wallet")).toBeInTheDocument();
    expect(screen.getByText("Outcome Micro-Passes")).toBeInTheDocument();
    expect(screen.getByText("Compute Packs")).toBeInTheDocument();

    // Check 3 outcome passes
    expect(screen.getByText("Thesis Plagiarism & IEEE Export")).toBeInTheDocument();
    expect(screen.getByText("Founder Project Pass")).toBeInTheDocument();
    expect(screen.getByText("Autonomous F-Commerce Operations")).toBeInTheDocument();
    expect(screen.getByText("৳49")).toBeInTheDocument();
    expect(screen.getByText("৳299")).toBeInTheDocument();
    expect(screen.getByText("৳999")).toBeInTheDocument();
  });

  it("reveals instant bKash / Nagad TrxID input when an outcome pass is selected", () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CreditPurchaseModal open={true} onOpenChange={() => {}} />
      </Provider>
    );

    const thesisPass = screen.getByText("Thesis Plagiarism & IEEE Export");
    fireEvent.click(thesisPass);

    expect(
      screen.getByText("Activate Thesis Plagiarism & IEEE Export (৳49 BDT)")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 9K72AX48LP")).toBeInTheDocument();
    expect(screen.getByText("Verify & Unlock")).toBeInTheDocument();
  });

  it("switches cleanly between Outcome Micro-Passes and Compute Packs tabs", () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CreditPurchaseModal open={true} onOpenChange={() => {}} />
      </Provider>
    );

    const computeTab = screen.getByText("Compute Packs");
    fireEvent.click(computeTab);

    // Compute pack tiers should now be visible
    expect(screen.getByText("Credits (STARTER)")).toBeInTheDocument();
    expect(screen.getByText("Credits (PRO)")).toBeInTheDocument();
  });
});
