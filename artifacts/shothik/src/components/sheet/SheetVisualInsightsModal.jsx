import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { analyzeAndRecommendCharts } from "./chartRecommender";
import { computePivotTable } from "./pivotAggregator";
import { BarChart3, PieChart as PieIcon, TableProperties, Sparkles, TrendingUp } from "lucide-react";

const COLORS = ["#059669", "#F59E0B", "#3B82F6", "#EC4899", "#8B5CF6", "#10B981"];

export default function SheetVisualInsightsModal({ open, onClose, data = [], headers = [] }) {
  const [activeTab, setActiveTab] = useState("charts");
  const [selectedChartType, setSelectedChartType] = useState("bar");
  
  // Pivot state
  const [pivotRowField, setPivotRowField] = useState(headers[0] || "");
  const [pivotColField, setPivotColField] = useState(headers[1] || "");
  const [pivotValField, setPivotValField] = useState(headers[2] || headers[1] || headers[0] || "");
  const [pivotAggFunc, setPivotAggFunc] = useState("SUM");

  const recommendations = useMemo(() => {
    return analyzeAndRecommendCharts(headers, data);
  }, [headers, data]);

  const pivotResult = useMemo(() => {
    if (!pivotRowField || !pivotValField) return null;
    return computePivotTable(data, {
      rowField: pivotRowField,
      colField: pivotColField === pivotRowField ? undefined : pivotColField,
      valField: pivotValField,
      aggFunc: pivotAggFunc,
    });
  }, [data, pivotRowField, pivotColField, pivotValField, pivotAggFunc]);

  // Format chart data
  const chartData = useMemo(() => {
    if (!data || data.length === 0 || !headers || headers.length < 2) return [];
    const labelKey = headers[0];
    const valKey = headers[1];
    return data.slice(0, 15).map((row) => ({
      name: String(row[labelKey] ?? "N/A"),
      value: typeof row[valKey] === "number" ? row[valKey] : parseFloat(String(row[valKey] || "0")) || 0,
    }));
  }, [data, headers]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-card text-card-foreground border-border">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Sheet Intelligence & Visual Insights</DialogTitle>
              <DialogDescription>
                AI-driven chart recommendations and multi-dimensional pivot summaries
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid grid-cols-2 w-full max-w-xs mb-4">
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Smart Charts
            </TabsTrigger>
            <TabsTrigger value="pivot" className="flex items-center gap-2">
              <TableProperties className="w-4 h-4" />
              Pivot Table
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SMART CHARTS */}
          <TabsContent value="charts" className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/40 rounded-xl border border-border">
              <span className="text-xs font-semibold text-muted-foreground mr-2">Recommended Formats:</span>
              {recommendations.map((rec) => (
                <Button
                  key={rec.kind}
                  variant={selectedChartType === rec.kind ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedChartType(rec.kind)}
                  className="rounded-lg text-xs flex items-center gap-1.5"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  {rec.label}
                </Button>
              ))}
            </div>

            <div className="h-[320px] w-full p-4 bg-muted/20 rounded-2xl border border-border flex items-center justify-center">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {selectedChartType === "line" ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                      <YAxis stroke="#888888" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  ) : selectedChartType === "area" ? (
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                      <YAxis stroke="#888888" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="value" stroke="#059669" fill="#059669" fillOpacity={0.2} />
                    </AreaChart>
                  ) : selectedChartType === "pie" ? (
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  ) : (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                      <YAxis stroke="#888888" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#059669" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-sm">Insufficient numeric columns for chart preview.</p>
              )}
            </div>
          </TabsContent>

          {/* TAB 2: PIVOT TABLE */}
          <TabsContent value="pivot" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-muted/40 rounded-xl border border-border">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Row Field</label>
                <select
                  value={pivotRowField}
                  onChange={(e) => setPivotRowField(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg text-xs p-2"
                >
                  {headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Column Field (Optional)</label>
                <select
                  value={pivotColField}
                  onChange={(e) => setPivotColField(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg text-xs p-2"
                >
                  <option value="">None (1D Summary)</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Values Field</label>
                <select
                  value={pivotValField}
                  onChange={(e) => setPivotValField(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg text-xs p-2"
                >
                  {headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Aggregation</label>
                <select
                  value={pivotAggFunc}
                  onChange={(e) => setPivotAggFunc(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg text-xs p-2 font-mono"
                >
                  <option value="SUM">SUM</option>
                  <option value="COUNT">COUNT</option>
                  <option value="AVERAGE">AVERAGE</option>
                  <option value="MIN">MIN</option>
                  <option value="MAX">MAX</option>
                </select>
              </div>
            </div>

            {pivotResult && (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/80 text-foreground font-semibold">
                    <tr>
                      <th className="p-2.5 border-b border-border">{pivotRowField || "Category"}</th>
                      {pivotResult.colKeys.map((c) => (
                        <th key={c} className="p-2.5 border-b border-border text-right">{c}</th>
                      ))}
                      <th className="p-2.5 border-b border-border text-right bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pivotResult.rowKeys.map((rKey, rIdx) => (
                      <tr key={rKey} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="p-2.5 font-medium">{rKey}</td>
                        {pivotResult.matrix[rIdx]?.map((val, cIdx) => (
                          <td key={cIdx} className="p-2.5 text-right font-mono">
                            {val !== null ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-"}
                          </td>
                        ))}
                        <td className="p-2.5 text-right font-bold font-mono bg-emerald-500/5">
                          {pivotResult.rowTotals[rIdx] !== null ? pivotResult.rowTotals[rIdx].toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-"}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-muted/60 font-bold">
                      <td className="p-2.5">Grand Total</td>
                      {pivotResult.colTotals.map((cTot, idx) => (
                        <td key={idx} className="p-2.5 text-right font-mono">
                          {cTot !== null ? cTot.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-"}
                        </td>
                      ))}
                      <td className="p-2.5 text-right font-mono bg-emerald-500/10 text-emerald-600">
                        {pivotResult.grandTotal !== null ? pivotResult.grandTotal.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
