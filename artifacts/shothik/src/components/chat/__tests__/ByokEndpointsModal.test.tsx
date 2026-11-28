import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { ByokEndpointsModal, DEFAULT_ENDPOINTS } from "../ByokEndpointsModal";

describe("ByokEndpointsModal Component", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <ByokEndpointsModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders custom provider tabs including DeepSeek, Anthropic, OpenAI", () => {
    render(
      <ByokEndpointsModal isOpen={true} onClose={vi.fn()} />
    );

    expect(screen.getByText("Custom Provider Endpoints (BYOK)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /DeepSeek Official/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Anthropic Claude/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /OpenAI Platform/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Groq LPUs/i })).toBeInTheDocument();
  });

  it("updates API key and verifies connection status", async () => {
    render(
      <ByokEndpointsModal isOpen={true} onClose={vi.fn()} />
    );

    const input = screen.getByPlaceholderText(/Paste your DeepSeek Official key/i);
    fireEvent.change(input, { target: { value: "sk-test-valid-deepseek-key-123456" } });

    const testBtn = screen.getByRole("button", { name: /Test Connection/i });
    fireEvent.click(testBtn);

    await waitFor(() => {
      expect(screen.getByText(/Verified/i)).toBeInTheDocument();
    });
  });

  it("calls onSaveEndpoints and closes modal on save", () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    render(
      <ByokEndpointsModal
        isOpen={true}
        onClose={handleClose}
        onSaveEndpoints={handleSave}
      />
    );

    const saveBtn = screen.getByRole("button", { name: "Save Configuration" });
    fireEvent.click(saveBtn);

    expect(handleSave).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });
});
