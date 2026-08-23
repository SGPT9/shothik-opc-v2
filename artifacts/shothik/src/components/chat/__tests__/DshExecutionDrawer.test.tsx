import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { DshExecutionDrawer } from "../DshExecutionDrawer";

describe("DshExecutionDrawer Component Suite", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.includes("/replay")) {
        return {
          ok: true,
          json: async () => ({
            replay: {
              timeline: [
                { step: 0, type: "session_init", timeDeltaMs: 0, summary: "Session init" },
                { step: 1, type: "model_call", timeDeltaMs: 120, summary: "Model deepseek-r1" },
              ],
            },
          }),
        } as any;
      }
      return {
        ok: true,
        json: async () => ({
          memories: [
            { id: "mem_1", category: "PREFERENCE", content: "Always format tables nicely", createdAt: Date.now() },
          ],
        }),
      } as any;
    }));
  });

  it("renders when open is true and shows DSH header and tabs", async () => {
    render(<DshExecutionDrawer open={true} onClose={vi.fn()} sessionId="dsh_test_session_123" />);

    expect(screen.getByText(/DSH Execution & Memory/i)).toBeDefined();
    expect(screen.getByText(/Execution Trace/i)).toBeDefined();
    expect(screen.getByText(/Memori Profile/i)).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText(/Session init/i)).toBeDefined();
    });
  });

  it("does not render when open is false", () => {
    const { container } = render(<DshExecutionDrawer open={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("switches to Memori Profile tab and displays memories", async () => {
    render(<DshExecutionDrawer open={true} onClose={vi.fn()} />);

    const memoriTab = screen.getByText(/Memori Profile/i);
    fireEvent.click(memoriTab);

    await waitFor(() => {
      expect(screen.getByText(/Persistent context auto-injected/i)).toBeDefined();
      expect(screen.getByText(/Always format tables nicely/i)).toBeDefined();
    });
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<DshExecutionDrawer open={true} onClose={onClose} />);

    const closeButtons = screen.getAllByRole("button");
    const closeBtn = closeButtons[0];
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
