import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { McpInspectorDrawer, DEFAULT_MCP_SERVERS } from "../McpInspectorDrawer";

describe("McpInspectorDrawer Component", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <McpInspectorDrawer isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders active MCP servers and default tools", () => {
    render(
      <McpInspectorDrawer isOpen={true} onClose={vi.fn()} />
    );

    expect(screen.getByText("MCP Servers & Tool Inspector")).toBeInTheDocument();
    expect(screen.getByText("DeerFlow Agent Orchestrator")).toBeInTheDocument();
    expect(screen.getByText("Bangla Voice AI Subsystem")).toBeInTheDocument();
    expect(screen.getByText("Shothik Bengali NLP & Grammar")).toBeInTheDocument();
    expect(screen.getByText("MFS & Courier Logistics Gateway")).toBeInTheDocument();
  });

  it("filters tools and servers by search query", () => {
    render(
      <McpInspectorDrawer isOpen={true} onClose={vi.fn()} />
    );

    const searchInput = screen.getByPlaceholderText(/Search MCP servers/i);
    fireEvent.change(searchInput, { target: { value: "whisper" } });

    expect(screen.getByText("whisper_asr_transcribe")).toBeInTheDocument();
    expect(screen.queryByText("DeerFlow Agent Orchestrator")).not.toBeInTheDocument();
  });

  it("reveals tool parameter schema on click", () => {
    render(
      <McpInspectorDrawer isOpen={true} onClose={vi.fn()} />
    );

    const toolItem = screen.getByText("web_search");
    fireEvent.click(toolItem);

    // Schema pre element should now be rendered
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });
});
