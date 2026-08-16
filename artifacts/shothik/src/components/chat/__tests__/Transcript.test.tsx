import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Transcript } from "../Transcript";
import type { ChatMessage } from "@/lib/chat/types";

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children, className }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={className}>{children}</div>
  ),
}));

vi.mock("../MessageActions", () => ({
  MessageActions: () => <div data-testid="message-actions" />,
}));

vi.mock("../MarkdownMessage", () => ({
  MarkdownMessage: ({ content, onOpenSource }: { content: string; onOpenSource?: (key: string) => void }) => (
    <div>
      <span>{content}</span>
      <button onClick={() => onOpenSource?.("doc_test_123")}>Open Source Test</button>
    </div>
  ),
}));

vi.mock("@/components/hermes/deerflow-visualizer", () => ({
  DeerFlowVisualizer: () => <div data-testid="deerflow-visualizer-mock" />,
}));

vi.mock("@/components/hermes/swarm-visualizer", () => ({
  SwarmVisualizer: () => <div data-testid="swarm-visualizer-mock" />,
}));

function createMessage(overrides: Partial<ChatMessage>): ChatMessage {
  return {
    _id: "message-1",
    conversationId: "conversation-1",
    userId: "user-1",
    role: "assistant",
    content: "",
    contentFormat: "markdown",
    status: "completed",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe("Transcript", () => {
  it("renders /spec user turns as a first-class slash command", () => {
    render(
      <Transcript
        messages={[
          createMessage({
            _id: "user-spec",
            role: "user",
            content: "/spec Draft the scalable chat UX",
            contentFormat: "plain",
          }),
        ]}
      />,
    );

    expect(screen.getByText("/spec")).toBeInTheDocument();
    expect(screen.getByText("Draft the scalable chat UX")).toBeInTheDocument();
    expect(screen.queryByText("/spec Draft the scalable chat UX")).not.toBeInTheDocument();
  });

  it("renders assistant progress and inline errors inside the transcript", () => {
    render(
      <Transcript
        messages={[
          createMessage({
            _id: "assistant-error",
            status: "error",
            metadata: {
              statusLabel: "Request failed",
              progress: [
                { id: "queue", label: "Queued", state: "completed" },
                { id: "response", label: "Response", state: "error", detail: "Rate limit exceeded" },
              ],
              inlineError: {
                message: "Rate limit exceeded. Please wait a moment.",
                recoverable: true,
              },
            },
          }),
        ]}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Rate limit exceeded. Please wait a moment.");
  });

  it("renders DeerFlowVisualizer and SwarmVisualizer when metadata is present", () => {
    render(
      <Transcript
        messages={[
          createMessage({
            _id: "assistant-visualizer",
            status: "completed",
            metadata: {
              deerflowPlan: {
                workflowId: "df_wf_123",
                workspaceId: "ws_123",
                status: "completed",
                nodes: [],
              },
              swarmTopology: {
                workspaceId: "ws_123",
                swarmId: "swarm_1",
                runId: "run_1",
              },
            },
          }),
        ]}
      />,
    );

    expect(screen.getByTestId("deerflow-visualizer-mock")).toBeInTheDocument();
    expect(screen.getByTestId("swarm-visualizer-mock")).toBeInTheDocument();
  });

  it("triggers onOpenSource when an interactive source citation is clicked", () => {
    const handleOpenSource = vi.fn();

    render(
      <Transcript
        messages={[
          createMessage({
            _id: "assistant-citations",
            status: "completed",
            content: "According to BB Circular 04/2024 [[doc:bb_2024_04]] the reserve is 15%.",
          }),
        ]}
        onOpenSource={handleOpenSource}
      />
    );

    const openSourceBtn = screen.getByText("Open Source Test");
    openSourceBtn.click();

    expect(handleOpenSource).toHaveBeenCalledWith("doc_test_123");
  });
});
