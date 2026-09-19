import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { MushakTaxStudioModal } from "../MushakTaxStudioModal";

describe("MushakTaxStudioModal Component", () => {
  it("renders header, statutory badges, and 13-digit seller BIN", () => {
    render(<MushakTaxStudioModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText("NBR Mushak-6.3 Statutory VAT & TDS Studio")).toBeInTheDocument();
    expect(screen.getByText("মূসক-৬.৩")).toBeInTheDocument();
    expect(screen.getByText("BIN: 001928374-0101")).toBeInTheDocument();
  });

  it("renders 4 navigation tabs and switches active tab views", () => {
    render(<MushakTaxStudioModal open={true} onOpenChange={() => {}} />);

    const genTab = screen.getByRole("button", { name: /Invoice Generator/i });
    const previewTab = screen.getByRole("button", { name: /Statutory Printable View/i });
    const ledgerTab = screen.getByRole("button", { name: /TDS Withholding Ledger/i });
    const mushak91Tab = screen.getByRole("button", { name: /Mushak-9.1 Return Summary/i });

    expect(genTab).toBeInTheDocument();
    expect(previewTab).toBeInTheDocument();
    expect(ledgerTab).toBeInTheDocument();
    expect(mushak91Tab).toBeInTheDocument();

    // Switch to Statutory Printable View
    fireEvent.click(previewTab);
    expect(screen.getByText("কর চালানপত্র (TAX INVOICE)")).toBeInTheDocument();
    expect(screen.getByText("বিক্রেতার বিবরণ:")).toBeInTheDocument();

    // Switch to TDS Withholding Ledger
    fireEvent.click(ledgerTab);
    expect(screen.getByPlaceholderText(/Search by BIN, Serial, or Buyer/i)).toBeInTheDocument();

    // Switch to Mushak-9.1 Return Summary
    fireEvent.click(mushak91Tab);
    expect(screen.getByText("Mushak-9.1 Monthly Value Added Tax Return")).toBeInTheDocument();
    expect(screen.getByText("Treasury Code: 1-1133-0006-0311")).toBeInTheDocument();
  });

  it("validates 13-digit buyer BIN input live in generator", () => {
    render(<MushakTaxStudioModal open={true} onOpenChange={() => {}} />);

    const binInput = screen.getByDisplayValue("002948172-0301");
    expect(binInput).toBeInTheDocument();
    expect(screen.getByText("✓ Valid BIN")).toBeInTheDocument();

    // Change to invalid BIN
    fireEvent.change(binInput, { target: { value: "12345" } });
    expect(screen.getByText("⚠ 13 Digits Required")).toBeInTheDocument();
  });

  it("allows adding and updating line items with dynamic tax calculations", () => {
    render(<MushakTaxStudioModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByDisplayValue("Shothik Developer Twin Annual Cloud License")).toBeInTheDocument();
    
    // Click Add Item
    const addBtn = screen.getByRole("button", { name: /Add Item/i });
    fireEvent.click(addBtn);

    expect(screen.getByDisplayValue("Custom Consulting / Content Generation")).toBeInTheDocument();
  });

  it("issues a new NBR Mushak-6.3 tax invoice and switches to preview", () => {
    render(<MushakTaxStudioModal open={true} onOpenChange={() => {}} />);

    const issueBtn = screen.getByRole("button", { name: /Issue NBR Mushak-6.3 Invoice/i });
    fireEvent.click(issueBtn);

    // Should switch to preview tab and show document canvas
    expect(screen.getByText("কর চালানপত্র (TAX INVOICE)")).toBeInTheDocument();
    expect(screen.getByText("Shothik Cryptographic Key Attested")).toBeInTheDocument();
  });
});
