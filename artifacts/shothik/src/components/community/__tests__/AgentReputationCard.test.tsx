import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AgentReputationCard } from "../AgentReputationCard";

describe("AgentReputationCard", () => {
  it("renders agent card details and triggers fork/chat callbacks", () => {
    const onFork = vi.fn();
    const onChatWith = vi.fn();

    render(
      <AgentReputationCard
        id="ayesha_sales"
        name="Ayesha (Sales Closer Twin)"
        creator="fcommerce_bd"
        category="F-Commerce"
        trustScore={98.6}
        ordersCompleted={1420}
        totalVolumeBdt={285000}
        status="consensus"
        forkPriceBdt={100}
        modelName="DeepSeek-R1"
        description="Autonomous sales closer that verifies bKash payments and books Steadfast courier parcels."
        onFork={onFork}
        onChatWith={onChatWith}
      />
    );

    expect(screen.getByText("Ayesha (Sales Closer Twin)")).toBeInTheDocument();
    expect(screen.getByText("F-Commerce")).toBeInTheDocument();
    expect(screen.getByText("98.6%")).toBeInTheDocument();
    expect(screen.getByText("1,420")).toBeInTheDocument();
    expect(screen.getByText("৳285,000")).toBeInTheDocument();

    // Trigger Chat
    const chatBtn = screen.getByRole("button", { name: /chat/i });
    fireEvent.click(chatBtn);
    expect(onChatWith).toHaveBeenCalledWith("ayesha_sales");

    // Trigger Fork
    const forkBtn = screen.getByRole("button", { name: /fork \(৳100\)/i });
    fireEvent.click(forkBtn);
    expect(onFork).toHaveBeenCalledWith("ayesha_sales");
  });
});
