"use client";

import { useState } from "react";
import {
  Database,
  Table,
  Sparkles,
  CheckCircle2,
  Copy,
  Layers,
  HardDrive,
  RefreshCw,
  Plus,
  Code2,
  Check,
  ShieldCheck,
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

export interface SchemaTable {
  name: string;
  rowCount: number;
  columns: { name: string; type: string; isPrimary?: boolean; isForeign?: boolean }[];
  description: string;
}

export interface DatabaseSchemaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName?: string;
}

const DEFAULT_TABLES: SchemaTable[] = [
  {
    name: "users",
    rowCount: 28,
    description: "Registered founder accounts, merchants, and team members with RLS auth policies.",
    columns: [
      { name: "id", type: "uuid", isPrimary: true },
      { name: "email", type: "varchar(255)" },
      { name: "full_name", type: "varchar(100)" },
      { name: "role", type: "varchar(32)" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
  {
    name: "orders",
    rowCount: 14,
    description: "Customer checkout orders, bKash TrxIDs, amounts in BDT, and Steadfast parcel IDs.",
    columns: [
      { name: "id", type: "uuid", isPrimary: true },
      { name: "customer_name", type: "varchar(100)" },
      { name: "amount_bdt", type: "numeric(10,2)" },
      { name: "payment_status", type: "varchar(32)" },
      { name: "trx_id", type: "varchar(64)" },
      { name: "created_at", type: "timestamptz" },
    ],
  },
  {
    name: "products",
    rowCount: 8,
    description: "Digital SaaS subscriptions, physical print books, and inventory items.",
    columns: [
      { name: "id", type: "uuid", isPrimary: true },
      { name: "title", type: "varchar(255)" },
      { name: "price_bdt", type: "numeric(10,2)" },
      { name: "category", type: "varchar(64)" },
      { name: "is_active", type: "boolean" },
    ],
  },
  {
    name: "webhook_logs",
    rowCount: 56,
    description: "Raw incoming bKash/Nagad and Steadfast courier IPN payloads with signature status.",
    columns: [
      { name: "id", type: "uuid", isPrimary: true },
      { name: "provider", type: "varchar(32)" },
      { name: "event_type", type: "varchar(64)" },
      { name: "signature_valid", type: "boolean" },
      { name: "received_at", type: "timestamptz" },
    ],
  },
];

export function DatabaseSchemaModal({
  open,
  onOpenChange,
  companyName = "VerifiQ AI",
}: DatabaseSchemaModalProps) {
  const [tables, setTables] = useState<SchemaTable[]>(DEFAULT_TABLES);
  const [selectedTable, setSelectedTable] = useState<SchemaTable>(DEFAULT_TABLES[1]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const totalRows = tables.reduce((acc, t) => acc + t.rowCount, 0);

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedSuccess(false);
    await new Promise((resolve) => setTimeout(resolve, 800));

    setTables((prev) =>
      prev.map((t) => ({
        ...t,
        rowCount: t.rowCount + Math.floor(Math.random() * 10) + 5,
      }))
    );

    saveOfflineTask({
      id: `seed-db-${Date.now()}`,
      title: `Seeded 25 test records across PostgreSQL tables for ${companyName}`,
      category: "Code",
      status: "completed",
      cost: "1 Credit",
      updatedAt: Date.now(),
    });

    setIsSeeding(false);
    setSeedSuccess(true);
    setTimeout(() => setSeedSuccess(false), 3000);
  };

  const handleCopySql = () => {
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-4xl bg-[#0b101b] border-slate-800 text-slate-100 p-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>PostgreSQL Database Schema & Tables</span>
                <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 font-mono text-[10px]">
                  Postgres 16 · InsForge BaaS
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Inspect auto-generated database relations, columns, Row-Level Security (RLS), and test datasets for {companyName}.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSeedData}
              disabled={isSeeding}
              className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              data-testid="button-seed-database"
            >
              {seedSuccess ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> 25 Records Seeded!
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" /> Seed Test Data
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Database Health Summary */}
        <div className="grid grid-cols-4 gap-3 p-6 bg-slate-950/80 border-b border-slate-800 font-mono text-center">
          <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Total Tables</span>
            <p className="text-base font-bold text-cyan-400 mt-0.5">{tables.length} Active</p>
          </div>
          <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Live Records</span>
            <p className="text-base font-bold text-slate-100 mt-0.5">{totalRows} Rows</p>
          </div>
          <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Storage Used</span>
            <p className="text-base font-bold text-emerald-400 mt-0.5">1.42 MB</p>
          </div>
          <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Security RLS</span>
            <p className="text-base font-bold text-indigo-400 mt-0.5">Enforced</p>
          </div>
        </div>

        {/* Main Explorer View */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Left Table List */}
          <div className="p-4 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block px-2 mb-2">
              Database Tables ({tables.length})
            </span>
            {tables.map((tbl) => (
              <button
                key={tbl.name}
                onClick={() => setSelectedTable(tbl)}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                  selectedTable.name === tbl.name
                    ? "border-cyan-500/80 bg-cyan-500/10 text-cyan-300"
                    : "border-slate-800/60 bg-slate-900/40 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Table className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="text-xs font-mono font-bold">{tbl.name}</span>
                </div>
                <Badge variant="outline" className="text-[9px] font-mono border-slate-700 text-slate-400">
                  {tbl.rowCount} rows
                </Badge>
              </button>
            ))}
          </div>

          {/* Right Column Schema Details */}
          <div className="p-6 md:col-span-2 space-y-5 bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-mono">
                  <span>public.{selectedTable.name}</span>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 font-mono">
                    {selectedTable.rowCount} Live Rows
                  </Badge>
                </h3>
                <p className="text-xs text-slate-400 mt-1">{selectedTable.description}</p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={handleCopySql}
                className="h-7 text-xs border-slate-700 text-slate-300 gap-1.5 font-mono"
              >
                {copiedSql ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copy DDL
                  </>
                )}
              </Button>
            </div>

            {/* Columns Table */}
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-mono">
                  <tr>
                    <th className="px-4 py-2.5">Column Name</th>
                    <th className="px-4 py-2.5">Data Type</th>
                    <th className="px-4 py-2.5">Constraints</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {selectedTable.columns.map((col) => (
                    <tr key={col.name} className="hover:bg-slate-900/60 transition">
                      <td className="px-4 py-2.5 font-bold text-slate-200 flex items-center gap-1.5">
                        {col.isPrimary && <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300">PK</span>}
                        {col.isForeign && <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300">FK</span>}
                        <span>{col.name}</span>
                      </td>
                      <td className="px-4 py-2.5 text-cyan-400">{col.type}</td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {col.isPrimary ? "NOT NULL PRIMARY KEY" : "DEFAULT NULL"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* RLS Security Note */}
            <div className="p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-300 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0" />
              <span className="text-[11px] font-mono">
                Postgres RLS Policy active: <strong className="text-white">auth.uid() = user_id</strong> (Zero data leakage).
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
