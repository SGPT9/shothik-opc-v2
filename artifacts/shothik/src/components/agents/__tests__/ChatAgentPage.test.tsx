import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import ChatAgentPage from "../ChatAgentPage";

const mockReplace = vi.fn();
const mockUseAuth = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/agents/chat",
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock("@/providers/AuthProvider", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/chat/Composer", () => ({
  Composer: () => <div>composer</div>,
}));

vi.mock("@/components/chat/Transcript", () => ({
  Transcript: () => <div>transcript</div>,
}));

describe("ChatAgentPage — DeepSeek-Close Shell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    } as unknown as Response);
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  });

  it("renders the Ask-First empty state heading immediately on first paint", () => {
    render(<ChatAgentPage />);

    expect(
      screen.getByText("What are we building today?")
    ).toBeInTheDocument();
  });

  it("renders starter prompt cards across creative and operational pillars", () => {
    render(<ChatAgentPage />);

    expect(screen.getByText("Self-Healing Bug & Test Fixer")).toBeInTheDocument();
    expect(screen.getByText("bKash & Nagad MFS Settlement Ledger")).toBeInTheDocument();
    expect(screen.getByText("Dhaka F-Commerce Order Ledger")).toBeInTheDocument();
  });

  it("renders the composer dispatch seam ready for typing without blocking overlays", () => {
    render(<ChatAgentPage />);

    expect(screen.getByText("composer")).toBeInTheDocument();
    expect(screen.queryByText("Checking your session")).not.toBeInTheDocument();
  });
});
