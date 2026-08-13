import React, { useState } from "react";
import { NbrTaxReturnService, type IncomeTaxSlabBreakdown, type ETinForm11GAReceipt } from "@/lib/infrastructure/nbr-tax-return-service";

export interface NbrTaxReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NbrTaxReturnModal: React.FC<NbrTaxReturnModalProps> = ({ isOpen, onClose }) => {
  const [taxPayerName, setTaxPayerName] = useState("Tanvir Ahmed");
  const [eTinNumber, setETinNumber] = useState("884269123456");
  const [genderOrCategory, setGenderOrCategory] = useState<"general" | "female_senior" | "disabled" | "freedom_fighter">("general");
  const [salaryBdt, setSalaryBdt] = useState(850000);
  const [investmentBdt, setInvestmentBdt] = useState(100000);
  const [paymentProvider, setPaymentProvider] = useState<"bkash" | "nagad">("bkash");

  const [taxCalc, setTaxCalc] = useState<IncomeTaxSlabBreakdown | null>(null);
  const [receipt, setReceipt] = useState<ETinForm11GAReceipt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCalculateTax = () => {
    const calc = NbrTaxReturnService.calculateIncomeTax({
      taxPayerName,
      eTinNumber,
      genderOrCategory,
      annualSalaryBdt: salaryBdt,
      investmentAmountBdt: investmentBdt,
    });
    setTaxCalc(calc);
  };

  const handleSubmitReturn = () => {
    setIsSubmitting(true);
    const rcpt = NbrTaxReturnService.generateETinForm11GAReceipt(
      {
        taxPayerName,
        eTinNumber,
        genderOrCategory,
        annualSalaryBdt: salaryBdt,
        investmentAmountBdt: investmentBdt,
      },
      paymentProvider
    );
    setReceipt(rcpt);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🏛️</span> NBR Individual e-TIN Tax Return Portal (Form 11GA)
            </h2>
            <p className="text-xs text-slate-400">Bangladesh Income Tax Act 2023 Tax Slab Calculator & e-Return Submission</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center">✕</button>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div>
            <label className="block text-slate-400 mb-1">Taxpayer Full Name</label>
            <input
              type="text"
              value={taxPayerName}
              onChange={(e) => setTaxPayerName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">12-Digit e-TIN Number</label>
            <input
              type="text"
              value={eTinNumber}
              onChange={(e) => setETinNumber(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Tax Exemption Category</label>
            <select
              value={genderOrCategory}
              onChange={(e) => setGenderOrCategory(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
            >
              <option value="general">General Taxpayer (৳3.5 Lakh Exemption)</option>
              <option value="female_senior">Female / Senior Citizen 65+ (৳4.0 Lakh Exemption)</option>
              <option value="disabled">Disabled Taxpayer (৳4.75 Lakh Exemption)</option>
              <option value="freedom_fighter">Gazetted Freedom Fighter (৳5.0 Lakh Exemption)</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Annual Salary / Income (৳ BDT)</label>
            <input
              type="number"
              value={salaryBdt}
              onChange={(e) => setSalaryBdt(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-slate-400 mb-1">Eligible Investment Amount (DPS, Sanchayapatra, Stock Market) (৳ BDT)</label>
            <input
              type="number"
              value={investmentBdt}
              onChange={(e) => setInvestmentBdt(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>
        </div>

        <button
          onClick={handleCalculateTax}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2.5 rounded-xl transition-colors"
        >
          Calculate Income Tax Slabs & 15% Investment Rebate ➔
        </button>

        {/* Calculation Results Card */}
        {taxCalc && (
          <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-emerald-400 text-sm">📊 Official NBR Income Tax Calculation (Assessment Year 2025-2026)</span>
              <span className="bg-emerald-950 text-emerald-300 font-mono text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                {taxCalc.effectiveTaxRatePercent}% Effective Rate
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <p>Total Taxable Income: <strong className="text-white font-mono">৳{taxCalc.taxableIncomeBdt.toLocaleString()} BDT</strong></p>
              <p>Tax Exemption Threshold: <strong className="text-emerald-400 font-mono">৳{taxCalc.taxExemptThresholdBdt.toLocaleString()} BDT</strong></p>
              <p>Tax Before Rebate: <strong className="text-amber-400 font-mono">৳{taxCalc.taxBeforeRebateBdt.toLocaleString()} BDT</strong></p>
              <p>Section 78 Investment Rebate (15%): <strong className="text-emerald-300 font-mono">-৳{taxCalc.investmentRebateBdt.toLocaleString()} BDT</strong></p>
              <p className="col-span-2 text-sm pt-1 border-t border-slate-800">Net Tax Payable: <strong className="text-emerald-400 font-mono font-bold text-base">৳{taxCalc.netTaxPayableBdt.toLocaleString()} BDT</strong></p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Payment Gateway:</span>
                <button
                  onClick={() => setPaymentProvider("bkash")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${paymentProvider === "bkash" ? "bg-pink-950 border border-pink-500 text-pink-300" : "bg-slate-900 border border-slate-800 text-slate-400"}`}
                >
                  bKash 1-Tap
                </button>
                <button
                  onClick={() => setPaymentProvider("nagad")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${paymentProvider === "nagad" ? "bg-orange-950 border border-orange-500 text-orange-300" : "bg-slate-900 border border-slate-800 text-slate-400"}`}
                >
                  Nagad 1-Tap
                </button>
              </div>

              <button
                onClick={handleSubmitReturn}
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs px-4 py-2 rounded-xl transition-colors"
              >
                {isSubmitting ? "Submitting Return..." : "📜 Submit e-Return (Form 11GA)"}
              </button>
            </div>
          </div>
        )}

        {/* e-Return Submission Receipt */}
        {receipt && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 p-5 rounded-2xl text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2">
              <div>
                <h3 className="text-sm font-bold text-emerald-400">🏛️ NBR Official e-Return Acknowledgment Receipt</h3>
                <p className="text-emerald-300 font-mono text-[11px]">Ack #: {receipt.acknowledgmentNumber}</p>
              </div>
              <span className="bg-emerald-500 text-slate-950 font-bold px-3 py-1 rounded-full text-[11px]">SUBMITTED & CLEARED</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-200">
              <p>Taxpayer: <strong className="text-white">{receipt.taxPayerName}</strong></p>
              <p>e-TIN #: <strong className="text-white font-mono">{receipt.eTinNumber}</strong></p>
              <p>Assessment Year: <strong className="text-white">{receipt.assessmentYear}</strong></p>
              <p>Tax Paid via {receipt.paymentMethod}: <strong className="text-emerald-300 font-mono font-bold">৳{receipt.netTaxPaidBdt.toLocaleString()} BDT</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
