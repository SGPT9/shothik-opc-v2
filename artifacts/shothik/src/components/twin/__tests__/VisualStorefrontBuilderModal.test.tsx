import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { VisualStorefrontBuilderModal } from "../VisualStorefrontBuilderModal";

describe("Visual No-Code Storefront & Landing Page Builder (VisualStorefrontBuilderModal.tsx)", () => {
  it("renders visual sections and toggles between desktop and mobile viewports", () => {
    render(
      <VisualStorefrontBuilderModal
        open={true}
        onOpenChange={() => {}}
        companyName="VerifiQ AI"
        subdomain="verifiq"
      />
    );

    expect(screen.getByText(/Visual No-Code Storefront & Landing Page Builder/i)).toBeInTheDocument();
    expect(
      screen.getAllByText((_, el) => (el?.textContent?.includes("Target: https://") && el?.textContent?.includes("verifiq.shothikgpt.com")) || false).length
    ).toBeGreaterThan(0);

    const mobileBtn = screen.getByTestId("viewport-mobile-btn");
    fireEvent.click(mobileBtn);
    expect(mobileBtn).toHaveClass("bg-indigo-600");

    const desktopBtn = screen.getByTestId("viewport-desktop-btn");
    fireEvent.click(desktopBtn);
    expect(desktopBtn).toHaveClass("bg-indigo-600");
  });

  it("applies AI prompt co-pilot transformations and publishes updates to Dokploy", async () => {
    render(
      <VisualStorefrontBuilderModal
        open={true}
        onOpenChange={() => {}}
        companyName="VerifiQ AI"
        subdomain="verifiq"
      />
    );

    const banglishPill = screen.getByText(/Translate to Banglish/i);
    fireEvent.click(banglishPill);

    expect(screen.getAllByText(/ঢাকা স্টার্টআপদের জন্য অটোনোমাস এআই কো-ফাউন্ডার/i).length).toBeGreaterThan(0);

    const publishBtn = screen.getByTestId("button-publish-visual-storefront");
    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(screen.getByText(/Published to Dokploy!/i)).toBeInTheDocument();
    }, { timeout: 3500 });
  });
});
