import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeepResearchStudioModal } from "../DeepResearchStudioModal";

describe("Frontend AG-UI Component: DeepResearchStudioModal (DeerFlow 2.0 Integration)", () => {
  it("renders DeepResearchStudioModal with WAI-ARIA role and tab navigation", () => {
    render(<DeepResearchStudioModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/DeerFlow 2.0 Deep Research & Academic Studio/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /^Systematic Literature Review \(SLR\)$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^Academic Manuscript & Nilkhet PoD$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^NBR Mushak & Math Sandbox$/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /^Bi-Directional MCP Tools$/i })).toBeDefined();
  });

  it("switches to Systematic Literature Review tab and displays topic and scope controls", () => {
    render(<DeepResearchStudioModal isOpen={true} onClose={() => {}} />);

    const slrTab = screen.getByRole("button", { name: /^Systematic Literature Review \(SLR\)$/i });
    fireEvent.click(slrTab);

    expect(screen.getByText(/Research Topic Query/i)).toBeDefined();
    expect(screen.getByText(/Field of Study/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Run DeerFlow 2.0 Systematic Literature Review/i })).toBeDefined();
  });

  it("switches to Academic Manuscript tab and displays manuscript and methodology controls", () => {
    render(<DeepResearchStudioModal isOpen={true} onClose={() => {}} />);

    const paperTab = screen.getByRole("button", { name: /^Academic Manuscript & Nilkhet PoD$/i });
    fireEvent.click(paperTab);

    expect(screen.getByText(/Manuscript Title/i)).toBeDefined();
    expect(screen.getByText(/Formatting Standard/i)).toBeDefined();
    expect(screen.getByText(/Methodological Framework/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Generate Peer-Reviewed Academic Manuscript/i })).toBeDefined();
  });

  it("switches to NBR Mushak & Math Sandbox tab and displays tax calculation controls", () => {
    render(<DeepResearchStudioModal isOpen={true} onClose={() => {}} />);

    const sandboxTab = screen.getByRole("button", { name: /^NBR Mushak & Math Sandbox$/i });
    fireEvent.click(sandboxTab);

    expect(screen.getByText(/Base Amount \(৳ BDT\)/i)).toBeDefined();
    expect(screen.getByText(/Supplementary Duty/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Execute in DeerFlow Isolated Sandbox/i })).toBeDefined();
  });

  it("switches to Bi-Directional MCP Tools tab and displays active RPC tool endpoints", () => {
    render(<DeepResearchStudioModal isOpen={true} onClose={() => {}} />);

    const mcpTab = screen.getByRole("button", { name: /Bi-Directional MCP Tools/i });
    fireEvent.click(mcpTab);

    expect(screen.getByText(/shothik_deerflow_slr/i)).toBeDefined();
    expect(screen.getByText(/shothik_mushak_calc/i)).toBeDefined();
    expect(screen.getByText(/shothik_mfs_payout/i)).toBeDefined();
    expect(screen.getByText(/shothik_courier_booking/i)).toBeDefined();
  });
});
