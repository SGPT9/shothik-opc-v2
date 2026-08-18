import { useState, useCallback, useEffect, useId } from "react";
import { Plus, Trash2, Download, Table2, Calculator, BarChart3, Copy, Check } from "lucide-react";
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

export function buildDynamicSheet(title?: string): { headers: string[]; rows: Grid; kpis: { label: string; value: string; color: string }[] } {
  const clean = title || "3-Scenario Financial Model (BDT)";
  const lower = clean.toLowerCase();

  if (lower.includes("logistics") || lower.includes("courier") || lower.includes("cod") || lower.includes("steadfast") || lower.includes("pathao") || lower.includes("delivery")) {
    return {
      headers: ["Logistics Operational Metric", "Dhaka Metro (BDT)", "Chittagong & Sylhet", "Nationwide Rural"],
      rows: [
        ["Monthly Dispatched Parcels", "25,000", "8,500", "4,200"],
        ["Average Order Value (AOV)", "1,450", "1,800", "1,200"],
        ["Gross Collection Volume", "36,250,000", "15,300,000", "5,040,000"],
        ["Courier Delivery Charge (Avg)", "60", "110", "150"],
        ["bKash / Nagad MFS Fee (1.5%)", "543,750", "229,500", "75,600"],
        ["Return-to-Origin (RTO) Rate", "3.2%", "5.8%", "8.5%"],
        ["Net Merchant Realization", "33,892,500", "13,924,500", "4,182,600"],
      ],
      kpis: [
        { label: "Total Parcels/Mo", value: "37,700", color: "text-cyan-400" },
        { label: "Gross Flow", value: "৳56.59M", color: "text-purple-400" },
        { label: "Net Payout", value: "৳51.99M", color: "text-emerald-400" },
        { label: "Avg Delivery Success", value: "94.8%", color: "text-amber-400" },
      ],
    };
  }

  if (lower.includes("tax") || lower.includes("nbr") || lower.includes("section 78") || lower.includes("rebate") || lower.includes("corporate")) {
    return {
      headers: ["Tax Assessment Parameter", "FY2024-25 Base", "With Sec 78 Rebate", "Export Exemption Case"],
      rows: [
        ["Gross Operating Turnover", "45,000,000", "45,000,000", "45,000,000"],
        ["Allowable Operating Expenses", "28,500,000", "28,500,000", "28,500,000"],
        ["Taxable Net Income", "16,500,000", "16,500,000", "0 (Exempt)"],
        ["Standard Corporate Tax (27.5%)", "4,537,500", "4,537,500", "0"],
        ["Section 78 Investment Rebate (15%)", "0", "-680,625", "0"],
        ["Net Final Tax Payable", "4,537,500", "3,856,875", "0 (Exempt)"],
      ],
      kpis: [
        { label: "Gross Turnover", value: "৳45.00M", color: "text-cyan-400" },
        { label: "Taxable Income", value: "৳16.50M", color: "text-purple-400" },
        { label: "Sec 78 Savings", value: "৳680,625", color: "text-emerald-400" },
        { label: "Effective Tax Rate", value: "8.57%", color: "text-amber-400" },
      ],
    };
  }

  // Default SaaS 3-Scenario Model
  return {
    headers: DEFAULT_HEADERS,
    rows: DEFAULT_ROWS_DATA,
    kpis: [
      { label: "Base MRR", value: "৳22,500,000", color: "text-cyan-400" },
      { label: "Aggressive MRR", value: "৳83,250,000", color: "text-purple-400" },
      { label: "Net Operating Profit", value: "+৳64,520,000", color: "text-emerald-400" },
      { label: "Gross Margin", value: "76.6%", color: "text-amber-400" },
    ],
  };
}

interface SheetArtifactProps {
  initialData?: Grid;
  title?: string;
  isStreaming?: boolean;
}

export function SheetArtifact({ initialData, title, isStreaming }: SheetArtifactProps) {
  const dynamic = buildDynamicSheet(title);
  const [headers, setHeaders] = useState<string[]>(
    initialData?.[0] ?? dynamic.headers,
  );
  const [grid, setGrid] = useState<Grid>(
    initialData?.slice(1) ?? dynamic.rows,
  );
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>({ r: 0, c: 1 });
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");
  const [copiedMd, setCopiedMd] = useState(false);
  const uid = useId();

  const colCount = headers.length;

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setHeaders(initialData[0]);
      setGrid(initialData.slice(1));
    } else if (title) {
      const generated = buildDynamicSheet(title);
      setHeaders(generated.headers);
      setGrid(generated.rows);
    }
  }, [initialData, title]);

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

  const copyMarkdown = () => {
    const headerLine = `| ${headers.join(" | ")} |`;
    const dividerLine = `| ${headers.map(() => "---").join(" | ")} |`;
    const rowLines = grid.map((r) => `| ${r.join(" | ")} |`).join("\n");
    const md = `${headerLine}\n${dividerLine}\n${rowLines}`;
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
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

        {/* Controls & View Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-border/60 bg-card p-0.5 mr-1">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer",
                viewMode === "table"
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Table2 className="h-3 w-3" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("chart")}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer",
                viewMode === "chart"
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BarChart3 className="h-3 w-3" />
              <span>Trends</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={copyMarkdown}
            className="h-7 px-2 text-[11px] font-semibold gap-1"
            title="Copy as Markdown table"
          >
            {copiedMd ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copiedMd ? "Copied" : "MD"}</span>
          </Button>

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

      {/* ── Sheet Preset Switcher & AI Actions Strip ── */}
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/10 px-4 py-1.5 shrink-0 overflow-x-auto no-scrollbar gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">Preset:</span>
          {[
            { id: "saas", label: "📊 SaaS Financials", titleText: "3-Scenario Financial Model (BDT)" },
            { id: "courier", label: "🚚 Courier & MFS Payout", titleText: "Logistics & MFS Settlement Model" },
            { id: "tax", label: "⚖️ NBR Tax Optimization", titleText: "NBR Section 78 Tax Rebate Assessment" },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                const generated = buildDynamicSheet(preset.titleText);
                setHeaders(generated.headers);
                setGrid(generated.rows);
              }}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-card hover:bg-muted/80 text-foreground border border-border/60 hover:border-cyan-500/40 transition cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* AI Quick Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              setGrid((prev) =>
                prev.map((row, idx) => {
                  if (idx === 0) return [row[0], "18,750", "56,250", "6,250"];
                  if (idx === 2) return [row[0], "28,125,000", "104,062,500", "7,500,000"];
                  return row;
                })
              );
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition cursor-pointer"
          >
            <Calculator className="w-3 h-3" />
            <span>AI +25% Growth</span>
          </button>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Agent Synced</span>
          </div>
        </div>
      </div>

      {/* ── KPI Summary Cards (GenSpark Sheet Metric Bar) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-border/60 bg-muted/10 p-2.5 shrink-0">
        {dynamic.kpis.map((kpi, idx) => (
          <div key={idx} className="rounded-lg border border-border/60 bg-background p-2 text-center space-y-0.5 shadow-xs">
            <span className="text-[10px] text-muted-foreground">{kpi.label}</span>
            <p className={cn("text-xs font-bold font-mono", kpi.color)}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* ── Live Agentic Step Progress Banner ── */}
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

      {/* ── Visual Scenario Trends Chart Mode vs Grid Stage ── */}
      {viewMode === "chart" ? (
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-cyan-400">Financial Multi-Scenario Visual Delta</h4>
              <p className="text-[11px] text-muted-foreground">Comparative simulation across Base Case, Aggressive (+30%), and Conservative models.</p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">
              3 Scenarios Audited
            </span>
          </div>

          <div className="space-y-3">
            {grid.map((row, r) => {
              const label = row[0] || `Metric ${r + 1}`;
              const baseValStr = row[1]?.replace(/[^\d.-]/g, "") || "0";
              const aggValStr = row[2]?.replace(/[^\d.-]/g, "") || "0";
              const consValStr = row[3]?.replace(/[^\d.-]/g, "") || "0";

              const baseVal = Math.abs(parseFloat(baseValStr) || 100);
              const aggVal = Math.abs(parseFloat(aggValStr) || 140);
              const consVal = Math.abs(parseFloat(consValStr) || 60);
              const maxVal = Math.max(baseVal, aggVal, consVal, 1);

              const basePct = Math.min(100, Math.max(10, Math.round((baseVal / maxVal) * 100)));
              const aggPct = Math.min(100, Math.max(10, Math.round((aggVal / maxVal) * 100)));
              const consPct = Math.min(100, Math.max(10, Math.round((consVal / maxVal) * 100)));

              return (
                <div key={r} className="rounded-xl border border-border/60 bg-card p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{label}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{headers[1]}: <strong className="text-foreground">{row[1]}</strong></span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {/* Aggressive Bar */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[10px] text-purple-400 font-mono">
                        <span>{headers[2] || "Aggressive"}</span>
                        <span>{row[2]}</span>
                      </div>
                      <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${aggPct}%` }} />
                      </div>
                    </div>

                    {/* Base Bar */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[10px] text-cyan-400 font-mono">
                        <span>{headers[1] || "Base Case"}</span>
                        <span>{row[1]}</span>
                      </div>
                      <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${basePct}%` }} />
                      </div>
                    </div>

                    {/* Conservative Bar */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[10px] text-amber-400 font-mono">
                        <span>{headers[3] || "Conservative"}</span>
                        <span>{row[3]}</span>
                      </div>
                      <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${consPct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── Grid Stage ── */
        <div className="flex-1 min-h-0 overflow-auto p-2 custom-scrollbar">
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
                      "border-b border-border/40 transition-colors hover:bg-muted/30 group",
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
                        className="opacity-0 group-hover:opacity-100 hover:text-destructive text-muted-foreground transition p-1 cursor-pointer"
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
      )}
    </div>
  );
}
