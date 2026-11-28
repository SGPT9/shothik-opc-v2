import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import SlidesPage from "@/app-next/(slide-layout)/slides/page";

// Mock wouter and navigation
vi.mock("@/lib/navigation", () => ({
  useSearchParams: () => new URLSearchParams(""),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/slides",
}));

vi.mock("@/components/slide/context/SlideContextProvider", () => ({
  usePresentation: () => ({
    isPresentationOpen: false,
    openPresentation: vi.fn(),
    closePresentation: vi.fn(),
  }),
}));

vi.mock("@/components/slide/SlidePreviewNavbar", () => ({
  default: () => <nav data-testid="mock-slide-navbar">Slide Preview Navbar</nav>,
}));

describe("SlidesPage Empty State & Anti-Hang Audit", () => {
  it("immediately renders the empty state when no project_id query parameter is present", () => {
    render(<SlidesPage />);

    expect(screen.getByTestId("mock-slide-navbar")).toBeInTheDocument();
    expect(screen.getByText(/No slides available/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Create Slide Deck/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Create Slide Deck/i })).toHaveAttribute("href", "/slide-generation");
  });
});
