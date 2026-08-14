import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DokployMicroContainersModal } from "../DokployMicroContainersModal";

describe("Dokploy Multi-Container Micro-Cluster (DokployMicroContainersModal.tsx)", () => {
  it("renders container list, RAM stats, and port allocations", () => {
    render(<DokployMicroContainersModal open={true} onOpenChange={() => {}} companyName="VerifiQ AI" />);

    expect(screen.getByText(/Dokploy Multi-Container Micro-Cluster/i)).toBeInTheDocument();
    expect(screen.getByText(/shothik-storefront-nextjs/i)).toBeInTheDocument();
    expect(screen.getByText(/shothik-postgres-db/i)).toBeInTheDocument();
    expect(screen.getByText(/Cluster Memory Usage/i)).toBeInTheDocument();
  });

  it("handles container restart action", () => {
    render(<DokployMicroContainersModal open={true} onOpenChange={() => {}} companyName="VerifiQ AI" />);

    const restartBtn = screen.getByTestId("button-restart-cnt-1");
    fireEvent.click(restartBtn);

    expect(screen.getAllByText(/Restarting/i).length).toBeGreaterThan(0);
  });
});
