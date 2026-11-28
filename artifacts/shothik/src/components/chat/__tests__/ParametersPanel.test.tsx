import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import {
  ParametersPanel,
  DEFAULT_CHAT_PARAMETERS,
  type ChatParameters,
} from "../ParametersPanel";

describe("ParametersPanel Component", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <ParametersPanel
        isOpen={false}
        onClose={vi.fn()}
        parameters={DEFAULT_CHAT_PARAMETERS}
        onChange={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders with current parameters and presets", () => {
    render(
      <ParametersPanel
        isOpen={true}
        onClose={vi.fn()}
        parameters={DEFAULT_CHAT_PARAMETERS}
        onChange={vi.fn()}
        activeModel="Gemini 2.5 Flash"
      />
    );

    expect(screen.getByText("Inference Parameters")).toBeInTheDocument();
    expect(screen.getByText("Gemini 2.5 Flash")).toBeInTheDocument();
    expect(screen.getByText("Precise")).toBeInTheDocument();
    expect(screen.getByText("Creative")).toBeInTheDocument();
    expect(screen.getByText("Code Gen")).toBeInTheDocument();
  });

  it("triggers onChange when a preset is selected", () => {
    const handleChange = vi.fn();
    render(
      <ParametersPanel
        isOpen={true}
        onClose={vi.fn()}
        parameters={DEFAULT_CHAT_PARAMETERS}
        onChange={handleChange}
      />
    );

    const preciseBtn = screen.getByText("Precise");
    fireEvent.click(preciseBtn);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        temperature: 0.2,
        topP: 0.8,
        presetName: "precise",
      })
    );
  });

  it("triggers onChange when temperature slider is adjusted", () => {
    const handleChange = vi.fn();
    render(
      <ParametersPanel
        isOpen={true}
        onClose={vi.fn()}
        parameters={DEFAULT_CHAT_PARAMETERS}
        onChange={handleChange}
      />
    );

    const sliders = screen.getAllByRole("slider");
    // Temperature is the first range input
    fireEvent.change(sliders[0], { target: { value: "1.4" } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        temperature: 1.4,
      })
    );
  });

  it("resets parameters to defaults when reset button is clicked", () => {
    const handleChange = vi.fn();
    const customParams: ChatParameters = {
      temperature: 1.9,
      topP: 0.4,
      maxTokens: 1024,
      systemPrompt: "Custom prompt",
      presetName: "custom",
    };

    render(
      <ParametersPanel
        isOpen={true}
        onClose={vi.fn()}
        parameters={customParams}
        onChange={handleChange}
      />
    );

    const resetBtn = screen.getByTitle("Reset to defaults");
    fireEvent.click(resetBtn);

    expect(handleChange).toHaveBeenCalledWith(DEFAULT_CHAT_PARAMETERS);
  });
});
