import React, { useEffect, useRef } from "react";

/**
 * CursorSpotlight — Interactive Human-to-Agent Light Horizon
 * 
 * Projects a subtle, hardware-accelerated ambient starlight spotlight
 * beneath frosted glass layers as the human moves their pointer across Shothik.
 */
export function CursorSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable on touch-only mobile devices to save battery
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    let rafId: number | null = null;
    let targetX = -500;
    let targetY = -500;
    let currentX = -500;
    let currentY = -500;

    const handlePointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!rafId) {
        rafId = requestAnimationFrame(updateSpotlight);
      }
    };

    const updateSpotlight = () => {
      // Smooth lerp for fluid starlight inertia
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        document.documentElement.style.setProperty("--cursor-x", `${currentX}px`);
        document.documentElement.style.setProperty("--cursor-y", `${currentY}px`);
      }

      const diff = Math.abs(targetX - currentX) + Math.abs(targetY - currentY);
      if (diff > 0.5) {
        rafId = requestAnimationFrame(updateSpotlight);
      } else {
        rafId = null;
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-20 overflow-hidden"
    >
      <div
        ref={spotlightRef}
        className="absolute -top-[100px] -left-[100px] w-[200px] h-[200px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,rgba(16,185,129,0.015)_50%,transparent_75%)] blur-xl transition-opacity duration-300 opacity-25 will-change-transform pointer-events-none"
      />
    </div>
  );
}

export default CursorSpotlight;
