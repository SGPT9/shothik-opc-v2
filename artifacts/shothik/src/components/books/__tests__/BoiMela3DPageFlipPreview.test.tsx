import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BoiMela3DPageFlipPreview, toBengaliNumber } from "../BoiMela3DPageFlipPreview";

describe("BoiMela3DPageFlipPreview", () => {
  it("converts numbers to Bengali numerals accurately", () => {
    expect(toBengaliNumber(1)).toBe("১");
    expect(toBengaliNumber(123)).toBe("১২৩");
    expect(toBengaliNumber(2026)).toBe("২০২৬");
  });

  it("renders cover page initially with book title, author, and Royal Demy badge", () => {
    render(<BoiMela3DPageFlipPreview />);

    expect(screen.getByText(/ডিজিটাল অমর একুশে/)).toBeDefined();
    expect(screen.getByText(/ড. সাইফুর রহমান/)).toBeDefined();
    expect(screen.getByText(/6.0 × 9.0" Royal Demy/i)).toBeDefined();
    expect(screen.getByText(/প্রচ্ছদ \(Cover Page\)/i)).toBeDefined();
  });

  it("navigates to next and previous chapter pages with Bengali numbering", async () => {
    render(<BoiMela3DPageFlipPreview />);

    const nextBtn = screen.getByTitle("Next Page");
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText(/প্রথম অধ্যায়/)).toBeDefined();
      expect(screen.getByText(/পৃষ্ঠা ১ \/ ৩/)).toBeDefined();
    });

    const prevBtn = screen.getByTitle("Previous Page");
    fireEvent.click(prevBtn);

    await waitFor(() => {
      expect(screen.getByText(/প্রচ্ছদ \(Cover Page\)/i)).toBeDefined();
    });
  });

  it("toggles print guides (CMYK, Gutter, Bleed) on the 3D book canvas", () => {
    render(<BoiMela3DPageFlipPreview />);

    const cmykBtn = screen.getByText(/300 DPI CMYK গাইড/i);
    fireEvent.click(cmykBtn);
    expect(screen.getByText("300 DPI")).toBeDefined();

    const gutterBtn = screen.getByText(/0.75" বাইন্ডিং গাটার/i);
    fireEvent.click(gutterBtn);
    expect(screen.getByText(/0.75" Gutter/i)).toBeDefined();

    const bleedBtn = screen.getByText(/0.125" ব্লিড মার্জিন/i);
    fireEvent.click(bleedBtn);
    expect(screen.getByText(/0.125" Bleed/i)).toBeDefined();
  });

  it("switches to print specs view with distribution channels", () => {
    render(<BoiMela3DPageFlipPreview />);

    const specBtn = screen.getByText("প্রিন্ট স্পেক্স");
    fireEvent.click(specBtn);

    expect(screen.getByText(/অমর একুশে প্রিন্ট স্পেসিফিকেশন/i)).toBeDefined();
    expect(screen.getByText(/6.0 × 9.0 ইঞ্চি/i)).toBeDefined();
    expect(screen.getByText(/Steadfast COD/i)).toBeDefined();
    expect(screen.getByText(/Amar Ekushey 2026/i)).toBeDefined();
    expect(screen.getByText(/রকমারি ডট কম/i)).toBeDefined();
    expect(screen.getByText(/বইবাজার প্রকাশনা/i)).toBeDefined();
    expect(screen.getByText(/লুমফিড ডিজিটাল এডিশন/i)).toBeDefined();
  });

  it("allows switching book edition cover presets", () => {
    render(<BoiMela3DPageFlipPreview />);

    const ekusheyBtn = screen.getByText("অমর একুশে উপন্যাস");
    const techBtn = screen.getByText("Tech Playbook");
    const poetryBtn = screen.getByText("কবিতা সংকলন");

    expect(ekusheyBtn).toBeDefined();
    expect(techBtn).toBeDefined();
    expect(poetryBtn).toBeDefined();

    fireEvent.click(techBtn);
    expect(techBtn.closest("button")).toBeDefined();
  });

  it("triggers 1-Click Print PDF export", async () => {
    render(<BoiMela3DPageFlipPreview />);

    const exportBtn = screen.getByText(/১-ক্লিক ৬×৯ প্রিন্ট-রেডি পিডিএফ ডাউনলোড/i);
    fireEvent.click(exportBtn);

    expect(screen.getByText(/পিডিএফ জেনারেট হচ্ছে/i)).toBeDefined();

    await waitFor(
      () => {
        expect(screen.getByText(/৬×৯ প্রিন্ট পিডিএফ ডাউনলোড সম্পন্ন/i)).toBeDefined();
      },
      { timeout: 3000 }
    );
  });
});
