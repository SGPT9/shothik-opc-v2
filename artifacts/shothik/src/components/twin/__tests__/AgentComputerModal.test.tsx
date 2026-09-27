import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AgentComputerModal } from "../AgentComputerModal";
import { ActionProposalCard } from "../../chat/ActionProposalCard";

describe("Frontend AG-UI Components: AgentComputerModal & ActionProposalCard", () => {
  it("renders ActionProposalCard with protected gate details and handles rejection", async () => {
    let denied = false;
    render(
      <ActionProposalCard
        id="prop-test-01"
        kind="bkash.payout"
        title="Authorize bKash Transfer to Supplier"
        data={{ recipientPhone: "01712345678", amount: 25000, reference: "REF_99" }}
        status="awaiting_review"
        hash="abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
        expiresAt={new Date(Date.now() + 600000).toISOString()}
        onDeny={async () => {
          denied = true;
        }}
      />,
    );

    expect(screen.getByText(/Protected Action/i)).toBeDefined();
    expect(screen.getByText(/Authorize bKash Transfer to Supplier/i)).toBeDefined();
    expect(screen.getByText(/৳25,000 BDT/i)).toBeDefined();

    const rejectBtn = screen.getByText(/Reject Action/i);
    fireEvent.click(rejectBtn);
    expect(denied).toBe(true);
  });

  it("renders AgentComputerModal with Browser Takeover, Tasks, Actions, and PDF tabs", () => {
    render(<AgentComputerModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/OpenMuse Agentic Computer/i)).toBeDefined();
    expect(screen.getByText(/Browser Takeover/i)).toBeDefined();
    expect(screen.getByText(/CAS Tasks/i)).toBeDefined();
    expect(screen.getByText(/Protected Actions/i)).toBeDefined();
    expect(screen.getByText(/Nilkhet PDF Hub/i)).toBeDefined();
  });
});
