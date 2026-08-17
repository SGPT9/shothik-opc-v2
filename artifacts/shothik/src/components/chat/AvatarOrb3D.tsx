"use client";

import React, { useRef, useEffect } from "react";

interface AvatarOrb3DProps {
  size?: number;
  isSpeaking?: boolean;
  isListening?: boolean;
  avatarRole?: "shothik_core" | "sales_twin" | "steadfast_logistics" | "tax_advisor";
  className?: string;
  onClick?: () => void;
}

export function AvatarOrb3D({
  size = 48,
  isSpeaking = false,
  isListening = false,
  avatarRole = "shothik_core",
  className = "",
  onClick,
}: AvatarOrb3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getOrbPalette = () => {
    switch (avatarRole) {
      case "sales_twin":
        return { primary: "#ec4899", secondary: "#8b5cf6", glow: "rgba(236, 72, 153, 0.4)" };
      case "steadfast_logistics":
        return { primary: "#10b981", secondary: "#06b6d4", glow: "rgba(16, 185, 129, 0.4)" };
      case "tax_advisor":
        return { primary: "#f59e0b", secondary: "#ef4444", glow: "rgba(245, 158, 11, 0.4)" };
      case "shothik_core":
      default:
        return { primary: "#6366f1", secondary: "#3b82f6", glow: "rgba(99, 102, 241, 0.4)" };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    const palette = getOrbPalette();

    const render = () => {
      time += 0.04;
      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const baseRadius = (size / 2) * 0.72;

      // Dynamic pulse multiplier for speaking/listening state
      const pulse = isSpeaking
        ? Math.sin(time * 4) * 4
        : isListening
        ? Math.sin(time * 2) * 2
        : Math.sin(time) * 1;

      const currentRadius = Math.max(4, baseRadius + pulse);

      // Outer glow
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        currentRadius * 0.4,
        centerX,
        centerY,
        currentRadius * 1.3
      );
      glowGrad.addColorStop(0, palette.glow);
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Main 3D Holographic Sphere
      const sphereGrad = ctx.createRadialGradient(
        centerX - currentRadius * 0.3,
        centerY - currentRadius * 0.3,
        currentRadius * 0.1,
        centerX,
        centerY,
        currentRadius
      );
      sphereGrad.addColorStop(0, "#ffffff");
      sphereGrad.addColorStop(0.3, palette.primary);
      sphereGrad.addColorStop(0.8, palette.secondary);
      sphereGrad.addColorStop(1, "#0f172a");

      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.fill();

      // Inner refractive ring / audio orbital wave
      if (isSpeaking || isListening) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY,
          currentRadius * 0.85,
          currentRadius * 0.35,
          time,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

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
      className={`relative inline-flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${className}`}
      style={{ width: size, height: size }}
      title={`AI Presenter: ${avatarRole}`}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full shadow-lg"
      />
    </div>
  );
}
