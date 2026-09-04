import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { TonightEngineDashboard } from "../TonightEngineDashboard";

// Mock insforge client to isolate component testing
vi.mock("@/lib/insforge/client", () => ({
  getInsforgeBrowserClient: () => null,
}));

describe("TonightEngineDashboard: Swarm & WebGPU Monitor Component", () => {
  it("renders the Tonight Engine dashboard header and state graph nodes", async () => {
    const { findByText } = render(
      <TonightEngineDashboard
        initialPrompt="Autonomous Overnight Loop & Intel Arc B580 WebGPU Speculative Swarm"
      />
    );

    // Verify Title and Subtitle
    expect(await findByText(/Tonight Engine Swarm Monitor/i)).toBeDefined();
    expect(await findByText(/Intel Arc B580 WebGPU Speculative Swarm/i)).toBeDefined();

    // Verify Open-SWE State Graph Nodes
    expect(await findByText(/1\. Swarm Plan/i)).toBeDefined();
    expect(await findByText(/2\. Deep Scan/i)).toBeDefined();
    expect(await findByText(/3\. Swarm Run/i)).toBeDefined();
    expect(await findByText(/4\. Audit & Verify/i)).toBeDefined();
    expect(await findByText(/5\. Synthesize/i)).toBeDefined();
  });

  it("renders the hardware acceleration card for Intel Arc WebGPU", async () => {
    const { findByText, findAllByText } = render(<TonightEngineDashboard />);

    expect(await findByText(/Local Acceleration/i)).toBeDefined();
    const arcElements = await findAllByText(/Intel Arc B580/i);
    expect(arcElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders DeepSeek Harness (DSH) interactive trace replay and allows session forking", async () => {
    const { findByText, getByTestId } = render(<TonightEngineDashboard />);

    // Check DSH header
    expect(await findByText(/DeepSeek Harness \(DSH\) Interactive Trace Replay & Forking/i)).toBeDefined();

    // Check step scrubber
    const nextBtn = getByTestId("dsh-next-step");
    const prevBtn = getByTestId("dsh-prev-step");
    const forkBtn = getByTestId("dsh-fork-button");

    expect(nextBtn).toBeDefined();
    expect(prevBtn).toBeDefined();
    expect(forkBtn).toBeDefined();

    // Trigger session fork at current step
    fireEvent.click(forkBtn);

    // Check that forked branch badge appeared
    expect(await findByText(/Forked: dsh_fork_/i)).toBeDefined();
  });
});

