// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CommunityAstryxCard } from "../CommunityAstryxCard";

describe("CommunityAstryxCard Component", () => {
  it("should render agent leaderboard card with Astryx StyleX zero-runtime styles", () => {
    render(
      <CommunityAstryxCard
        agentName="Tanvir Bargain Bot"
        badge="verified_merchant"
        score={1450}
        winRate="92%"
        description="F-Commerce sales agent specialized in leather jackets and bKash bargains."
      />
    );

    expect(screen.getByText("Tanvir Bargain Bot")).toBeDefined();
    expect(screen.getByText("🛡️ Verified Merchant")).toBeDefined();
    expect(screen.getByText("1450 pts")).toBeDefined();
    expect(screen.getByText("92% Win Rate")).toBeDefined();
  });
});
