"use client";

import { useState } from "react";
import {
  Camera,
  Sparkles,
  Download,
  Sliders,
  Layers,
  Image as ImageIcon,
  Sun,
  Palette,
  Ratio,
  Check,
  RefreshCw,
} from "lucide-react";
import { LiquidGlassCard } from "../LiquidGlassCard";
import { cn } from "@/lib/utils";

export interface MockupPreset {
  id: string;
  name: string;
  description: string;
  bgGradient: string;
  lighting: string;
  badge: string;
}

const PRESETS: MockupPreset[] = [
  {
    id: "preset-podium",
    name: "Minimalist Studio Podium",
    description: "Sleek matte circular pedestal with soft studio fill light and diffuse drop shadows.",
    bgGradient: "from-slate-900 via-indigo-950/80 to-slate-900",
    lighting: "Dual-point softbox (5600K Daylight)",
    badge: "Best for Perfumes & Gadgets",
  },
  {
    id: "preset-heritage",
    name: "Dhaka Heritage Wood",
    description: "Rustic polished mahogany wood textures with warm ambient morning sunlight.",
    bgGradient: "from-amber-950/90 via-stone-900 to-amber-950/70",
    lighting: "Warm rim light (3200K Tungsten)",
    badge: "Best for Panjabis & Sarees",
  },
  {
    id: "preset-botanical",
    name: "Lush Botanical Nature",
    description: "Organic green monstera foliage shadows with clean marble countertop reflections.",
    bgGradient: "from-emerald-950/80 via-zinc-900 to-teal-950/80",
    lighting: "Natural window diffused sun",
    badge: "Best for Skincare & Honey",
  },
  {
    id: "preset-cyber",
    name: "Neon Tech Cyberpunk",
    description: "Electric cyan and magenta underglow reflections on dark brushed carbon fiber.",
    bgGradient: "from-purple-950 via-slate-950 to-cyan-950",
    lighting: "High-contrast dual neon rim",
    badge: "Best for Gaming & Earbuds",
  },
];

export function ProductPhotoArtifact() {
  const [selectedPreset, setSelectedPreset] = useState<MockupPreset>(PRESETS[0]);
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5" | "9:16">("1:1");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [productTitle, setProductTitle] = useState("Handcrafted Jamdani Silk Panjabi");

  const handleEnhance = () => {
    setIsEnhancing(true);
    setTimeout(() => {
      setIsEnhancing(false);
    }, 1200);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Header ── */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>AI Product Photography & 3D Mockup Studio</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold">
                Studio-Grade Render
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Turn flat merchant photos into high-converting e-commerce hero shots with realistic studio lighting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Aspect Ratio Selector */}
          <div className="flex items-center p-0.5 rounded-lg bg-muted/60 border border-border text-xs font-mono">
            <button
              type="button"
              onClick={() => setAspectRatio("1:1")}
              className={cn(
                "px-2 py-1 rounded-md transition cursor-pointer",
                aspectRatio === "1:1" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground"
              )}
            >
              1:1
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio("4:5")}
              className={cn(
                "px-2 py-1 rounded-md transition cursor-pointer",
                aspectRatio === "4:5" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground"
              )}
            >
              4:5
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio("9:16")}
              className={cn(
                "px-2 py-1 rounded-md transition cursor-pointer",
                aspectRatio === "9:16" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground"
              )}
            >
              9:16
            </button>
          </div>

          <button
            type="button"
            onClick={handleEnhance}
            disabled={isEnhancing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            {isEnhancing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isEnhancing ? "Rendering..." : "Generate 4K Shot"}</span>
          </button>
        </div>
      </div>

      {/* ── Main Viewport Grid ── */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Left Column: Preset Selection & Controls */}
        <div className="md:col-span-5 flex flex-col h-full bg-card/40 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase font-mono">
              Product SKU Title
            </label>
            <input
              type="text"
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              className="w-full text-xs font-semibold bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-foreground block">
              Lighting & Environment Presets
            </span>

            {PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => setSelectedPreset(preset)}
                className={cn(
                  "p-3.5 rounded-2xl border transition cursor-pointer space-y-1.5",
                  selectedPreset.id === preset.id
                    ? "bg-cyan-500/10 border-cyan-500 shadow-sm ring-1 ring-cyan-500/30"
                    : "bg-card border-border/70 hover:border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">{preset.name}</h4>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-muted/60 text-cyan-400 border border-border/60">
                    {preset.badge}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {preset.description}
                </p>
                <div className="text-[10px] font-mono text-muted-foreground/80 flex items-center gap-1 pt-1">
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>{preset.lighting}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live 3D Viewport Mockup Canvas */}
        <div className="md:col-span-7 flex flex-col h-full bg-background items-center justify-center p-6 overflow-hidden">
          <div
            className={cn(
              "relative rounded-3xl border border-white/20 p-8 shadow-2xl transition-all duration-500 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b",
              selectedPreset.bgGradient,
              aspectRatio === "1:1" && "w-72 h-72 sm:w-84 sm:h-84",
              aspectRatio === "4:5" && "w-64 h-80 sm:w-72 sm:h-90",
              aspectRatio === "9:16" && "w-52 h-92 sm:w-60 sm:h-106"
            )}
          >
            {/* Ambient Lighting Flare */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />

            {/* 3D Product Podium Mockup */}
            <div className="relative z-10 text-center space-y-3">
              <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xl rotate-3 hover:rotate-0 transition">
                <ImageIcon className="w-10 h-10 text-cyan-300" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight drop-shadow-md">
                  {productTitle}
                </h3>
                <span className="text-[10px] font-mono text-cyan-300/90 uppercase tracking-widest block">
                  Studio Lighting Active
                </span>
              </div>
            </div>

            {/* Circular Reflection Base */}
            <div className="absolute bottom-6 w-44 h-8 bg-white/10 rounded-full blur-md border border-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPhotoArtifact;
