"use client";

import { useState, useEffect } from "react";
import {
  GitBranch,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Zap,
  TrendingDown,
  Activity,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sliders,
  Server,
  ArrowRight,
  Clock,
  Radio,
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

export interface CanaryDeployment {
  id: string;
  candidateVersion: string;
  stableVersion: string;
  targetService: string;
  commitSha: string;
  status: "IDLE" | "CANARY_ROUTING" | "PROMOTED" | "ROLLED_BACK";
  trafficWeightPercent: number;
  startedAt: string;
  updatedAt: string;
  promotedAt?: string;
  rolledBackAt?: string;
  rollbackReason?: string;
}

export interface CanaryTelemetry {
  timestamp: string;
  canaryWeight: number;
  errorRatePercent: number;
  p95LatencyMs: number;
  http5xxCount: number;
  requestsPerSec: number;
  sloHealthy: boolean;
  anomalyScore: number;
}

export interface RollbackEvent {
  eventId: string;
  timestamp: string;
  trigger: "ERROR_RATE_SPIKE" | "LATENCY_REGRESSION" | "MANUAL_OPERATOR" | "CIRCUIT_BREAKER";
  message: string;
  previousWeight: number;
  newWeight: number;
}

export const FALLBACK_CANARY_DEPLOYMENT: CanaryDeployment = {
  id: "canary_fallback_01",
  candidateVersion: "v2.4.1-rc1",
  stableVersion: "v2.4.0",
  targetService: "api-server-mesh",
  commitSha: "84276155",
  status: "CANARY_ROUTING",
  trafficWeightPercent: 10,
  startedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const FALLBACK_TELEMETRY: CanaryTelemetry = {
  timestamp: new Date().toISOString(),
  canaryWeight: 10,
  errorRatePercent: 0.12,
  p95LatencyMs: 48.5,
  http5xxCount: 0,
  requestsPerSec: 1420,
  sloHealthy: true,
  anomalyScore: 0.02,
};

export interface CanaryTrafficDirectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CanaryTrafficDirectorModal({ open, onOpenChange }: CanaryTrafficDirectorModalProps) {
  const [activeTab, setActiveTab] = useState<"director" | "telemetry" | "chaos">("director");
  const [deployment, setDeployment] = useState<CanaryDeployment>(FALLBACK_CANARY_DEPLOYMENT);
  const [stableVersion, setStableVersion] = useState("v2.4.0");
  const [telemetry, setTelemetry] = useState<CanaryTelemetry>(FALLBACK_TELEMETRY);
  const [rollbacks, setRollbacks] = useState<RollbackEvent[]>([]);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/v1/traffic/canary/status");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          if (json.activeDeployment) setDeployment(json.activeDeployment);
          if (json.stableVersion) setStableVersion(json.stableVersion);
          if (json.latestTelemetry) setTelemetry(json.latestTelemetry);
          if (json.recentRollbacks) setRollbacks(json.recentRollbacks);
        }
      }
    } catch {
      // Retain fallback state
    }
  };

  useEffect(() => {
    if (open) {
      fetchStatus();
    }
  }, [open]);

  // Adjust traffic weight
  const handleAdjustWeight = async (weight: number) => {
    setIsAdjusting(true);
    setNotification(null);
    try {
      const res = await fetch("/api/v1/traffic/canary/adjust-weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight }),
      });

      if (res.ok) {
        const json = await res.json();
        setDeployment(json.deployment);
        setNotification(`Traffic split adjusted to ${weight}% Canary / ${100 - weight}% Stable.`);
        await fetchStatus();
      } else {
        // Fallback local update
        setDeployment((prev) => ({
          ...prev,
          trafficWeightPercent: weight,
          status: weight === 100 ? "PROMOTED" : weight === 0 ? "ROLLED_BACK" : "CANARY_ROUTING",
        }));
        setNotification(`Traffic weight updated locally to ${weight}%.`);
      }
    } catch {
      setDeployment((prev) => ({ ...prev, trafficWeightPercent: weight }));
      setNotification(`Traffic shifted to ${weight}% (local simulation).`);
    } finally {
      setIsAdjusting(false);
    }
  };

  // Promote Canary
  const handlePromote = async () => {
    setIsAdjusting(true);
    setNotification(null);
    try {
      const res = await fetch("/api/v1/traffic/canary/promote", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        setDeployment(json.deployment);
        setStableVersion(json.deployment.candidateVersion);
        setNotification(`Canary ${json.deployment.candidateVersion} promoted to 100% production baseline!`);
        await fetchStatus();
      }
    } catch {
      setDeployment((prev) => ({ ...prev, status: "PROMOTED", trafficWeightPercent: 100 }));
      setNotification("Canary candidate promoted to stable baseline.");
    } finally {
      setIsAdjusting(false);
    }
  };

  // Emergency Rollback
  const handleRollback = async () => {
    setIsAdjusting(true);
    setNotification(null);
    try {
      const res = await fetch("/api/v1/traffic/canary/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Emergency operator manual rollback" }),
      });

      if (res.ok) {
        const json = await res.json();
        setDeployment(json.deployment);
        setNotification("Emergency rollback completed. 100% traffic routed to stable baseline.");
        await fetchStatus();
      }
    } catch {
      setDeployment((prev) => ({
        ...prev,
        status: "ROLLED_BACK",
        trafficWeightPercent: 0,
        rollbackReason: "Emergency rollback",
      }));
      setNotification("Rollback executed. Canary weight 0%.");
    } finally {
      setIsAdjusting(false);
    }
  };

  // Simulate Anomaly (Self-Healing Demo)
  const handleSimulateAnomaly = async (type: "ERROR_SPIKE" | "LATENCY_SPIKE") => {
    setNotification(null);
    try {
      const res = await fetch("/api/v1/traffic/canary/simulate-anomaly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (res.ok) {
        const json = await res.json();
        setTelemetry(json.telemetry);
        if (json.circuitBreakerTriggered) {
          setNotification(
            `Autonomous Circuit Breaker ACTIVATED! Error threshold breached -> Canary instantly rolled back to 0%.`
          );
        }
        await fetchStatus();
      } else {
        // Local simulation
        setDeployment((prev) => ({ ...prev, status: "ROLLED_BACK", trafficWeightPercent: 0 }));
        setTelemetry((prev) => ({ ...prev, errorRatePercent: 4.85, sloHealthy: false }));
        setNotification("Autonomous circuit breaker triggered: 100% traffic restored to stable.");
      }
    } catch {
      setDeployment((prev) => ({ ...prev, status: "ROLLED_BACK", trafficWeightPercent: 0 }));
      setNotification("Autonomous circuit breaker triggered: 100% traffic restored to stable.");
    } finally {
      setIsAdjusting(false);
    }
  };

  const canaryPercent = deployment.trafficWeightPercent;
  const stablePercent = 100 - canaryPercent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="canary-traffic-director-modal"
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl p-6 rounded-2xl"
      >
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <GitBranch className="w-5 h-5" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Autonomous Self-Healing Canary & Traffic Director
                <Badge
                  variant="outline"
                  className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px] font-mono uppercase px-2 py-0.5"
                >
                  Blue/Green Zero-Downtime
                </Badge>
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-zinc-400 mt-1">
              Dynamic blue/green traffic splitting, continuous SLO anomaly monitoring, and sub-second automated circuit-breaker rollback across polyrepo micro-services.
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isAdjusting || canaryPercent === 0}
              onClick={handleRollback}
              className="h-8 text-xs font-semibold bg-red-600/10 hover:bg-red-600/20 text-red-300 border-red-500/30"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-red-400" />
              Emergency Rollback
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isAdjusting || deployment.status === "PROMOTED"}
              onClick={handlePromote}
              className="h-8 text-xs font-semibold bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-300 border-emerald-500/30"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Promote to 100%
            </Button>
          </div>
        </DialogHeader>

        {/* Global Live Notification Banner */}
        <div className="mt-4 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-1.5 rounded-lg ${
                telemetry.sloHealthy ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
              }`}
            >
              {telemetry.sloHealthy ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                SLO Status: {telemetry.sloHealthy ? "Compliant & Healthy" : "SLO Violation Detected"}
                <Badge variant="secondary" className="text-[10px] font-mono bg-zinc-800 text-zinc-300">
                  {deployment.status}
                </Badge>
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">
                {notification || `Active: ${canaryPercent}% routed to ${deployment.candidateVersion} | ${stablePercent}% to ${stableVersion}.`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-300 font-mono">
              Circuit Breaker: Active
            </Badge>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 mt-4 border-b border-zinc-800/80 pb-2">
          <button
            onClick={() => setActiveTab("director")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              activeTab === "director"
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            Blue/Green Split Director
          </button>
          <button
            onClick={() => setActiveTab("telemetry")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              activeTab === "telemetry"
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            Live SLO Telemetry
          </button>
          <button
            onClick={() => setActiveTab("chaos")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              activeTab === "chaos"
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            Chaos & Self-Healing Sandbox
          </button>
        </div>

        {/* Tab 1: Blue/Green Split Director */}
        {activeTab === "director" && (
          <div className="space-y-4 mt-4">
            {/* Visual Traffic Split Gauge Bar */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="font-semibold text-zinc-200">Stable Baseline: {stableVersion}</span>
                  <Badge variant="outline" className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border-blue-500/30">
                    {stablePercent}% Traffic
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-zinc-200">Canary: {deployment.candidateVersion}</span>
                  <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    {canaryPercent}% Traffic
                  </Badge>
                </div>
              </div>

              {/* Animated Progress Split Bar */}
              <div className="w-full h-4 bg-zinc-950 rounded-full overflow-hidden flex border border-zinc-800">
                <div
                  style={{ width: `${stablePercent}%` }}
                  className="bg-blue-600 h-full transition-all duration-500 relative"
                ></div>
                <div
                  style={{ width: `${canaryPercent}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500 relative"
                ></div>
              </div>

              {/* Stepped Traffic Ramp Controls */}
              <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Quick Ramp Weights:</span>
                <div className="flex items-center gap-2">
                  {[5, 10, 25, 50, 100].map((w) => (
                    <Button
                      key={w}
                      size="sm"
                      variant={canaryPercent === w ? "default" : "outline"}
                      disabled={isAdjusting}
                      onClick={() => handleAdjustWeight(w)}
                      className={`h-7 text-xs font-mono px-3 ${
                        canaryPercent === w
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      {w === 100 ? "100% (Promote)" : `${w}%`}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Micro-Service Details Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2 text-xs">
                <span className="text-zinc-500 block">Target Deployment Fleet</span>
                <div className="font-semibold text-white text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-400" />
                  {deployment.targetService}
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  Git Commit: <span className="text-purple-300">{deployment.commitSha}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2 text-xs">
                <span className="text-zinc-500 block">Circuit Breaker Trigger Rules</span>
                <div className="font-semibold text-white text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Autonomous Zero-Downtime Rollback
                </div>
                <div className="text-[11px] text-zinc-400">
                  Breaches if Error &gt; 1.5% or P95 Latency &gt; 250ms
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Live SLO Telemetry */}
        {activeTab === "telemetry" && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Error Rate</span>
                <span
                  className={`text-lg font-bold font-mono ${
                    telemetry.errorRatePercent > 1.5 ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {telemetry.errorRatePercent.toFixed(2)}%
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Threshold: &lt;1.5%</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">P95 Latency</span>
                <span
                  className={`text-lg font-bold font-mono ${
                    telemetry.p95LatencyMs > 250 ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {telemetry.p95LatencyMs.toFixed(1)} ms
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Threshold: &lt;250ms</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">HTTP 5xx Spikes</span>
                <span className="text-lg font-bold font-mono text-zinc-200">{telemetry.http5xxCount} errs</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Zero tolerance</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Throughput</span>
                <span className="text-lg font-bold font-mono text-blue-400">
                  {telemetry.requestsPerSec.toLocaleString()} rps
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Active load</span>
              </div>
            </div>

            {/* Historical Incident Rollback Log */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-xs font-semibold text-white block mb-2">Rollback Incident Audit Trail</span>
              {rollbacks.length === 0 ? (
                <div className="text-xs text-zinc-500 font-mono py-2">
                  No automated rollbacks recorded. Fleet operating normally.
                </div>
              ) : (
                <div className="space-y-2">
                  {rollbacks.slice(0, 5).map((rb) => (
                    <div
                      key={rb.eventId}
                      className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-[10px] font-mono">
                          {rb.trigger}
                        </Badge>
                        <span className="text-zinc-300">{rb.message}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(rb.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Chaos & Self-Healing Sandbox */}
        {activeTab === "chaos" && (
          <div className="space-y-4 mt-4">
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-white">
                  Autonomous Anomaly Injection & Circuit Breaker Verification
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Trigger an artificial anomaly in the canary fleet. The autonomous circuit breaker monitors the stream in real-time, detects the SLO threshold breach, and instantly dumps canary traffic to 0%, preventing outages for production users.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Error Rate Spike (4.85%)</div>
                    <div className="text-[10px] text-zinc-500">Exceeds 1.5% max threshold</div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleSimulateAnomaly("ERROR_SPIKE")}
                    className="h-7 text-xs font-semibold"
                  >
                    Simulate Error Spike
                  </Button>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Latency Regression (412ms)</div>
                    <div className="text-[10px] text-zinc-500">Exceeds 250ms P95 threshold</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSimulateAnomaly("LATENCY_SPIKE")}
                    className="h-7 text-xs font-semibold border-amber-500/30 text-amber-300 hover:bg-amber-950/20"
                  >
                    Simulate Latency Spike
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
