"use client";

import { useState } from "react";
import {
  FileText,
  Calculator,
  Printer,
  ShieldCheck,
  Building2,
  QrCode,
  CheckCircle2,
  Download,
  Receipt,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Coins,
  Calendar,
  Hash,
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
import { Input } from "@/components/ui/input";

export interface MushakTaxStudioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface TaxLineItem {
  id: string;
  itemDescription: string;
  quantity: number;
  unit: "pcs" | "service" | "copies" | "hours" | "reams";
  unitPriceBdt: number;
  vatRatePercent: number; // 0, 5, 7.5, 10, 15
  supplementaryDutyRatePercent?: number;
  tdsCategory: "none" | "it_software_2pct" | "printing_publishing_3pct" | "goods_supply_5pct" | "professional_service_10pct";
}

export interface MockMushakInvoice {
  invoiceId: string;
  serialNumber: string;
  issueDate: string;
  buyerName: string;
  buyerCompany: string;
  buyerBin: string;
  grossTotalBdt: number;
  vatAmountBdt: number;
  tdsWithheldBdt: number;
  netPayableBdt: number;
  status: "issued" | "settled" | "flagged";
  qrVerificationToken: string;
}

const SAMPLE_INVOICES: MockMushakInvoice[] = [
  {
    invoiceId: "inv_m63_01",
    serialNumber: "M63-202609-00101",
    issueDate: "2026-09-18",
    buyerName: "Tanvir Hossain",
    buyerCompany: "Dhaka Creative Agency",
    buyerBin: "003849102-0201",
    grossTotalBdt: 28750,
    vatAmountBdt: 3750,
    tdsWithheldBdt: 500,
    netPayableBdt: 28250,
    status: "flagged",
    qrVerificationToken: "e7f8a91b2c3d4e5f6a7b8c9d0e1f2a3b"
  },
  {
    invoiceId: "inv_m63_02",
    serialNumber: "M63-202609-00102",
    issueDate: "2026-09-17",
    buyerName: "Farhana Yasmin",
    buyerCompany: "Bengal Crafts Co.",
    buyerBin: "001849204-0102",
    grossTotalBdt: 9200,
    vatAmountBdt: 1200,
    tdsWithheldBdt: 160,
    netPayableBdt: 9040,
    status: "settled",
    qrVerificationToken: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d"
  },
  {
    invoiceId: "inv_m63_03",
    serialNumber: "M63-202609-00103",
    issueDate: "2026-09-16",
    buyerName: "Zubair Rahman",
    buyerCompany: "Sylhet Tech Hub",
    buyerBin: "009182736-0501",
    grossTotalBdt: 6900,
    vatAmountBdt: 900,
    tdsWithheldBdt: 0,
    netPayableBdt: 6900,
    status: "issued",
    qrVerificationToken: "9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c"
  }
];

export function MushakTaxStudioModal({ open, onOpenChange }: MushakTaxStudioModalProps) {
  const [activeTab, setActiveTab] = useState<"generator" | "preview" | "ledger" | "mushak91">("generator");
  const [buyerName, setBuyerName] = useState("Rafiqul Islam");
  const [buyerCompany, setBuyerCompany] = useState("Meghna Digital Solutions");
  const [buyerBin, setBuyerBin] = useState("002948172-0301");
  const [buyerAddress, setBuyerAddress] = useState("Agrabad C/A, Chittagong, Bangladesh");
  const [isWithholdingEntity, setIsWithholdingEntity] = useState(true);
  
  const [lineItems, setLineItems] = useState<TaxLineItem[]>([
    {
      id: "item_1",
      itemDescription: "Shothik Developer Twin Annual Cloud License",
      quantity: 1,
      unit: "service",
      unitPriceBdt: 20000,
      vatRatePercent: 15,
      supplementaryDutyRatePercent: 0,
      tdsCategory: "it_software_2pct"
    },
    {
      id: "item_2",
      itemDescription: "Nilkhet POD Physical Manuscript Imposition & Batch Press",
      quantity: 50,
      unit: "copies",
      unitPriceBdt: 120,
      vatRatePercent: 5,
      supplementaryDutyRatePercent: 0,
      tdsCategory: "printing_publishing_3pct"
    }
  ]);

  const [invoices, setInvoices] = useState<MockMushakInvoice[]>(SAMPLE_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<MockMushakInvoice>(SAMPLE_INVOICES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);

  // BIN validation helper
  const isBinValid = (bin: string) => {
    const clean = bin.replace(/[-\s]/g, "");
    return /^\d{13}$/.test(clean);
  };

  // Calculations
  const calculateTotals = () => {
    let rawTotal = 0;
    let sdTotal = 0;
    let vatTotal = 0;
    let tdsTotal = 0;

    lineItems.forEach((item) => {
      const raw = item.quantity * item.unitPriceBdt;
      const sd = raw * ((item.supplementaryDutyRatePercent || 0) / 100);
      const afterSd = raw + sd;
      const vat = afterSd * (item.vatRatePercent / 100);

      let tdsRate = 0;
      if (isWithholdingEntity) {
        if (item.tdsCategory === "it_software_2pct") tdsRate = 0.02;
        if (item.tdsCategory === "printing_publishing_3pct") tdsRate = 0.03;
        if (item.tdsCategory === "goods_supply_5pct") tdsRate = 0.05;
        if (item.tdsCategory === "professional_service_10pct") tdsRate = 0.10;
      }
      const tds = raw * tdsRate;

      rawTotal += raw;
      sdTotal += sd;
      vatTotal += vat;
      tdsTotal += tds;
    });

    const gross = rawTotal + sdTotal + vatTotal;
    const net = gross - tdsTotal;

    return {
      rawTotal,
      sdTotal,
      vatTotal,
      gross,
      tdsTotal,
      net,
      isSupervisedAutonomyFlagged: gross > 10000
    };
  };

  const totals = calculateTotals();

  const handleAddItem = () => {
    const newItem: TaxLineItem = {
      id: `item_${Date.now()}`,
      itemDescription: "Custom Consulting / Content Generation",
      quantity: 1,
      unit: "service",
      unitPriceBdt: 5000,
      vatRatePercent: 15,
      supplementaryDutyRatePercent: 0,
      tdsCategory: "professional_service_10pct"
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((i) => i.id !== id));
  };

  const handleUpdateItem = (id: string, updates: Partial<TaxLineItem>) => {
    setLineItems(lineItems.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const handleGenerateInvoice = () => {
    const newInv: MockMushakInvoice = {
      invoiceId: `inv_m63_${Date.now()}`,
      serialNumber: `M63-202609-${String(invoices.length + 101).padStart(5, "0")}`,
      issueDate: new Date().toISOString().split("T")[0],
      buyerName,
      buyerCompany,
      buyerBin,
      grossTotalBdt: totals.gross,
      vatAmountBdt: totals.vatTotal,
      tdsWithheldBdt: totals.tdsTotal,
      netPayableBdt: totals.net,
      status: totals.isSupervisedAutonomyFlagged ? "flagged" : "issued",
      qrVerificationToken: "a1b2c3d4e5f67890123456789abcdef0"
    };

    setInvoices([newInv, ...invoices]);
    setSelectedInvoice(newInv);
    setIsGenerated(true);
    setActiveTab("preview");
  };

  const filteredInvoices = invoices.filter((inv) =>
    inv.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.buyerCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.buyerBin.includes(searchQuery)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background/95 backdrop-blur-xl border border-border/80 shadow-2xl">
        <DialogHeader className="p-5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  NBR Mushak-6.3 Statutory VAT & TDS Studio
                  <Badge variant="outline" className="bg-sky-500/10 text-sky-400 border-sky-500/30 text-xs">
                    মূসক-৬.৩
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Automated VAT calculation, 13-digit BIN validation, TDS settlement ledger & Mushak-9.1 return compliance.
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-mono">
                BIN: 001928374-0101
              </Badge>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 mt-4 bg-muted/40 p-1 rounded-xl border border-border/50 text-xs font-medium">
            <button
              onClick={() => setActiveTab("generator")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "generator"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              Invoice Generator
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "preview"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              Statutory Printable View
            </button>
            <button
              onClick={() => setActiveTab("ledger")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "ledger"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              TDS Withholding Ledger ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab("mushak91")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "mushak91"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Mushak-9.1 Return Summary
            </button>
          </div>
        </DialogHeader>

        {/* Tab 1: Invoice Generator */}
        {activeTab === "generator" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Buyer Details */}
            <div className="p-4 rounded-xl bg-card border border-border/60 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sky-400" />
                  Buyer Information & Tax Classification
                </span>
                <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isWithholdingEntity}
                    onChange={(e) => setIsWithholdingEntity(e.target.checked)}
                    className="rounded text-sky-500 focus:ring-sky-400 w-3.5 h-3.5"
                  />
                  <span>Tax Withholding Entity (উৎস কর কর্তনকারী সত্তা)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Buyer Name</label>
                  <Input
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Rafiqul Islam"
                    className="h-8 text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Company / Organization</label>
                  <Input
                    value={buyerCompany}
                    onChange={(e) => setBuyerCompany(e.target.value)}
                    placeholder="e.g. Meghna Digital Solutions"
                    className="h-8 text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>13-Digit BIN</span>
                    {buyerBin && (
                      <span className={`text-[10px] ${isBinValid(buyerBin) ? "text-emerald-400" : "text-amber-400"}`}>
                        {isBinValid(buyerBin) ? "✓ Valid BIN" : "⚠ 13 Digits Required"}
                      </span>
                    )}
                  </label>
                  <Input
                    value={buyerBin}
                    onChange={(e) => setBuyerBin(e.target.value)}
                    placeholder="001234567-0101"
                    type="tel"
                    inputMode="numeric"
                    aria-label="13-Digit BIN"
                    className={`h-8 text-xs font-mono mt-1 ${
                      buyerBin && !isBinValid(buyerBin) ? "border-amber-500/60" : ""
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Destination / Business Address</label>
                <Input
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  placeholder="Street, City, Bangladesh"
                  className="h-8 text-xs mt-1"
                />
              </div>
            </div>

            {/* Line Items Table */}
            <div className="p-4 rounded-xl bg-card border border-border/60 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-indigo-400" />
                  Itemized Services / Commodities (পণ্য ও সেবার বিবরণ)
                </span>
                <Button size="sm" variant="outline" onClick={handleAddItem} className="h-7 text-xs gap-1.5 border-dashed">
                  <Plus className="w-3 h-3" /> Add Item
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground">
                      <th className="py-2 px-1">Description</th>
                      <th className="py-2 px-1 w-16">Qty</th>
                      <th className="py-2 px-1 w-20">Unit</th>
                      <th className="py-2 px-1 w-24">Unit Price (৳)</th>
                      <th className="py-2 px-1 w-24">VAT Rate</th>
                      <th className="py-2 px-1 w-32">TDS Category</th>
                      <th className="py-2 px-1 w-24 text-right">Total (৳)</th>
                      <th className="py-2 px-1 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {lineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/10">
                        <td className="py-2 px-1">
                          <Input
                            value={item.itemDescription}
                            aria-label="Item description"
                            onChange={(e) => handleUpdateItem(item.id, { itemDescription: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </td>
                        <td className="py-2 px-1">
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            aria-label="Quantity"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, { quantity: Math.max(1, Number(e.target.value)) })}
                            className="h-7 text-xs"
                          />
                        </td>
                        <td className="py-2 px-1">
                          <select
                            value={item.unit}
                            aria-label="Unit"
                            onChange={(e) => handleUpdateItem(item.id, { unit: e.target.value as any })}
                            className="h-7 text-xs bg-background border border-input rounded px-1.5 w-full"
                          >
                            <option value="service">service</option>
                            <option value="copies">copies</option>
                            <option value="pcs">pcs</option>
                            <option value="hours">hours</option>
                            <option value="reams">reams</option>
                          </select>
                        </td>
                        <td className="py-2 px-1">
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            aria-label="Unit Price in BDT"
                            value={item.unitPriceBdt}
                            onChange={(e) => handleUpdateItem(item.id, { unitPriceBdt: Math.max(0, Number(e.target.value)) })}
                            className="h-7 text-xs font-mono"
                          />
                        </td>
                        <td className="py-2 px-1">
                          <select
                            value={item.vatRatePercent}
                            aria-label="VAT Rate"
                            onChange={(e) => handleUpdateItem(item.id, { vatRatePercent: Number(e.target.value) })}
                            className="h-7 text-xs bg-background border border-input rounded px-1.5 w-full"
                          >
                            <option value={15}>15% (Standard)</option>
                            <option value={10}>10% (Reduced)</option>
                            <option value={7.5}>7.5% (Printing)</option>
                            <option value={5}>5% (Books/Raw)</option>
                            <option value={0}>0% (Exempt)</option>
                          </select>
                        </td>
                        <td className="py-2 px-1">
                          <select
                            value={item.tdsCategory}
                            aria-label="TDS Category"
                            onChange={(e) => handleUpdateItem(item.id, { tdsCategory: e.target.value as any })}
                            className="h-7 text-xs bg-background border border-input rounded px-1.5 w-full"
                          >
                            <option value="none">No TDS (0%)</option>
                            <option value="it_software_2pct">IT/Software (2%)</option>
                            <option value="printing_publishing_3pct">Printing/POD (3%)</option>
                            <option value="goods_supply_5pct">Supplies (5%)</option>
                            <option value="professional_service_10pct">Prof. Services (10%)</option>
                          </select>
                        </td>
                        <td className="py-2 px-1 text-right font-mono font-semibold">
                          ৳{((item.quantity * item.unitPriceBdt) * (1 + item.vatRatePercent / 100)).toFixed(2)}
                        </td>
                        <td className="py-2 px-1 text-center">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            aria-label="Remove item"
                            className="min-w-[36px] min-h-[36px] inline-flex items-center justify-center text-muted-foreground hover:text-rose-400 p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations Summary Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-card to-muted/20 border border-border/80 shadow-md">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-2.5 rounded-lg bg-background/50 border border-border/40">
                  <div className="text-[11px] text-muted-foreground">Raw Base Price</div>
                  <div className="text-base font-bold font-mono text-foreground mt-0.5">
                    ৳{totals.rawTotal.toFixed(2)}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                  <div className="text-[11px] text-sky-400">Total VAT (মূসক)</div>
                  <div className="text-base font-bold font-mono text-sky-400 mt-0.5">
                    +৳{totals.vatTotal.toFixed(2)}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <div className="text-[11px] text-rose-400">TDS Withheld (উৎস কর)</div>
                  <div className="text-base font-bold font-mono text-rose-400 mt-0.5">
                    -৳{totals.tdsTotal.toFixed(2)}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-[11px] text-emerald-400">Net Receivable</div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                    ৳{totals.net.toFixed(2)}
                  </div>
                </div>
              </div>

              {totals.isSupervisedAutonomyFlagged && (
                <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Supervised Autonomy Threshold:</strong> Gross invoice value (৳{totals.gross.toFixed(2)}) exceeds ৳10,000. Digital signature will record founder authorization log.
                  </span>
                </div>
              )}

              <div className="mt-4 flex items-center justify-end gap-3">
                <Button
                  onClick={handleGenerateInvoice}
                  className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs gap-2 shadow-md shadow-sky-500/20"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Issue NBR Mushak-6.3 Invoice (চালানপত্র তৈরি করুন)
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Statutory Printable View */}
        {activeTab === "preview" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-sky-500/10 text-sky-400 border-sky-500/30">
                  {selectedInvoice.serialNumber}
                </Badge>
                <span className="text-xs text-muted-foreground">Issued: {selectedInvoice.issueDate}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
                className="h-8 text-xs gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Export PDF
              </Button>
            </div>

            {/* Official NBR Mushak-6.3 Document Canvas */}
            <div className="p-6 rounded-xl bg-white text-slate-900 border border-slate-300 shadow-lg font-sans text-xs space-y-4">
              {/* Document Header */}
              <div className="text-center border-b border-slate-200 pb-3">
                <div className="text-[11px] font-bold text-slate-700">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার, জাতীয় রাজস্ব বোর্ড</div>
                <div className="text-base font-extrabold text-slate-900 my-1">কর চালানপত্র (TAX INVOICE)</div>
                <div className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-[10px]">
                  [বিধি ৪০ এর উপ-বিধি (১) এর দফা (গ) ও দফা (চ) দ্রষ্টব্য] — মূসক-৬.৩
                </div>
              </div>

              {/* Seller & Buyer Header Matrix */}
              <div className="grid grid-cols-2 gap-4 pb-2 border-b border-dashed border-slate-300">
                <div>
                  <div className="font-bold text-slate-800">বিক্রেতার বিবরণ:</div>
                  <div><strong>নিবন্ধিত নাম:</strong> Shothik Technologies Limited</div>
                  <div><strong>বাণিজ্যিক নাম:</strong> ShothikGPT AgenticOS</div>
                  <div><strong>বিআইএন (BIN):</strong> <span className="font-mono font-bold text-sky-700">001928374-0101</span></div>
                  <div><strong>ঠিকানা:</strong> House 42, Road 11, Banani, Dhaka-1213</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800">চালানের বিবরণ:</div>
                  <div><strong>চালান নম্বর:</strong> <span className="font-mono font-bold">{selectedInvoice.serialNumber}</span></div>
                  <div><strong>ইস্যুর তারিখ:</strong> {selectedInvoice.issueDate}</div>
                  <div><strong>গন্তব্যস্থল:</strong> {buyerAddress}</div>
                </div>
              </div>

              <div className="pb-2 border-b border-dashed border-slate-300">
                <div className="font-bold text-slate-800">ক্রেতার বিবরণ:</div>
                <div><strong>নাম ও প্রতিষ্ঠান:</strong> {selectedInvoice.buyerName} ({selectedInvoice.buyerCompany})</div>
                <div><strong>ক্রেতার বিআইএন (BIN):</strong> <span className="font-mono">{selectedInvoice.buyerBin || "প্রযোজ্য নহে (Unregistered)"}</span></div>
              </div>

              {/* Table */}
              <table className="w-full border-collapse border border-slate-400 text-center text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="border border-slate-400 p-1.5">ক্রমিক</th>
                    <th className="border border-slate-400 p-1.5 text-left">পণ্য বা সেবার বিবরণ</th>
                    <th className="border border-slate-400 p-1.5">পরিমাণ</th>
                    <th className="border border-slate-400 p-1.5 text-right">একক মূল্য</th>
                    <th className="border border-slate-400 p-1.5 text-right">মোট মূল্য</th>
                    <th className="border border-slate-400 p-1.5">মূসক হার</th>
                    <th className="border border-slate-400 p-1.5 text-right">মূসক</th>
                    <th className="border border-slate-400 p-1.5 text-right">সর্বমোট মূল্য</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => {
                    const raw = item.quantity * item.unitPriceBdt;
                    const vat = raw * (item.vatRatePercent / 100);
                    const gross = raw + vat;
                    return (
                      <tr key={item.id} className="text-slate-700">
                        <td className="border border-slate-400 p-1.5">{idx + 1}</td>
                        <td className="border border-slate-400 p-1.5 text-left font-medium">{item.itemDescription}</td>
                        <td className="border border-slate-400 p-1.5">{item.quantity} {item.unit}</td>
                        <td className="border border-slate-400 p-1.5 text-right">৳{item.unitPriceBdt.toFixed(2)}</td>
                        <td className="border border-slate-400 p-1.5 text-right">৳{raw.toFixed(2)}</td>
                        <td className="border border-slate-400 p-1.5">{item.vatRatePercent}%</td>
                        <td className="border border-slate-400 p-1.5 text-right">৳{vat.toFixed(2)}</td>
                        <td className="border border-slate-400 p-1.5 text-right font-bold">৳{gross.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Total Box */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1 text-right">
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-600">মোট মূল্য (Raw Price):</span>
                    <span className="font-mono font-semibold">৳{totals.rawTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1 text-sky-700">
                    <span>মোট মূসক (VAT):</span>
                    <span className="font-mono font-bold">+৳{totals.vatTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b-2 border-slate-900 pb-1 text-sm font-bold">
                    <span>সর্বমোট প্রদেয়:</span>
                    <span className="font-mono">৳{totals.gross.toFixed(2)}</span>
                  </div>
                  {totals.tdsTotal > 0 && (
                    <>
                      <div className="flex justify-between text-rose-600 pt-1">
                        <span>উৎস কর কর্তন (TDS):</span>
                        <span className="font-mono">-৳{totals.tdsTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-900 pt-1 font-bold text-emerald-700 text-sm">
                        <span>প্রকৃত প্রাপ্য (Net):</span>
                        <span className="font-mono">৳{totals.net.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Legal Declaration & Digital Signatures */}
              <div className="border-t border-slate-300 pt-4 flex items-center justify-between text-[10px] text-slate-500">
                <div>
                  <div><strong>ডিজিটাল স্বাক্ষর:</strong> Shothik Cryptographic Key Attested</div>
                  <div><strong>QR Verification Hash:</strong> {selectedInvoice.qrVerificationToken}</div>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded bg-slate-100 border border-slate-200">
                  <QrCode className="w-8 h-8 text-slate-800" />
                  <div className="text-[9px] text-slate-600 text-left">
                    <div>NBR e-VAT</div>
                    <div>Verified Seal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: TDS Withholding Ledger */}
        {activeTab === "ledger" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-72">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by BIN, Serial, or Buyer..."
                  className="h-8 pl-8 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Total Issued: <strong>{invoices.length}</strong></span>
              </div>
            </div>

            <div className="border border-border/60 rounded-xl overflow-hidden bg-card shadow-sm">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/60 text-muted-foreground">
                    <th className="py-2.5 px-3">Serial Number</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Buyer & BIN</th>
                    <th className="py-2.5 px-3 text-right">Gross (৳)</th>
                    <th className="py-2.5 px-3 text-right">VAT (৳)</th>
                    <th className="py-2.5 px-3 text-right">TDS (৳)</th>
                    <th className="py-2.5 px-3 text-right">Net (৳)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredInvoices.map((inv) => (
                    <tr
                      key={inv.invoiceId}
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setActiveTab("preview");
                      }}
                      className="hover:bg-muted/20 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-400">
                        {inv.serialNumber}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">{inv.issueDate}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-foreground">{inv.buyerName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{inv.buyerBin || "Unregistered"}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">
                        ৳{inv.grossTotalBdt.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-sky-400">
                        ৳{inv.vatAmountBdt.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                        -৳{inv.tdsWithheldBdt.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        ৳{inv.netPayableBdt.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge
                          variant="outline"
                          className={
                            inv.status === "settled"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : inv.status === "flagged"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-sky-500/10 text-sky-400 border-sky-500/30"
                          }
                        >
                          {inv.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Mushak-9.1 Return Summary */}
        {activeTab === "mushak91" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div className="p-4 rounded-xl bg-card border border-border/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-sky-400" />
                    Mushak-9.1 Monthly Value Added Tax Return
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Fiscal Period: <strong>September 2026</strong> | Filing Deadline: <strong>October 15, 2026</strong>
                  </p>
                </div>

                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-xs">
                  Treasury Code: 1-1133-0006-0311
                </Badge>
              </div>

              {/* Aggregates Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/40">
                  <span className="text-xs text-muted-foreground">Total Output Tax (Sub-Form A)</span>
                  <div className="text-lg font-bold font-mono text-sky-400 mt-1">
                    ৳{invoices.reduce((acc, i) => acc + i.vatAmountBdt, 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-muted-foreground">From {invoices.length} issued Mushak-6.3 invoices</span>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/40">
                  <span className="text-xs text-muted-foreground">Input Tax Credit (Sub-Form B)</span>
                  <div className="text-lg font-bold font-mono text-indigo-400 mt-1">
                    ৳{(invoices.reduce((acc, i) => acc + i.vatAmountBdt, 0) * 0.4).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Estimated 40% offset on cloud/print raw materials</span>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/40">
                  <span className="text-xs text-muted-foreground">TDS Withheld by Buyers</span>
                  <div className="text-lg font-bold font-mono text-rose-400 mt-1">
                    ৳{invoices.reduce((acc, i) => acc + i.tdsWithheldBdt, 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Claimable as credit with certificates</span>
                </div>
              </div>

              {/* Net Treasury Calculation */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/20 to-sky-950/20 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-emerald-300">Net VAT Payable to Government Treasury (ট্রেজারি চালান)</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Payable via Bangladesh Bank e-Challan / A-Challan</div>
                </div>
                <div className="text-xl font-extrabold font-mono text-emerald-400">
                  ৳{(
                    invoices.reduce((acc, i) => acc + i.vatAmountBdt, 0) -
                    (invoices.reduce((acc, i) => acc + i.vatAmountBdt, 0) * 0.4) -
                    invoices.reduce((acc, i) => acc + i.tdsWithheldBdt, 0)
                  ).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
