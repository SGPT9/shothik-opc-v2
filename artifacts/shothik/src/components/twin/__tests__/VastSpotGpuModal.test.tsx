import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { VastSpotGpuModal } from "../VastSpotGpuModal";

describe("VastSpotGpuModal Component (VastSpotGpuModal.tsx)", () => {
  it("renders modal header, WebGPU Hybrid Fallback badge, and spot GPU offers", () => {
    render(<VastSpotGpuModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText("Vast.ai Dynamic Spot GPU Bursting & Offload Engine")).toBeInTheDocument();
    expect(screen.getByText("WebGPU Hybrid Fallback")).toBeInTheDocument();
    expect(screen.getByText(/Spot GPU Market Offers/)).toBeInTheDocument();
    expect(screen.getByText("NVIDIA GeForce RTX 4090")).toBeInTheDocument();
    expect(screen.getByText("NVIDIA A100-SXM4-80GB")).toBeInTheDocument();
  });

  it("switches to Active Workers tab and displays running container", async () => {
    render(<VastSpotGpuModal open={true} onOpenChange={() => {}} />);

    const workersTab = screen.getByText(/Active Workers/);
    expect(workersTab).toBeInTheDocument();
    fireEvent.click(workersTab);

    await waitFor(() => {
      expect(screen.getByText(/Running & Historical Spot GPU Containers/)).toBeInTheDocument();
    });
    expect(screen.getAllByText(/NVIDIA GeForce RTX 4090/).length).toBeGreaterThan(0);
    expect(screen.getByText("Destroy Worker")).toBeInTheDocument();
  });

  it("switches to Hybrid Fallback Sandbox and evaluates workload", () => {
    render(<VastSpotGpuModal open={true} onOpenChange={() => {}} />);

    const sandboxTab = screen.getByText("Hybrid Fallback Sandbox");
    fireEvent.click(sandboxTab);

    expect(screen.getByText("Workload Compute Offload Simulator")).toBeInTheDocument();
    const evalBtn = screen.getByText("Evaluate Compute Fallback");
    expect(evalBtn).toBeInTheDocument();

    fireEvent.click(evalBtn);

    expect(screen.getByText(/Burst to Vast.ai Spot Cloud GPU Recommended/)).toBeInTheDocument();
  });
});
