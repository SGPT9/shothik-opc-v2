import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TwinCommandPalette } from "../TwinCommandPalette";

describe("TwinCommandPalette Component (TwinCommandPalette.tsx)", () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });
  it("renders all 4 operational categories and their respective tools", () => {
    render(<TwinCommandPalette open={true} onOpenChange={() => {}} />);

    // Check titles of the categories
    expect(screen.getByText("👔 1. Founder Cockpit & Intelligence")).toBeInTheDocument();
    expect(screen.getByText("🚀 2. Go-to-Market & Growth")).toBeInTheDocument();
    expect(screen.getByText("🚚 3. Commerce & Local Logistics")).toBeInTheDocument();
    expect(screen.getByText("🛠️ 4. DevOps, Domains & Cloud")).toBeInTheDocument();
    expect(screen.getByText("🚀 6. Labs, Voice Duplex & Ecosystem Hub")).toBeInTheDocument();

    // Check specific tools in categories
    expect(screen.getByText("SecondMe Memory Vault")).toBeInTheDocument();
    expect(screen.getByText("The 10 Specialized Twins Swarm")).toBeInTheDocument();
    expect(screen.getByText("Platform Services Directory (12 Pillars)")).toBeInTheDocument();
    expect(screen.getByText("Auto Cold Outreach Autopilot")).toBeInTheDocument();
    expect(screen.getByText("bKash & Nagad MFS Hub")).toBeInTheDocument();
    expect(screen.getByText("Steadfast Courier Logistics")).toBeInTheDocument();
    expect(screen.getByText("Nilkhet POD Direct Press Hub")).toBeInTheDocument();
    expect(screen.getByText("Sandboxed Live Preview (Builds)")).toBeInTheDocument();
    expect(screen.getByText("Dokploy Micro-Containers")).toBeInTheDocument();
    expect(screen.getByText("WebAssembly Edge CRDT Sync")).toBeInTheDocument();
    expect(screen.getByText("Scenario Lab (Chaos & Stress Simulation)")).toBeInTheDocument();
    expect(screen.getByText("Unified 3D Voice Studio & Neural Orb")).toBeInTheDocument();
    expect(screen.getByText("Skill Provider Emporium & Marketplace")).toBeInTheDocument();
    expect(screen.getByText("Developer Community & Agent Swarm")).toBeInTheDocument();
  });

  it("fires callback and closes palette when a command item is selected", () => {
    const onOpenChange = vi.fn();
    const onOpenSecondMeMemory = vi.fn();
    const onOpenPlatformServices = vi.fn();
    const onOpenAutoColdOutreach = vi.fn();
    const onOpenMfsGateway = vi.fn();
    const onOpenStartupBuilds = vi.fn();
    const onOpenWasmCrdtSync = vi.fn();
    const onOpenScenarioLab = vi.fn();
    const onOpenUnifiedVoice = vi.fn();
    const onOpenEmporium = vi.fn();
    const onOpenCommunity = vi.fn();

    render(
      <TwinCommandPalette
        open={true}
        onOpenChange={onOpenChange}
        onOpenSecondMeMemory={onOpenSecondMeMemory}
        onOpenPlatformServices={onOpenPlatformServices}
        onOpenAutoColdOutreach={onOpenAutoColdOutreach}
        onOpenMfsGateway={onOpenMfsGateway}
        onOpenStartupBuilds={onOpenStartupBuilds}
        onOpenWasmCrdtSync={onOpenWasmCrdtSync}
        onOpenScenarioLab={onOpenScenarioLab}
        onOpenUnifiedVoice={onOpenUnifiedVoice}
        onOpenEmporium={onOpenEmporium}
        onOpenCommunity={onOpenCommunity}
      />
    );

    // Select SecondMe Memory
    const memoryItem = screen.getByText("SecondMe Memory Vault");
    fireEvent.click(memoryItem);

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenSecondMeMemory).toHaveBeenCalledTimes(1);

    // Select Platform Services Directory
    const servicesItem = screen.getByText("Platform Services Directory (12 Pillars)");
    fireEvent.click(servicesItem);
    expect(onOpenPlatformServices).toHaveBeenCalledTimes(1);

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

    // Select WebAssembly Edge CRDT Sync
    const wasmItem = screen.getByText("WebAssembly Edge CRDT Sync");
    fireEvent.click(wasmItem);
    expect(onOpenWasmCrdtSync).toHaveBeenCalledTimes(1);

    // Select Scenario Lab
    const labItem = screen.getByText("Scenario Lab (Chaos & Stress Simulation)");
    fireEvent.click(labItem);
    expect(onOpenScenarioLab).toHaveBeenCalledTimes(1);

    // Select Unified Voice Studio
    const voiceItem = screen.getByText("Unified 3D Voice Studio & Neural Orb");
    fireEvent.click(voiceItem);
    expect(onOpenUnifiedVoice).toHaveBeenCalledTimes(1);

    // Select Emporium Marketplace
    const emporiumItem = screen.getByText("Skill Provider Emporium & Marketplace");
    fireEvent.click(emporiumItem);
    expect(onOpenEmporium).toHaveBeenCalledTimes(1);

    // Select Developer Community
    const communityItem = screen.getByText("Developer Community & Agent Swarm");
    fireEvent.click(communityItem);
    expect(onOpenCommunity).toHaveBeenCalledTimes(1);

    // Select NBR Mushak-6.3 Tax Studio
    const taxItem = screen.getByText("NBR Mushak-6.3 Statutory VAT & TDS Studio");
    expect(taxItem).toBeInTheDocument();

    // Select AI Legal Contracts & Stamp Duty Act 1899 Studio
    const legalItem = screen.getByText("AI Legal Contracts & Stamp Duty Act 1899 Studio");
    expect(legalItem).toBeInTheDocument();
  });
});
