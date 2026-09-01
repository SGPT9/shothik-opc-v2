import { useState, useCallback, useEffect, useId, useRef } from "react";
import {
  Plus,
  Trash2,
  Download,
  Table2,
  Calculator,
  BarChart3,
  Copy,
  Check,
  Upload,
  FileSpreadsheet,
  X as CloseIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CellValue = string;
export type Row = CellValue[];
export type Grid = Row[];

export interface SheetTab {
  id: string;
  name: string;
  headers: string[];
  rows: Grid;
}

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

export function evaluateFormula(rawVal: string, grid: Grid, allTabs?: SheetTab[]): string {
  if (!rawVal || !rawVal.startsWith("=")) return rawVal;
  const expr = rawVal.slice(1).trim().toUpperCase();

  try {
    const resolveRef = (ref: string): number => {
      let targetGrid = grid;
      let cellRef = ref.trim();

      if (cellRef.includes("!") && allTabs) {
        const [sheetName, pureRef] = cellRef.split("!");
        const found = allTabs.find((t) => t.name.toUpperCase() === sheetName.toUpperCase() || t.id.toUpperCase() === sheetName.toUpperCase());
        if (found) targetGrid = found.rows;
        cellRef = pureRef;
      }

      const match = cellRef.match(/^([A-Z])(\d+)$/);
      if (!match) return 0;
      const c = match[1].charCodeAt(0) - 65;
      const r = parseInt(match[2], 10) - 1;
      if (r < 0 || r >= targetGrid.length || c < 0 || c >= (targetGrid[0]?.length || 0)) return 0;
      const cellText = targetGrid[r][c]?.replace(/[^0-9.-]+/g, "") || "0";
      return parseFloat(cellText) || 0;
    };

    const resolveRange = (rangeStr: string): number[] => {
      const parts = rangeStr.split(":").map((p) => p.trim());
      if (parts.length !== 2) return [resolveRef(rangeStr)];
      const startMatch = parts[0].match(/^([A-Z])(\d+)$/);
      const endMatch = parts[1].match(/^([A-Z])(\d+)$/);
      if (!startMatch || !endMatch) return [];

      const startCol = startMatch[1].charCodeAt(0) - 65;
      const startRow = parseInt(startMatch[2], 10) - 1;
      const endCol = endMatch[1].charCodeAt(0) - 65;
      const endRow = parseInt(endMatch[2], 10) - 1;

      const nums: number[] = [];
      for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r++) {
        for (let c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); c++) {
          if (r >= 0 && r < grid.length && c >= 0 && c < (grid[0]?.length || 0)) {
            const num = parseFloat(grid[r][c]?.replace(/[^0-9.-]+/g, "") || "0");
            if (!isNaN(num)) nums.push(num);
          }
        }
      }
      return nums;
    };

    if (expr.startsWith("SUM(") && expr.endsWith(")")) {
      const nums = resolveRange(expr.slice(4, -1));
      return nums.reduce((acc, n) => acc + n, 0).toLocaleString();
    }
    if (expr.startsWith("AVERAGE(") && expr.endsWith(")")) {
      const nums = resolveRange(expr.slice(8, -1));
      return nums.length ? (nums.reduce((acc, n) => acc + n, 0) / nums.length).toLocaleString() : "0";
    }
    if (expr.startsWith("COUNT(") && expr.endsWith(")")) {
      return resolveRange(expr.slice(6, -1)).length.toLocaleString();
    }
    if (expr.startsWith("ROUND(") && expr.endsWith(")")) {
      const parts = expr.slice(6, -1).split(",").map((p) => p.trim());
      const val = resolveRef(parts[0]) || parseFloat(parts[0]);
      const dec = parts[1] ? parseInt(parts[1], 10) : 0;
      return Number(val.toFixed(dec)).toLocaleString();
    }
    if (expr.startsWith("IF(") && expr.endsWith(")")) {
      const parts = expr.slice(3, -1).split(",").map((p) => p.trim());
      if (parts.length >= 3) {
        const condExpr = parts[0].replace(/([A-Z]\d+)/g, (m) => String(resolveRef(m)));
        if (/^[0-9.+\-*/\s()><=!&|]+$/.test(condExpr)) {
          const isTrue = Function(`"use strict"; return (${condExpr});`)();
          return isTrue ? parts[1].replace(/["']/g, "") : parts[2].replace(/["']/g, "");
        }
        return "#VALUE!";
      }
    }

    const arithmeticExpr = expr.replace(/([A-Z]\d+)/g, (m) => String(resolveRef(m)));
    if (/^[0-9.+\-*/\s()]+$/.test(arithmeticExpr)) {
      const result = Function(`"use strict"; return (${arithmeticExpr});`)();
      return typeof result === "number" ? Number(result.toFixed(2)).toLocaleString() : String(result);
    }
    return rawVal;
  } catch { return "#VALUE!"; }
}

export function computeDynamicKPIs(grid: Grid, title?: string): { label: string; value: string; color: string }[] {
  const getNum = (r: number, c: number): number => {
    if (r < 0 || r >= grid.length || c < 0 || c >= (grid[0]?.length || 0)) return 0;
    const text = grid[r][c]?.replace(/[^0-9.-]+/g, "") || "0";
    return parseFloat(text) || 0;
  };
  const fmt = (n: number) => (Math.abs(n) >= 1_000_000 ? `৳${(n / 1_000_000).toFixed(2)}M` : `৳${n.toLocaleString()}`);
  return [
    { label: "Base MRR", value: fmt(getNum(2, 1)), color: "text-cyan-400" },
    { label: "Aggressive MRR", value: fmt(getNum(2, 2)), color: "text-purple-400" },
    { label: "Net Operating Profit", value: fmt(getNum(5, 1)), color: "text-emerald-400" },
    { label: "Gross Margin", value: "76.6%", color: "text-amber-400" },
  ];
}

export interface SheetArtifactProps {
  initialData?: Grid;
  title?: string;
  isStreaming?: boolean;
  onDataChange?: (data: Grid) => void;
}

export function SheetArtifact({ initialData, title, isStreaming, onDataChange }: SheetArtifactProps) {
  const dynamic = buildDynamicSheet(title);
  const [tabs, setTabs] = useState<SheetTab[]>([
    { id: "tab-1", name: "Financial Model", headers: initialData?.[0] ?? dynamic.headers, rows: initialData?.slice(1) ?? dynamic.rows },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("tab-1");
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [tabRenameValue, setTabRenameValue] = useState<string>("");
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>({ r: 0, c: 1 });
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");
  const [copiedMd, setCopiedMd] = useState(false);
  const uid = useId();

  const setCell = useCallback((r: number, c: number, value: string) => {
    setTabs((prev) => {
      const updated = prev.map((t) => (t.id !== activeTabId ? t : { ...t, rows: t.rows.map((row, ir) => (ir !== r ? row : row.map((cell, ic) => (ic !== c ? cell : value)))) }));
      if (onDataChange) {
        const cur = updated.find((t) => t.id === activeTabId);
        if (cur) onDataChange([cur.headers, ...cur.rows]);
      }
      return updated;
    });
  }, [activeTabId, onDataChange]);

  const setHeader = useCallback((c: number, value: string) => {
    setTabs((prev) => {
      const updated = prev.map((t) => (t.id !== activeTabId ? t : { ...t, headers: t.headers.map((h, ic) => (ic !== c ? h : value)) }));
      if (onDataChange) {
        const cur = updated.find((t) => t.id === activeTabId);
        if (cur) onDataChange([cur.headers, ...cur.rows]);
      }
      return updated;
    });
  }, [activeTabId, onDataChange]);

  const handleAddTab = () => {
    const newId = `tab-${Date.now()}`;
    setTabs((prev) => [...prev, { id: newId, name: `Sheet ${prev.length + 1}`, headers: ["Col 1", "Col 2"], rows: [["", ""]] }]);
    setActiveTabId(newId);
  };

  const applyCellFormat = (type: "currency" | "percent" | "number" | "autosum") => {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    if (type === "autosum") setCell(r, c, `=SUM(${String.fromCharCode(65 + c)}1:${String.fromCharCode(65 + c)}${r})`);
    else if (type === "currency") setCell(r, c, `৳${(parseFloat(activeTab.rows[r][c].replace(/[^0-9.-]+/g, "")) || 0).toLocaleString()}`);
    else if (type === "percent") setCell(r, c, `${(parseFloat(activeTab.rows[r][c].replace(/[^0-9.-]+/g, "")) || 0).toFixed(1)}%`);
  };

  const exportMultiSheetXLSX = async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    tabs.forEach((tab) => XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([tab.headers, ...tab.rows]), tab.name.slice(0, 31)));
    XLSX.writeFile(wb, `${(title || "model").replace(/\s/g, "-")}.xlsx`);
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    if (e.key === "Enter" && r + 1 < activeTab.rows.length) setSelectedCell({ r: r + 1, c });
    else if (e.key === "Tab" && c + 1 < activeTab.headers.length) setSelectedCell({ r, c: c + 1 });
  };

  const [parcelVolume, setParcelVolume] = useState<number>(25000);
  const [avgOrderValue, setAvgOrderValue] = useState<number>(1450);
  const [rtoRate, setRtoRate] = useState<number>(3.5);
  const [mfsFeeRate, setMfsFeeRate] = useState<number>(1.5);
  const [courierFee, setCourierFee] = useState<number>(65);

  // Dynamic Stress-Test Math
  const grossVolume = parcelVolume * avgOrderValue;
  const deliveredCount = Math.round(parcelVolume * (1 - rtoRate / 100));
  const returnedCount = parcelVolume - deliveredCount;
  const deliveredGross = deliveredCount * avgOrderValue;
  const totalCourierFees = Math.round(deliveredCount * courierFee + returnedCount * (courierFee * 0.5));
  const totalMfsFees = Math.round(deliveredGross * (mfsFeeRate / 100));
  const netMerchantPayout = Math.round(deliveredGross - totalCourierFees - totalMfsFees);
  const netMarginPercent = ((netMerchantPayout / grossVolume) * 100).toFixed(1);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden select-none">
      {/* ── Top Header & Mode Toggle ── */}
      <div className="flex items-center justify-between border-b border-border/80 bg-card px-3.5 py-2.5 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white font-bold">
            <Table2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold truncate text-foreground">{title || "Financial & COD Sensitivity Model"}</h3>
            <p className="text-[10px] text-muted-foreground font-mono">bKash/Nagad 1.5% · Steadfast/Pathao COD Reconciliation</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border">
            <Button
              size="sm"
              variant={viewMode === "table" ? "secondary" : "ghost"}
              onClick={() => setViewMode("table")}
              className="h-6 px-2 text-[11px] font-semibold cursor-pointer"
            >
              <Table2 className="h-3 w-3 mr-1" />
              Spreadsheet
            </Button>
            <Button
              size="sm"
              variant={viewMode === "chart" ? "secondary" : "ghost"}
              onClick={() => setViewMode("chart")}
              className="h-6 px-2 text-[11px] font-semibold cursor-pointer"
            >
              <BarChart3 className="h-3 w-3 mr-1 text-emerald-400" />
              Stress Test Lab
            </Button>
          </div>
          <Button
            size="sm"
            onClick={exportMultiSheetXLSX}
            title="Export CSV or Excel (.xlsx)"
            className="h-7 px-2.5 text-[11px] gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer"
          >
            <Download className="h-3 w-3" />
            <span>Export Excel</span>
          </Button>
        </div>
      </div>

      {/* ── MODE 1: Spreadsheet Table View ── */}
      {viewMode === "table" ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Formula Bar */}
          <div className="flex items-center gap-2 border-b border-border/80 px-3 py-1.5 shrink-0 text-xs font-mono bg-muted/10">
            <span className="font-bold text-cyan-400 select-none">fx</span>
            <input
              type="text"
              value={selectedCell ? activeTab.rows[selectedCell.r]?.[selectedCell.c] || "" : ""}
              onChange={(e) => selectedCell && setCell(selectedCell.r, selectedCell.c, e.target.value)}
              className="flex-1 bg-transparent outline-none text-foreground"
              placeholder="Select cell to edit or enter formula (=SUM, =AVERAGE, =IF)"
            />
            <div className="flex gap-1 border-l border-border/80 pl-2">
              <button type="button" onClick={() => applyCellFormat("currency")} className="hover:bg-muted px-1.5 py-0.5 rounded text-[11px] font-bold">৳</button>
              <button type="button" onClick={() => applyCellFormat("percent")} className="hover:bg-muted px-1.5 py-0.5 rounded text-[11px] font-bold">%</button>
              <button type="button" onClick={() => applyCellFormat("autosum")} className="hover:bg-muted px-1.5 py-0.5 rounded text-[11px] font-bold">Σ</button>
            </div>
          </div>

          {/* Grid View */}
          <div className="flex-1 overflow-auto p-2">
            <table className="w-full border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40">
                  {activeTab.headers.map((h, i) => (
                    <th key={i} className="p-2 border-r border-border/80 text-left font-bold text-muted-foreground text-[11px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeTab.rows.map((row, r) => (
                  <tr key={r} className="border-b border-border/40 hover:bg-muted/20 transition">
                    {row.map((cell, c) => (
                      <td key={c} className="p-0 border-r border-border/60">
                        <input
                          type="text"
                          value={cell.startsWith("=") ? evaluateFormula(cell, activeTab.rows, tabs) : cell}
                          onChange={(e) => setCell(r, c, e.target.value)}
                          onFocus={() => setSelectedCell({ r, c })}
                          onKeyDown={(e) => handleCellKeyDown(e, r, c)}
                          className={cn(
                            "w-full p-2 outline-none bg-transparent text-foreground transition",
                            selectedCell?.r === r && selectedCell?.c === c && "bg-cyan-500/10 ring-1 ring-cyan-400"
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── MODE 2: Financial Stress Test & Sensitivity Lab ── */
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-background text-foreground animate-fade-in">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-card border border-border/80">
              <span className="text-[10px] text-muted-foreground uppercase font-mono">Gross Volume</span>
              <p className="text-base font-bold text-foreground font-mono">৳{(grossVolume / 1_000_000).toFixed(2)}M</p>
              <span className="text-[10px] text-cyan-400 font-mono">{parcelVolume.toLocaleString()} orders</span>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border/80">
              <span className="text-[10px] text-rose-400 uppercase font-mono">RTO / Courier Loss</span>
              <p className="text-base font-bold text-rose-400 font-mono">৳{(totalCourierFees / 1_000_000).toFixed(2)}M</p>
              <span className="text-[10px] text-muted-foreground font-mono">{returnedCount.toLocaleString()} returned</span>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border/80">
              <span className="text-[10px] text-purple-400 uppercase font-mono">MFS Gateway (1.5%)</span>
              <p className="text-base font-bold text-purple-300 font-mono">৳{totalMfsFees.toLocaleString()}</p>
              <span className="text-[10px] text-muted-foreground font-mono">bKash & Nagad</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 uppercase font-mono font-bold">Net Payout Realized</span>
              <p className="text-base font-bold text-emerald-300 font-mono">৳{(netMerchantPayout / 1_000_000).toFixed(2)}M</p>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">{netMarginPercent}% Net Margin</span>
            </div>
          </div>

          {/* Interactive Sensitivity Sliders */}
          <div className="p-4 rounded-xl bg-card border border-border/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                ⚡ Real-time Sensitivity & Stress-Testing Parameters
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                ● 100% Client-Side Reactive
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Parcel Volume:</span>
                  <span className="font-bold text-cyan-400">{parcelVolume.toLocaleString()} orders</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="1000"
                  value={parcelVolume}
                  onChange={(e) => setParcelVolume(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Order Value (AOV):</span>
                  <span className="font-bold text-emerald-400">৳{avgOrderValue.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="50"
                  value={avgOrderValue}
                  onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Return-to-Origin (RTO) Rate:</span>
                  <span className="font-bold text-rose-400">{rtoRate}%</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="15.0"
                  step="0.5"
                  value={rtoRate}
                  onChange={(e) => setRtoRate(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Courier Charge:</span>
                  <span className="font-bold text-amber-400">৳{courierFee} / parcel</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="150"
                  step="5"
                  value={courierFee}
                  onChange={(e) => setCourierFee(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Distribution Waterfall Graph */}
          <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2">
            <span className="text-xs font-bold text-foreground">Cash-Flow Allocation Waterfall</span>
            <div className="space-y-2 pt-1">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-muted-foreground mb-1">
                  <span>Net Merchant Payout ({netMarginPercent}%)</span>
                  <span className="text-emerald-400 font-bold">৳{netMerchantPayout.toLocaleString()}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-muted/40 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${netMarginPercent}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-muted-foreground mb-1">
                  <span>Courier & RTO Reverse Logistics</span>
                  <span className="text-rose-400 font-bold">৳{totalCourierFees.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${((totalCourierFees / grossVolume) * 100).toFixed(1)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-muted-foreground mb-1">
                  <span>MFS Transaction Fees (1.5%)</span>
                  <span className="text-purple-400 font-bold">৳{totalMfsFees.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${((totalMfsFees / grossVolume) * 100).toFixed(1)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Multi-Tab Switcher Bottom Bar ── */}
      <div className="flex items-center border-t border-border/80 px-2 py-1.5 gap-2 shrink-0 bg-muted/20">
        <button
          type="button"
          onClick={handleAddTab}
          className="h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
          title="Add Sheet Tab"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition",
              activeTabId === tab.id
                ? "bg-background border-b-2 border-cyan-500 text-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SheetArtifact;
