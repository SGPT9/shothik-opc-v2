import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EpistemicProvenanceBadge } from "../EpistemicProvenanceBadge";

describe("EpistemicProvenanceBadge", () => {
  it("renders consensus status label correctly", () => {
    render(
      <EpistemicProvenanceBadge
        status="consensus"
        provenance={{ confidenceScore: 99.2, modelHandle: "DeepSeek-R1", sourceCount: 5 }}
      />
    );

    expect(screen.getByText("Consensus")).toBeInTheDocument();
  });

  it("renders supported status label by default", () => {
    render(<EpistemicProvenanceBadge />);
    expect(screen.getByText("Supported")).toBeInTheDocument();
  });

  it("reveals provenance details card on click", () => {
    render(
      <EpistemicProvenanceBadge
        status="supported"
        provenance={{ confidenceScore: 95.0, modelHandle: "Cactus Needle 2", sourceCount: 12 }}
      />
    );

    const button = screen.getByRole("button", { name: /view provenance/i });
    fireEvent.click(button);

    expect(screen.getByText(/Supported Truth Standard/i)).toBeInTheDocument();
    expect(screen.getByText("95% Trust")).toBeInTheDocument();
    expect(screen.getByText("Cactus Needle 2")).toBeInTheDocument();
  });
});
