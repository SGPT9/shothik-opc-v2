import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  Building2,
  FileText,
  Percent,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Zap,
  ArrowRight
} from "lucide-react";

export interface EarlyLiquidityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EarlyLiquidityModal: React.FC<EarlyLiquidityModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"radar" | "factoring" | "buyers" | "contract">("radar");

  // Invoices & Aging State
  const [invoices, setInvoices] = useState<any[]>([]);
  const [radar, setRadar] = useState<any | null>(null);
  const [buyers, setBuyers] = useState<any[]>([]);

  // Factoring Calculator State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("INV-2026-081");
  const [advanceRate, setAdvanceRate] = useState<number>(85);
  const [channel, setChannel] = useState<"bkash_enterprise" | "nagad_enterprise" | "beftn_bank">("bkash_enterprise");
  const [offer, setOffer] = useState<any | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [disbursed, setDisbursed] = useState(false);

  // Keyboard shortcut ⌘L / Ctrl+L
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "l") {
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
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [invRes, radarRes, buyersRes] = await Promise.all([
        fetch("/api/factoring/invoices"),
        fetch("/api/factoring/aging-radar"),
        fetch("/api/factoring/buyers"),
      ]);
      const invData = await invRes.json();
      const radarData = await radarRes.json();
      const buyersData = await buyersRes.json();

      if (invData.success) setInvoices(invData.invoices);
      if (radarData.success) setRadar(radarData.radar);
      if (buyersData.success) setBuyers(buyersData.buyers);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCalculateOffer = async () => {
    setCalculating(true);
    try {
      const res = await fetch("/api/factoring/calculate-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoiceId,
          requestedAdvanceRatePercent: advanceRate,
          channel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOffer(data.offer);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (selectedInvoiceId) {
      handleCalculateOffer();
    }
  }, [selectedInvoiceId, advanceRate, channel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-100">
                  Autonomous B2B Micro-Factoring & Early Liquidity Radar
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                  Slice 60 · v2.8
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Corporate receivables aging, dynamic APR haircuts, and instant bKash/Nagad early payout liquidity
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 border border-slate-700 bg-slate-800/80 px-2.5 py-1 rounded-lg">
              ⌘L
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab("radar")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "radar"
                ? "border-amber-500 text-amber-400 bg-amber-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Receivables Aging Radar
          </button>
          <button
            onClick={() => setActiveTab("factoring")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "factoring"
                ? "border-amber-500 text-amber-400 bg-amber-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-4 h-4" />
            Instant Micro-Factoring
          </button>
          <button
            onClick={() => setActiveTab("buyers")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "buyers"
                ? "border-amber-500 text-amber-400 bg-amber-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Corporate Buyer Ledger
          </button>
          <button
            onClick={() => setActiveTab("contract")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === "contract"
                ? "border-amber-500 text-amber-400 bg-amber-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            Legal Lien & SHA-256 Seal
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Tab 1: Radar */}
          {activeTab === "radar" && (
            <div className="space-y-6">
              {radar ? (
                <>
                  {/* Top Stats Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                      <span className="text-slate-500 text-xs block">Total Receivables</span>
                      <span className="text-xl font-bold font-mono text-slate-100 mt-1 block">
                        ৳{radar.totalReceivablesBDT.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-1 block">Across all outstanding invoices</span>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                      <span className="text-slate-500 text-xs block">Days Sales Outstanding (DSO)</span>
                      <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
                        {radar.weightedDSO} Days
                      </span>
                      <span className="text-[11px] text-emerald-400 mt-1 block">Within healthy 45d corridor</span>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                      <span className="text-slate-500 text-xs block">Expected 30-Day Recovery</span>
                      <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                        ৳{radar.expected30DayRecoveryBDT.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-1 block">91.4% collection confidence</span>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                      <span className="text-slate-500 text-xs block">Instant Unlockable Liquidity</span>
                      <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
                        ৳{Math.round(radar.totalReceivablesBDT * 0.85).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-1 block">Up to 85% advance rate</span>
                    </div>
                  </div>

                  {/* Aging Buckets Breakdown */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Accounts Receivable Aging Distribution
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                        <span className="text-emerald-400 font-bold block mb-1">0–30 Days (Current)</span>
                        <span className="font-mono text-slate-200 text-sm font-semibold">
                          ৳{radar.bucket0to30BDT.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                        <span className="text-amber-400 font-bold block mb-1">31–60 Days</span>
                        <span className="font-mono text-slate-200 text-sm font-semibold">
                          ৳{radar.bucket31to60BDT.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                        <span className="text-amber-500 font-bold block mb-1">61–90 Days</span>
                        <span className="font-mono text-slate-200 text-sm font-semibold">
                          ৳{radar.bucket61to90BDT.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                        <span className="text-rose-400 font-bold block mb-1">90+ Days (Overdue)</span>
                        <span className="font-mono text-slate-200 text-sm font-semibold">
                          ৳{radar.bucket90PlusBDT.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">Analyzing receivables aging radar...</div>
              )}
            </div>
          )}

          {/* Tab 2: Factoring Calculator */}
          {activeTab === "factoring" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Controls Column */}
              <div className="md:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Select Receivable Invoice to Factor
                  </label>
                  <select
                    value={selectedInvoiceId}
                    onChange={(e) => setSelectedInvoiceId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    {invoices.map((inv) => (
                      <option key={inv.invoiceId} value={inv.invoiceId}>
                        {inv.invoiceId} · {inv.buyerName} (৳{inv.invoiceAmountBDT.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Requested Advance Rate</span>
                    <span className="font-bold text-amber-400 font-mono">{advanceRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="90"
                    step="5"
                    value={advanceRate}
                    onChange={(e) => setAdvanceRate(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Instant Payout Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e: any) => setChannel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="bkash_enterprise">bKash Enterprise Merchant Wallet</option>
                    <option value="nagad_enterprise">Nagad Enterprise B2B Direct</option>
                    <option value="beftn_bank">Bangladesh Bank BEFTN / NPSB</option>
                  </select>
                </div>
              </div>

              {/* Offer Result Card */}
              <div className="md:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                {offer ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <span className="text-xs text-slate-400">Buyer Entity</span>
                        <span className="text-xs font-bold text-slate-200">{offer.buyerName}</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Invoice Face Value</span>
                          <span className="font-mono text-slate-200">৳{offer.invoiceFaceValueBDT.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Gross Advance ({offer.advanceRatePercent}%)</span>
                          <span className="font-mono text-slate-200">৳{offer.grossAdvanceAmountBDT.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Discount Haircut ({offer.annualizedAprPercent}% APR · {offer.tenureDays}d)</span>
                          <span className="font-mono text-rose-400">-৳{offer.factoringDiscountFeeBDT.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 bg-amber-500/5 p-3 rounded-lg border border-amber-500/20">
                        <span className="text-xs text-amber-400 block mb-1">Instant Net Merchant Payout</span>
                        <span className="text-2xl font-black text-amber-400 font-mono">
                          ৳{offer.netMerchantPayoutBDT.toLocaleString()} BDT
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setDisbursed(true)}
                      disabled={disbursed}
                      className={`w-full py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition ${
                        disbursed
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                          : "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20"
                      }`}
                    >
                      {disbursed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Disbursed to {channel.replace("_", " ").toUpperCase()}
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Accept Offer & Instant Disburse
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs">Calculating offer...</div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Corporate Buyers */}
          {activeTab === "buyers" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {buyers.map((b) => (
                  <div key={b.buyerId} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100 text-sm">{b.name}</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        b.creditTier === "AAA"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : b.creditTier === "AA"
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {b.creditTier}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-slate-400 border-t border-slate-800/80">
                      <div>
                        <span className="block text-[11px]">Industry</span>
                        <span className="text-slate-200">{b.industry}</span>
                      </div>
                      <div>
                        <span className="block text-[11px]">Avg Settlement</span>
                        <span className="text-slate-200">{b.avgPaymentDays} Days</span>
                      </div>
                      <div>
                        <span className="block text-[11px]">Default Risk</span>
                        <span className="text-emerald-400 font-mono">{(b.defaultRiskRate * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="block text-[11px]">Factoring Cap</span>
                        <span className="text-slate-200 font-mono">৳{(b.maxFactoringLimitBDT / 100000).toFixed(1)} Lac</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Legal Lien */}
          {activeTab === "contract" && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Enforceable Promissory Note & Cryptographic Lien
                  </h3>
                  <span className="text-[11px] text-slate-500">Bangladesh Contract Act 1872</span>
                </div>

                <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                  {offer?.legalContractText || "No active offer selected."}
                </pre>

                {offer && (
                  <div className="pt-2">
                    <span className="text-slate-500 text-[11px] block mb-1">
                      Digital Cryptographic Hash Seal (SHA-256)
                    </span>
                    <code className="text-[10px] font-mono text-amber-400/90 bg-amber-950/30 p-2.5 rounded-lg block break-all border border-amber-500/20">
                      {offer.verificationSealSha256}
                    </code>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              bKash Enterprise Gateway: Connected
            </span>
            <span>BEFTN Clearing: Live</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
