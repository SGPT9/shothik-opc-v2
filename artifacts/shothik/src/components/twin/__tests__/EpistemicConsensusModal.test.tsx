import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EpistemicConsensusModal } from "../EpistemicConsensusModal";

describe("EpistemicConsensusModal Component (EpistemicConsensusModal.tsx)", () => {
  it("renders modal header, BFT Merkle badge, and quick stats", () => {
    render(<EpistemicConsensusModal open={true} onOpenChange={() => {}} />);

    expect(
      screen.getByText("Epistemic Consensus & Knowledge Vault")
    ).toBeInTheDocument();
    expect(screen.getByText("BFT Merkle v2.1")).toBeInTheDocument();
    expect(screen.getByText(/Decentralized Byzantine fault-tolerant verification/i)).toBeInTheDocument();
  });

  it("renders all 4 navigation tabs", () => {
    render(<EpistemicConsensusModal open={true} onOpenChange={() => {}} />);

    expect(screen.getAllByText(/Knowledge Vault/i)[0]).toBeInTheDocument();
    expect(screen.getByText("Merkle Proof Verifier")).toBeInTheDocument();
    expect(screen.getByText("Consensus Chamber & Proposer")).toBeInTheDocument();
    expect(screen.getByText(/Cryptographic Block Ledger/i)).toBeInTheDocument();
  });

  it("switches to Consensus Chamber & Proposer tab and displays preset buttons", async () => {
    render(<EpistemicConsensusModal open={true} onOpenChange={() => {}} />);

    const consensusTab = screen.getByText("Consensus Chamber & Proposer");
    expect(consensusTab).toBeInTheDocument();
    fireEvent.click(consensusTab);

    await waitFor(() => {
      expect(screen.getByText("Propose New Epistemic Research Assertion")).toBeInTheDocument();
      expect(screen.getByText("Dhaka BDIX Edge Latency")).toBeInTheDocument();
      expect(screen.getByText("WebGPU Local Embedding")).toBeInTheDocument();
      expect(screen.getByText("bKash Idempotent Settlement")).toBeInTheDocument();
      expect(screen.getByText("Simulate Rejectable Claim (Low Confidence)")).toBeInTheDocument();
    });

    // Clicking a preset populates the claim description
    const bdixPreset = screen.getByText("Dhaka BDIX Edge Latency");
    fireEvent.click(bdixPreset);

    const submitBtn = screen.getByText("Submit to Validator Quorum & Mine Block");
    expect(submitBtn).toBeInTheDocument();
  });

  it("switches to Merkle Proof Verifier tab", async () => {
    render(<EpistemicConsensusModal open={true} onOpenChange={() => {}} />);

    const merkleTab = screen.getByText("Merkle Proof Verifier");
    fireEvent.click(merkleTab);

    await waitFor(() => {
      expect(merkleTab).toHaveClass("border-indigo-500");
    });
  });

  it("switches to Cryptographic Block Ledger tab", async () => {
    render(<EpistemicConsensusModal open={true} onOpenChange={() => {}} />);

    const ledgerTab = screen.getByText(/Cryptographic Block Ledger/i);
    fireEvent.click(ledgerTab);

    await waitFor(() => {
      expect(screen.getByText(/Historical Epistemic Blocks/i)).toBeInTheDocument();
    });
  });
});
