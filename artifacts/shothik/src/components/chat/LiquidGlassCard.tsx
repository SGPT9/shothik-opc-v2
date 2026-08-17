"use client";

import React, { useRef, useState, useEffect } from "react";

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: "subtle" | "medium" | "vibrant";
  interactive?: boolean;
  glowColor?: string;
}

export function LiquidGlassCard({
  children,
  className = "",
  intensity = "medium",
  interactive = true,
  glowColor = "rgba(99, 102, 241, 0.15)",
}: LiquidGlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const getBackdropStyles = () => {
    switch (intensity) {
      case "vibrant":
        return "bg-slate-900/60 backdrop-blur-2xl border-white/20 shadow-2xl shadow-indigo-500/10";
      case "subtle":
        return "bg-slate-900/30 backdrop-blur-md border-white/10 shadow-lg shadow-black/20";
      case "medium":
      default:
        return "bg-slate-900/45 backdrop-blur-xl border-white/15 shadow-xl shadow-indigo-950/30";
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${getBackdropStyles()} ${className}`}
      style={{
        transform: isHovered && interactive ? "translateY(-2px)" : "translateY(0px)",
      }}
    >
      {/* Dynamic Specular Glass Highlight & Refractive Glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0.4,
          background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, ${glowColor}, transparent 40%)`,
        }}
      />

      {/* Subtle Chromatic Border Sheen */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.8 : 0.2,
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 50%, rgba(99, 102, 241, 0.1) 100%)`,
        }}
      />

      {/* Card Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
