import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LandRegistryModal } from "../LandRegistryModal";

describe("Frontend AG-UI Component: LandRegistryModal (Slice 79)", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            conversions: {
              shatangsho: 10,
              katha: 6.05,
              bigha: 0.3025,
              chhotak: 96.8,
              acre: 0.1,
              sqft: 4356,
              sqmeter: 404.69,
            },
          },
        }),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders modal with header and tabs when open", () => {
    render(<LandRegistryModal isOpen={true} onClose={() => {}} />);

    expect(
      screen.getByText(/(জমি রেকর্ড ও বায়া দলিল যাচাইকরণ স্টুডিও|Bengali Land Record & Title Verification Studio)/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/খতিয়ান ও দলিল/i)).toBeInTheDocument();
    expect(screen.getByText(/পরিমাপ রূপান্তর \(Area Units\)/i)).toBeInTheDocument();
    expect(
      screen.getByText(/স্ট্যাম্প ও রেজিস্ট্রেশন ফি \(Stamp & Fees\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/বায়া দলিল অডিট \(Chain of Title\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ই-নামজারি ও সনদ \(e-Mutation & Seal\)/i)
    ).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <LandRegistryModal isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("toggles between Bengali and English language modes", () => {
    render(<LandRegistryModal isOpen={true} onClose={() => {}} />);

    // Initially in Bengali mode
    expect(
      screen.getByText(/জমি রেকর্ড ও বায়া দলিল যাচাইকরণ স্টুডিও/i)
    ).toBeInTheDocument();

    // Click EN button
    const enBtn = screen.getByRole("button", { name: "EN" });
    fireEvent.click(enBtn);

    expect(
      screen.getByText(/Bengali Land Record & Title Verification Studio/i)
    ).toBeInTheDocument();

    // Click বাং button
    const bnBtn = screen.getByRole("button", { name: "বাং" });
    fireEvent.click(bnBtn);

    expect(
      screen.getByText(/জমি রেকর্ড ও বায়া দলিল যাচাইকরণ স্টুডিও/i)
    ).toBeInTheDocument();
  });

  it("switches tabs to Stamp & Fees Calculator and calculates fees", () => {
    render(<LandRegistryModal isOpen={true} onClose={() => {}} />);

    const feeTab = screen.getByText(/স্ট্যাম্প ও রেজিস্ট্রেশন ফি/i);
    fireEvent.click(feeTab);

    expect(
      screen.getByText(/Statutory Deed Registration & Stamp Duty Calculator/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/(Total Government Fees|মোট সরকারি খরচ)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /(সরকারি ফি হিসাব করুন|Calculate Statutory Fees)/i })
    ).toBeInTheDocument();
  });

  it("switches tabs to Chain of Title Auditor and shows transfer history", () => {
    render(<LandRegistryModal isOpen={true} onClose={() => {}} />);

    const chainTab = screen.getByText(/বায়া দলিল অডিট/i);
    fireEvent.click(chainTab);

    expect(
      screen.getByText(/Chain-of-Ownership \(বায়া দলিল ধারাবাহিকতা\) Timeline Auditor/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/CS Survey/i)).toBeInTheDocument();
    expect(screen.getByText(/SA Survey/i)).toBeInTheDocument();
    expect(screen.getByText(/RS Survey/i)).toBeInTheDocument();
    expect(screen.getByText(/Current_Deed Survey/i)).toBeInTheDocument();
  });

  it("switches tabs to e-Mutation & Seal and shows certificate info", () => {
    render(<LandRegistryModal isOpen={true} onClose={() => {}} />);

    const mutationTab = screen.getByText(/ই-নামজারি ও সনদ/i);
    fireEvent.click(mutationTab);

    expect(
      screen.getByText(/AC Land e-Mutation \(ই-নামজারি\) Readiness Screener/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Cryptographic Title Search Audit Seal/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/SHOTHIK_LAND_DHA_/i)).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", () => {
    const onCloseMock = vi.fn();
    render(<LandRegistryModal isOpen={true} onClose={onCloseMock} />);

    const closeBtn = screen.getByLabelText("Close");
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    const onCloseMock = vi.fn();
    render(<LandRegistryModal isOpen={true} onClose={onCloseMock} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
