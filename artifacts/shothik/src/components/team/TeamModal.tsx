"use client";

import React, { useState, useEffect } from "react";
import { Users, Brain, Calendar, X, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TeamPanel } from "./TeamPanel";
import { MemoryViewer } from "../memory/MemoryViewer";
import { SchedulePanel } from "../schedule/SchedulePanel";

export interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "agents" | "memory" | "schedule";
}

export function TeamModal({ isOpen, onClose, initialTab = "agents" }: TeamModalProps) {
  const [activeTab, setActiveTab] = useState<"agents" | "memory" | "schedule">(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-4xl w-full p-0 overflow-hidden bg-slate-950/95 border-slate-800 text-slate-100 shadow-2xl flex flex-col h-[85vh] rounded-2xl backdrop-blur-2xl"
        aria-describedby="team-modal-description"
      >
        {/* Top Studio Bar */}
        <div className="p-4 border-b border-white/10 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                Agent Orchestration Studio
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Team • Memory • Schedule
                </span>
              </DialogTitle>
              <DialogDescription id="team-modal-description" className="text-xs text-zinc-400">
                Manage autonomous subagents, persistent semantic memory chunks, and recurring cron jobs.
              </DialogDescription>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab("agents")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "agents"
                  ? "bg-indigo-600/30 border border-indigo-500/40 text-indigo-200"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Agents</span>
            </button>

            <button
              onClick={() => setActiveTab("memory")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "memory"
                  ? "bg-cyan-600/30 border border-cyan-500/40 text-cyan-200"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Brain className="h-3.5 w-3.5" />
              <span>Memory</span>
            </button>

            <button
              onClick={() => setActiveTab("schedule")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "schedule"
                  ? "bg-amber-600/30 border border-amber-500/40 text-amber-200"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Scheduler</span>
            </button>
          </div>
        </div>

        {/* Studio Content Pane */}
        <div className="flex-1 overflow-hidden p-4">
          {activeTab === "agents" && <TeamPanel isModal={false} className="h-full" />}
          {activeTab === "memory" && <MemoryViewer isModal={false} className="h-full" />}
          {activeTab === "schedule" && <SchedulePanel isModal={false} className="h-full" />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TeamModal;
