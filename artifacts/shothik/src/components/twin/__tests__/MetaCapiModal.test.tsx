import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MetaCapiModal } from "../MetaCapiModal";

describe("Frontend AG-UI Component: MetaCapiModal", () => {
  it("renders MetaCapiModal with Event Match Quality and tabs", () => {
    render(<MetaCapiModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/Meta & TikTok Conversion API/i)).toBeInTheDocument();
    expect(screen.getByText(/Offline COD Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Event Match Quality/i)).toBeInTheDocument();
    expect(screen.getByText(/Pixel Health & ROAS/i)).toBeInTheDocument();
    expect(screen.getByText(/Realtime CAPI Tester/i)).toBeInTheDocument();
    expect(screen.getByText(/Offline COD Postback/i)).toBeInTheDocument();
  });

  it("switches to Realtime CAPI Tester tab and renders input fields", () => {
    render(<MetaCapiModal isOpen={true} onClose={() => {}} />);

    const testTab = screen.getByText(/Realtime CAPI Tester/i);
    fireEvent.click(testTab);

    expect(screen.getByText(/Dispatch Realtime Server-Side CAPI Event/i)).toBeInTheDocument();
    expect(screen.getByText(/Customer Phone/i)).toBeInTheDocument();
    expect(screen.getByText(/Order Amount \(BDT\)/i)).toBeInTheDocument();
  });

  it("switches to Offline COD Postback tab and renders courier options", () => {
    render(<MetaCapiModal isOpen={true} onClose={() => {}} />);

    const codTab = screen.getByText(/Offline COD Postback/i);
    fireEvent.click(codTab);

    expect(screen.getByText(/Simulate Doorstep COD Delivery Postback/i)).toBeInTheDocument();
    expect(screen.getByText(/Courier Partner/i)).toBeInTheDocument();
  });
});
