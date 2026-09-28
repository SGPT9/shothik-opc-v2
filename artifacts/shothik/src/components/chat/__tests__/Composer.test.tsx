import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Composer } from "../Composer";

describe("Composer", () => {
  it("renders slash command guidance and inline validation errors", () => {
    render(
      <Composer
        value="/spec"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        commandHint={{
          name: "spec",
          description: "Hermes will handle this turn in spec mode.",
        }}
        errorMessage="`/spec` needs a prompt or an attached document."
      />,
    );

    expect(screen.getByRole("textbox")).toHaveDisplayValue("/spec");
    expect(screen.getByText("/spec", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("Hermes will handle this turn in spec mode.")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "`/spec` needs a prompt or an attached document.",
    );
  });

  it("dispatches SEND_MESSAGE via the consolidated onAction seam", () => {
    const handleAction = vi.fn();
    render(
      <Composer
        value="Investigate Bangladeshi fintech market"
        onAction={handleAction}
      />
    );

    const sendButton = screen.getByRole("button", { name: "Send message" });
    expect(sendButton).not.toBeDisabled();
    fireEvent.click(sendButton);

    expect(handleAction).toHaveBeenCalledWith({
      type: "SEND_MESSAGE",
      payload: {
        text: "Investigate Bangladeshi fintech market",
        attachments: [],
      },
    });
  });

  it("dispatches STOP_STREAM via onAction when streaming is active", () => {
    const handleAction = vi.fn();
    render(
      <Composer
        isStreaming={true}
        onAction={handleAction}
      />
    );

    const stopButton = screen.getByRole("button", { name: "Stop generating" });
    fireEvent.click(stopButton);

    expect(handleAction).toHaveBeenCalledWith({
      type: "STOP_STREAM",
    });
  });

  it("dispatches OPEN_TOOL and OPEN_ARTIFACT via onAction from the Tools menu", () => {
    const handleAction = vi.fn();
    render(<Composer onAction={handleAction} />);

    // Open tools / attachment dropdown
    const attachButton = screen.getByRole("button", { name: /Add attachment or open workspace/i });
    fireEvent.click(attachButton);

    // Deep Research
    const deepResearchOption = screen.getByText("Deep Research");
    fireEvent.click(deepResearchOption);

    expect(handleAction).toHaveBeenCalledWith({
      type: "OPEN_ARTIFACT",
      tab: "research",
    });
  });

  it("does not submit on Enter key when user is composing via IME (isComposing: true)", () => {
    const handleAction = vi.fn();
    render(
      <Composer
        value="বাংলা "
        onAction={handleAction}
      />
    );

    const textarea = screen.getByRole("textbox");
    fireEvent.keyDown(textarea, {
      key: "Enter",
      isComposing: true,
      keyCode: 229,
    });

    expect(handleAction).not.toHaveBeenCalled();
  });
});

