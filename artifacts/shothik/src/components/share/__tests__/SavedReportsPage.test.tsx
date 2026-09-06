import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SavedReportsPage, { getBanglaBrief } from "@/app-next/(primary-layout)/saved-reports/page";

describe("Saved Reports & Briefs Page (SavedReportsPage.tsx)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("getBanglaBrief generates specialized briefs for tax, pitch deck, and MFS", () => {
    const taxBrief = getBanglaBrief("NBR Income Tax Act 2023", "Section 78 investment rebate");
    expect(taxBrief.summary).toContain("জাতীয় রাজস্ব বোর্ড (NBR) আয়কর আইন ২০২৩");
    expect(taxBrief.takeaways.length).toBeGreaterThanOrEqual(3);
    expect(taxBrief.kpis[0].label).toBe("কর রেয়াত");

    const pitchBrief = getBanglaBrief("10-Slide Investor Pitch Deck", "BD E-Commerce TAM analysis");
    expect(pitchBrief.summary).toContain("১০-স্লাইডের প্রাতিষ্ঠানিক পিচ ডেক");
    expect(pitchBrief.kpis[0].value).toBe("$1.2B");

    const mfsBrief = getBanglaBrief("bKash & Nagad MFS Merchant Settlement API", "TrxID webhook");
    expect(mfsBrief.summary).toContain("বিকাশ ও নগদ এমএফএস");
    expect(mfsBrief.kpis[0].label).toBe("ক্যাশআউট ফি");
  });

  it("renders saved reports page heading and default hydrated reports", () => {
    render(<SavedReportsPage />);

    expect(screen.getByText("Saved Reports & Briefs")).toBeInTheDocument();
    expect(screen.getByTestId("input-search-saved-reports")).toBeInTheDocument();
    expect(screen.getByText("Bangla Briefing Active")).toBeInTheDocument();
    expect(screen.getByText("Papermark Tracking")).toBeInTheDocument();

    // Default sessions contain Investor Pitch Deck and NBR Tax
    expect(screen.getByText(/10-Slide Investor Pitch Deck/i)).toBeInTheDocument();
    expect(screen.getByText(/NBR Income Tax Act 2023/i)).toBeInTheDocument();
  });

  it("toggles vernacular Bangla Executive Briefing card when clicking the Bangla button", () => {
    render(<SavedReportsPage />);

    const banglaBtn = screen.getByTestId("toggle-bangla-conv_pitch_deck");
    expect(banglaBtn).toHaveTextContent("বাংলা");

    // Click toggle to reveal Bangla Brief
    fireEvent.click(banglaBtn);

    expect(banglaBtn).toHaveTextContent("বাংলা ব্রিফ");
    const briefCard = screen.getByTestId("bangla-brief-conv_pitch_deck");
    expect(briefCard).toBeInTheDocument();
    expect(briefCard).toHaveTextContent("নির্বাহী সারসংক্ষেপ (Executive Brief)");
    expect(briefCard).toHaveTextContent("১০-স্লাইডের প্রাতিষ্ঠানিক পিচ ডেক");
    expect(briefCard).toHaveTextContent("TAM: $1.2B");

    // Click again to collapse
    fireEvent.click(banglaBtn);
    expect(screen.queryByTestId("bangla-brief-conv_pitch_deck")).not.toBeInTheDocument();
  });

  it("filters report items when searching in search bar", () => {
    render(<SavedReportsPage />);

    const searchInput = screen.getByTestId("input-search-saved-reports");
    fireEvent.change(searchInput, { target: { value: "Rebate" } });

    expect(screen.getByText(/NBR Income Tax Act 2023 & Section 78 Rebate/i)).toBeInTheDocument();
    expect(screen.queryByText(/Dhaka Logistics Competitor TAM Analysis/i)).not.toBeInTheDocument();
  });

  it("opens Papermark secure share modal, toggles password protection, and closes modal", () => {
    render(<SavedReportsPage />);

    const papermarkBtn = screen.getByTestId("btn-papermark-conv_tax_sro");
    fireEvent.click(papermarkBtn);

    // Modal appears
    expect(screen.getByTestId("modal-papermark-share")).toBeInTheDocument();
    expect(screen.getByText("Secure Public Share")).toBeInTheDocument();
    expect(screen.getByText("Papermark-grade trackable link with viewer analytics")).toBeInTheDocument();
    expect(screen.getByText("Real-Time Viewer Analytics")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument(); // Views count

    // URL input
    const urlInput = screen.getByTestId("input-share-url") as HTMLInputElement;
    expect(urlInput.value).toContain("/share/r/conv_tax_sro");

    // Toggle password protection
    const togglePwd = screen.getByTestId("toggle-password-protect");
    fireEvent.click(togglePwd);

    const passcode = screen.getByTestId("input-access-passcode") as HTMLInputElement;
    expect(passcode).toBeInTheDocument();
    expect(passcode.value).toBe("shothik2026");

    // Close modal
    fireEvent.click(screen.getByTestId("button-close-share-modal"));
    expect(screen.queryByTestId("modal-papermark-share")).not.toBeInTheDocument();
  });

  it("triggers WhatsApp sharing with vernacular Bengali payload when Bangla is active", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<SavedReportsPage />);

    // Toggle Bangla on first report
    fireEvent.click(screen.getByTestId("toggle-bangla-conv_pitch_deck"));

    // Click WhatsApp button
    const waBtn = screen.getByTestId("btn-whatsapp-conv_pitch_deck");
    expect(waBtn).toHaveTextContent("WA (বাংলা)");
    fireEvent.click(waBtn);

    expect(openSpy).toHaveBeenCalled();
    const calledUrl = openSpy.mock.calls[0][0] as string;
    expect(calledUrl).toContain("https://api.whatsapp.com/send?text=");
    expect(decodeURIComponent(calledUrl)).toContain("বাংলা নির্বাহী সারসংক্ষেপ");

    openSpy.mockRestore();
  });
});
