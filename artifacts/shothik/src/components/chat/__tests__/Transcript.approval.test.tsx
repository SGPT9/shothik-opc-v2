// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";

import { Transcript } from "../Transcript";
import type { ChatMessage } from "@/lib/chat/types";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children, className }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={className}>{children}</div>
  ),
}));

vi.mock("../MessageActions", () => ({
  MessageActions: () => <div data-testid="message-actions" />,
}));

vi.mock("../MarkdownMessage", () => ({
  MarkdownMessage: ({ content }: { content: string }) => (
    <div>
      <span>{content}</span>
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
    content: "Assistant response",
    contentFormat: "markdown",
    status: "completed",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe("Transcript Approval & Run-Control Checkpoints", () => {
  it("renders active ApprovalCard when message metadata contains checkpoint/approval and fires onApproveCheckpoint", () => {
    const onApproveCheckpoint = vi.fn();
    const onDenyCheckpoint = vi.fn();

    const msg = createMessage({
      _id: "msg-approval-1",
      metadata: {
        approval: {
          checkpointId: "chk_sql_migration_01",
          actionSummary: "Run database migration for multi-tenant schema",
          reason: "Alters organizations table with RLS security policies",
          details: "ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;",
        },
      },
    });

    const { getByText, getByRole } = render(
      <Transcript
        messages={[msg]}
        onApproveCheckpoint={onApproveCheckpoint}
        onDenyCheckpoint={onDenyCheckpoint}
      />
    );

    expect(getByText("Approval Required")).toBeInTheDocument();
    expect(
      getByText("Run database migration for multi-tenant schema")
    ).toBeInTheDocument();
    expect(
      getByText("Alters organizations table with RLS security policies")
    ).toBeInTheDocument();

    const approveBtn = getByRole("button", { name: /Approve/i });
    fireEvent.click(approveBtn);

    expect(onApproveCheckpoint).toHaveBeenCalledTimes(1);
    expect(onApproveCheckpoint).toHaveBeenCalledWith("chk_sql_migration_01", expect.objectContaining({ _id: "msg-approval-1" }));
    expect(onDenyCheckpoint).not.toHaveBeenCalled();
  });

  it("fires onDenyCheckpoint when human supervisor clicks Deny", () => {
    const onApproveCheckpoint = vi.fn();
    const onDenyCheckpoint = vi.fn();

    const msg = createMessage({
      _id: "msg-approval-2",
      metadata: {
        checkpoint: {
          checkpointId: "chk_deploy_02",
          actionSummary: "Deploy production build to Cloudflare edge",
          reason: "High traffic release window",
        },
      },
    });

    const { getByRole } = render(
      <Transcript
        messages={[msg]}
        onApproveCheckpoint={onApproveCheckpoint}
        onDenyCheckpoint={onDenyCheckpoint}
      />
    );

    const denyBtn = getByRole("button", { name: /Deny/i });
    fireEvent.click(denyBtn);

    expect(onDenyCheckpoint).toHaveBeenCalledTimes(1);
    expect(onDenyCheckpoint).toHaveBeenCalledWith("chk_deploy_02", expect.objectContaining({ _id: "msg-approval-2" }));
    expect(onApproveCheckpoint).not.toHaveBeenCalled();
  });

  it("renders collapsed audit badge when approval is resolved", () => {
    const msgApproved = createMessage({
      _id: "msg-resolved-approved",
      metadata: {
        approval: {
          checkpointId: "chk_resolved_01",
          actionSummary: "Deploy v2.4.0 edge worker",
          resolved: true,
          outcome: "approved",
        },
      },
    });

    const { getByText, queryByText } = render(<Transcript messages={[msgApproved]} />);

    expect(queryByText("Approval Required")).not.toBeInTheDocument();
    expect(getByText("Approved:")).toBeInTheDocument();
    expect(getByText("Deploy v2.4.0 edge worker")).toBeInTheDocument();
  });
});
