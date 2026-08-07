import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/use-realtime-workspace", () => ({
  useRealtimeWorkspace: vi.fn(() => ({
    connectionState: "connected",
    lastEvent: null,
  })),
}));

import { TerminalEmulator } from "../terminal-emulator";

describe("TerminalEmulator UI Component", () => {
  it("renders terminal logs and input prompt", () => {
    render(
      <TerminalEmulator
        workspaceId="ws_term_ui_test"
        sessionId="trm_ui_100"
        initialLogs={["$ echo Hello World\nHello World\n"]}
      />
    );

    expect(screen.getByText("shothik-tty — trm_ui_100")).toBeInTheDocument();
    expect(screen.getByText("$ echo Hello World\nHello World\n")).toBeInTheDocument();
  });

  it("submits commands and triggers onCommandSubmit callback", () => {
    const onSubmit = vi.fn();

    render(
      <TerminalEmulator
        workspaceId="ws_term_ui_test"
        onCommandSubmit={onSubmit}
      />
    );

    const input = screen.getByPlaceholderText("Execute shell command or send stdin input...");
    fireEvent.change(input, { target: { value: "pnpm test" } });
    fireEvent.submit(input);

    expect(onSubmit).toHaveBeenCalledWith("pnpm test");
    expect(screen.getByText("$ pnpm test\n")).toBeInTheDocument();
  });

  it("clears log buffer when clicking Clear button", () => {
    const onClear = vi.fn();

    render(
      <TerminalEmulator
        workspaceId="ws_term_ui_test"
        initialLogs={["Line to clear\n"]}
        onClear={onClear}
      />
    );

    const clearBtn = screen.getByText("Clear");
    fireEvent.click(clearBtn);

    expect(onClear).toHaveBeenCalled();
    expect(screen.queryByText("Line to clear\n")).not.toBeInTheDocument();
  });
});
