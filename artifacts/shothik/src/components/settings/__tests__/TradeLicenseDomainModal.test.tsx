// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { TradeLicenseDomainModal } from "../TradeLicenseDomainModal";

describe("TradeLicenseDomainModal", () => {
  it("renders domain check & E-Trade license application UI controls", () => {
    render(<TradeLicenseDomainModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Custom Domain & E-Trade License Engine/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/e.g. polsiastore/i)).toBeDefined();
    expect(screen.getByText(/Submit E-Trade License Application/i)).toBeDefined();
  });
});
