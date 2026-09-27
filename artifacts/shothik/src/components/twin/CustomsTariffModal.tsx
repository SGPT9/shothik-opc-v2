import React, { useState, useEffect } from "react";
import {
  Search,
  Calculator,
  ShieldCheck,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  Printer,
  Globe,
  Truck,
  Percent,
} from "lucide-react";

export interface CustomsTariffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomsTariffModal: React.FC<CustomsTariffModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"classifier" | "calculator" | "invoice">("classifier");
  const [searchQuery, setSearchQuery] = useState("smartphone");
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);

  // Calculator state
  const [assessableValueBdt, setAssessableValueBdt] = useState<number>(100000);
  const [taxBreakdown, setTaxBreakdown] = useState<any | null>(null);

  // Invoice state
  const [exporterName, setExporterName] = useState("Shenzhen Tech Sourcing Ltd");
  const [importerName, setImporterName] = useState("Dhaka Digital OPC Ltd");
  const [importerBin, setImporterBin] = useState("001234567-0101");
  const [quantity, setQuantity] = useState<number>(50);
  const [unitPriceUsd, setUnitPriceUsd] = useState<number>(18);
  const [generatedInvoice, setGeneratedInvoice] = useState<any | null>(null);

  // Keyboard shortcut ⌘N / Ctrl+N
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      handleSearch("smartphone");
    }
  }, [isOpen]);

  const handleSearch = async (q = searchQuery) => {
    try {
      const res = await fetch(`/api/customs/classify?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches);
        setSelectedEntry(data.matches[0]);
        calculateTax(assessableValueBdt, data.matches[0].hsCode);
      }
    } catch {
      // Fallback
    }
  };

  const calculateTax = async (av = assessableValueBdt, hsCode = selectedEntry?.hsCode) => {
    if (!hsCode) return;
    try {
      const res = await fetch("/api/customs/calculate-tax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessableValueBdt: av, hsCode }),
      });
      const data = await res.json();
      if (data.breakdown) {
        setTaxBreakdown(data.breakdown);
      }
    } catch {
      // Fallback
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedEntry) return;
    try {
      const res = await fetch("/api/customs/generate-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exporter: { name: exporterName, address: "Huaqiangbei, Shenzhen", country: "China" },
          importer: { name: importerName, binNumber: importerBin, tinNumber: "192837465012", address: "Motijheel, Dhaka" },
          portOfEntry: "Chittagong Port",
          items: [
            {
              itemDescription: selectedEntry.description,
              hsCode: selectedEntry.hsCode,
              quantity,
              unit: "PCS",
              unitPriceUsd,
              totalPriceUsd: quantity * unitPriceUsd,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.invoice) {
        setGeneratedInvoice(data.invoice);
      }
    } catch {
      // Fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="flex flex-col w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-600 text-white shadow-lg">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-slate-100">NBR Customs Tariff & HS Code Engine</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Customs Act 2023
                </span>
              </div>
              <p className="text-xs text-slate-400">
                8-Digit HS Classification · Total Tax Incidence (TTI) · ASYCUDA CIPL
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab("classifier")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "classifier" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Search className="w-3.5 h-3.5" /> HS Classifier
            </button>
            <button
              onClick={() => setActiveTab("calculator")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "calculator" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" /> TTI Calculator
            </button>
            <button
              onClick={() => setActiveTab("invoice")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "invoice" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> CIPL Generator
            </button>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: HS CLASSIFIER */}
          {activeTab === "classifier" && (
            <div className="space-y-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search product name, category, or Bangla description (e.g. 'smartphones', 'টি-শার্ট', 'cosmetics')..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch(searchQuery);
                    }}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-950 rounded-xl border border-slate-700 text-slate-100"
                  />
                </div>
                <button
                  onClick={() => handleSearch(searchQuery)}
                  className="px-5 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow transition"
                >
                  Classify HS Code
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((m) => (
                  <div
                    key={m.hsCode}
                    onClick={() => {
                      setSelectedEntry(m);
                      calculateTax(assessableValueBdt, m.hsCode);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      selectedEntry?.hsCode === m.hsCode
                        ? "bg-sky-950/40 border-sky-500 shadow-lg ring-1 ring-sky-500/50"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-sky-400 font-mono">{m.hsCode}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {m.category}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400">
                        {Math.round(m.confidence * 100)}% Match
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-100 mt-2">{m.description}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{m.banglaDescription}</p>

                    {/* Duty Rate Matrix */}
                    <div className="grid grid-cols-6 gap-1 my-3 text-center text-[10px] font-mono bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                      <div><div className="text-slate-500">CD</div><div className="text-slate-200 font-bold">{m.cd}%</div></div>
                      <div><div className="text-slate-500">RD</div><div className="text-slate-200 font-bold">{m.rd}%</div></div>
                      <div><div className="text-slate-500">SD</div><div className="text-amber-400 font-bold">{m.sd}%</div></div>
                      <div><div className="text-slate-500">VAT</div><div className="text-slate-200 font-bold">{m.vat}%</div></div>
                      <div><div className="text-slate-500">AIT</div><div className="text-slate-200 font-bold">{m.ait}%</div></div>
                      <div><div className="text-slate-500">AT</div><div className="text-slate-200 font-bold">{m.at}%</div></div>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-400">
                      {m.mandatoryCertificates?.map((cert: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                          <ShieldCheck className="w-3 h-3 text-sky-400 shrink-0" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TTI CALCULATOR */}
          {activeTab === "calculator" && (
            <div className="grid grid-cols-2 gap-6">
              {/* Inputs */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-sky-400" /> Assessment Value Parameter
                </h4>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Selected HS Code</label>
                  <input
                    type="text"
                    disabled
                    value={`${selectedEntry?.hsCode || "8517.13.00"} - ${selectedEntry?.description || "Smartphones"}`}
                    className="w-full px-3 py-2 text-xs bg-slate-900 rounded-lg border border-slate-700 text-sky-300 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Assessable Value (AV in BDT)</label>
                  <input
                    type="number"
                    value={assessableValueBdt}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setAssessableValueBdt(val);
                      calculateTax(val, selectedEntry?.hsCode);
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-900 rounded-lg border border-slate-700 text-slate-100 font-mono font-bold"
                  />
                </div>

                <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-xs text-sky-200 space-y-1">
                  <p className="font-semibold">Statutory Compounding Formula:</p>
                  <p className="text-[11px] text-slate-300 font-mono">
                    SD Basis = AV + CD + RD
                    <br />
                    VAT Basis = AV + CD + RD + SD
                  </p>
                </div>
              </div>

              {/* Duty Calculation Output */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-100 pb-3 border-b border-slate-800 flex items-center justify-between">
                    <span>Tax Incidence Breakdown</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      TTI: {taxBreakdown?.totalTaxIncidencePercent || 0}%
                    </span>
                  </h4>

                  <div className="my-4 space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Customs Duty (CD):</span>
                      <span className="text-slate-200 font-bold">৳{taxBreakdown?.cdAmount?.toLocaleString()} BDT</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Regulatory Duty (RD):</span>
                      <span className="text-slate-200">৳{taxBreakdown?.rdAmount?.toLocaleString()} BDT</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Supplementary Duty (SD):</span>
                      <span className="text-amber-400 font-bold">৳{taxBreakdown?.sdAmount?.toLocaleString()} BDT</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Value Added Tax (15% VAT):</span>
                      <span className="text-slate-200 font-bold">৳{taxBreakdown?.vatAmount?.toLocaleString()} BDT</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Advance Income Tax (5% AIT):</span>
                      <span className="text-slate-200">৳{taxBreakdown?.aitAmount?.toLocaleString()} BDT</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Advance Tax (5% AT):</span>
                      <span className="text-slate-200">৳{taxBreakdown?.atAmount?.toLocaleString()} BDT</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-1">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-200">Total Customs Duty:</span>
                    <span className="text-amber-400 font-mono">৳{taxBreakdown?.totalDutyBdt?.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Effective Landed Cost:</span>
                    <span className="text-emerald-400 font-mono font-bold">৳{taxBreakdown?.effectiveLandedCostBdt?.toLocaleString()} BDT</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CIPL GENERATOR */}
          {activeTab === "invoice" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" /> Commercial Invoice Parameters
                </h4>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Exporter Details</label>
                  <input
                    type="text"
                    value={exporterName}
                    onChange={(e) => setExporterName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 rounded-lg border border-slate-700 text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Importer Name & BIN</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={importerName}
                      onChange={(e) => setImporterName(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-slate-900 rounded-lg border border-slate-700 text-slate-100"
                    />
                    <input
                      type="text"
                      value={importerBin}
                      onChange={(e) => setImporterBin(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-slate-900 rounded-lg border border-slate-700 text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Quantity & Unit Price (USD)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="px-3 py-1.5 text-xs bg-slate-900 rounded-lg border border-slate-700 text-slate-100"
                    />
                    <input
                      type="number"
                      value={unitPriceUsd}
                      onChange={(e) => setUnitPriceUsd(Number(e.target.value))}
                      className="px-3 py-1.5 text-xs bg-slate-900 rounded-lg border border-slate-700 text-slate-100"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerateInvoice}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-semibold shadow transition"
                >
                  Generate ASYCUDA CIPL Dossier
                </button>
              </div>

              {/* Generated Invoice View */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-sm font-semibold text-slate-100">ASYCUDA World Manifest</span>
                    {generatedInvoice && (
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        {generatedInvoice.invoiceNumber}
                      </span>
                    )}
                  </div>

                  {generatedInvoice ? (
                    <div className="my-4 space-y-2 text-xs font-mono">
                      <div><span className="text-slate-500">Port of Entry:</span> <span className="text-sky-300">{generatedInvoice.portOfEntry}</span></div>
                      <div><span className="text-slate-500">Invoice Total:</span> <span className="text-emerald-400 font-bold">${generatedInvoice.totalUsd} USD</span></div>
                      <div><span className="text-slate-500">Assessable Value:</span> <span className="text-slate-200">৳{generatedInvoice.totalAssessableValueBdt?.toLocaleString()} BDT</span></div>
                      <div><span className="text-slate-500">Total Duty:</span> <span className="text-amber-400 font-bold">৳{generatedInvoice.taxBreakdown?.totalDutyBdt?.toLocaleString()} BDT</span></div>
                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-slate-500">Cryptographic Seal:</span>
                        <div className="text-[10px] text-slate-400 break-all bg-slate-900 p-2 rounded mt-1 border border-slate-800">
                          {generatedInvoice.signedHashSeal}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-500 text-xs">
                      Click generate to compile commercial invoice
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
