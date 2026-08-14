import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LeadCrmDrawer } from "../LeadCrmDrawer";

describe("Unified Customer Prospecting & Lead CRM (LeadCrmDrawer.tsx)", () => {
  it("renders leads table, pipeline value, and channel filters", () => {
    render(<LeadCrmDrawer open={true} onOpenChange={() => {}} companyName="VerifiQ AI" />);

    expect(screen.getByText(/Unified Customer Prospecting & Lead CRM/i)).toBeInTheDocument();
    expect(screen.getByText(/Pipeline Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Tanvir Hossain/i)).toBeInTheDocument();
    expect(screen.getByText(/Banani Fashion House/i)).toBeInTheDocument();

    const whatsappFilter = screen.getAllByText("WhatsApp")[0];
    fireEvent.click(whatsappFilter);

    expect(screen.getByText(/Dhanmondi Prep Academy/i)).toBeInTheDocument();
    expect(screen.queryByText(/Banani Fashion House/i)).not.toBeInTheDocument();
  });

  it("adds a new prospect lead and updates the pipeline table", async () => {
    render(<LeadCrmDrawer open={true} onOpenChange={() => {}} companyName="VerifiQ AI" />);

    const addLeadBtn = screen.getByTestId("button-add-lead-crm");
    fireEvent.click(addLeadBtn);

    expect(screen.getByText(/Add New Prospect Lead/i)).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/e.g. Tanvir Hasan/i);
    const emailInput = screen.getByPlaceholderText(/e.g. tanvir@dhakatech.bd/i);
    const companyInput = screen.getByPlaceholderText(/e.g. Dhaka Tech Ltd/i);

    fireEvent.change(nameInput, { target: { value: "Karim Chowdhury" } });
    fireEvent.change(emailInput, { target: { value: "karim@motijheel.bd" } });
    fireEvent.change(companyInput, { target: { value: "Motijheel Financial" } });

    const saveBtn = screen.getByText("Save Lead");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Karim Chowdhury/i)).toBeInTheDocument();
      expect(screen.getByText(/Motijheel Financial/i)).toBeInTheDocument();
    });
  });
});
