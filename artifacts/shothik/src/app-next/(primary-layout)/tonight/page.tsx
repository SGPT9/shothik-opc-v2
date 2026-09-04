import React from "react";
import { TonightEngineDashboard } from "@/components/tonight-engine/TonightEngineDashboard";

export default function TonightEnginePage() {
  return (
    <div className="w-full min-h-screen p-4 md:p-8 bg-slate-950/60">
      <TonightEngineDashboard
        initialPrompt="Autonomous Overnight Loop & Intel Arc B580 WebGPU Speculative Swarm"
      />
    </div>
  );
}
