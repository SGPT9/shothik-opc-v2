import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ScenarioLabModal } from "../ScenarioLabModal";

describe("ScenarioLabModal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 30-scenario system reliability view and metrics", () => {
    render(<ScenarioLabModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/ScenarioLab™ Stress-Test & Financial Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/900 Monte Carlo Runs Locked/i)).toBeInTheDocument();
    expect(screen.getByText(/30-Scenario System Reliability \(900-Run Monte Carlo\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Financial TAM \/ SAM \/ SOM CAC Payback Engine/i)).toBeInTheDocument();
  });

  it("switches to financial projections tab, toggles BDT currency, and triggers CSV spreadsheet download", async () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    const createObjectURLMock = vi.fn(() => "blob:http://localhost/mock-csv-uuid");
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    render(<ScenarioLabModal isOpen={true} onClose={() => {}} initialTab="financial" />);

    // Verify TAM / SAM / SOM inputs
    await waitFor(() => {
      expect(screen.getByText(/TAM \(Total Addressable Market\)/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Cash-on-Delivery \(COD\) Return/i)).toBeInTheDocument();
    expect(screen.getByText(/bKash\/Nagad MFS Cash-Out Fee/i)).toBeInTheDocument();

    // Toggle currency to BDT
    const bdtBtn = screen.getByRole("button", { name: /BDT \(৳\)/i });
    fireEvent.click(bdtBtn);

    // Verify CSV download button exists and triggers blob export
    const downloadCsvBtn = screen.getByTestId("button-download-scenariolab-csv");
    expect(downloadCsvBtn).toBeInTheDocument();

    fireEvent.click(downloadCsvBtn);
    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
  });
});
