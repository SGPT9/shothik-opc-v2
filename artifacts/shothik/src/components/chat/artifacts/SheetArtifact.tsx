"use client";

import { useState, useCallback, useEffect, useId } from "react";
import { Plus, Trash2, Download, Table2, Calculator, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CellValue = string;
type Row       = CellValue[];
type Grid      = Row[];

const DEFAULT_HEADERS = ["Metric / Scenario", "Base Case (BDT)", "Aggressive (BDT)", "Conservative (BDT)"];
const DEFAULT_ROWS_DATA: Grid = [
  ["Monthly Active Users", "15,000", "45,000", "5,000"],
  ["Average Order Value (AOV)", "1,500", "1,850", "1,200"],
  ["Gross Revenue (MRR)", "22,500,000", "83,250,000", "6,000,000"],
  ["Cost of Goods Sold (COGS)", "5,250,000", "18,450,000", "1,750,000"],
  ["Customer Acquisition Cost (CAC)", "350", "280", "520"],
  ["Net Operating Profit", "+16,900,000", "+64,520,000", "+3,730,000"],
];

interface SheetArtifactProps {
  initialData?: string[][];
  title?: string;
  isStreaming?: boolean;
}

export function SheetArtifact({ initialData, title, isStreaming }: SheetArtifactProps) {
  const [headers, setHeaders] = useState<string[]>(
    initialData?.[0] ?? DEFAULT_HEADERS,
  );
  const [grid, setGrid] = useState<Grid>(
    initialData?.slice(1) ?? DEFAULT_ROWS_DATA,
  );
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>({ r: 0, c: 1 });
  const uid = useId();

  const colCount = headers.length;

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setHeaders(initialData[0]);
      setGrid(initialData.slice(1));
    }
  }, [initialData]);

  const setCell = useCallback((r: number, c: number, value: string) => {
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = value;
      return next;
    });
  }, []);

  const setHeader = useCallback((c: number, value: string) => {
    setHeaders((prev) => { const n = [...prev]; n[c] = value; return n; });
  }, []);

  const addRow = () => setGrid((prev) => [...prev, Array(colCount).fill("")]);
  const deleteRow = (r: number) => setGrid((prev) => prev.filter((_, i) => i !== r));
  const addCol = () => {
    setHeaders((prev) => [...prev, `Col ${prev.length + 1}`]);
    setGrid((prev) => prev.map((row) => [...row, ""]));
  };

  const exportCSV = () => {
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines  = [headers, ...grid].map((row) => row.map(escape).join(","));
    const blob   = new Blob([lines.join("\n")], { type: "text/csv" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a");
    a.href = url; a.download = "shothik-financial-model.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      if (r + 1 < grid.length) {
        e.preventDefault();
        setSelectedCell({ r: r + 1, c });
        document.getElementById(`${uid}-cell-${r + 1}-${c}`)?.focus();
      }
    } else if (e.key === "ArrowUp") {
      if (r > 0) {
        e.preventDefault();
        setSelectedCell({ r: r - 1, c });
        document.getElementById(`${uid}-cell-${r - 1}-${c}`)?.focus();
      }
    } else if (e.key === "Tab" && !e.shiftKey) {
      if (c + 1 < colCount) {
        e.preventDefault();
        setSelectedCell({ r, c: c + 1 });
        document.getElementById(`${uid}-cell-${r}-${c + 1}`)?.focus();
      } else if (r + 1 < grid.length) {
        e.preventDefault();
        setSelectedCell({ r: r + 1, c: 0 });
        document.getElementById(`${uid}-cell-${r + 1}-0`)?.focus();
      }
    } else if (e.key === "Tab" && e.shiftKey) {
      if (c > 0) {
        e.preventDefault();
        setSelectedCell({ r, c: c - 1 });
        document.getElementById(`${uid}-cell-${r}-${c - 1}`)?.focus();
      }
    }
  };

  const selectedVal = selectedCell
    ? grid[selectedCell.r]?.[selectedCell.c] ?? ""
    : "";

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden select-none">
      
      {/* ── Genspark Sheet Header Bar ── */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Table2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-foreground truncate">
              {title || "3-Scenario Financial Model (BDT)"}
            </h3>
            <p className="text-[10px] text-muted-foreground font-mono">
              Financial Model Spreadsheet · {grid.length} Rows × {colCount} Cols
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={addRow}
            className="h-7 px-2 text-[11px] font-semibold gap-1"
          >
            <Plus className="h-3 w-3" /> Row
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={addCol}
            className="h-7 px-2 text-[11px] font-semibold gap-1"
          >
            <Plus className="h-3 w-3" /> Col
          </Button>

          <Button
            size="sm"
            onClick={exportCSV}
            className="h-7 px-2.5 text-[11px] font-semibold gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white"
          >
            <Download className="h-3 w-3" /> Export CSV
          </Button>
        </div>
      </div>

      {/* ── Live Agentic Step Progress Banner (Genspark / Manus / ChatGPT pattern) ── */}
      {isStreaming && (
        <div className="flex items-center justify-between border-b border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs text-cyan-300 font-mono shrink-0 animate-pulse">
          <div className="flex items-center gap-2">
            <Calculator className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
            <span>AI Swarm Agent: Computing cell formulas & populating financial grid live…</span>
          </div>
          <span className="font-bold text-cyan-400">Step 2/3 · Computing MRR & Net Profit</span>
        </div>
      )}

      {/* ── Formula Bar ── */}
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/10 px-3 py-1.5 shrink-0 text-xs font-mono">
        <span className="font-bold text-cyan-400 shrink-0">fx</span>
        <div className="h-3 w-[1px] bg-border" />
        <span className="text-muted-foreground shrink-0 font-bold">
          {selectedCell ? `${String.fromCharCode(65 + selectedCell.c)}${selectedCell.r + 1}` : "A1"}
        </span>
        <input
          type="text"
          value={selectedVal}
          onChange={(e) => {
            if (selectedCell) setCell(selectedCell.r, selectedCell.c, e.target.value);
          }}
          placeholder="Enter text, value, or formula..."
          className="flex-1 bg-transparent text-foreground outline-none border-0 font-mono text-xs"
        />
      </div>

      {/* ── Grid Stage ── */}
      <div className="flex-1 min-h-0 overflow-auto p-2">
        <table className="w-full border-collapse text-xs font-mono select-none">
          <thead>
            <tr className="border-b border-border/80 bg-muted/30">
              <th className="w-10 border-r border-border/60 p-2 text-center text-[10px] text-muted-foreground font-mono">
                #
              </th>
              {headers.map((h, c) => (
                <th key={c} className="border-r border-border/60 p-2 text-left">
                  <input
                    type="text"
                    value={h}
                    onChange={(e) => setHeader(c, e.target.value)}
                    className="w-full bg-transparent font-bold text-foreground outline-none border-0 text-xs"
                  />
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {grid.map((row, r) => {
              const isProfitRow = row[0]?.toLowerCase().includes("profit") || row[0]?.toLowerCase().includes("margin");
              return (
                <tr
                  key={r}
                  className={cn(
                    "border-b border-border/40 transition-colors hover:bg-muted/30",
                    isProfitRow && "bg-emerald-500/10 font-bold text-emerald-300 border-emerald-500/30"
                  )}
                >
                  <td className="border-r border-border/60 p-2 text-center text-[10px] text-muted-foreground font-mono bg-muted/10">
                    {r + 1}
                  </td>
                  {row.map((cell, c) => {
                    const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                    return (
                      <td
                        key={c}
                        onClick={() => setSelectedCell({ r, c })}
                        className={cn(
                          "border-r border-border/60 p-0 relative transition-colors",
                          isSelected && "outline outline-2 outline-cyan-400 bg-cyan-500/10 z-10"
                        )}
                      >
                        <input
                          id={`${uid}-cell-${r}-${c}`}
                          type="text"
                          value={cell}
                          onChange={(e) => setCell(r, c, e.target.value)}
                          onKeyDown={(e) => handleCellKeyDown(e, r, c)}
                          onFocus={() => setSelectedCell({ r, c })}
                          className="w-full h-full bg-transparent px-2 py-2 outline-none border-0 text-xs font-mono text-foreground"
                        />
                      </td>
                    );
                  })}
                  <td className="p-1 text-center">
                    <button
                      type="button"
                      onClick={() => deleteRow(r)}
                      className="opacity-0 group-hover:opacity-100 hover:text-destructive text-muted-foreground transition p-1"
                      title="Delete row"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
