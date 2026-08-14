import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DailyDigestModal } from "../DailyDigestModal";

describe("Daily CEO Briefing Modal (DailyDigestModal.tsx)", () => {
  it("renders daily digest preview and dispatches test email on click", async () => {
    render(<DailyDigestModal open={true} onOpenChange={() => {}} companyName="VerifiQ AI" />);

    expect(screen.getByText("Daily CEO Morning Email Briefing")).toBeInTheDocument();
    expect(screen.getByText("SHOTHIK TWIN · DAILY CEO BRIEFING")).toBeInTheDocument();
    expect(screen.getByText("Send Test Email Now")).toBeInTheDocument();

    const sendBtn = screen.getByTestId("button-send-test-digest");
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText("Test Dispatched!")).toBeInTheDocument();
    });
  });
});
