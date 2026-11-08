import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MessageTokenBadge } from "../MessageTokenBadge";

describe("MessageTokenBadge Component", () => {
  it("renders nothing when metrics is undefined", () => {
    const { container } = render(<MessageTokenBadge />);
    expect(container.firstChild).toBeNull();
  });

  it("renders latency and token counts correctly", () => {
    render(
      <MessageTokenBadge
        metrics={{
          promptTokens: 120,
          completionTokens: 350,
          totalTokens: 470,
          latencySeconds: 1.4,
          modelName: "DeepSeek-V3",
          costEstimatedUsd: 0.0008,
        }}
      />
    );

    expect(screen.getByText("1.4s")).toBeInTheDocument();
    expect(screen.getByText(/120 in \/ 350 out \(470 tokens\)/)).toBeInTheDocument();
    expect(screen.getByText("DeepSeek-V3")).toBeInTheDocument();
    expect(screen.getByText("$0.0008")).toBeInTheDocument();
  });
});
