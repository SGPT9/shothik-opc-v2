import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NewCompanyWizardPage from "../(primary-layout)/twin/new/page";
import { listOfflineTasks, listOfflineManuscripts, clearOfflineStorage } from "@/lib/offline/offline-storage";

describe("Polsia Company Creation Wizard (/twin/new)", () => {
  beforeEach(() => {
    clearOfflineStorage();
  });

  it("renders Step 1 with input fields and auto-slugified subdomain", () => {
    render(<NewCompanyWizardPage />);

    expect(screen.getByText("New Autonomous Company Slot")).toBeInTheDocument();
    
    const nameInput = screen.getByTestId("input-company-name");
    fireEvent.change(nameInput, { target: { value: "MediFlow AI" } });

    expect(screen.getByText("mediflow-ai")).toBeInTheDocument();
    expect(screen.getByTestId("button-synthesize-company")).toBeEnabled();
  });

  it("completes synthesis and populates the first 10 Wayfinder tickets", async () => {
    render(<NewCompanyWizardPage />);

    const nameInput = screen.getByTestId("input-company-name");
    fireEvent.change(nameInput, { target: { value: "DhakaLogistics" } });

    const synthesizeBtn = screen.getByTestId("button-synthesize-company");
    fireEvent.click(synthesizeBtn);

    // Should transition to Step 2 then Step 3
    await waitFor(
      () => {
        expect(screen.getByText("DhakaLogistics Successfully Synthesized")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    expect(screen.getByText("First 10 Wayfinder Delivery Tickets (Auto-Populated)")).toBeInTheDocument();
    expect(screen.getByTestId("preview-ticket-wf-1")).toBeInTheDocument();
    expect(screen.getByTestId("preview-ticket-wf-10")).toBeInTheDocument();
  });

  it("persists all 10 tickets and PRD to offline-storage on launch", async () => {
    render(<NewCompanyWizardPage />);

    const nameInput = screen.getByTestId("input-company-name");
    fireEvent.change(nameInput, { target: { value: "FinFlow" } });

    const synthesizeBtn = screen.getByTestId("button-synthesize-company");
    fireEvent.click(synthesizeBtn);

    await waitFor(
      () => {
        expect(screen.getByTestId("button-launch-company")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    const launchBtn = screen.getByTestId("button-launch-company");
    fireEvent.click(launchBtn);

    const tasks = listOfflineTasks();
    expect(tasks.length).toBe(10);
    expect(tasks.some((t) => t.title.includes("Dokploy PaaS"))).toBe(true);
    expect(tasks.some((t) => t.title.includes("bKash & Nagad"))).toBe(true);

    const docs = listOfflineManuscripts();
    expect(docs.length).toBe(1);
    expect(docs[0].title).toContain("FinFlow PRD");
  });
});
