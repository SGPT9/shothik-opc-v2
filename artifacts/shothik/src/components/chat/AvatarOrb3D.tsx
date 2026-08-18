"use client";

import React, { useRef, useEffect } from "react";

export type AvatarOrbRole = "shothik_core" | "sales_twin" | "steadfast_logistics" | "tax_advisor";

export interface AvatarOrb3DProps {
  size?: number;
  isSpeaking?: boolean;
  isListening?: boolean;
  avatarRole?: AvatarOrbRole;
  className?: string;
  onClick?: () => void;
}

interface OrbPalette {
  core: string;
  primary: string;
  secondary: string;
  ambient: string;
  glow: string;
  ripple: string;
}

const PALETTES: Record<AvatarOrbRole, OrbPalette> = {
  shothik_core: {
    core: "#ffffff",
    primary: "#6366f1",
    secondary: "#a855f7",
    ambient: "#06b6d4",
    glow: "rgba(99, 102, 241, 0.45)",
    ripple: "rgba(168, 85, 247, 0.6)",
  },
  sales_twin: {
    core: "#ffffff",
    primary: "#f43f5e",
    secondary: "#ec4899",
    ambient: "#fb923c",
    glow: "rgba(244, 63, 94, 0.45)",
    ripple: "rgba(251, 146, 60, 0.6)",
  },
  steadfast_logistics: {
    core: "#ffffff",
    primary: "#10b981",
    secondary: "#14b8a6",
    ambient: "#22c55e",
    glow: "rgba(16, 185, 129, 0.45)",
    ripple: "rgba(20, 184, 166, 0.6)",
  },
  tax_advisor: {
    core: "#ffffff",
    primary: "#3b82f6",
    secondary: "#f59e0b",
    ambient: "#64748b",
    glow: "rgba(245, 158, 11, 0.45)",
    ripple: "rgba(59, 130, 246, 0.6)",
  },
};

export function AvatarOrb3D({
  size = 48,
  isSpeaking = false,
  isListening = false,
  avatarRole = "shothik_core",
  className = "",
  onClick,
}: AvatarOrb3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx || typeof ctx.createRadialGradient !== "function") return;

    // High DPI crispness
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    if (typeof ctx.scale === "function") {
      ctx.scale(dpr, dpr);
    }

    let animationFrameId: number;
    let time = 0;
    const palette = PALETTES[avatarRole] || PALETTES.shothik_core;

    // Pre-allocated variables to achieve ZERO garbage-collection stalls in RAF
    const centerX = size / 2;
    const centerY = size / 2;
    const baseRadius = (size / 2) * 0.68;
    const pi2 = Math.PI * 2;

    const render = () => {
      time += isSpeaking ? 0.06 : isListening ? 0.035 : 0.02;
      ctx.clearRect(0, 0, size, size);

      // Reactive amplitude pulse
      const pulseAmp = isSpeaking
        ? Math.sin(time * 5) * 3.5 + Math.cos(time * 3) * 1.5
        : isListening
        ? Math.sin(time * 2.5) * 2.0
        : Math.sin(time) * 0.8;

      const currentRadius = Math.max(3, baseRadius + pulseAmp);

      // ── 1. Broad Ambient Radial Glow ──
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        currentRadius * 0.3,
        centerX,
        centerY,
        currentRadius * 1.45
      );
      glowGrad.addColorStop(0, palette.glow);
      glowGrad.addColorStop(0.7, palette.glow.replace(/[\d\.]+\)$/, "0.15)"));
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius * 1.45, 0, pi2);
      ctx.fill();

      // ── 2. Reactive Concentric Audio Wave Ripples ──
      if (isSpeaking || isListening) {
        const rippleCount = isSpeaking ? 3 : 2;
        for (let i = 0; i < rippleCount; i++) {
          const ripplePhase = (time * 1.5 + (i * Math.PI) / rippleCount) % (Math.PI * 2);
          const rippleFactor = Math.sin(ripplePhase) * 0.5 + 0.5;
          const rippleRadius = currentRadius + rippleFactor * (size * 0.22);
          const alpha = (1 - rippleFactor) * (isSpeaking ? 0.65 : 0.4);

          ctx.strokeStyle = palette.ripple.replace(/[\d\.]+\)$/, `${alpha})`);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, rippleRadius, 0, pi2);
          ctx.stroke();
        }
      }

      // ── 3. Main Holographic 3D Sphere with Specular Light ──
      const sphereGrad = ctx.createRadialGradient(
        centerX - currentRadius * 0.35,
        centerY - currentRadius * 0.35,
        currentRadius * 0.08,
        centerX,
        centerY,
        currentRadius
      );
      sphereGrad.addColorStop(0, palette.core);
      sphereGrad.addColorStop(0.25, palette.primary);
      sphereGrad.addColorStop(0.65, palette.secondary);
      sphereGrad.addColorStop(0.92, palette.ambient);
      sphereGrad.addColorStop(1, "#090d16");

      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, pi2);
      ctx.fill();

      // ── 4. Orbital Ring Wave / Voice Resonator ──
      if (isSpeaking || isListening) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(time * 0.8);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          currentRadius * 0.92,
          currentRadius * 0.38,
          0,
          0,
          pi2
        );
        ctx.stroke();
        ctx.restore();
      }

      // ── 5. Specular Glint Dot ──
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.beginPath();
      ctx.arc(
        centerX - currentRadius * 0.32,
        centerY - currentRadius * 0.32,
        Math.max(1, currentRadius * 0.12),
        0,
        pi2
      );
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [size, isSpeaking, isListening, avatarRole]);

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 select-none ${className}`}
      style={{ width: size, height: size }}
      title={`AI Presenter: ${avatarRole.replace(/_/g, " ").toUpperCase()}`}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="rounded-full shadow-lg"
      />
    </div>
  );
}
