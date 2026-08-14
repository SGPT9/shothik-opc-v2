import React, { useState } from "react";
import {
  Server,
  Terminal,
  Globe,
  ShieldCheck,
  RotateCcw,
  Play,
  Download,
  Key,
  CheckCircle2,
  Cpu,
  HardDrive,
  Activity,
  Filter,
  Search,
  ExternalLink,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DokployLogEntry {
  id: string;
  time: string;
  level: "info" | "warn" | "error" | "deploy";
  message: string;
}

const MOCK_LOGS: DokployLogEntry[] = [
  { id: "l-1", time: "17:04:12", level: "info", message: "[dokploy-agent] Container started: verifiq_prod_container_3301" },
  { id: "l-2", time: "17:04:13", level: "info", message: "[next-standalone] Ready in 412ms on http://0.0.0.0:3000" },
  { id: "l-3", time: "17:04:15", level: "deploy", message: "[traefik-proxy] Acquired Let's Encrypt SSL certificate for verifiq.polsia.app" },
  { id: "l-4", time: "17:04:20", level: "info", message: "[insforge-baas] Connected to PostgreSQL BaaS pool (wss://ers8j28a.ap-southeast.insforge.app/realtime)" },
  { id: "l-5", time: "17:04:22", level: "info", message: "[healthcheck] HTTP 200 OK — RAM: 28.4MB / 88MB budget — CPU: 2.1%" },
];

export default function DokployDeployPage() {
  const [activeCompany, setActiveCompany] = useState("VerifiQ AI");
  const [logFilter, setLogFilter] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [showSecretsModal, setShowSecretsModal] = useState(false);
  const [logs, setLogs] = useState<DokployLogEntry[]>(MOCK_LOGS);

  const handleRedeploy = () => {
    setIsDeploying(true);
    const newLog: DokployLogEntry = {
      id: `l-${Date.now()}`,
      time: new Date().toLocaleTimeString(),
      level: "deploy",
      message: `[dokploy-deployer] Triggered zero-downtime container rolling update for ${activeCompany}…`,
    };
    setLogs((prev) => [...prev, newLog]);
    setTimeout(() => {
      setIsDeploying(false);
      setLogs((prev) => [
        ...prev,
        {
          id: `l-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          level: "info",
          message: `[dokploy-deployer] Rolling update successful: Container healthy on ${activeCompany.toLowerCase().replace(/\s+/g, "")}.polsia.app`,
        },
      ]);
    }, 1200);
  };

  const filteredLogs = logs.filter((l) =>
    l.message.toLowerCase().includes(logFilter.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Server className="h-6 w-6 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Dokploy Container & PaaS Runtime
            </h1>
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px] font-mono">
              {"Docker Standalone (<88MB)"}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Self-hosted container infrastructure, custom subdomain routing, and automated Let's Encrypt SSL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activeCompany}
            onChange={(e) => setActiveCompany(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm outline-none"
          >
            <option value="VerifiQ AI">🏢 VerifiQ AI</option>
            <option value="Acme SaaS">🏢 Acme SaaS</option>
            <option value="BookStudio">🏢 BookStudio</option>
          </select>
          <Button
            size="sm"
            onClick={handleRedeploy}
            disabled={isDeploying}
            className="h-8 rounded-xl text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
          >
            <RotateCcw className={cn("h-3.5 w-3.5", isDeploying && "animate-spin")} />
            <span>{isDeploying ? "Deploying Container…" : "Redeploy"}</span>
          </Button>
        </div>
      </div>

      {/* Container Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="rounded-2xl border border-border/80 bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Container Memory</span>
            <HardDrive className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-foreground mt-1 tabular-nums font-mono">28.4 MB</p>
          <p className="text-[10px] text-emerald-400 font-mono mt-0.5">Budget: 88 MB max</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>CPU Utilization</span>
            <Cpu className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-xl font-bold text-foreground mt-1 tabular-nums font-mono">2.1%</p>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">1 vCPU Allocated</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>SSL Certificate</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-foreground mt-1 font-mono">Active (ACM)</p>
          <p className="text-[10px] text-emerald-400 font-mono mt-0.5">Auto-renews in 78 days</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Daily Hosting Cost</span>
            <Activity className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-foreground mt-1 tabular-nums font-mono">$0.50 / day</p>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">৳60 BDT / day</p>
        </div>
      </div>

      {/* Domain & Network Manager */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-foreground">Domains & Ingress Routing</h2>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSecretsModal(true)}
            className="h-7 rounded-xl text-xs gap-1.5"
          >
            <Key className="h-3.5 w-3.5" /> Edit Secrets
          </Button>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-border/60 bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-foreground font-semibold">https://verifiq.polsia.app</span>
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 text-[9px]">
                Primary Subdomain
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-400 font-semibold">● Traefik SSL Live</span>
              <a
                href="https://verifiq.polsia.app"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                Open <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-border/60 bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-foreground font-semibold">app.verifiq.ai</span>
              <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-[9px]">
                Custom CNAME
              </Badge>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">● DNS Verified</span>
          </div>
        </div>
      </div>

      {/* Terminal Logs Viewer */}
      <div className="rounded-2xl border border-border/80 bg-[#0b101b] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-200 font-mono">
              Container Live Logs (stdout / stderr)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-3 w-3 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter logs…"
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="h-7 w-36 sm:w-48 pl-7 pr-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="p-4 font-mono text-xs text-slate-300 space-y-1.5 max-h-72 overflow-y-auto">
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
              <span className="text-slate-500 shrink-0 select-none text-[11px]">{log.time}</span>
              <span
                className={cn(
                  "shrink-0 text-[10px] font-bold px-1.5 rounded",
                  log.level === "deploy" && "bg-sky-500/20 text-sky-400",
                  log.level === "info" && "bg-slate-800 text-slate-300",
                  log.level === "warn" && "bg-amber-500/20 text-amber-400",
                  log.level === "error" && "bg-rose-500/20 text-rose-400"
                )}
              >
                {log.level.toUpperCase()}
              </span>
              <span className="break-all">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Secrets Modal */}
      <Dialog open={showSecretsModal} onOpenChange={setShowSecretsModal}>
        <DialogContent className="sm:max-w-md bg-[#0b101b] border-slate-800 text-slate-200">
          <DialogTitle className="flex items-center gap-2 text-base text-slate-100">
            <Key className="h-4 w-4 text-indigo-400" />
            <span>Container Secrets (.env.local)</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Environment variables injected into the Dokploy container runtime during build and start.
          </DialogDescription>
          <div className="space-y-2.5 font-mono text-xs my-2">
            <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950">
              <p className="text-slate-500 text-[10px]">NEXT_PUBLIC_INSFORGE_URL</p>
              <p className="text-slate-200">https://ers8j28a.ap-southeast.insforge.app</p>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950">
              <p className="text-slate-500 text-[10px]">NEXT_PUBLIC_INSFORGE_ANON_KEY</p>
              <p className="text-slate-200">ik_live_••••••••••••••••••••••••</p>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950">
              <p className="text-slate-500 text-[10px]">OPENROUTER_API_KEY</p>
              <p className="text-slate-200">sk-or-v1-••••••••••••••••••••</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setShowSecretsModal(false)}
            className="w-full rounded-xl text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
          >
            Save & Trigger Hot Reload
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
