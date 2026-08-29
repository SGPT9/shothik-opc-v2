// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { NilkhetOrderModal } from "../NilkhetOrderModal";

describe("NilkhetOrderModal — Print-on-Demand Fulfillment Bridge", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({
          success: true,
          breakdown: {
            printingCostPerCopyBdt: 180,
            bindingCostPerCopyBdt: 70,
            subtotalCopiesBdt: 250,
            deliveryBdt: 60,
            totalPayableBdt: 310,
          },
        }),
      })
    );
  });

  it("renders when open with book title and page count", async () => {
    render(
      <NilkhetOrderModal
        open={true}
        onOpenChange={vi.fn()}
        bookTitle="A History of Bengal Rivers"
        pageCount={140}
        authorName="Prof. Karim"
      />
    );

    expect(screen.getByText(/Nilkhet Print-on-Demand/i)).toBeInTheDocument();
    expect(screen.getByText("A History of Bengal Rivers")).toBeInTheDocument();
    expect(screen.getByText(/140 Pages/i)).toBeInTheDocument();
  });

  it("fetches and displays live cost breakdown from /api/v1/publishing/estimate-cost", async () => {
    render(
      <NilkhetOrderModal
        open={true}
        onOpenChange={vi.fn()}
        bookTitle="Modern Software Architecture"
        pageCount={200}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/310/)).toBeInTheDocument();
    });
  });
});
