"use client";

import React, { useState } from "react";
import { Users, Bot, Shield, Zap, Sparkles, Check, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { TeamModal } from "./TeamModal";

export function TeamSettingsPanel() {
  const [defaultPolicy, setDefaultPolicy] = useState<"auto" | "manual">("auto");
  const [memorySync, setMemorySync] = useState<boolean>(true);
  const [overnightAutopilot, setOvernightAutopilot] = useState<boolean>(true);
  const [teamModalOpen, setTeamModalOpen] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Autonomous Team & Agent Orchestration</h3>
              <p className="text-sm text-muted-foreground">
                Configure defaults, memory synchronization, and execution permissions for subagents.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setTeamModalOpen(true)}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 shadow-sm"
          >
            <Bot className="h-4 w-4" />
            <span>Open Team Studio</span>
            <ExternalLink className="h-3 w-3 ml-0.5 opacity-70" />
          </Button>
        </div>

        {/* Setting options */}
        <div className="space-y-4 divide-y divide-border/60">
          <div className="pt-3 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-foreground">Default Agent Policy</h4>
              <p className="text-xs text-muted-foreground">
                Set whether newly provisioned subagents run autonomously or require supervisory approval.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDefaultPolicy("auto")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  defaultPolicy === "auto"
                    ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400"
                    : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                ⚡ Autonomous
              </button>
              <button
                type="button"
                onClick={() => setDefaultPolicy("manual")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  defaultPolicy === "manual"
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                    : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                🛡️ Supervised
              </button>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-foreground">Second-Me Memory Vector Sync</h4>
              <p className="text-xs text-muted-foreground">
                Automatically share retrieved user preferences and episodic facts with active subagents.
              </p>
            </div>
            <Switch checked={memorySync} onCheckedChange={setMemorySync} />
          </div>

          <div className="pt-4 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-foreground">Overnight Batch Autopilot</h4>
              <p className="text-xs text-muted-foreground">
                Allow scheduled tasks to self-execute during off-peak hours (02:00 - 06:00 BST).
              </p>
            </div>
            <Switch checked={overnightAutopilot} onCheckedChange={setOvernightAutopilot} />
          </div>
        </div>
      </div>

      {teamModalOpen && (
        <TeamModal isOpen={teamModalOpen} onClose={() => setTeamModalOpen(false)} />
      )}
    </div>
  );
}

export default TeamSettingsPanel;
