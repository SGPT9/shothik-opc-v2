import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CanaryTrafficDirectorModal } from "../CanaryTrafficDirectorModal";

describe("CanaryTrafficDirectorModal Component (CanaryTrafficDirectorModal.tsx)", () => {
  it("renders modal header, Zero-Downtime badge, and stable vs canary versions", () => {
    render(<CanaryTrafficDirectorModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText("Autonomous Self-Healing Canary & Traffic Director")).toBeInTheDocument();
    expect(screen.getByText("Blue/Green Zero-Downtime")).toBeInTheDocument();
    expect(screen.getByText(/Stable Baseline: v2.4.0/)).toBeInTheDocument();
    expect(screen.getByText(/Canary: v2.4.1-rc1/)).toBeInTheDocument();
  });

  it("displays quick ramp buttons and adjusts traffic weight", async () => {
    render(<CanaryTrafficDirectorModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText("Quick Ramp Weights:")).toBeInTheDocument();
    const btn25 = screen.getByText("25%");
    expect(btn25).toBeInTheDocument();

    fireEvent.click(btn25);

    await waitFor(() => {
      expect(screen.getByText("25% Traffic")).toBeInTheDocument();
    });
  });

  it("switches to Live SLO Telemetry tab and displays error rate and latency metrics", async () => {
    render(<CanaryTrafficDirectorModal open={true} onOpenChange={() => {}} />);

    const telemetryTab = screen.getByText("Live SLO Telemetry");
    expect(telemetryTab).toBeInTheDocument();
    fireEvent.click(telemetryTab);

    await waitFor(() => {
      expect(screen.getByText("Rollback Incident Audit Trail")).toBeInTheDocument();
    });
    expect(screen.getByText("Error Rate")).toBeInTheDocument();
    expect(screen.getByText("P95 Latency")).toBeInTheDocument();
    expect(screen.getByText("Throughput")).toBeInTheDocument();
  });

  it("switches to Chaos Sandbox tab and triggers autonomous circuit-breaker rollback simulation", async () => {
    render(<CanaryTrafficDirectorModal open={true} onOpenChange={() => {}} />);

    const chaosTab = screen.getByText("Chaos & Self-Healing Sandbox");
    fireEvent.click(chaosTab);

    await waitFor(() => {
      expect(screen.getByText(/Autonomous Anomaly Injection & Circuit Breaker Verification/)).toBeInTheDocument();
    });

    const errorBtn = screen.getByText("Simulate Error Spike");
    expect(errorBtn).toBeInTheDocument();

    fireEvent.click(errorBtn);

    await waitFor(() => {
      expect(screen.getByText(/Autonomous circuit breaker/)).toBeInTheDocument();
    });
  });
});
