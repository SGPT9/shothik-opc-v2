import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BoiMela3DPageFlipPreview } from "../BoiMela3DPageFlipPreview.js";

describe("BoiMela3DPageFlipPreview", () => {
  it("renders cover page initially with book title and author", () => {
    render(<BoiMela3DPageFlipPreview />);

    expect(screen.getByText(/ডিজিটাল অমর একুশে/)).toBeDefined();
    expect(screen.getByText(/ড. সাইফুর রহমান/)).toBeDefined();
    expect(screen.getByText(/প্রচ্ছদ \(Cover\)/)).toBeDefined();
  });

  it("navigates to next page on click", () => {
    render(<BoiMela3DPageFlipPreview />);

    const nextBtn = screen.getByTitle("Next Page");
    fireEvent.click(nextBtn);

    expect(screen.getByText(/প্রথম অধ্যায়/)).toBeDefined();
    expect(screen.getByText(/পৃষ্ঠা ১ \/ ৩/)).toBeDefined();
  });

  it("switches to print specs view", () => {
    render(<BoiMela3DPageFlipPreview />);

    const specBtn = screen.getByText("প্রিন্ট স্পেক্স");
    fireEvent.click(specBtn);

    expect(screen.getByText(/অমর একুশে প্রিন্ট স্পেসিফিকেশন/)).toBeDefined();
    expect(screen.getByText(/6.0 × 9.0 ইঞ্চি/)).toBeDefined();
  });
});
