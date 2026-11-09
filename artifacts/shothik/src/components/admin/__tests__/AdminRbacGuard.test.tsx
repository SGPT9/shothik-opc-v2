import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { AdminControlCenter } from "@/components/admin/AdminControlCenter";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

vi.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({ user: null }),
}));

function renderWithStore(ui: React.ReactElement, role = "user") {
  const store = configureStore({
    reducer: {
      auth: () => ({ user: { role, email: "test@example.com" } }),
    },
  });
  return render(<Provider store={store}>{ui}</Provider>);
}

describe("AdminControlCenter RBAC Access Gate", () => {
  beforeEach(() => {
    localStorage.clear();
    // Simulate non-localhost hostname
    Object.defineProperty(window, "location", {
      value: { hostname: "spencer-customise-museum-pie.trycloudflare.com", search: "" },
      writable: true,
    });
  });

  it("blocks non-admin users and displays the Restricted Administrative Surface banner", () => {
    renderWithStore(<AdminControlCenter />, "user");

    expect(screen.getByText(/Restricted Administrative Surface/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Return to Dashboard/i })).toBeInTheDocument();
    expect(screen.queryByText(/Ollama 11434 Online/i)).not.toBeInTheDocument();
  });

  it("grants access to authenticated users with admin role", () => {
    renderWithStore(<AdminControlCenter />, "admin");

    expect(screen.getByText(/Shothik Hermes Admin Center/i)).toBeInTheDocument();
    expect(screen.getByText(/Privileged Surface/i)).toBeInTheDocument();
    expect(screen.queryByText(/Restricted Administrative Surface/i)).not.toBeInTheDocument();
  });
});
