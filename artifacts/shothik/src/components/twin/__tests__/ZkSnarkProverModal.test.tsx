import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ZkSnarkProverModal } from "../ZkSnarkProverModal";

describe("ZkSnarkProverModal Component (ZkSnarkProverModal.tsx)", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/api/v1/epistemic/zk/status")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                success: true,
                data: {
                  circuitsAvailable: 4,
                  totalProofsGenerated: 3,
                  totalProofsVerified: 3,
                  leakageRate: 0.0,
                },
              }),
          });
        }
        if (url.includes("/api/v1/epistemic/zk/circuits")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                success: true,
                data: [
                  {
                    id: "MERKLE_MEMBERSHIP_ZK",
                    name: "Merkle Tree Membership & Nullifier",
                    description: "Proves membership in secret Merkle state tree without revealing leaf",
                    constraintCount: 1024,
                  },
                ],
              }),
          });
        }
        if (url.includes("/api/v1/epistemic/zk/ledger")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                success: true,
                data: [],
              }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: {} }),
        });
      })
    );
  });

  it("renders modal header, BN254 badge, and engine description", () => {
    render(<ZkSnarkProverModal open={true} onOpenChange={() => {}} />);

    expect(
      screen.getByText("Autonomous Epistemic ZK-SNARK Engine")
    ).toBeInTheDocument();
    expect(screen.getByText("BN254 / Groth16")).toBeInTheDocument();
    expect(
      screen.getByText(/Zero-knowledge cryptographic verification proving cross-twin solvency/i)
    ).toBeInTheDocument();
  });

  it("renders all 3 navigation tabs", () => {
    render(<ZkSnarkProverModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText(/ZK Proof Generator & Witness Builder/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero-Knowledge Verifier Chamber/i)).toBeInTheDocument();
    expect(screen.getByText(/Cross-Twin ZK Ledger/i)).toBeInTheDocument();
  });

  it("switches to Zero-Knowledge Verifier Chamber tab and displays verifier controls", async () => {
    render(<ZkSnarkProverModal open={true} onOpenChange={() => {}} />);

    const verifierTab = screen.getByText(/Zero-Knowledge Verifier Chamber/i);
    fireEvent.click(verifierTab);

    await waitFor(() => {
      expect(
        screen.getByText(/Input Proof JSON for Bilinear Pairing Verification/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Verify Zero-Knowledge Proof \(Pairing Equation\)/i)
      ).toBeInTheDocument();
    });
  });

  it("switches to Cross-Twin ZK Ledger tab and displays ledger header", async () => {
    render(<ZkSnarkProverModal open={true} onOpenChange={() => {}} />);

    const ledgerTab = screen.getByText(/Cross-Twin ZK Ledger/i);
    fireEvent.click(ledgerTab);

    await waitFor(() => {
      expect(
        screen.getByText(/Immutable record of attested Zero-Knowledge proofs verified across specialized twins/i)
      ).toBeInTheDocument();
    });
  });

  it("renders public inputs and private witness inputs on prover tab", () => {
    render(<ZkSnarkProverModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText(/Public Inputs \(Verifiable by Verifier\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Private Witness \(Zero Knowledge Hidden\)/i)).toBeInTheDocument();
    expect(screen.getByText("Generate Zero-Knowledge SNARK Proof")).toBeInTheDocument();
    expect(screen.getByText("0.00% (Strict ZK)")).toBeInTheDocument();
  });
});
