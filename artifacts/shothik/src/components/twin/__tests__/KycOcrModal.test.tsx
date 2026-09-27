import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KycOcrModal } from "../KycOcrModal";

describe("Frontend AG-UI Component: KycOcrModal (Slice 76)", () => {
  it("renders KycOcrModal with NID and Trade License tabs", () => {
    render(<KycOcrModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/Bengali KYC & NID \/ Trade License OCR/i)).toBeInTheDocument();
    expect(screen.getByText(/National ID \(স্মার্ট এনআইডি\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Trade License \(ট্রেড লাইসেন্স\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Process Smart NID OCR/i)).toBeInTheDocument();
    expect(screen.getByText(/Demographic Compliance Standard/i)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(<KycOcrModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("switches tabs between NID and Trade License", () => {
    render(<KycOcrModal isOpen={true} onClose={() => {}} />);

    const tradeTab = screen.getByText(/Trade License \(ট্রেড লাইসেন্স\)/i);
    fireEvent.click(tradeTab);

    expect(screen.getByText(/Trade License Document Payload/i)).toBeInTheDocument();
    expect(screen.getByText(/Process Trade License OCR/i)).toBeInTheDocument();
  });

  it("renders empty state placeholder before extraction", () => {
    render(<KycOcrModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/No document processed yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Click process to extract and verify entities/i)).toBeInTheDocument();
  });
});
