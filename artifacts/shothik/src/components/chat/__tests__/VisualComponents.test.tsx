import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LiquidGlassCard } from "../LiquidGlassCard.js";
import { AvatarOrb3D } from "../AvatarOrb3D.js";

describe("Visual WOW Components", () => {
  it("renders LiquidGlassCard with children correctly", () => {
    render(
      <LiquidGlassCard intensity="vibrant">
        <div data-testid="card-child">Action Content</div>
      </LiquidGlassCard>
    );

    expect(screen.getByTestId("card-child")).toBeDefined();
    expect(screen.getByText("Action Content")).toBeDefined();
  });

  it("renders AvatarOrb3D canvas for different roles", () => {
    const { container } = render(
      <AvatarOrb3D
        size={64}
        isSpeaking={true}
        avatarRole="sales_twin"
      />
    );

    const canvas = container.querySelector("canvas");
    expect(canvas).toBeDefined();
    expect(canvas?.getAttribute("width")).toBe("64");
    expect(canvas?.getAttribute("height")).toBe("64");
  });
});
