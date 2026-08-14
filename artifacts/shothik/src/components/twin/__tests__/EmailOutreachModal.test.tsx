import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EmailOutreachModal } from "../EmailOutreachModal";

describe("Cold Email Outreach Modal (EmailOutreachModal.tsx)", () => {
  it("renders prospects table and adds a new lead", () => {
    render(<EmailOutreachModal open={true} onOpenChange={() => {}} />);

    expect(screen.getByText("Cold Email Outreach Autopilot")).toBeInTheDocument();
    expect(screen.getByText("Total Leads")).toBeInTheDocument();

    const nameInput = screen.getByTestId("input-lead-name");
    const emailInput = screen.getByTestId("input-lead-email");
    const companyInput = screen.getByTestId("input-lead-company");
    const addBtn = screen.getByTestId("button-add-lead");

    fireEvent.change(nameInput, { target: { value: "Karim Uddin" } });
    fireEvent.change(emailInput, { target: { value: "karim@chaldalclone.bd" } });
    fireEvent.change(companyInput, { target: { value: "Chaldal Clone" } });

    fireEvent.click(addBtn);

    expect(screen.getByText("Karim Uddin")).toBeInTheDocument();
    expect(screen.getByText("Chaldal Clone")).toBeInTheDocument();
  });

  it("dispatches queued leads when clicking dispatch button", async () => {
    render(<EmailOutreachModal open={true} onOpenChange={() => {}} />);

    const dispatchBtn = screen.getByTestId("button-dispatch-batch");
    fireEvent.click(dispatchBtn);

    await waitFor(() => {
      expect(screen.getByText("Dispatched!")).toBeInTheDocument();
    });
  });
});
