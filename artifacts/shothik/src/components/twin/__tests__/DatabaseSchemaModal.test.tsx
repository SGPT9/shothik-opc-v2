import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DatabaseSchemaModal } from "../DatabaseSchemaModal";

describe("PostgreSQL Database Schema Explorer (DatabaseSchemaModal.tsx)", () => {
  it("renders database tables, column types, and RLS policy badges", () => {
    render(<DatabaseSchemaModal open={true} onOpenChange={() => {}} companyName="VerifiQ AI" />);

    expect(screen.getByText(/PostgreSQL Database Schema & Tables/i)).toBeInTheDocument();
    expect(screen.getByText(/Postgres 16 · InsForge BaaS/i)).toBeInTheDocument();
    expect(screen.getAllByText(/orders/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/products/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/users/i).length).toBeGreaterThan(0);
  });

  it("seeds 25 test records across tables when clicking Seed Test Data", async () => {
    render(<DatabaseSchemaModal open={true} onOpenChange={() => {}} companyName="VerifiQ AI" />);

    const seedBtn = screen.getByTestId("button-seed-database");
    fireEvent.click(seedBtn);

    await waitFor(() => {
      expect(screen.getByText(/25 Records Seeded!/i)).toBeInTheDocument();
    });
  });
});
