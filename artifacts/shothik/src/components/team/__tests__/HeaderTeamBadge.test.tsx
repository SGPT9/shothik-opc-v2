import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Header from "@/components/partials/header";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import * as teamService from "@/services/agent-team.service";

// Mock auth & translation providers and queries
vi.mock("@/i18n", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
  SUPPORTED_LOCALES: [
    { code: "en", label: "English" },
    { code: "bn", label: "বাংলা" },
  ],
}));

vi.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({ user: { _id: "usr_1", email: "test@shothik.ai", credits: 250 } }),
}));

vi.mock("@/services/agent-team.service", () => ({
  fetchAgents: vi.fn(),
}));

vi.mock("@/redux/api/auth/authApi", () => ({
  useGetUserQuery: () => ({ isLoading: false }),
}));

describe("Header Autonomous Team Badge Integration", () => {
  it("renders the Team Badge with active agents count in primary layout", async () => {
    vi.mocked(teamService.fetchAgents).mockResolvedValueOnce([
      { id: "a1", name: "Dev Specialist", role: "Dev", policy: "auto" },
      { id: "a2", name: "QA Specialist", role: "QA", policy: "auto" },
    ]);

    const store = configureStore({
      reducer: {
        auth: () => ({ accessToken: "tok", user: { credits: 250 } }),
        settings: () => ({ theme: "dark" }),
      },
    });

    render(
      <Provider store={store}>
        <Header layout="primary" />
      </Provider>
    );

    const badge = screen.getByTestId("header-team-badge");
    expect(badge).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("2 Agents")).toBeInTheDocument();
    });

    // Click to open Team Studio
    fireEvent.click(badge);
    await waitFor(() => {
      expect(screen.getByText("Agent Orchestration Studio")).toBeInTheDocument();
    });
  });
});
