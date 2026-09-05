import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EdgeMeshStudioModal } from "../EdgeMeshStudioModal";

describe("EdgeMeshStudioModal Component (EdgeMeshStudioModal.tsx)", () => {
  it("renders modal header, Sub-10ms Reads badge, and regional edge nodes", () => {
    render(<EdgeMeshStudioModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText("Autonomous Multi-Region Edge Replication Mesh")).toBeInTheDocument();
    expect(screen.getByText("Sub-10ms Reads")).toBeInTheDocument();
    expect(screen.getByText("Dhaka")).toBeInTheDocument();
    expect(screen.getByText("Singapore")).toBeInTheDocument();
    expect(screen.getByText("Frankfurt")).toBeInTheDocument();
  });

  it("displays local read RTT metrics and live inter-region latency matrix", () => {
    render(<EdgeMeshStudioModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText("Live Inter-Region RTT Latency Matrix")).toBeInTheDocument();
    expect(screen.getAllByText(/6.4 ms/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/DHK: 10/).length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText(/SIN: 10/).length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText(/FRA: 10/).length).toBeGreaterThanOrEqual(3);
  });

  it("switches to Distributed WAL Frame Stream tab and displays cryptographic frame sequence", async () => {
    render(<EdgeMeshStudioModal open={true} onOpenChange={() => {}} />);

    const framesTab = screen.getByText("Distributed WAL Frame Stream");
    expect(framesTab).toBeInTheDocument();
    fireEvent.click(framesTab);

    await waitFor(() => {
      expect(screen.getByText("Cryptographic Write-Ahead Log (WAL) Frames Audit Log")).toBeInTheDocument();
    });
    expect(screen.getByText("SHA-256 Validated")).toBeInTheDocument();
    expect(screen.getByText("SEQ #10")).toBeInTheDocument();
    expect(screen.getByText("UPDATE")).toBeInTheDocument();
  });

  it("switches to Chaos & Partition Sandbox tab and verifies partition toggle controls", async () => {
    render(<EdgeMeshStudioModal open={true} onOpenChange={() => {}} />);

    const chaosTab = screen.getByText("Chaos & Partition Sandbox");
    fireEvent.click(chaosTab);

    await waitFor(() => {
      expect(screen.getByText(/Simulate Network Partition & Offline Replay Verification/)).toBeInTheDocument();
    });
    const partitionButtons = screen.getAllByText("Partition");
    expect(partitionButtons.length).toBe(3);
  });

  it("triggers Simulate Write (Dhaka) and displays confirmation notification", async () => {
    render(<EdgeMeshStudioModal open={true} onOpenChange={() => {}} />);

    const writeBtn = screen.getByText("Simulate Write (Dhaka)");
    expect(writeBtn).toBeInTheDocument();

    fireEvent.click(writeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Local simulation write/)).toBeInTheDocument();
    });
  });
});
