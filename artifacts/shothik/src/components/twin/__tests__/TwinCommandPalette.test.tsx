import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TwinCommandPalette } from "../TwinCommandPalette";

describe("TwinCommandPalette Component (TwinCommandPalette.tsx)", () => {
  it("renders all 4 operational categories and their respective tools", () => {
    render(<TwinCommandPalette open={true} onOpenChange={() => {}} />);

    // Check titles of the 4 categories
    expect(screen.getByText("👔 1. Founder Cockpit & Intelligence")).toBeInTheDocument();
    expect(screen.getByText("🚀 2. Go-to-Market & Growth")).toBeInTheDocument();
    expect(screen.getByText("🚚 3. Commerce & Local Logistics")).toBeInTheDocument();
    expect(screen.getByText("🛠️ 4. DevOps, Domains & Cloud")).toBeInTheDocument();

    // Check specific tools in categories
    expect(screen.getByText("SecondMe Memory Vault")).toBeInTheDocument();
    expect(screen.getByText("The 9 Specialized Twins Swarm")).toBeInTheDocument();
    expect(screen.getByText("Auto Cold Outreach Autopilot")).toBeInTheDocument();
    expect(screen.getByText("bKash & Nagad MFS Hub")).toBeInTheDocument();
    expect(screen.getByText("Steadfast Courier Logistics")).toBeInTheDocument();
    expect(screen.getByText("Sandboxed Live Preview (Builds)")).toBeInTheDocument();
    expect(screen.getByText("Dokploy Micro-Containers")).toBeInTheDocument();
  });

  it("fires callback and closes palette when a command item is selected", () => {
    const onOpenChange = vi.fn();
    const onOpenSecondMeMemory = vi.fn();
    const onOpenAutoColdOutreach = vi.fn();
    const onOpenMfsGateway = vi.fn();
    const onOpenStartupBuilds = vi.fn();

    render(
      <TwinCommandPalette
        open={true}
        onOpenChange={onOpenChange}
        onOpenSecondMeMemory={onOpenSecondMeMemory}
        onOpenAutoColdOutreach={onOpenAutoColdOutreach}
        onOpenMfsGateway={onOpenMfsGateway}
        onOpenStartupBuilds={onOpenStartupBuilds}
      />
    );

    // Select SecondMe Memory
    const memoryItem = screen.getByText("SecondMe Memory Vault");
    fireEvent.click(memoryItem);

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenSecondMeMemory).toHaveBeenCalledTimes(1);

    // Select Auto Cold Outreach
    const outreachItem = screen.getByText("Auto Cold Outreach Autopilot");
    fireEvent.click(outreachItem);
    expect(onOpenAutoColdOutreach).toHaveBeenCalledTimes(1);

    // Select MFS Gateway
    const mfsItem = screen.getByText("bKash & Nagad MFS Hub");
    fireEvent.click(mfsItem);
    expect(onOpenMfsGateway).toHaveBeenCalledTimes(1);

    // Select Sandboxed Live Preview
    const previewItem = screen.getByText("Sandboxed Live Preview (Builds)");
    fireEvent.click(previewItem);
    expect(onOpenStartupBuilds).toHaveBeenCalledTimes(1);
  });
});
