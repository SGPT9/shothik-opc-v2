import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ChatSidebar, type ChatSidebarItem } from "../ChatSidebar";

describe("ChatSidebar Tag Filtering & Bookmarking", () => {
  const mockConversations: ChatSidebarItem[] = [
    {
      _id: "conv-1",
      title: "Fintech Regulatory Compliance",
      tags: ["Work", "Finance"],
      updatedAt: Date.now(),
    },
    {
      _id: "conv-2",
      title: "Machine Learning Benchmarks",
      tags: ["Research", "Coding"],
      updatedAt: Date.now(),
    },
    {
      _id: "conv-3",
      title: "Untagged Casual Query",
      tags: [],
      updatedAt: Date.now(),
    },
  ];

  it("renders all tag chips including #All", () => {
    render(
      <ChatSidebar
        conversations={mockConversations}
        onSelectConversation={vi.fn()}
        onNewChat={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "#All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "#Work" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "#Research" })).toBeInTheDocument();
  });

  it("filters conversation list when a tag chip is clicked", () => {
    render(
      <ChatSidebar
        conversations={mockConversations}
        onSelectConversation={vi.fn()}
        onNewChat={vi.fn()}
      />
    );

    // Initially all 3 conversations are visible
    expect(screen.getByText("Fintech Regulatory Compliance")).toBeInTheDocument();
    expect(screen.getByText("Machine Learning Benchmarks")).toBeInTheDocument();
    expect(screen.getByText("Untagged Casual Query")).toBeInTheDocument();

    // Click #Research tag button
    fireEvent.click(screen.getByRole("button", { name: "#Research" }));

    // Only conv-2 should now be visible
    expect(screen.getByText("Machine Learning Benchmarks")).toBeInTheDocument();
    expect(screen.queryByText("Fintech Regulatory Compliance")).not.toBeInTheDocument();
    expect(screen.queryByText("Untagged Casual Query")).not.toBeInTheDocument();

    // Click #All to clear filter
    fireEvent.click(screen.getByRole("button", { name: "#All" }));
    expect(screen.getByText("Fintech Regulatory Compliance")).toBeInTheDocument();
  });
});
