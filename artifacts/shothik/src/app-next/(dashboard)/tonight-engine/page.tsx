import React from "react";
import { TonightEngineDashboard } from "@/components/tonight-engine/TonightEngineDashboard";

export const metadata = {
  title: "Tonight Engine Swarm Monitor | Shothik",
  description: "Live multi-agent swarm orchestration and overnight job telemetry canvas.",
};

export default function TonightEnginePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <TonightEngineDashboard
        runId="run_demo_overnight"
        initialPrompt="Autonomous Market Research, Outbound Sales Prospecting, and Social Launch Campaign"
      />
    </main>
  );
}
