import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommercializeBookModal } from "../components/CommercializeBookModal";

describe("Commercialize Book in Twin Modal (CommercializeBookModal.tsx)", () => {
  it("renders book commercialization channels and triggers 1-click launch", () => {
    render(
      <CommercializeBookModal
        open={true}
        onOpenChange={() => {}}
        manuscriptTitle="Echoes of the River"
        wordCount={45200}
      />
    );

    expect(screen.getByText("Commercialize with Autonomous Co-Founder")).toBeInTheDocument();
    expect(screen.getByText("Echoes of the River")).toBeInTheDocument();
    expect(screen.getByText("1-Tap bKash Checkout Storefront")).toBeInTheDocument();
    expect(screen.getByText("Cold Email Reviewer Outreach")).toBeInTheDocument();
    expect(screen.getByText("Steadfast COD & POD Preflight")).toBeInTheDocument();

    const launchBtn = screen.getByTestId("button-launch-commercialization");
    fireEvent.click(launchBtn);
  });
});
