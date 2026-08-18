"use client";

import React, { useRef, useState, useCallback } from "react";

export type LiquidGlassPalette = "indigo" | "bkash" | "steadfast" | "tax_gold" | "cyan" | "custom";

export interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: "subtle" | "medium" | "vibrant";
  interactive?: boolean;
  glowColor?: string;
  palette?: LiquidGlassPalette;
  borderRadius?: string;
}

const PALETTE_GLOWS: Record<LiquidGlassPalette, { glow: string; borderGlow: string; accent: string }> = {
  indigo: {
    glow: "rgba(99, 102, 241, 0.22)",
    borderGlow: "rgba(99, 102, 241, 0.4)",
    accent: "rgba(129, 140, 248, 0.3)",
  },
  bkash: {
    glow: "rgba(226, 19, 110, 0.24)",
    borderGlow: "rgba(236, 72, 153, 0.45)",
    accent: "rgba(244, 114, 182, 0.35)",
  },
  steadfast: {
    glow: "rgba(16, 185, 129, 0.22)",
    borderGlow: "rgba(52, 211, 153, 0.4)",
    accent: "rgba(110, 231, 183, 0.3)",
  },
  tax_gold: {
    glow: "rgba(245, 158, 11, 0.22)",
    borderGlow: "rgba(251, 191, 36, 0.4)",
    accent: "rgba(252, 211, 77, 0.3)",
  },
  cyan: {
    glow: "rgba(6, 182, 212, 0.22)",
    borderGlow: "rgba(34, 211, 238, 0.4)",
    accent: "rgba(103, 232, 249, 0.3)",
  },
  custom: {
    glow: "rgba(99, 102, 241, 0.2)",
    borderGlow: "rgba(99, 102, 241, 0.35)",
    accent: "rgba(129, 140, 248, 0.25)",
  },
};

export function LiquidGlassCard({
  children,
  className = "",
  intensity = "medium",
  interactive = true,
  glowColor,
  palette = "indigo",
  borderRadius = "rounded-2xl",
}: LiquidGlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const activePalette = PALETTE_GLOWS[palette] || PALETTE_GLOWS.indigo;
  const resolvedGlow = glowColor || activePalette.glow;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    },
    [interactive]
  );

  const getBackdropStyles = () => {
    switch (intensity) {
      case "vibrant":
        return "bg-slate-900/65 dark:bg-slate-950/70 backdrop-blur-2xl border-white/20 dark:border-white/15 shadow-2xl shadow-black/40";
      case "subtle":
        return "bg-slate-900/30 dark:bg-slate-950/35 backdrop-blur-md border-white/10 dark:border-white/5 shadow-lg shadow-black/20";
      case "medium":
      default:
        return "bg-slate-900/50 dark:bg-slate-950/55 backdrop-blur-xl border-white/15 dark:border-white/10 shadow-xl shadow-black/30";
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden border transition-all duration-300 ${borderRadius} ${getBackdropStyles()} ${className}`}
      style={{
        transform: isHovered && interactive ? "translateY(-2px)" : "translateY(0px)",
      }}
    >
      {/* ── 1. Dynamic Radial Specular Highlight (Tracks Cursor) ── */}
      <div
        className={`pointer-events-none absolute -inset-px ${borderRadius} transition-opacity duration-300`}
        style={{
          opacity: isHovered ? 1 : 0.35,
          background: `radial-gradient(450px circle at ${mousePos.x}% ${mousePos.y}%, ${resolvedGlow}, transparent 55%)`,
        }}
      />

      {/* ── 2. Focused Specular Core Reflection ── */}
      <div
        className={`pointer-events-none absolute -inset-px ${borderRadius} transition-opacity duration-200`}
        style={{
          opacity: isHovered ? 0.75 : 0,
          background: `radial-gradient(180px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.18), transparent 70%)`,
        }}
      />

      {/* ── 3. Chromatic Border Sheen with Dynamic Dispersion ── */}
      <div
        className={`pointer-events-none absolute inset-0 ${borderRadius} transition-opacity duration-300`}
        style={{
          opacity: isHovered ? 0.85 : 0.25,
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.02) 40%, ${activePalette.borderGlow} 75%, ${activePalette.accent} 100%)`,
        }}
      />

      {/* ── 4. Internal Refractive Texture Sheen ── */}
      <div
        className={`pointer-events-none absolute inset-0 ${borderRadius} bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none`}
      />

      {/* Card Content Surface */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
