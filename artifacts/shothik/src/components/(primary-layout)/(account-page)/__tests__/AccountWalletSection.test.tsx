import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AccountWalletSection from "../AccountWalletSection";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const store = configureStore({
  reducer: {
    auth: () => ({ accessToken: "test_token", user: { id: "usr_wallet_tester" } }),
    user_wallet: () => ({ wallet: { token: 1500, package: { name: "Pro Plan" } }, isLoading: false }),
  },
});

describe("AccountWalletSection Component", () => {
  it("renders the Credits card with Verify Offline SMS and Creator Cash-Out buttons", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <AccountWalletSection />
        </Provider>
      </QueryClientProvider>
    );

    expect(screen.getAllByText(/Credits/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/bKash \/ Nagad Verified/i)).toBeDefined();
    expect(screen.getByText(/📱 Verify Offline SMS/i)).toBeDefined();
    expect(screen.getByText(/💰 Creator Cash-Out/i)).toBeDefined();
  });

  it("opens the Offline bKash Trx modal on button click", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <AccountWalletSection />
        </Provider>
      </QueryClientProvider>
    );

    const smsBtn = screen.getByText(/📱 Verify Offline SMS/i);
    fireEvent.click(smsBtn);

    expect(screen.getByText(/Verify Offline MFS Transaction/i)).toBeDefined();
  });
});
