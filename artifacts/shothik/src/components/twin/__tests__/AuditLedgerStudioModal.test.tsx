import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AuditLedgerStudioModal } from "../AuditLedgerStudioModal";

describe("AuditLedgerStudioModal Component (AuditLedgerStudioModal.tsx)", () => {
  it("renders header, statutory badge, and summary when open", () => {
    render(<AuditLedgerStudioModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText("NBR Statutory Audit Dossier & Double-Entry Ledger Reconciler")).toBeInTheDocument();
    expect(screen.getByText("Slice 34 · Statutory Grade")).toBeInTheDocument();
    expect(screen.getByText(/Double-Entry Balancing/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <AuditLedgerStudioModal isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("switches across the 4 navigation tabs and renders account balances", () => {
    render(<AuditLedgerStudioModal isOpen={true} onClose={() => {}} />);

    const accountsTab = screen.getByRole("button", { name: /Chart of Accounts/i });
    const journalsTab = screen.getByRole("button", { name: /General Ledger/i });
    const trialBalanceTab = screen.getByRole("button", { name: /Trial Balance/i });
    const dossierTab = screen.getByRole("button", { name: /NBR Statutory Dossier/i });

    expect(accountsTab).toBeInTheDocument();
    expect(journalsTab).toBeInTheDocument();
    expect(trialBalanceTab).toBeInTheDocument();
    expect(dossierTab).toBeInTheDocument();

    // Default tab is Chart of Accounts
    expect(screen.getByText("Standard South Asian Chart of Accounts")).toBeInTheDocument();
    expect(screen.getByText("Cash at Bank (BRAC / City Bank)")).toBeInTheDocument();
    expect(screen.getByText("1010")).toBeInTheDocument();

    // Switch to General Ledger
    fireEvent.click(journalsTab);
    expect(screen.getByText("Post Balanced Double-Entry Journal")).toBeInTheDocument();
    expect(screen.getByText("INV-MUSHAK-9011")).toBeInTheDocument();

    // Switch to Trial Balance
    fireEvent.click(trialBalanceTab);
    expect(screen.getByText("Real-Time Trial Balance Verification")).toBeInTheDocument();
    expect(screen.getByText("Total Debit Balance")).toBeInTheDocument();

    // Switch to NBR Dossier
    fireEvent.click(dossierTab);
    expect(screen.getByText("NBR Statutory Compliance Dossier Compiler")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Compile & Seal NBR Dossier/i })).toBeInTheDocument();
  });

  it("generates an NBR dossier when clicking compile button", async () => {
    render(<AuditLedgerStudioModal isOpen={true} onClose={() => {}} />);

    const dossierTab = screen.getByRole("button", { name: /NBR Statutory Dossier/i });
    fireEvent.click(dossierTab);

    const compileBtn = screen.getByRole("button", { name: /Compile & Seal NBR Dossier/i });
    fireEvent.click(compileBtn);

    expect(await screen.findByText("Cryptographic Statutory Seal")).toBeInTheDocument();
    expect(screen.getByText("SHA-256 SEALED")).toBeInTheDocument();
  });
});
