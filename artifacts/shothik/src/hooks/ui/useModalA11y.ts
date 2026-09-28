import { useEffect } from "react";

export interface UseModalA11yOptions {
  isOpen: boolean;
  onClose: () => void;
  enableEscape?: boolean;
  lockScroll?: boolean;
}

/**
 * useModalA11y: Standard WAI-ARIA Modal Accessibility & Ergonomics Hook
 * - Captures Escape key to cleanly dismiss open modals
 * - Locks document body scroll on mobile/desktop while modal is active
 * - Prevents background bounce and interaction leakage
 */
export function useModalA11y({
  isOpen,
  onClose,
  enableEscape = true,
  lockScroll = true,
}: UseModalA11yOptions): void {
  useEffect(() => {
    if (!isOpen) return;

    // 1. Lock document.body overflow to prevent background scrolling/bounce
    let originalOverflow = "";
    if (lockScroll && typeof document !== "undefined") {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    // 2. Global Escape key listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (enableEscape && e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (lockScroll && typeof document !== "undefined") {
        document.body.style.overflow = originalOverflow;
      }
    };
  }, [isOpen, onClose, enableEscape, lockScroll]);
}

export default useModalA11y;
