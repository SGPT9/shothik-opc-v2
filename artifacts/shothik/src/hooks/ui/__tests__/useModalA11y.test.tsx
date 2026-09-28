import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { useModalA11y } from "../useModalA11y";

function TestModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useModalA11y({ isOpen, onClose });
  if (!isOpen) return null;
  return <div data-testid="modal">Modal Content</div>;
}

describe("useModalA11y Hook", () => {
  it("locks document.body overflow when open and restores it when closed", () => {
    document.body.style.overflow = "visible";

    const { rerender } = render(<TestModal isOpen={true} onClose={() => {}} />);
    expect(document.body.style.overflow).toBe("hidden");

    rerender(<TestModal isOpen={false} onClose={() => {}} />);
    expect(document.body.style.overflow).toBe("visible");
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(<TestModal isOpen={true} onClose={onClose} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when Escape key is pressed if modal is closed", () => {
    const onClose = vi.fn();
    render(<TestModal isOpen={false} onClose={onClose} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});
