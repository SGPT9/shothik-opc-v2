"use client";

import React from "react";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { GovernanceSettingsCard } from "@/components/admin/GovernanceSettingsCard";

export default function AdminGovernancePage() {
  return (
    <ErrorBoundary fallback={<GovernanceFallback />}>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">System Governance & Safety Policy</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Manage platform automation guardrails, OpenWiki auto-indexing, and Vibe Coder 1-click database migration handoffs.
            </p>
          </div>

          <GovernanceSettingsCard />
        </div>
      </div>
    </ErrorBoundary>
  );
}

function GovernanceFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center space-y-2">
        <p className="text-white font-bold">Failed to load Governance Control Panel</p>
        <p className="text-zinc-400 text-sm">
          Please refresh the page or verify admin settings.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
