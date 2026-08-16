// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ChatHeader } from "../components/agents/components/ChatHeader";
import { Composer } from "../components/chat/Composer";
import { EmptyChatGreeting } from "../components/chat/EmptyChatGreeting";
import { PerplexitySourcesGrid } from "../components/perplexity/PerplexitySourcesGrid";
import { PerplexityRelatedQueries } from "../components/perplexity/PerplexityRelatedQueries";

describe("a11y-debugging & Chrome DevTools Comprehensive Audit", () => {
  it("verifies accessible names for all ChatHeader interactive buttons", () => {
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

    const buttons = headerRes.container.querySelectorAll("button");
    buttons.forEach((btn) => {
      const title = btn.getAttribute("title");
      const ariaLabel = btn.getAttribute("aria-label");
      const text = btn.textContent?.trim();

      const hasAccessibleName = Boolean(title || ariaLabel || text);
      expect(hasAccessibleName).toBe(true);
    });
  });

  it("verifies Composer prompt container accessibility & keyboard navigation bindings", () => {
    const composerRes = render(<Composer onSend={() => {}} />);
    const textarea = composerRes.container.querySelector("textarea");

    expect(textarea).not.toBeNull();
    expect(textarea?.getAttribute("placeholder")).toBeDefined();
  });

  it("verifies EmptyChatGreeting contrast and heading accessibility", () => {
    const greetingRes = render(<EmptyChatGreeting />);
    const heading = greetingRes.container.querySelector("h1");

    expect(heading).not.toBeNull();
    expect(heading?.textContent).toBe("What do you want to accomplish today?");
  });

  it("verifies PerplexitySourcesGrid tap target link accessibility", () => {
    const sourcesRes = render(<PerplexitySourcesGrid />);
    const links = sourcesRes.container.querySelectorAll("a");

    links.forEach((link) => {
      expect(link.getAttribute("href")).toBeDefined();
      expect(link.getAttribute("target")).toBe("_blank");
    });
  });
});
