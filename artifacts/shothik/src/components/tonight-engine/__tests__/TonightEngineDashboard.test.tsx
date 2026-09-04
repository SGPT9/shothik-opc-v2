import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
    const { findByText } = render(<TonightEngineDashboard />);

    expect(await findByText(/Local Acceleration/i)).toBeDefined();
    expect(await findByText(/Intel Arc B580/i)).toBeDefined();
  });
});
