import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DokployDeployPage from "../(primary-layout)/deploy/page";

describe("Dokploy Container & PaaS Dashboard (/deploy)", () => {
  it("renders container telemetry, domains, and terminal log stream", () => {
    render(<DokployDeployPage />);

    expect(screen.getByText(/Dokploy Container & PaaS Runtime/i)).toBeInTheDocument();
    expect(screen.getByText(/28.4 MB/i)).toBeInTheDocument();
    expect(screen.getByText(/Active \(ACM\)/i)).toBeInTheDocument();
    expect(screen.getByText(/https:\/\/verifiq.polsia.app/i)).toBeInTheDocument();
    expect(screen.getByText(/app.verifiq.ai/i)).toBeInTheDocument();
    expect(screen.getByText(/Container Live Logs/i)).toBeInTheDocument();
  });

  it("filters terminal logs by search input", () => {
    render(<DokployDeployPage />);

    const searchInput = screen.getByPlaceholderText(/Filter logs…/i);
    fireEvent.change(searchInput, { target: { value: "traefik" } });

    expect(screen.getByText(/Acquired Let's Encrypt SSL/i)).toBeInTheDocument();
    expect(screen.queryByText(/Connected to PostgreSQL BaaS pool/i)).not.toBeInTheDocument();
  });
});
