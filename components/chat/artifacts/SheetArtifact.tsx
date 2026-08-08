"use client";

import { useState, useCallback, useRef, useId } from "react";
import { Plus, Trash2, Download, Table2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

type CellValue = string;
type Row       = CellValue[];
type Grid      = Row[];

const DEFAULT_COLS = 4;
const DEFAULT_ROWS = 6;

function makeGrid(rows: number, cols: number): Grid {
  return Array.from({ length: rows }, () => Array(cols).fill(""));
}

const DEFAULT_HEADERS = ["Name", "Value", "Category", "Notes"];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  /** Optional initial CSV data pre-populated from chat context */
  initialData?: string[][];
}

export function SheetArtifact({ initialData }: Props) {
  const [headers, setHeaders] = useState<string[]>(
    initialData?.[0] ?? DEFAULT_HEADERS.slice(0, DEFAULT_COLS),
  );
  const [grid, setGrid] = useState<Grid>(
    initialData?.slice(1) ?? makeGrid(DEFAULT_ROWS, DEFAULT_COLS),
  );
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const uid = useId();

  const colCount = headers.length;

  // ── Editing ──────────────────────────────────────────────────────────────

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

  // ── Row/Col ops ──────────────────────────────────────────────────────────

  const addRow = () => setGrid((prev) => [...prev, Array(colCount).fill("")]);
  const deleteRow = (r: number) => setGrid((prev) => prev.filter((_, i) => i !== r));
  const addCol = () => {
    setHeaders((prev) => [...prev, `Col ${prev.length + 1}`]);
    setGrid((prev) => prev.map((row) => [...row, ""]));
  };
  const deleteCol = (c: number) => {
    setHeaders((prev) => prev.filter((_, i) => i !== c));
    setGrid((prev) => prev.map((row) => row.filter((_, i) => i !== c)));
  };

  // ── Export ───────────────────────────────────────────────────────────────

  const exportCSV = () => {
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines  = [headers, ...grid].map((row) => row.map(escape).join(","));
    const blob   = new Blob([lines.join("\n")], { type: "text/csv" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a");
    a.href = url; a.download = "shothik-sheet.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Keyboard nav ─────────────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const nextC = c + 1 < colCount ? c + 1 : 0;
      const nextR = c + 1 < colCount ? r : r + 1 < grid.length ? r + 1 : r;
      setSelectedCell({ r: nextR, c: nextC });
      document.getElementById(`${uid}-cell-${nextR}-${nextC}`)?.focus();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const nextR = r + 1 < grid.length ? r + 1 : r;
      setSelectedCell({ r: nextR, c });
      document.getElementById(`${uid}-cell-${nextR}-${c}`)?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-muted/20 shrink-0">
        <div className="flex items-center gap-1.5">
          <Table2 className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-xs font-semibold text-foreground">
            {grid.length} rows × {colCount} cols
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={addRow}
            className="h-7 px-2 rounded-lg text-[11px] text-muted-foreground hover:text-foreground">
            <Plus className="h-3 w-3 mr-1" /> Row
          </Button>
          <Button size="sm" variant="ghost" onClick={addCol}
            className="h-7 px-2 rounded-lg text-[11px] text-muted-foreground hover:text-foreground">
            <Plus className="h-3 w-3 mr-1" /> Col
          </Button>
          <Button size="sm" variant="ghost" onClick={exportCSV}
            className="h-7 px-2 rounded-lg text-[11px] text-muted-foreground hover:text-foreground">
            <Download className="h-3 w-3 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs select-none">
          {/* Header row */}
          <thead>
            <tr>
              {/* Row number gutter */}
              <th className="w-8 border-b border-r border-border/40 bg-muted/30 text-center text-[10px] text-muted-foreground/50 font-normal sticky top-0 z-10" />
              {headers.map((h, c) => (
                <th key={c} className="border-b border-r border-border/40 bg-muted/30 sticky top-0 z-10 min-w-[100px] p-0">
                  <div className="flex items-center group">
                    <input
                      value={h}
                      onChange={(e) => setHeader(c, e.target.value)}
                      className="w-full px-2 py-1.5 bg-transparent font-semibold text-[11px] text-foreground outline-none focus:bg-indigo-500/10"
                      aria-label={`Column ${c + 1} header`}
                    />
                    <button
                      onClick={() => deleteCol(c)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition p-0.5 mr-0.5 rounded text-muted-foreground hover:text-destructive"
                      aria-label={`Delete column ${h}`}
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Data rows */}
          <tbody>
            {grid.map((row, r) => (
              <tr key={r} className="group/row">
                {/* Row number */}
                <td className="border-b border-r border-border/30 bg-muted/10 text-center text-[10px] text-muted-foreground/50 w-8 py-0.5">
                  <div className="flex items-center justify-center gap-0.5">
                    <span>{r + 1}</span>
                    <button
                      onClick={() => deleteRow(r)}
                      className="opacity-0 group-hover/row:opacity-100 transition p-0.5 rounded text-muted-foreground hover:text-destructive"
                      aria-label={`Delete row ${r + 1}`}
                    >
                      <Trash2 className="h-2 w-2" />
                    </button>
                  </div>
                </td>

                {row.map((cell, c) => {
                  const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                  return (
                    <td key={c}
                      className={`border-b border-r border-border/30 p-0 ${isSelected ? "ring-2 ring-inset ring-indigo-500/60" : ""}`}>
                      <input
                        id={`${uid}-cell-${r}-${c}`}
                        value={cell}
                        onChange={(e) => setCell(r, c, e.target.value)}
                        onFocus={() => setSelectedCell({ r, c })}
                        onKeyDown={(e) => handleKeyDown(e, r, c)}
                        className="w-full px-2 py-1.5 bg-transparent text-foreground outline-none focus:bg-indigo-500/5"
                        aria-label={`Row ${r + 1}, ${headers[c] || `Col ${c + 1}`}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer hint */}
      <div className="shrink-0 px-3 py-1.5 border-t border-border/40 bg-muted/10 flex items-center gap-3 text-[10px] text-muted-foreground">
        <span>Tab to move right · Enter to move down</span>
        <span className="ml-auto">{grid.length * colCount} cells</span>
      </div>
    </div>
  );
}
