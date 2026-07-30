"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Bot,
  GitBranch,
  Database,
  CheckCircle2,
  Sliders,
  AlertCircle,
} from "lucide-react";
import {
  getSystemGovernanceConfig,
  updateSystemGovernanceConfig,
  type SystemGovernanceConfig,
} from "@/lib/config/system-governance";
import { MigrationHandoffModal } from "@/components/vibe/MigrationHandoffModal";

export function GovernanceSettingsCard() {
  const [config, setConfig] = useState<SystemGovernanceConfig>({
    twinCommunityRole: "auto_heartbeat",
    githubAutoSync: true,
    databaseMigrationSafety: true,
  });
  const [savedNotice, setSavedNotice] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setConfig(getSystemGovernanceConfig());
  }, []);

  const handleToggleTwinRole = () => {
    const newRole =
      config.twinCommunityRole === "auto_heartbeat"
        ? "manual_approval"
        : "auto_heartbeat";
    const updated = updateSystemGovernanceConfig({ twinCommunityRole: newRole });
    setConfig(updated);
    triggerSaved();
  };

  const handleToggleGithubSync = () => {
    const updated = updateSystemGovernanceConfig({
      githubAutoSync: !config.githubAutoSync,
    });
    setConfig(updated);
    triggerSaved();
  };

  const handleToggleMigrationSafety = () => {
    const updated = updateSystemGovernanceConfig({
      databaseMigrationSafety: !config.databaseMigrationSafety,
    });
    setConfig(updated);
    triggerSaved();
  };

  const triggerSaved = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              System Governance & Safety Policy
              {savedNotice && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1 font-medium animate-pulse">
                  <CheckCircle2 className="size-3" /> Policy Updated
                </span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              Configure automation rules, GitHub OpenWiki indexing, and Vibe Coder database migration handoffs.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all flex items-center gap-1.5"
        >
          <Database className="size-3.5" /> View Pending Migrations
        </button>
      </div>

      <div className="space-y-4">
        {/* Twin Community Role Rule */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-background/50 hover:border-border transition-colors">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 mt-0.5">
              <Bot className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Twin Community Forum Automation</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-mono">
                  {config.twinCommunityRole}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automatically respond to mentions in /community forums using periodic heartbeat execution rules.
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleTwinRole}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              config.twinCommunityRole === "auto_heartbeat"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
            }`}
          >
            {config.twinCommunityRole === "auto_heartbeat" ? "Auto Heartbeat" : "Manual Approval"}
          </button>
        </div>

        {/* GitHub Auto-Sync Rule */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-background/50 hover:border-border transition-colors">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5">
              <GitBranch className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">GitHub OpenWiki Auto-Sync</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${
                  config.githubAutoSync ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"
                }`}>
                  {config.githubAutoSync ? "Enabled" : "Disabled"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Trigger OpenWiki re-indexing jobs automatically on GitHub repository updates and push webhooks.
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleGithubSync}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              config.githubAutoSync
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {config.githubAutoSync ? "Active" : "Paused"}
          </button>
        </div>

        {/* Database Migration Safety Rule */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-background/50 hover:border-border transition-colors">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
              <Database className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Vibe Coder Postgres Migration Safety</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${
                  config.databaseMigrationSafety ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"
                }`}>
                  {config.databaseMigrationSafety ? "1-Click Human Assist Required" : "Auto-Apply Enabled"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Require a 1-click Human Assist Handoff Approval before applying AI-generated schema changes to live Postgres.
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleMigrationSafety}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              config.databaseMigrationSafety
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
            }`}
          >
            {config.databaseMigrationSafety ? "Safety Active" : "Unsafe Mode"}
          </button>
        </div>
      </div>

      <MigrationHandoffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
