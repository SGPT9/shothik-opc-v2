"use client";

import { useState } from "react";
import {
  Server,
  Layers,
  Cpu,
  Activity,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  Terminal,
  Zap,
  HardDrive,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveOfflineTask } from "@/lib/offline/offline-storage";

export interface MicroContainer {
  id: string;
  name: string;
  image: string;
  port: number;
  memoryMb: number;
  memoryLimitMb: number;
  cpuPercent: number;
  status: "Running" | "Restarting" | "Stopped";
  uptime: string;
}

export interface DokployMicroContainersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName?: string;
}

const INITIAL_CONTAINERS: MicroContainer[] = [
  {
    id: "cnt-1",
    name: "shothik-storefront-nextjs",
    image: "dokploy/shothik-storefront:v2.5",
    port: 3000,
    memoryMb: 48,
    memoryLimitMb: 88,
    cpuPercent: 1.2,
    status: "Running",
    uptime: "4d 12h",
  },
  {
    id: "cnt-2",
    name: "shothik-postgres-db",
    image: "postgres:16-alpine",
    port: 5432,
    memoryMb: 64,
    memoryLimitMb: 128,
    cpuPercent: 0.8,
    status: "Running",
    uptime: "14d 6h",
  },
  {
    id: "cnt-3",
    name: "shothik-redis-cache",
    image: "redis:7-alpine",
    port: 6379,
    memoryMb: 14,
    memoryLimitMb: 32,
    cpuPercent: 0.1,
    status: "Running",
    uptime: "14d 6h",
  },
  {
    id: "cnt-4",
    name: "shothik-banglish-nlp",
    image: "dokploy/banglish-nlp:latest",
    port: 8000,
    memoryMb: 72,
    memoryLimitMb: 96,
    cpuPercent: 2.4,
    status: "Running",
    uptime: "2d 8h",
  },
];

export function DokployMicroContainersModal({
  open,
  onOpenChange,
  companyName = "VerifiQ AI",
}: DokployMicroContainersModalProps) {
  const [containers, setContainers] = useState<MicroContainer[]>(INITIAL_CONTAINERS);
  const [restartingId, setRestartingId] = useState<string | null>(null);

  const handleRestartContainer = (id: string, name: string) => {
    setRestartingId(id);
    setContainers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Restarting" } : c))
    );

    setTimeout(() => {
      setContainers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "Running", uptime: "Just now" } : c))
      );
      setRestartingId(null);

      saveOfflineTask({
        id: `dokploy-restart-${Date.now()}`,
        title: `Restarted Dokploy container ${name} for ${companyName}`,
        category: "Publish",
        status: "completed",
        cost: "0 Credits",
        updatedAt: Date.now(),
      });
    }, 800);
  };

  const totalRamUsed = containers.reduce((acc, c) => acc + c.memoryMb, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] xl:max-w-5xl bg-[#0b101b] border-slate-800 text-slate-100 p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Dokploy Multi-Container Micro-Cluster</span>
                <Badge variant="outline" className="border-indigo-500/40 text-indigo-400 font-mono text-[10px]">
                  &lt;88MB VPS Budget
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Manage isolated Redis, PostgreSQL, Storefront, and Banglish NLP micro-containers for {companyName}.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Resource KPI Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-950/80 border-b border-slate-800 font-mono text-center shrink-0">
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Total Containers</span>
            <p className="text-base font-bold text-slate-100 mt-0.5">{containers.length} Micro-Services</p>
          </div>
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Cluster Memory Usage</span>
            <p className="text-base font-bold text-emerald-400 mt-0.5">{totalRamUsed}MB / 344MB</p>
          </div>
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Average CPU Load</span>
            <p className="text-base font-bold text-cyan-400 mt-0.5">1.1% vCPU</p>
          </div>
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Cluster Health</span>
            <p className="text-base font-bold text-indigo-400 mt-0.5">100% Operational</p>
          </div>
        </div>

        {/* Containers List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 font-mono text-xs">
          {containers.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100">{c.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] ${
                      c.status === "Running"
                        ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                        : "border-amber-500/40 text-amber-400 bg-amber-500/10"
                    }`}
                  >
                    {c.status}
                  </Badge>
                  <span className="text-[10px] text-slate-500">Port: :{c.port}</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-3">
                  <span>Image: {c.image}</span>
                  <span>Uptime: {c.uptime}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right text-[10px]">
                  <div className="text-slate-300 font-bold">
                    RAM: {c.memoryMb}MB <span className="text-slate-500">/ {c.memoryLimitMb}MB</span>
                  </div>
                  <div className="text-slate-400">CPU: {c.cpuPercent}%</div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={restartingId === c.id}
                  onClick={() => handleRestartContainer(c.id, c.name)}
                  className="h-7 text-[11px] gap-1 border-slate-700 text-slate-200 hover:bg-slate-800"
                  data-testid={`button-restart-${c.id}`}
                >
                  <RotateCcw className={`h-3 w-3 ${restartingId === c.id ? "animate-spin text-amber-400" : ""}`} />
                  <span>{restartingId === c.id ? "Restarting..." : "Restart"}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
