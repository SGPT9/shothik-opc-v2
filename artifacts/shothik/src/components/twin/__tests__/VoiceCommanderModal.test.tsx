import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { VoiceCommanderModal } from "../VoiceCommanderModal";

describe("Banglish Voice Commander Modal (VoiceCommanderModal.tsx)", () => {
  it("renders voice orb, language toggles, and quick command suggestions", () => {
    render(<VoiceCommanderModal open={true} onOpenChange={() => {}} companyName="VerifiQ AI" />);

    expect(screen.getByText(/Banglish Voice Commander/i)).toBeInTheDocument();
    expect(screen.getByText(/Web Speech V2/i)).toBeInTheDocument();
    expect(screen.getByTestId("voice-mic-button")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Banglish" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "বাংলা" })).toBeInTheDocument();
  });

  it("triggers quick command and logs action response in conversation history", () => {
    render(<VoiceCommanderModal open={true} onOpenChange={() => {}} companyName="VerifiQ AI" />);

    const quickCmd = screen.getByTestId("quick-cmd-0");
    act(() => {
      fireEvent.click(quickCmd);
    });

    expect(screen.getByText(/Kaj hoye geche!/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Checked MFS ledger/i).length).toBeGreaterThan(0);
  });
});
