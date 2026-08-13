import React, { useState } from "react";
import { LandRecordPorchaService, type SurveyRecordType, type PorchaParseResult, type LandTaxCalcResult, type LandTaxReceipt } from "@/lib/infrastructure/land-record-porcha-service";

export interface LandRecordPorchaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LandRecordPorchaModal: React.FC<LandRecordPorchaModalProps> = ({ isOpen, onClose }) => {
  const [surveyType, setSurveyType] = useState<SurveyRecordType>("RS");
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Inputs
  const [landClass, setLandClass] = useState<"agricultural" | "commercial" | "residential" | "industrial">("commercial");
  const [areaDecimal, setAreaDecimal] = useState(15.5);
  const [unpaidYears, setUnpaidYears] = useState(2);
  const [paymentProvider, setPaymentProvider] = useState<"bkash" | "nagad">("bkash");

  // Output States
  const [porcha, setPorcha] = useState<PorchaParseResult | null>(null);
  const [taxCalc, setTaxCalc] = useState<LandTaxCalcResult | null>(null);
  const [receipt, setReceipt] = useState<LandTaxReceipt | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  if (!isOpen) return null;

  const handleParsePorcha = () => {
    const parsed = LandRecordPorchaService.parsePorchaDocument(surveyType);
    setPorcha(parsed);
    setLandClass(parsed.landClass);
    setAreaDecimal(parsed.areaShatakDecimal);

    const tax = LandRecordPorchaService.calculateLandTax({
      surveyType,
      landClass: parsed.landClass,
      areaShatakDecimal: parsed.areaShatakDecimal,
      unpaidYears,
      district: parsed.district,
    });
    setTaxCalc(tax);
    setStep(2);
  };

  const handlePayTax = () => {
    if (!porcha || !taxCalc) return;
    setIsPaying(true);

    const rcpt = LandRecordPorchaService.generateLandTaxReceipt(
      porcha.khatianNumber,
      porcha.dagNumber,
      porcha.mouza,
      porcha.ownerNames[0],
      taxCalc.totalTaxPayableBdt,
      paymentProvider
    );

    setReceipt(rcpt);
    setIsPaying(false);
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🏛️</span> Land Ministry CS/SA/RS/BS Porcha & Khajna Portal
            </h2>
            <p className="text-xs text-slate-400">Land Record OCR Parser & Development Tax (খাজনা) e-Challan Calculator</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center">✕</button>
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold border-b border-slate-800 pb-3">
          <span className={step === 1 ? "text-emerald-400 font-bold border-b-2 border-emerald-400 pb-1" : "text-slate-500"}>1. Porcha Survey</span>
          <span className={step === 2 ? "text-emerald-400 font-bold border-b-2 border-emerald-400 pb-1" : "text-slate-500"}>2. Khajna Tax Calc</span>
          <span className={step === 3 ? "text-emerald-400 font-bold border-b-2 border-emerald-400 pb-1" : "text-slate-500"}>3. e-Challan Receipt</span>
        </div>

        {/* Step 1: Select Survey & Parse Porcha */}
        {step === 1 && (
          <div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800 text-xs">
            <h3 className="text-sm font-semibold text-emerald-400">Step 1: Select Survey Record Type & Upload Porcha Scan</h3>
            <div>
              <label className="block text-slate-400 mb-1">Land Survey Record Type</label>
              <div className="grid grid-cols-4 gap-2">
                {(["CS", "SA", "RS", "BS"] as SurveyRecordType[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSurveyType(st)}
                    className={`py-2 rounded-xl font-bold border transition-colors ${surveyType === st ? "bg-emerald-600 border-emerald-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"}`}
                  >
                    {st} Survey ({st === "CS" ? "1888-1940" : st === "SA" ? "1956-1962" : st === "RS" ? "1965-1998" : "City Survey"})
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border-2 border-dashed border-slate-800 p-6 rounded-2xl text-center space-y-2">
              <div className="text-3xl">📄</div>
              <p className="text-slate-300 font-medium">Upload CS/SA/RS/BS Porcha Document Scan (PDF/JPG)</p>
              <p className="text-[11px] text-slate-500">Supports Bangladesh Land Records OCR parsing for Khatian & Dag Numbers</p>
            </div>

            <button
              onClick={handleParsePorcha}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl transition-colors"
            >
              Parse Porcha OCR & Calculate Khajna ➔
            </button>
          </div>
        )}

        {/* Step 2: Extracted Porcha Data & Tax Calculation */}
        {step === 2 && porcha && taxCalc && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-emerald-400 text-sm">📜 Parsed {porcha.surveyType} Land Record Porcha Data</span>
                <span className="font-mono text-slate-400">{porcha.porchaId}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <p>Khatian Number: <strong className="text-white font-mono">{porcha.khatianNumber}</strong></p>
                <p>Dag (Plot) Number: <strong className="text-white font-mono">{porcha.dagNumber}</strong></p>
                <p>District / Upazila: <strong className="text-white">{porcha.district} / {porcha.upazila}</strong></p>
                <p>Mouza / JL #: <strong className="text-white">{porcha.mouza} (JL #{porcha.jlNumber})</strong></p>
                <p className="col-span-2">Owner(s): <strong className="text-emerald-300">{porcha.ownerNames.join(", ")}</strong></p>
                <p>Land Category: <strong className="text-white capitalize">{porcha.landClass}</strong></p>
                <p>Area Size: <strong className="text-emerald-400 font-mono font-bold">{porcha.areaShatakDecimal} Shatak (Decimal)</strong></p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/40 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-purple-400 text-sm">💰 Land Development Tax (খাজনা) Calculation</span>
                <span className="text-purple-300 font-mono font-bold">Total: ৳{taxCalc.totalTaxPayableBdt.toLocaleString()} BDT</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <p>Annual Rate: <strong className="text-white font-mono">৳{taxCalc.annualTaxBdt.toLocaleString()} BDT / yr</strong></p>
                <p>Unpaid Period: <strong className="text-amber-400 font-mono">{taxCalc.unpaidYears} Years</strong></p>
                <p>Arrears Amount: <strong className="text-white font-mono">৳{taxCalc.arrearsBdt.toLocaleString()} BDT</strong></p>
                <p>Late Penalty Surcharge (10%): <strong className="text-amber-400 font-mono">৳{taxCalc.lateSurchargeBdt.toLocaleString()} BDT</strong></p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <label className="text-slate-400 font-medium">Select Payment Gateway:</label>
                <button
                  onClick={() => setPaymentProvider("bkash")}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${paymentProvider === "bkash" ? "bg-pink-950 border-pink-500 text-pink-300" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                >
                  bKash 1-Tap
                </button>
                <button
                  onClick={() => setPaymentProvider("nagad")}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${paymentProvider === "nagad" ? "bg-orange-950 border-orange-500 text-orange-300" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                >
                  Nagad 1-Tap
                </button>
              </div>
            </div>

            <button
              onClick={handlePayTax}
              disabled={isPaying}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 rounded-xl text-xs transition-colors"
            >
              {isPaying ? "Processing Payment..." : `💳 Pay ৳${taxCalc.totalTaxPayableBdt.toLocaleString()} BDT via ${paymentProvider.toUpperCase()}`}
            </button>
          </div>
        )}

        {/* Step 3: e-Challan Tax Clearance Receipt */}
        {step === 3 && receipt && (
          <div className="space-y-4 bg-emerald-950/80 border border-emerald-500/50 p-6 rounded-2xl text-xs">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
              <div>
                <h3 className="text-lg font-bold text-emerald-400">🏛️ Ministry of Land e-Challan Tax Receipt</h3>
                <p className="text-emerald-300 font-mono text-[11px]">Challan No: {receipt.challanNumber}</p>
              </div>
              <span className="bg-emerald-500 text-slate-950 font-bold px-3 py-1 rounded-full text-xs">PAID & CLEARED</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-200">
              <p>Taxpayer Name: <strong className="text-white">{receipt.taxPayerName}</strong></p>
              <p>Khatian / Dag #: <strong className="text-white font-mono">{receipt.khatianNumber} / {receipt.dagNumber}</strong></p>
              <p>Mouza Location: <strong className="text-white">{receipt.mouza}</strong></p>
              <p>Payment Method: <strong className="text-emerald-300">{receipt.paymentMethod}</strong></p>
              <p>Transaction ID: <strong className="text-purple-300 font-mono">{receipt.transactionId}</strong></p>
              <p>Total Amount Paid: <strong className="text-emerald-300 font-mono font-bold text-sm">৳{receipt.amountPaidBdt.toLocaleString()} BDT</strong></p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl transition-colors text-xs"
            >
              Download PDF e-Challan Receipt
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
