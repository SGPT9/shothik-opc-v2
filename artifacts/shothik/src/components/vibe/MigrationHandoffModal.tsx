

import React, { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle2, XCircle, Terminal, Database, Clock, RefreshCw } from "lucide-react";
import type { PendingMigration } from "@/lib/insforge/migration-safety";

interface MigrationHandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMigrationApproved?: (migration: PendingMigration) => void;
}

export function MigrationHandoffModal({
  isOpen,
  onClose,
  onMigrationApproved,
}: MigrationHandoffModalProps) {
  const [migrations, setMigrations] = useState<PendingMigration[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchMigrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/vibe/migrations/approve");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMigrations(json.data);
      }
    } catch (err: any) {
      setError("Failed to fetch pending migrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMigrations();
    }
  }, [isOpen]);

  const handleApprove = async (migrationId: string) => {
    try {
      setSubmittingId(migrationId);
      setError(null);
      setSuccessMessage(null);

      const res = await fetch("/api/vibe/migrations/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          migrationId,
          approvedBy: "human_operator_ui",
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSuccessMessage(`Migration "${json.data.title}" successfully approved & applied to live Postgres!`);
        if (onMigrationApproved) {
          onMigrationApproved(json.data);
        }
        await fetchMigrations();
      } else {
        setError(json.error || "Approval failed.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to execute migration approval.");
    } finally {
      setSubmittingId(null);
    }
  };

  if (!isOpen) return null;

  const pendingMigrations = migrations.filter((m) => m.status === "pending_approval");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-xl border border-border bg-background shadow-2xl p-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                Database Migration Safety Handoff
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">
                  1-Click Human Assist Required
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Vibe Coder AI generated Postgres schema changes waiting for human verification before applying live.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <XCircle className="size-5" />
          </button>
        </div>

        {/* Status Banners */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <XCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="my-4 overflow-y-auto flex-1 space-y-4 pr-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <RefreshCw className="size-6 animate-spin text-primary" />
              <span className="text-sm">Fetching pending schema migrations...</span>
            </div>
          ) : pendingMigrations.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2 border border-dashed border-border rounded-xl">
              <CheckCircle2 className="size-8 text-emerald-500/80" />
              <span className="text-sm font-medium text-foreground">No Pending Migrations</span>
              <span className="text-xs text-muted-foreground">
                Live Postgres schema is synchronized and clean.
              </span>
            </div>
          ) : (
            pendingMigrations.map((mig) => (
              <div
                key={mig.id}
                className="rounded-xl border border-border bg-card p-4 space-y-3 transition-all hover:border-accent"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="size-4 text-primary" />
                    <span className="font-semibold text-sm text-foreground">{mig.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    <span>{new Date(mig.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="relative rounded-lg bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-slate-200 overflow-x-auto">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Terminal className="size-3 text-amber-400" /> PostgreSQL DDL Payload
                    </span>
                    <span>ID: {mig.id}</span>
                  </div>
                  <pre className="whitespace-pre-wrap">{mig.sql}</pre>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-amber-400/90 font-medium">
                    ⚠️ Blocked by Human Assist Handoff Policy
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(mig.id)}
                      disabled={submittingId === mig.id}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {submittingId === mig.id ? (
                        <RefreshCw className="size-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-3.5" />
                      )}
                      1-Click Approve & Apply to Live Postgres
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Shothik Vibe Coder Safety Layer v1.0</span>
          <button
            onClick={fetchMigrations}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <RefreshCw className="size-3" /> Refresh List
          </button>
        </div>
      </div>
    </div>
  );
}
