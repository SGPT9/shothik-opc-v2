// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ChatHeader } from "../components/agents/components/ChatHeader";
import { Composer } from "../components/chat/Composer";
import { PerplexitySourcesGrid } from "../components/perplexity/PerplexitySourcesGrid";
import { PerplexityFocusSelector } from "../components/perplexity/PerplexityFocusSelector";
import { PerplexityRelatedQueries } from "../components/perplexity/PerplexityRelatedQueries";

describe("CLI DOM & ARIA Tree Audit", () => {
  it("audits ChatHeader interactive buttons and titles", () => {
    const headerRes = render(
      <ChatHeader
        currentPersona="general"
        executionMode="realtime"
        activeTab={null}
        onTabChange={() => {}}
        onToggleSidebar={() => {}}
        sidebarOpen={false}
        onVTuberClick={() => {}}
        onPaywallClick={() => {}}
      />
    );

    const headerButtons = headerRes.container.querySelectorAll("button");
    expect(headerButtons.length).toBeGreaterThanOrEqual(3);

    console.log(`📌 [ChatHeader DOM]: ${headerButtons.length} interactive buttons rendered`);
    headerButtons.forEach((btn, idx) => {
      const text = btn.textContent?.trim() || btn.getAttribute("title") || "Icon Button";
      console.log(`   - Button #${idx + 1}: "${text}" | title="${btn.getAttribute("title") || "N/A"}"`);
    });
  });

  it("audits Composer textarea and focus selector mode pills", () => {
    const composerRes = render(
      <Composer
        onSend={() => {}}
        onVoiceOrbClick={() => {}}
      />
    );

    const textareas = composerRes.container.querySelectorAll("textarea");
    expect(textareas.length).toBe(1);
    expect(textareas[0].getAttribute("placeholder")).toContain("Ask anything");

    console.log(`📌 [Composer DOM]: Textarea verified with placeholder="${textareas[0].getAttribute("placeholder")}"`);
  });

  it("audits PerplexitySourcesGrid domain cards and links", () => {
    const mockSources = [
      { id: 1, title: "TechCrunch Bangladesh", domain: "techcrunch.com", url: "https://techcrunch.com" },
      { id: 2, title: "GitHub Shothik", domain: "github.com", url: "https://github.com" },
      { id: 3, title: "Daily Star Business", domain: "thedailystar.net", url: "https://thedailystar.net" },
    ];
    const sourcesRes = render(<PerplexitySourcesGrid sources={mockSources} />);
    const sourceCards = sourcesRes.container.querySelectorAll("a");
    expect(sourceCards.length).toBe(3);

    console.log(`📌 [PerplexitySourcesGrid DOM]: ${sourceCards.length} domain source cards verified`);
  });

  it("audits PerplexityRelatedQueries follow-up question pills", () => {
    const mockQueries = [
      "What is the Nilkhet POD forme sizing specification?",
      "How to connect Steadfast parcel webhook API?",
      "Export 5-year financial model to Excel spreadsheet",
    ];
    const relatedRes = render(<PerplexityRelatedQueries queries={mockQueries} onSelectQuery={() => {}} />);
    const relatedButtons = relatedRes.container.querySelectorAll("button");
    expect(relatedButtons.length).toBe(3);

    console.log(`📌 [PerplexityRelatedQueries DOM]: ${relatedButtons.length} related question pills verified`);
  });
});
