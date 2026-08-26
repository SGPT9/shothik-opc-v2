import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { TurnstileWidget } from "../TurnstileWidget";

describe("TurnstileWidget Component", () => {
  it("renders container element with test id", () => {
    render(<TurnstileWidget onSuccess={() => {}} />);
    expect(screen.getByTestId("turnstile-widget")).toBeInTheDocument();
  });

  it("triggers onSuccess callback in development mode", async () => {
    const onSuccess = vi.fn();
    render(<TurnstileWidget onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith("test_pass_token");
    });
  });

  it("calls window.turnstile.render when Turnstile API is globally loaded", () => {
    const renderFn = vi.fn().mockReturnValue("widget-123");
    const removeFn = vi.fn();
    window.turnstile = {
      render: renderFn,
      reset: vi.fn(),
      remove: removeFn,
    };

    const onSuccess = vi.fn();
    const { unmount } = render(<TurnstileWidget siteKey="sitekey-xyz" onSuccess={onSuccess} />);

    expect(renderFn).toHaveBeenCalled();
    unmount();
    expect(removeFn).toHaveBeenCalledWith("widget-123");

    // Clean up
    delete (window as any).turnstile;
  });
});
