"use client";

import { useState } from "react";
import {
  Server,
  Layers,
  Terminal,
  Globe,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Smartphone,
  Monitor,
  Code2,
  Lock,
  Cpu,
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

export interface BuildRelease {
  version: string;
  commitHash: string;
  deployedAt: string;
  status: "active" | "archived" | "failed";
  sizeMb: number;
  cpuPercent: number;
  changelog: string;
}

export interface StartupBuildsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subdomain?: string;
  companyName?: string;
}

const DEFAULT_RELEASES: BuildRelease[] = [
  {
    version: "v2.5.0-alpha",
    commitHash: "9a4cefa",
    deployedAt: "10 mins ago",
    status: "active",
    sizeMb: 28.4,
    cpuPercent: 2.1,
    changelog: "Add bKash 1.85% MFS webhook signature verification & Cold Email Cadences",
  },
  {
    version: "v2.4.9-patch",
    commitHash: "841fa18",
    deployedAt: "Yesterday at 04:30 PM",
    status: "archived",
    sizeMb: 27.9,
    cpuPercent: 1.8,
    changelog: "Optimize standalone bundle to <88MB RAM on Dokploy PaaS",
  },
  {
    version: "v2.4.8-hotfix",
    commitHash: "ee1fb3b",
    deployedAt: "2 days ago",
    status: "archived",
    sizeMb: 29.1,
    cpuPercent: 2.4,
    changelog: "Patch IndexedDB offline task queue synchronization on 3G connections",
  },
];

export function StartupBuildsModal({
  open,
  onOpenChange,
  subdomain = "verifiq",
  companyName = "VerifiQ AI",
}: StartupBuildsModalProps) {
  const [releases, setReleases] = useState<BuildRelease[]>(DEFAULT_RELEASES);
  const [selectedRelease, setSelectedRelease] = useState<BuildRelease>(DEFAULT_RELEASES[0]);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"releases" | "preview">("releases");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);

  const previewUrl = `https://${subdomain}.polsia.app`;

  const handleTriggerRedeploy = async () => {
    setIsDeploying(true);
    setDeploySuccess(false);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const newRelease: BuildRelease = {
      version: `v2.5.${releases.length + 1}-rolling`,
      commitHash: Math.random().toString(36).substring(2, 9),
      deployedAt: "Just now",
      status: "active",
      sizeMb: 28.2,
      cpuPercent: 1.9,
      changelog: "Autonomous zero-downtime rolling container rebuild",
    };

    setReleases([
      newRelease,
      ...releases.map((r) => ({ ...r, status: "archived" as const })),
    ]);
    setSelectedRelease(newRelease);
    setIsDeploying(false);
    setDeploySuccess(true);
    setTimeout(() => setDeploySuccess(false), 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-4xl bg-[#0b101b] border-slate-800 text-slate-100 p-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>{companyName} Container Builds & Releases</span>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 font-mono text-[10px]">
                  Dokploy PaaS · Live
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Inspect standalone Docker containers (&lt;88MB), SSL certificates, git commit hashes, and sandboxed previews.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-slate-800 p-0.5 bg-slate-950">
              <button
                type="button"
                onClick={() => setActiveTab("releases")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  activeTab === "releases" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Releases ({releases.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  activeTab === "preview" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Live Preview
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Releases Matrix */}
        {activeTab === "releases" && (
          <div className="p-6 space-y-6">
            {/* Live Container Telemetry Card */}
            <div className="grid grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-center">
              <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/40">
                <span className="text-[10px] text-slate-400 uppercase">Container RAM</span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">{selectedRelease.sizeMb} MB / 88 MB</p>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/40">
                <span className="text-[10px] text-slate-400 uppercase">CPU Usage</span>
                <p className="text-sm font-bold text-sky-400 mt-0.5">{selectedRelease.cpuPercent}%</p>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/40">
                <span className="text-[10px] text-slate-400 uppercase">SSL Certificate</span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">Let's Encrypt</p>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/40">
                <span className="text-[10px] text-slate-400 uppercase">Node Runtime</span>
                <p className="text-sm font-bold text-purple-400 mt-0.5">v20 Alpine</p>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Deployment History</span>
              <Button
                size="sm"
                onClick={handleTriggerRedeploy}
                disabled={isDeploying}
                className="h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                data-testid="button-trigger-redeploy"
              >
                {deploySuccess ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Redeploy Succeeded!
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-3.5 w-3.5" /> Trigger Rolling Redeploy
                  </>
                )}
              </Button>
            </div>

            {/* Releases Table */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="px-4 py-2.5">Release Version</th>
                    <th className="px-4 py-2.5">Commit Hash</th>
                    <th className="px-4 py-2.5">Changelog</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Deployed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {releases.map((rel) => (
                    <tr
                      key={rel.version}
                      className={`hover:bg-slate-900/40 transition cursor-pointer ${
                        selectedRelease.version === rel.version ? "bg-slate-900/60" : ""
                      }`}
                      onClick={() => setSelectedRelease(rel)}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-200">
                        {rel.version}
                      </td>
                      <td className="px-4 py-3 font-mono text-indigo-400">
                        {rel.commitHash}
                      </td>
                      <td className="px-4 py-3 text-slate-300 max-w-xs truncate">
                        {rel.changelog}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            rel.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {rel.status === "active" ? "ACTIVE / LIVE" : "ARCHIVED"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-500">
                        {rel.deployedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Sandboxed Live Preview */}
        {activeTab === "preview" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2 font-mono text-slate-300">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <ShieldCheck className="h-3.5 w-3.5" /> SSL Verified
                </span>
                <span className="text-slate-500">· URL:</span>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline flex items-center gap-1"
                >
                  {previewUrl} <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="flex items-center gap-1 border border-slate-800 rounded-lg p-0.5 bg-slate-900">
                <button
                  type="button"
                  onClick={() => setViewMode("desktop")}
                  className={`p-1.5 rounded ${
                    viewMode === "desktop" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Desktop View (1200px)"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("mobile")}
                  className={`p-1.5 rounded ${
                    viewMode === "mobile" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Mobile View (375px)"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Sandboxed Preview Frame */}
            <div className="flex justify-center bg-black/80 rounded-xl border border-slate-800 p-4 min-h-[380px] overflow-hidden">
              <div
                className={`transition-all duration-300 bg-slate-950 rounded-xl border border-slate-800 shadow-2xl flex flex-col ${
                  viewMode === "mobile" ? "w-[375px] h-[520px]" : "w-full h-[420px]"
                }`}
              >
                <div className="h-7 bg-slate-900 border-b border-slate-800 flex items-center px-3 gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-[10px] font-mono text-slate-400">{previewUrl}</span>
                </div>
                <iframe
                  src={previewUrl}
                  title="Live Container Sandboxed Preview"
                  className="w-full flex-1 border-none bg-background rounded-b-xl"
                />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
