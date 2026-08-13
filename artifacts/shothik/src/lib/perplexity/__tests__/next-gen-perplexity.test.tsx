// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { PerplexityCitationPreviewCard } from "@/components/perplexity/PerplexityCitationPreviewCard";
import { PerplexityDeepResearchDrawer } from "@/components/perplexity/PerplexityDeepResearchDrawer";
import { VTuberSlidePresenterService } from "@/lib/voice/vtuber-slide-presenter-service";

describe("Next-Gen Perplexity & VTuber Capabilities", () => {
  it("renders Perplexity Citation Preview Card badge", () => {
    const mockSource = {
      id: 1,
      title: "Chaldal Grocery E-Commerce Logistics",
      domain: "chaldal.com",
      url: "https://chaldal.com",
      snippet: "Dhaka logistics hubs operations.",
    };

    render(
      <PerplexityCitationPreviewCard source={mockSource}>
        [1]
      </PerplexityCitationPreviewCard>
    );

    expect(screen.getByText("[1]")).toBeDefined();
  });

  it("renders Perplexity Deep Research Drawer with execution steps", () => {
    render(<PerplexityDeepResearchDrawer />);

    expect(screen.getByText(/Pro Search: Deep Research Execution/i)).toBeDefined();
    expect(screen.getByText(/Querying NBR Tax API/i)).toBeDefined();
  });

  it("generates VTuber slide deck presentation narration", () => {
    const slides = [
      { title: "Market Sizing", bulletPoints: ["$10B TAM in Bangladesh", "15M Micro-Merchants"] },
    ];

    const presentation = VTuberSlidePresenterService.generateDeckPresentation(slides);
    expect(presentation.length).toBe(1);
    expect(presentation[0].slideTitle).toBe("Market Sizing");
    expect(presentation[0].visemeSequence.length).toBeGreaterThan(0);
  });
});
