import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TeaAuctionModal } from "../TeaAuctionModal";

describe("Frontend AG-UI Component: TeaAuctionModal (Slice 90)", () => {
  it("renders TeaAuctionModal with WAI-ARIA role and tab navigation", () => {
    render(<TeaAuctionModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(/চা নিলাম ও গুণমান ক্লিয়ারিং ইঞ্জিন/i)).toBeDefined();
    expect(screen.getByRole("tab", { name: /লাইভ নিলাম ও ডিও/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /টি টেস্টারের মূল্যায়ন/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /ক্ষুদ্র চাষী সবুজ পাতা/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /চা বাগান তালিকা/i })).toBeDefined();
  });

  it("displays live auction bidding controls and interacts with form", () => {
    render(<TeaAuctionModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/লট নম্বর \(Lot ID\)/i)).toBeDefined();
    expect(screen.getByText(/পাতার গ্রেড \(Leaf Grade\)/i)).toBeDefined();
    expect(screen.getByText(/বর্তমান সর্বোচ্চ ডাক/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /নিলামে ডাক দিন/i })).toBeDefined();

    // Trigger bid submission
    const bidBtn = screen.getByRole("button", { name: /নিলামে ডাক দিন/i });
    fireEvent.click(bidBtn);
  });

  it("switches to Tea Taster Appraisal tab and displays sensory sliders", () => {
    render(<TeaAuctionModal isOpen={true} onClose={() => {}} />);

    const tasterTab = screen.getByRole("tab", { name: /টি টেস্টারের মূল্যায়ন/i });
    fireEvent.click(tasterTab);

    expect(screen.getByText(/পাতার বাহ্যিক রূপ ও আকার/i)).toBeDefined();
    expect(screen.getByText(/তামাটে সুবাস ও উজ্জ্বলতা/i)).toBeDefined();
    expect(screen.getByText(/লিকারের বর্ণ ও গভীরতা/i)).toBeDefined();
    expect(screen.getByText(/তেজ ও কড়া ভাব/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /টি টেস্টার স্কোর গণনা করুন/i })).toBeDefined();
  });

  it("switches to Smallholder Green Leaf tab and displays fair pricing calculator", () => {
    render(<TeaAuctionModal isOpen={true} onClose={() => {}} />);

    const smallholderTab = screen.getByRole("tab", { name: /ক্ষুদ্র চাষী সবুজ পাতা/i });
    fireEvent.click(smallholderTab);

    expect(screen.getByText(/উত্তরাঞ্চলের সমতল চা চাষী সুরক্ষা ফর্মুলা/i)).toBeDefined();
    expect(screen.getByText(/নিলাম গড় তৈরি চা মূল্য/i)).toBeDefined();
    expect(screen.getByText(/সবুজ পাতার পরিমাণ/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /ন্যায্য সংগ্রহ মূল্য হিসাব করুন/i })).toBeDefined();
  });
});
